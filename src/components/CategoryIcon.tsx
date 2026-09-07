import React from 'react';
import {
  Briefcase,
  Award,
  Store,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
  Utensils,
  Car,
  Home,
  Zap,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Film,
  Users,
  CreditCard,
  CircleDollarSign,
  Wallet
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-5 h-5', size = 20 }) => {
  switch (iconName) {
    case 'Briefcase':
      return <Briefcase size={size} className={className} />;
    case 'Award':
      return <Award size={size} className={className} />;
    case 'Store':
      return <Store size={size} className={className} />;
    case 'Laptop':
      return <Laptop size={size} className={className} />;
    case 'TrendingUp':
      return <TrendingUp size={size} className={className} />;
    case 'Gift':
      return <Gift size={size} className={className} />;
    case 'Coins':
      return <Coins size={size} className={className} />;
    case 'Utensils':
      return <Utensils size={size} className={className} />;
    case 'Car':
      return <Car size={size} className={className} />;
    case 'Home':
      return <Home size={size} className={className} />;
    case 'Zap':
      return <Zap size={size} className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag size={size} className={className} />;
    case 'HeartPulse':
      return <HeartPulse size={size} className={className} />;
    case 'GraduationCap':
      return <GraduationCap size={size} className={className} />;
    case 'Film':
      return <Film size={size} className={className} />;
    case 'Users':
      return <Users size={size} className={className} />;
    case 'CreditCard':
      return <CreditCard size={size} className={className} />;
    case 'Wallet':
      return <Wallet size={size} className={className} />;
    default:
      return <CircleDollarSign size={size} className={className} />;
  }
};
