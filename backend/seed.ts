import { Category } from './models/Category';
import { Product } from './models/Product';

const sampleCategories = [
  { name: 'Vegetables', image: 'https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=400&auto=format&fit=crop' },
  { name: 'Fruits', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&auto=format&fit=crop' },
  { name: 'Cakes', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop' },
  { name: 'Biscuits', image: 'https://images.unsplash.com/photo-1558961309-dbdf71799f5a?w=400&auto=format&fit=crop' },
  { name: 'Beverages', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&auto=format&fit=crop' },
  { name: 'Dairy Products', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop' },
  { name: 'Snacks', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d09?w=400&auto=format&fit=crop' },
  { name: 'Frozen Foods', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&auto=format&fit=crop' }
];

const sampleProducts = [
  // Vegetables
  {
    name: 'Fresh Organic Broccoli',
    description: 'Crisp green broccoli florets. Loaded with vitamin C, fiber, and iron. Perfect for steaming or stir-fry.',
    price: 2.99,
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=500&auto=format&fit=crop',
    stock: 50,
    rating: 4.8,
    reviewsCount: 24
  },
  {
    name: 'Organic Sweet Carrots',
    description: 'Fresh organic carrots directly from local farms. Sweet and crunchy, ideal for snacks and cooking.',
    price: 1.89,
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop',
    stock: 75,
    rating: 4.6,
    reviewsCount: 18
  },
  {
    name: 'Vine-Ripened Red Tomatoes',
    description: 'Juicy, vine-ripened red tomatoes. Ideal for salads, sandwiches, pasta sauces, or making homemade soup.',
    price: 3.49,
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop',
    stock: 60,
    rating: 4.5,
    reviewsCount: 15
  },

  // Fruits
  {
    name: 'Honeycrisp Apples (Bag)',
    description: 'Crisp, sweet, and slightly tart Honeycrisp apples. Perfect for healthy snacks or baking delicious apple pies.',
    price: 4.99,
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop',
    stock: 40,
    rating: 4.7,
    reviewsCount: 32
  },
  {
    name: 'Organic Bananas (Bunch)',
    description: 'A bunch of fresh organic bananas. Naturally sweet energy boosters packed with potassium and essential vitamins.',
    price: 1.99,
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop',
    stock: 100,
    rating: 4.9,
    reviewsCount: 88
  },
  {
    name: 'Sweet Organic Strawberries',
    description: 'Juicy, sweet red organic strawberries. Perfect for breakfast cereals, smoothies, desserts, or fresh snacking.',
    price: 3.99,
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop',
    stock: 35,
    rating: 4.8,
    reviewsCount: 42
  },

  // Cakes
  {
    name: 'Chocolate Fudge Cake',
    description: 'Decadent double-layered chocolate fudge cake. Rich, moist chocolate sponge coated with premium chocolate frosting.',
    price: 18.99,
    category: 'Cakes',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop',
    stock: 10,
    rating: 4.9,
    reviewsCount: 55
  },
  {
    name: 'Strawberry Glazed Cheesecake',
    description: 'Creamy New York style cheesecake topped with sweet strawberry glaze and fresh strawberries on a graham cracker crust.',
    price: 21.99,
    category: 'Cakes',
    image: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=500&auto=format&fit=crop',
    stock: 8,
    rating: 4.8,
    reviewsCount: 29
  },

  // Biscuits
  {
    name: 'Gourmet Chocolate Chip Cookies',
    description: 'Freshly baked soft-baked cookies packed with rich Belgian chocolate chips. The ultimate comforting dessert snack.',
    price: 4.49,
    category: 'Biscuits',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop',
    stock: 45,
    rating: 4.7,
    reviewsCount: 61
  },
  {
    name: 'Traditional Butter Shortbread',
    description: 'Rich, crumbly Scottish-style butter shortbread biscuits. Perfectly melts in the mouth, great companion for hot tea.',
    price: 3.99,
    category: 'Biscuits',
    image: 'https://images.unsplash.com/photo-1558961309-dbdf71799f5a?w=500&auto=format&fit=crop',
    stock: 30,
    rating: 4.6,
    reviewsCount: 21
  },

  // Beverages
  {
    name: 'Cold Press Orange Juice',
    description: '100% natural, cold-pressed sweet orange juice. Rich in Vitamin C with no added sugar or artificial preservatives.',
    price: 5.49,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop',
    stock: 25,
    rating: 4.8,
    reviewsCount: 37
  },
  {
    name: 'Organic Cold Brew Coffee',
    description: 'Smooth and low-acid cold brew coffee made from premium organic Arabica beans. Ready to drink over ice.',
    price: 4.99,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop',
    stock: 40,
    rating: 4.7,
    reviewsCount: 48
  },

  // Dairy Products
  {
    name: 'Organic Whole Milk',
    description: 'Grade A organic pasteurized whole milk. Locally sourced from pasture-raised cows, rich in calcium and Vitamin D.',
    price: 3.79,
    category: 'Dairy Products',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop',
    stock: 50,
    rating: 4.9,
    reviewsCount: 74
  },
  {
    name: 'Creamy Greek Yogurt (Plain)',
    description: 'Authentic thick and creamy strained Greek yogurt. High in protein and probiotic cultures. Ideal for breakfasts.',
    price: 4.29,
    category: 'Dairy Products',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop',
    stock: 35,
    rating: 4.7,
    reviewsCount: 19
  },

  // Snacks
  {
    name: 'Classic Sea Salt Potato Chips',
    description: 'Thinly sliced kettle-cooked potato chips dusted with premium sea salt. Extra crunchy and satisfyingly salty.',
    price: 2.99,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d09?w=500&auto=format&fit=crop',
    stock: 80,
    rating: 4.5,
    reviewsCount: 30
  },
  {
    name: 'Organic Mixed Roasted Nuts',
    description: 'Premium blend of lightly salted almonds, cashews, walnuts, and pecans. High in healthy fats and proteins.',
    price: 6.99,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1541795795328-f073b763494e?w=500&auto=format&fit=crop',
    stock: 50,
    rating: 4.8,
    reviewsCount: 41
  },

  // Frozen Foods
  {
    name: 'Frozen Wild Mixed Berries',
    description: 'Frozen sweet wild blueberries, blackberries, raspberries, and strawberries. Perfect for healthy daily smoothies.',
    price: 5.99,
    category: 'Frozen Foods',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&auto=format&fit=crop',
    stock: 30,
    rating: 4.7,
    reviewsCount: 22
  },
  {
    name: 'Stone-Baked Pepperoni Pizza',
    description: 'Premium thin-crust pizza loaded with zesty pepperoni slices, rich marinara sauce, and gooey mozzarella cheese.',
    price: 7.99,
    category: 'Frozen Foods',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop',
    stock: 20,
    rating: 4.6,
    reviewsCount: 38
  }
];

export const seedDatabase = async () => {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('Seeding categories...');
      await Category.insertMany(sampleCategories);
      console.log('Categories seeded successfully!');
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding products...');
      await Product.insertMany(sampleProducts);
      console.log('Products seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
