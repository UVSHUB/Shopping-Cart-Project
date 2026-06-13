import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryItem {
  _id: string;
  name: string;
  image: string;
}

interface ProductItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating?: number;
  reviewsCount?: number;
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
        // Fetch products
        const prodRes = await fetch('/api/products?sortBy=popular');
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setFeaturedProducts(prodData.slice(0, 4)); // Get top 4 popular items
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Slideshow Section */}
      <Hero />

      {/* 2. Brand Value Props */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-2">
        <div className="flex items-center gap-3.5 p-4 rounded-2xl glass-panel">
          <Truck className="h-8 w-8 text-primary shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-app-text">Free Delivery</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">On all orders over $50</p>
          </div>
        </div>
        <div className="flex items-center gap-3.5 p-4 rounded-2xl glass-panel">
          <ShieldCheck className="h-8 w-8 text-primary shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-app-text">100% Organic</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Directly from local farms</p>
          </div>
        </div>
        <div className="flex items-center gap-3.5 p-4 rounded-2xl glass-panel">
          <RotateCcw className="h-8 w-8 text-primary shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-app-text">Easy Returns</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">1-day instant refund policy</p>
          </div>
        </div>
        <div className="flex items-center gap-3.5 p-4 rounded-2xl glass-panel">
          <Sparkles className="h-8 w-8 text-primary shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-app-text">Weekly Deals</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Special seasonal discounts</p>
          </div>
        </div>
      </div>

      {/* 3. Browse Categories Section */}
      <section className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-app-text">Explore Categories</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Browse fresh ingredients by department</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl glass-panel animate-pulse bg-gray-250 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat, index) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                className="group cursor-pointer flex flex-col items-center p-3.5 rounded-2xl glass-panel hover:border-primary/40 transition-all text-center"
              >
                <div className="h-16 w-16 rounded-full overflow-hidden mb-3.5 bg-slate-150 dark:bg-slate-800">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs font-semibold text-app-text group-hover:text-primary transition-colors line-clamp-1">
                  {cat.name}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Special Offers Slider (Carousel) */}
      <section className="max-w-7xl mx-auto px-2">
        <div className="rounded-3xl glass-panel p-8 bg-gradient-to-br from-green-500/10 via-primary/5 to-transparent relative overflow-hidden border border-primary/20">
          <div className="max-w-md relative z-10 flex flex-col gap-3">
            <span className="text-[10px] font-extrabold tracking-wider bg-primary/25 text-primary px-3 py-1 rounded-full w-max">
              OFFER OF THE WEEK
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-app-text">Fresh Organic Strawberries</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Only this week, enjoy sweet vine-picked organic strawberries for just <strong className="text-primary">$2.99</strong> instead of $3.99.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => navigate('/products?search=Strawberry')}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-5 rounded-full transition shadow"
              >
                Get Discount Now
              </button>
            </div>
          </div>
          {/* Visual absolute element matching offer */}
          <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop"
              alt="Strawberries Promo"
              className="h-full w-full object-cover rounded-l-3xl mask-image-grad"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 40%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)'
              }}
            />
          </div>
        </div>
      </section>

      {/* 5. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-app-text">Featured Products</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Customer favorites this week</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <span>Browse All Products</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl glass-panel animate-pulse bg-gray-250 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
