import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Check, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
    rating?: number;
    reviewsCount?: number;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;

    setAdding(true);
    await addToCart(product, 1);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const ratingValue = product.rating || 4.5;
  const reviewsVal = product.reviewsCount || 10;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group flex flex-col h-full rounded-2xl glass-panel hover:shadow-md hover:border-primary/30 transition-all duration-300 overflow-hidden"
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Category badge */}
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-black/60 dark:bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
          {product.category}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4.5">
        <div className="flex items-center gap-1 mb-1.5 text-accent">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < Math.floor(ratingValue) ? 'fill-accent' : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">
            ({reviewsVal})
          </span>
        </div>

        <h3 className="text-sm font-semibold text-app-text group-hover:text-primary transition-colors line-clamp-1 mb-1">
          {product.name}
        </h3>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Pricing & Stock & CTA */}
        <div className="mt-auto pt-3 border-t border-app-border flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-bold text-app-text">Rs. {product.price.toFixed(2)}</span>
            <div className="flex items-center mt-0.5">
              {isOutOfStock ? (
                <span className="text-[10px] font-medium text-red-500 flex items-center gap-0.5">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="text-[10px] font-medium text-amber-500 flex items-center gap-0.5 animate-pulse">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Only {product.stock} left
                </span>
              ) : (
                <span className="text-[10px] font-medium text-green-500 flex items-center gap-0.5">
                  In Stock
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              isOutOfStock
                ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed'
                : added
                ? 'bg-green-500 text-white'
                : 'bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow'
            }`}
            aria-label="Add to cart"
          >
            {adding ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : added ? (
              <Check className="h-5 w-5" />
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};
