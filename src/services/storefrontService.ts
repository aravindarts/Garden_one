export type StorefrontData = {
  categories: Category[];
  products: Product[];
};

type Category = {
  slug: string;
  name: string;
  description: string;
  accent: string;
  image: string;
};

type Product = {
  id: number;
  name: string;
  category: string;
  tag: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  benefits: string[];
  care: string[];
  stock: number;
};

export const fallbackCategories: Category[] = [
  {
    slug: 'indoor',
    name: 'Indoor Plants',
    description: 'Air-purifying greens for bright, calm interiors.',
    accent: '#7dbf9d',
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'low-light',
    name: 'Low Light',
    description: 'Easy-care foliage that thrives in dim corners.',
    accent: '#a3c4f3',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'pet-friendly',
    name: 'Pet Friendly',
    description: 'Non-toxic picks that are safe for curious companions.',
    accent: '#f1b36b',
    image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'gifts',
    name: 'Gift Sets',
    description: 'Thoughtful bundles for new plant parents.',
    accent: '#d8a7a5',
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=900&q=80',
  },
];

export const fallbackProducts: Product[] = [
  {
    id: 1,
    name: 'Monstera Deliciosa',
    category: 'indoor',
    tag: 'Best seller',
    price: 54,
    originalPrice: 68,
    rating: 4.9,
    reviews: 214,
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80',
    description: 'A sculptural statement plant with lush split leaves and fast growth.',
    benefits: ['Air-purifying', 'Pet-safe with caution', 'Low maintenance'],
    care: ['Bright indirect light', 'Water weekly', 'Rotate monthly'],
    stock: 14,
  },
  {
    id: 2,
    name: 'Snake Plant',
    category: 'low-light',
    tag: 'Hard to kill',
    price: 32,
    rating: 4.8,
    reviews: 331,
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
    description: 'Architectural upright foliage that thrives in neglected rooms and low light.',
    benefits: ['Low water needs', 'Excellent for beginners', 'Air-cleaning'],
    care: ['Indirect light', 'Water every 2–3 weeks', 'Dust leaves gently'],
    stock: 21,
  },
  {
    id: 3,
    name: 'Calathea Orbifolia',
    category: 'indoor',
    tag: 'Designer pick',
    price: 46,
    rating: 4.7,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80',
    description: 'Striking broad leaves with unique wave-like patterns and soft movement.',
    benefits: ['Humidity friendly', 'Display-worthy foliage', 'Soothing texture'],
    care: ['Bright filtered light', 'Mist often', 'Keep soil lightly moist'],
    stock: 9,
  },
  {
    id: 4,
    name: 'Parlor Palm',
    category: 'pet-friendly',
    tag: 'Gentle green',
    price: 39,
    rating: 4.8,
    reviews: 164,
    image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=80',
    description: 'Soft feathered fronds bring tropical calm to bedrooms and living spaces.',
    benefits: ['Safe for pets', 'Air-filtering', 'Easy to grow'],
    care: ['Medium indirect light', 'Water once a week', 'Trim brown tips'],
    stock: 18,
  },
  {
    id: 5,
    name: 'ZZ Plant',
    category: 'low-light',
    tag: 'Resilient',
    price: 42,
    rating: 4.9,
    reviews: 276,
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=900&q=80',
    description: 'Glossy stems and waxy leaves create an effortless, polished look.',
    benefits: ['Thrives in shade', 'Low-maintenance', 'Modern silhouette'],
    care: ['Low to medium light', 'Water every 2 weeks', 'Let soil dry slightly'],
    stock: 12,
  },
  {
    id: 6,
    name: 'Peace Lily',
    category: 'indoor',
    tag: 'Blooming favorite',
    price: 36,
    originalPrice: 44,
    rating: 4.7,
    reviews: 155,
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80',
    description: 'Elegant white blooms and lush foliage for calm, refreshing corners.',
    benefits: ['Low-light tolerant', 'Beautiful blooms', 'Natural humidifier'],
    care: ['Filtered light', 'Keep soil moist', 'Remove spent flowers'],
    stock: 17,
  },
  {
    id: 7,
    name: 'Basil & Bloom Gift Set',
    category: 'gifts',
    tag: 'New arrival',
    price: 58,
    rating: 4.8,
    reviews: 84,
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=900&q=80',
    description: 'A curated collection of greenery, ceramic planter, and care card.',
    benefits: ['Perfect for gifting', 'Includes planter', 'Ready to style'],
    care: ['Place in bright light', 'Water once weekly', 'Enjoy the seasonal growth'],
    stock: 8,
  },
  {
    id: 8,
    name: 'Spider Plant',
    category: 'pet-friendly',
    tag: 'Easy care',
    price: 28,
    rating: 4.9,
    reviews: 401,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
    description: 'Arching leaves and baby offshoots create a relaxed, airy feel.',
    benefits: ['Non-toxic', 'Pet-friendly', 'Begins quickly'],
    care: ['Bright indirect light', 'Water weekly', 'Trim runners as desired'],
    stock: 22,
  },
];

export async function fetchStorefrontData(): Promise<StorefrontData> {
  try {
    const response = await fetch('/api/storefront');
    if (!response.ok) {
      throw new Error('API unavailable');
    }
    const payload = await response.json();

    const categories = Array.isArray(payload?.categories) ? payload.categories : fallbackCategories;
    const products = Array.isArray(payload?.products) ? payload.products : fallbackProducts;

    return { categories, products };
  } catch {
    return {
      categories: fallbackCategories,
      products: fallbackProducts,
    };
  }
}
