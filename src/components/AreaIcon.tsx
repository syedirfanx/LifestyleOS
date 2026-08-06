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
  Palette,
  Heart,
  Baby,
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
  if (lower.includes('fashion') || lower.includes('wardrobe') || lower.includes('clothing') || lower.includes('shirt')) {
    return <Shirt {...props} />;
  }
  if (lower.includes('fit') || lower.includes('health') || lower.includes('gym') || lower.includes('dumbbell')) {
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
  if (lower.includes('palette') || lower.includes('hobby') || lower.includes('creativity')) {
    return <Palette {...props} />;
  }
  if (lower.includes('heart') || lower.includes('pet')) {
    return <Heart {...props} />;
  }
  if (lower.includes('baby') || lower.includes('family') || lower.includes('kid')) {
    return <Baby {...props} />;
  }
  if (lower.includes('briefcase') || lower.includes('career') || lower.includes('business')) {
    return <Briefcase {...props} />;
  }
  if (lower.includes('compass') || lower.includes('travel') || lower.includes('outdoor') || lower.includes('recreation')) {
    return <Compass {...props} />;
  }

  return <Sparkles {...props} />;
};
