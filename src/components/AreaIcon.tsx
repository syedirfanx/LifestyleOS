import React from 'react';
import {
  Bed,
  Laptop,
  Briefcase,
  Compass,
  Car,
  Home,
  HeartPulse,
  Building2,
  TrendingUp,
  Sparkles,
  Camera,
  Shirt,
  Dumbbell,
  Gamepad2,
  Tv,
  LucideProps,
} from 'lucide-react';

interface AreaIconProps extends LucideProps {
  name: string;
}

export const AreaIcon: React.FC<AreaIconProps> = ({ name, ...props }) => {
  const lower = name.toLowerCase();

  if (lower.includes('house') || lower.includes('home')) {
    return <Home {...props} />;
  }
  if (lower.includes('tech') || lower.includes('laptop') || lower.includes('office')) {
    return <Laptop {...props} />;
  }
  if (lower.includes('auto') || lower.includes('car') || lower.includes('vehicle')) {
    return <Car {...props} />;
  }
  if (lower.includes('photo') || lower.includes('camera') || lower.includes('studio')) {
    return <Camera {...props} />;
  }
  if (lower.includes('fashion') || lower.includes('wardrobe') || lower.includes('clothing')) {
    return <Shirt {...props} />;
  }
  if (lower.includes('fit') || lower.includes('health') || lower.includes('gym')) {
    return <Dumbbell {...props} />;
  }
  if (lower.includes('game') || lower.includes('gaming')) {
    return <Gamepad2 {...props} />;
  }
  if (lower.includes('bed') || lower.includes('room')) {
    return <Bed {...props} />;
  }
  if (lower.includes('tv') || lower.includes('living')) {
    return <Tv {...props} />;
  }

  return <Sparkles {...props} />;
};
