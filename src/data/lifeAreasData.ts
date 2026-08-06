export interface SubCategoryPreset {
  id: string;
  name: string;
  defaultTitle: string;
  description: string;
  exampleItems: {
    name: string;
    brand?: string;
    estimatedPrice: number;
    category?: string;
  }[];
}

export interface LifeArea {
  id: string;
  name: string;
  icon: string;
  description: string;
  subCategories: SubCategoryPreset[];
}

export const LIFE_AREAS: LifeArea[] = [
  {
    id: 'fashion-beauty',
    name: 'Fashion & Beauty',
    icon: 'Shirt',
    description: 'Cosmetics, vanity setups, wardrobes, footwear, and accessories.',
    subCategories: [
      {
        id: 'makeup-vanity',
        name: 'Makeup & Vanity Setup',
        defaultTitle: 'Makeup & Vanity Corner',
        description: 'Cosmetic collection, brushes, mirrors, and organizer',
        exampleItems: [
          { name: 'Lipstick Collection (Matte & Gloss)', brand: 'MAC / NARS', estimatedPrice: 12000 },
          { name: 'Makeup Brush Set (15 Pieces)', brand: 'Real Techniques', estimatedPrice: 6500 },
          { name: 'Liquid Foundation & Concealer', brand: 'Estee Lauder', estimatedPrice: 14000 },
          { name: 'Hollywood LED Vanity Mirror', brand: 'Impressions Vanity', estimatedPrice: 22000 },
          { name: 'Acrylic Makeup Organizer', brand: 'IKEA', estimatedPrice: 4500 },
          { name: 'Eyeshadow Palette', brand: 'Urban Decay', estimatedPrice: 8500 },
        ],
      },
      {
        id: 'skincare-grooming',
        name: 'Skincare & Daily Beauty',
        defaultTitle: 'Skincare & Beauty Station',
        description: 'Serums, moisturizers, tools, and daily facial care',
        exampleItems: [
          { name: 'Facial Cleanser & Toners', brand: 'CeraVe / La Roche-Posay', estimatedPrice: 5500 },
          { name: 'Hydrating Serums Set', brand: 'The Ordinary', estimatedPrice: 8000 },
          { name: 'Microcurrent Facial Toning Device', brand: 'NuFACE', estimatedPrice: 28000 },
          { name: 'Skincare Mini Refrigerator', brand: 'Cooluli', estimatedPrice: 9500 },
        ],
      },
      {
        id: 'wardrobe-clothing',
        name: 'Wardrobe & Apparel',
        defaultTitle: 'Dream Wardrobe Collection',
        description: 'Outfits, suits, jackets, and seasonal clothing',
        exampleItems: [
          { name: 'Tailored Suits / Formalwear', brand: 'Custom / Zara', estimatedPrice: 45000 },
          { name: 'Designer Leather Jacket', brand: 'AllSaints', estimatedPrice: 55000 },
          { name: 'Capsule Wardrobe Essentials', brand: 'UNIQLO', estimatedPrice: 35000 },
        ],
      },
      {
        id: 'jewelry-accessories',
        name: 'Jewelry & Accessories',
        defaultTitle: 'Jewelry & Watch Box',
        description: 'Watches, rings, bags, and luxury accessories',
        exampleItems: [
          { name: 'Automatic Wristwatch', brand: 'Seiko / Tissot', estimatedPrice: 48000 },
          { name: 'Leather Tote Handbag', brand: 'Coach', estimatedPrice: 38000 },
          { name: 'Designer Sunglasses', brand: 'Ray-Ban', estimatedPrice: 18000 },
        ],
      },
      {
        id: 'perfumes-fragrance',
        name: 'Perfumes & Fragrances',
        defaultTitle: 'Perfume Bar',
        description: 'Signature perfumes, colognes, and scents',
        exampleItems: [
          { name: 'Signature Eau de Parfum', brand: 'Bleu de Chanel / Dior', estimatedPrice: 22000 },
          { name: 'Niche Fragrance Bottle', brand: 'Maison Francis Kurkdjian', estimatedPrice: 38000 },
        ],
      },
    ],
  },
  {
    id: 'house-living',
    name: 'House & Living',
    icon: 'Home',
    description: 'Furnishings, rooms, appliances, and home decor.',
    subCategories: [
      {
        id: 'bedroom-setup',
        name: 'Master Bedroom Setup',
        defaultTitle: 'Master Bedroom Setup',
        description: 'Bed frame, orthopedic mattress, side tables, and cooling',
        exampleItems: [
          { name: 'Teak Wooden Bed Frame', brand: 'Custom / Hatil', estimatedPrice: 45000 },
          { name: 'Orthopedic Latex Mattress', brand: 'King Koil', estimatedPrice: 32000 },
          { name: 'Split Air Conditioner (1.5 Ton)', brand: 'Gree / General', estimatedPrice: 68000 },
          { name: 'Sliding Wardrobe', brand: 'IKEA', estimatedPrice: 38000 },
        ],
      },
      {
        id: 'living-room',
        name: 'Living Room Setup',
        defaultTitle: 'Living Room & Entertainment',
        description: 'Sectional sofa, smart TV, coffee table, and ambient lights',
        exampleItems: [
          { name: 'Modular Sectional Sofa', brand: 'IKEA', estimatedPrice: 85000 },
          { name: '65 inch 4K OLED Smart TV', brand: 'Sony / LG', estimatedPrice: 175000 },
          { name: 'Dolby Atmos Soundbar', brand: 'Sonos / JBL', estimatedPrice: 45000 },
          { name: 'Coffee Table', brand: 'Hatil', estimatedPrice: 18000 },
        ],
      },
      {
        id: 'kitchen-dining',
        name: 'Kitchen & Dining Setup',
        defaultTitle: 'Modern Kitchen & Dining',
        description: 'Dining set, refrigerator, microwave, and coffee maker',
        exampleItems: [
          { name: '6-Seater Dining Table Set', brand: 'Hatil', estimatedPrice: 62000 },
          { name: 'Side-by-Side Refrigerator', brand: 'Samsung / LG', estimatedPrice: 125000 },
          { name: 'Espresso Coffee Machine', brand: 'DeLonghi', estimatedPrice: 32000 },
          { name: 'Convection Microwave Oven', brand: 'Panasonic', estimatedPrice: 22000 },
        ],
      },
      {
        id: 'balcony-garden',
        name: 'Balcony & Outdoor Space',
        defaultTitle: 'Balcony Lounge',
        description: 'Patio seating, planters, and outdoor mood lighting',
        exampleItems: [
          { name: 'Weatherproof Patio Chair Set', brand: 'IKEA', estimatedPrice: 18000 },
          { name: 'Hanging Egg Chair', brand: 'Garden Craft', estimatedPrice: 24000 },
        ],
      },
    ],
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: 'Laptop',
    description: 'Workstations, gaming, smart devices, and mobile gear.',
    subCategories: [
      {
        id: 'tech-workstation',
        name: 'Home Office & Workstation',
        defaultTitle: 'Tech Workstation',
        description: 'Ergonomic desk, dual monitors, computer, and lighting',
        exampleItems: [
          { name: 'Motorized Standing Desk', brand: 'Jarvis / Autonomous', estimatedPrice: 55000 },
          { name: 'Ergonomic Mesh Chair', brand: 'Herman Miller / Steelcase', estimatedPrice: 95000 },
          { name: '27 inch 4K Monitor', brand: 'Dell UltraSharp', estimatedPrice: 62000 },
          { name: 'Workstation Laptop', brand: 'Apple MacBook Pro', estimatedPrice: 280000 },
          { name: 'Mechanical Keyboard & Mouse', brand: 'Logitech MX', estimatedPrice: 24000 },
        ],
      },
      {
        id: 'gaming-battlestation',
        name: 'Gaming Battlestation',
        defaultTitle: 'Gaming Rig Setup',
        description: 'Custom gaming PC, ultrawide screen, and RGB peripherals',
        exampleItems: [
          { name: 'Custom Gaming PC (RTX GPU)', brand: 'Custom Build', estimatedPrice: 220000 },
          { name: '34 inch Ultrawide Curved Monitor', brand: 'Samsung Odyssey', estimatedPrice: 88000 },
          { name: 'Gaming Headset', brand: 'SteelSeries / Razer', estimatedPrice: 18000 },
        ],
      },
      {
        id: 'smart-home',
        name: 'Smart Home Automation',
        defaultTitle: 'Smart Home Setup',
        description: 'Smart lighting, robot vacuum, air purifier, and hubs',
        exampleItems: [
          { name: 'Smart LED Lighting Kit', brand: 'Philips Hue', estimatedPrice: 28000 },
          { name: 'Robot Vacuum Cleaner', brand: 'Roborock', estimatedPrice: 52000 },
          { name: 'HEPA Air Purifier', brand: 'Dyson / Xiaomi', estimatedPrice: 32000 },
        ],
      },
    ],
  },
  {
    id: 'automotive',
    name: 'Automotive',
    icon: 'Car',
    description: 'Vehicle upgrades, interior electronics, and riding gear.',
    subCategories: [
      {
        id: 'car-interior',
        name: 'Car Interior & Tech',
        defaultTitle: 'Car Tech Setup',
        description: 'Dashcams, audio systems, floor mats, and seat covers',
        exampleItems: [
          { name: '4K Dual Channel Dash Cam', brand: '70mai', estimatedPrice: 18000 },
          { name: 'Touchscreen Android Head Unit', brand: 'Pioneer', estimatedPrice: 42000 },
          { name: 'Laser-Fit Floor Mats', brand: 'WeatherTech', estimatedPrice: 14000 },
        ],
      },
      {
        id: 'motorcycle-gear',
        name: 'Motorcycle & Riding',
        defaultTitle: 'Riding Gear Setup',
        description: 'Helmets, armor jackets, gloves, and intercoms',
        exampleItems: [
          { name: 'Full Face Helmet', brand: 'Shoei / AGV', estimatedPrice: 48000 },
          { name: 'Armored Riding Jacket', brand: 'Alpinestars', estimatedPrice: 32000 },
          { name: 'Bluetooth Helmet Intercom', brand: 'Cardo / Sena', estimatedPrice: 22000 },
        ],
      },
    ],
  },
  {
    id: 'photography-studio',
    name: 'Photography & Studio',
    icon: 'Camera',
    description: 'Cameras, lenses, studio lighting, and audio equipment.',
    subCategories: [
      {
        id: 'camera-lenses',
        name: 'Camera & Lens Gear',
        defaultTitle: 'Camera Kit',
        description: 'Mirrorless body, prime lenses, and carbon tripod',
        exampleItems: [
          { name: 'Full Frame Mirrorless Camera', brand: 'Sony A7 IV / Canon R6', estimatedPrice: 240000 },
          { name: '85mm f/1.4 Prime Lens', brand: 'Sigma / Sony', estimatedPrice: 110000 },
          { name: 'Carbon Fiber Tripod', brand: 'Peak Design', estimatedPrice: 38000 },
        ],
      },
      {
        id: 'studio-lighting-audio',
        name: 'Studio Lighting & Audio',
        defaultTitle: 'Content Creator Studio',
        description: 'Softbox lights, podcast mics, and sound treatment',
        exampleItems: [
          { name: 'Continuous LED Video Light', brand: 'Aputure / Godox', estimatedPrice: 35000 },
          { name: 'XLR Studio Microphone', brand: 'Shure SM7B', estimatedPrice: 42000 },
          { name: 'Audio Interface & Boom Arm', brand: 'Focusrite / Rode', estimatedPrice: 28000 },
        ],
      },
    ],
  },
  {
    id: 'fitness-wellness',
    name: 'Fitness & Wellness',
    icon: 'Dumbbell',
    description: 'Home gym equipment, cardio machines, and recovery tools.',
    subCategories: [
      {
        id: 'home-gym',
        name: 'Home Gym Setup',
        defaultTitle: 'Home Gym Setup',
        description: 'Adjustable dumbbells, treadmill, bench, and rack',
        exampleItems: [
          { name: 'Adjustable Dumbbells Set', brand: 'Bowflex SelectTech', estimatedPrice: 42000 },
          { name: 'Folding Treadmill', brand: 'NordicTrack', estimatedPrice: 98000 },
          { name: 'Adjustable Weight Bench', brand: 'Rogue', estimatedPrice: 28000 },
        ],
      },
      {
        id: 'yoga-recovery',
        name: 'Yoga & Recovery Corner',
        defaultTitle: 'Wellness Corner',
        description: 'Yoga mats, massage guns, and foam rollers',
        exampleItems: [
          { name: 'Non-Slip Yoga Mat', brand: 'Lululemon', estimatedPrice: 9500 },
          { name: 'Percussive Massage Gun', brand: 'Theragun', estimatedPrice: 34000 },
        ],
      },
    ],
  },
];
