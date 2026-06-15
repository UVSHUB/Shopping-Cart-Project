import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, Star } from 'lucide-react';


interface Product {
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

interface Category {
  _id: string;
  name: string;
}

export const ProductList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch lists
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState(30);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('newest');

  // Toggle for responsive filters sidebar on mobile
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync search query parameter from URL
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Fetch categories initially
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCats();
  }, []);

  // Fetch products based on filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (maxPrice < 30) params.append('maxPrice', maxPrice.toString());
      if (minRating) params.append('rating', minRating.toString());
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, maxPrice, minRating, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMaxPrice(30);
    setMinRating(null);
    setSortBy('newest');
    setSearchParams({});
  };

  const handleCategorySelect = (catName: string) => {
    const newCat = selectedCategory === catName ? '' : catName;
    setSelectedCategory(newCat);
    setSearchParams(prev => {
      if (newCat) {
        prev.set('category', newCat);
      } else {
        prev.delete('category');
      }
      return prev;
    });
  };

  return (
    <div className="pb-16 max-w-7xl mx-auto px-2">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-app-text tracking-tight">Browse Grocery</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {loading ? 'Searching catalog...' : `Found ${products.length} products`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="lg:hidden flex items-center justify-center gap-2 p-2.5 rounded-full border border-app-border bg-glass-bg text-sm font-semibold hover:border-primary/50 transition-colors w-full sm:w-auto"
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
            Filters
          </button>

          {/* Sort Select */}
          <div className="relative flex items-center border border-app-border rounded-full bg-glass-bg px-3.5 py-2 w-full sm:w-auto">
            <ArrowUpDown className="h-4.5 w-4.5 text-gray-400 mr-2 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm font-medium text-app-text outline-none cursor-pointer w-full"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* 1. Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 glass-panel p-6 rounded-2xl sticky top-20">
          <div className="flex items-center justify-between pb-4 border-b border-app-border mb-5">
            <h3 className="font-bold text-app-text flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
              Refine Search
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
          </div>

          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedCategory === cat.name}
                      onChange={() => handleCategorySelect(cat.name)}
                      className="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className={selectedCategory === cat.name ? 'text-primary font-medium' : 'text-app-text'}>
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Max Price (Rs. {maxPrice})</h4>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-250 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1 font-medium">
                <span>Rs. 1.00</span>
                <span>Rs. 30.00</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Rating</h4>
              <div className="space-y-2">
                {[4, 3, 2].map((stars) => (
                  <label key={stars} className="flex items-center gap-2.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === stars}
                      onChange={() => setMinRating(stars)}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="flex items-center gap-1 text-app-text">
                      <span>{stars}★ & Up</span>
                      <span className="flex text-accent ml-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < stars ? 'fill-accent' : 'text-gray-300 dark:text-gray-600'}`} />
                        ))}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filters Drawer Overlay */}
        <aside
          className={`fixed inset-0 z-50 transition-opacity duration-300 bg-black/40 backdrop-blur-sm lg:hidden ${
            showFiltersMobile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setShowFiltersMobile(false)}
        >
          <div
            className={`absolute bottom-0 left-0 right-0 rounded-t-3xl bg-slate-900 dark:bg-slate-950 p-6 space-y-6 transition-transform duration-300 ${
              showFiltersMobile ? 'translate-y-0' : 'translate-y-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white">Filters</h3>
              <div className="flex gap-4">
                <button onClick={handleResetFilters} className="text-xs text-primary font-bold">Reset</button>
                <button onClick={() => setShowFiltersMobile(false)} className="text-xs text-white font-bold">Done</button>
              </div>
            </div>

            {/* Categories Mobile */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      selectedCategory === cat.name
                        ? 'bg-primary border-primary text-white'
                        : 'border-slate-800 text-slate-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Mobile */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Max Price: Rs. {maxPrice}</h4>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </aside>

        {/* 2. Products Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[360px] rounded-2xl glass-panel animate-pulse bg-gray-250 dark:bg-slate-800" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-3xl p-12">
              <span className="text-3xl">🍉</span>
              <h2 className="text-xl font-bold mt-4 text-app-text">No Products Found</h2>
              <p className="text-sm text-gray-500 mt-2">
                We couldn't find any products matching your current search options. Try broadening your filter parameters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-5 rounded-full shadow"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
