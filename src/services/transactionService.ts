import { 
  db, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from '../lib/firebase';
import { Transaction } from '../types';

const COLLECTION_NAME = 'moneydb_transactions';

// Local storage key helper
function getLocalKey(userId: string) {
  return `moneydb_cache_${userId}`;
}

export function getLocalTransactions(userId: string): Transaction[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getLocalKey(userId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read local transactions cache:', e);
    return [];
  }
}

export function saveLocalTransactions(userId: string, txs: Transaction[]): void {
  if (!userId) return;
  try {
    localStorage.setItem(getLocalKey(userId), JSON.stringify(txs));
  } catch (e) {
    console.error('Failed to save local transactions cache:', e);
  }
}

export function subscribeToTransactions(
  userId: string, 
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  // 1. Immediately provide local cache so user experiences zero latency
  const cached = getLocalTransactions(userId);
  if (cached.length > 0) {
    onUpdate(cached);
  }

  // 2. Query Firestore in real time
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId,
          type: data.type,
          amount: Number(data.amount) || 0,
          category: data.category || '',
          note: data.note || '',
          date: data.date || new Date().toISOString().split('T')[0],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      // Update local storage cache
      saveLocalTransactions(userId, items);
      onUpdate(items);
    },
    (error) => {
      console.warn('Firestore subscription notice (fallback to local cache):', error);
      // If Firestore fails (e.g. offline), ensure local items are still shown
      const fallbackItems = getLocalTransactions(userId);
      onUpdate(fallbackItems);
      if (onError) onError(error);
    }
  );
}

export async function createTransaction(
  userId: string,
  data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!userId) throw new Error('ไม่พบข้อมูลผู้ใช้งาน กรุณาลองใหม่อีกครั้ง');

  let generatedId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Optimistically save to local cache so user sees it right away
  const currentLocal = getLocalTransactions(userId);
  const newLocalItem: Transaction = {
    id: generatedId,
    userId,
    type: data.type,
    amount: Number(data.amount),
    category: data.category,
    note: data.note || '',
    date: data.date,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    // Attempt Firestore persistence
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId,
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      note: data.note || '',
      date: data.date,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    generatedId = docRef.id;
    newLocalItem.id = docRef.id;
  } catch (firestoreErr) {
    console.warn('Saved transaction locally (cloud sync pending):', firestoreErr);
  }

  // Update local cache
  const updatedList = [newLocalItem, ...currentLocal.filter(t => t.id !== newLocalItem.id)];
  // Sort descending by date
  updatedList.sort((a, b) => b.date.localeCompare(a.date));
  saveLocalTransactions(userId, updatedList);

  return generatedId;
}

export async function updateTransaction(
  id: string,
  userId: string,
  data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  if (!userId) throw new Error('ไม่พบข้อมูลผู้ใช้งาน');

  // Update local cache
  const current = getLocalTransactions(userId);
  const updatedList = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...data,
        ...(data.amount !== undefined ? { amount: Number(data.amount) } : {}),
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });
  saveLocalTransactions(userId, updatedList);

  // Attempt Firestore update
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      ...(data.amount !== undefined ? { amount: Number(data.amount) } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Updated transaction locally (cloud sync pending):', err);
  }
}

export async function deleteTransaction(id: string, userId?: string): Promise<void> {
  // If userId provided, remove from local cache immediately
  if (userId) {
    const current = getLocalTransactions(userId);
    saveLocalTransactions(userId, current.filter(t => t.id !== id));
  }

  // Attempt Firestore deletion
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Deleted transaction locally (cloud sync pending):', err);
  }
}

/**
 * Migrates transactions created in guest mode to a logged-in Google account
 */
export async function migrateGuestTransactions(guestId: string, googleUid: string): Promise<void> {
  if (!guestId || !googleUid || guestId === googleUid) return;

  const guestItems = getLocalTransactions(guestId);
  if (guestItems.length === 0) return;

  for (const item of guestItems) {
    try {
      await createTransaction(googleUid, {
        type: item.type,
        amount: item.amount,
        category: item.category,
        note: item.note,
        date: item.date,
      });
    } catch (e) {
      console.error('Error migrating transaction:', e);
    }
  }

  // Clear guest items after migration
  saveLocalTransactions(guestId, []);
}

/**
 * Seeds initial friendly sample transactions for the user to explore immediately.
 */
export async function seedSampleTransactions(userId: string): Promise<void> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  const samples: Array<Omit<Transaction, 'id' | 'userId'>> = [
    {
      type: 'income',
      amount: 38000,
      category: 'เงินเดือน',
      note: 'เงินเดือนประจำเดือน',
      date: `${year}-${month}-01`,
    },
    {
      type: 'income',
      amount: 4500,
      category: 'งานเสริม/ฟรีแลนซ์',
      note: 'รับออกแบบกราฟิกโปรเจกต์พิเศษ',
      date: `${year}-${month}-05`,
    },
    {
      type: 'expense',
      amount: 6500,
      category: 'ค่าที่พัก/ผ่อนบ้าน',
      note: 'ค่าเช่าคอนโดมิเนียม',
      date: `${year}-${month}-02`,
    },
    {
      type: 'expense',
      amount: 1450,
      category: 'ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต',
      note: 'ค่าไฟฟ้าและไฟเบอร์อินเทอร์เน็ต',
      date: `${year}-${month}-04`,
    },
    {
      type: 'expense',
      amount: 320,
      category: 'อาหารและเครื่องดื่ม',
      note: 'มื้อกลางวันและกาแฟสด',
      date: `${year}-${month}-05`,
    },
    {
      type: 'expense',
      amount: 850,
      category: 'การเดินทาง/น้ำมัน',
      note: 'เติมน้ำมันรถยนต์',
      date: `${year}-${month}-07`,
    },
    {
      type: 'expense',
      amount: 1290,
      category: 'ช้อปปิ้ง/ของใช้',
      note: 'ซื้อของใช้ในบ้านซูเปอร์มาร์เก็ต',
      date: `${year}-${month}-08`,
    },
    {
      type: 'expense',
      amount: 500,
      category: 'อาหารและเครื่องดื่ม',
      note: 'ทานสุกี้กับเพื่อน',
      date: `${year}-${month}-10`,
    },
    {
      type: 'expense',
      amount: 400,
      category: 'สุขภาพและการรักษา',
      note: 'วิตามินและยาแก้แพ้',
      date: `${year}-${month}-12`,
    }
  ];

  for (const item of samples) {
    await createTransaction(userId, {
      type: item.type,
      amount: item.amount,
      category: item.category,
      note: item.note,
      date: item.date,
    });
  }
}

