import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, ArrowLeft, Plus, Minus, Check, Sparkles, MessageSquare } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

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

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Set active photo thumbnail
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Reset state
        setQuantity(1);

        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          navigate('/products');
          return;
        }
        const data = await res.json();
        setProduct(data);
        setActiveImage(data.image);

        // Fetch related products
        const relRes = await fetch(`/api/products?category=${encodeURIComponent(data.category)}`);
        if (relRes.ok) {
          const relData = await relRes.json();
          // Exclude current product
          setRelatedProducts(relData.filter((p: Product) => p._id !== data._id).slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-2 py-12 animate-pulse space-y-8">
        <div className="h-6 w-32 bg-gray-250 dark:bg-slate-800 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-[400px] bg-gray-250 dark:bg-slate-800 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-8 w-2/3 bg-gray-250 dark:bg-slate-800 rounded-full" />
            <div className="h-6 w-1/3 bg-gray-250 dark:bg-slate-800 rounded-full" />
            <div className="h-24 bg-gray-250 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const handleAddToCart = async () => {
    if (product.stock === 0) return;
    setAdding(true);
    await addToCart(product, quantity);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = product.stock === 0;
  const ratingValue = product.rating || 4.5;

  return (
    <div className="pb-16 max-w-7xl mx-auto px-2">
      {/* Back to shop navigation */}
      <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mb-8 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden glass-panel bg-slate-100 dark:bg-slate-800">
            <img src={activeImage} alt={product.name} className="h-full w-full object-cover object-center" />
          </div>
          {/* Thumbnails list */}
          <div className="flex gap-3">
            <button
              onClick={() => setActiveImage(product.image)}
              className={`h-16 w-16 rounded-xl overflow-hidden border-2 bg-slate-100 dark:bg-slate-800 ${
                activeImage === product.image ? 'border-primary' : 'border-app-border'
              }`}
            >
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </button>
            {/* Mock extra images with different visual filters for premium feel */}
            <button
              onClick={() => setActiveImage(`${product.image}&blur=2`)}
              className={`h-16 w-16 rounded-xl overflow-hidden border-2 bg-slate-100 dark:bg-slate-800 ${
                activeImage.includes('&blur') ? 'border-primary' : 'border-app-border'
              }`}
            >
              <img src={product.image} alt={product.name} className="h-full w-full object-cover filter brightness-95" />
            </button>
          </div>
        </div>

        {/* Content details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">{product.category}</span>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-app-text tracking-tight">{product.name}</h1>
            
            {/* Reviews / Star ratings */}
            <div className="flex items-center gap-1 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4.5 w-4.5 ${
                    i < Math.floor(ratingValue) ? 'fill-accent' : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-1.5">
                {ratingValue} ({product.reviewsCount || 12} customer reviews)
              </span>
            </div>
          </div>

          <div className="text-2xl font-extrabold text-app-text">${product.price.toFixed(2)}</div>

          <p className="text-sm text-gray-600 dark:text-gray-350 leading-relaxed">{product.description}</p>

          <div className="pt-4 border-t border-app-border space-y-4">
            {/* Stock Level Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Availability:</span>
              {isOutOfStock ? (
                <span className="text-sm font-semibold text-red-500 bg-red-100/10 px-3 py-1 rounded-full border border-red-500/20">
                  Out of Stock
                </span>
              ) : (
                <span className="text-sm font-semibold text-green-500 bg-green-100/10 px-3 py-1 rounded-full border border-green-500/20">
                  In Stock ({product.stock} units left)
                </span>
              )}
            </div>

            {/* Quantity controls & Add to Cart button */}
            {!isOutOfStock && (
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center border border-app-border rounded-full bg-glass-bg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-3 text-app-text hover:text-primary disabled:opacity-30 disabled:hover:text-app-text"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-bold text-app-text w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="p-3 text-app-text hover:text-primary disabled:opacity-35"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={`flex items-center justify-center gap-2 font-bold py-3.5 px-8 rounded-full shadow transition-all duration-200 ${
                    added
                      ? 'bg-green-500 text-white'
                      : 'bg-primary hover:bg-primary-hover text-white hover:shadow-lg'
                  }`}
                >
                  {adding ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : added ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      <span>Add to Shopping Cart</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Static Reviews / Testimonials Section */}
      <section className="mt-16 pt-12 border-t border-app-border">
        <h3 className="text-xl font-bold text-app-text flex items-center gap-2 mb-8">
          <MessageSquare className="h-5 w-5 text-primary" />
          Customer Feedback
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-5.5 rounded-2xl flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="flex text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                ))}
              </span>
              <span className="text-xs font-bold text-app-text">Jane Doe</span>
              <span className="text-xs text-gray-400">June 5, 2026</span>
            </div>
            <p className="text-sm text-gray-650 dark:text-gray-300">
              Extremely fresh! SmartCart has become my absolute favorite place to get groceries. Outstanding quality, fast shipping!
            </p>
          </div>
          <div className="glass-panel p-5.5 rounded-2xl flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="flex text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < 4 ? 'fill-accent text-accent' : 'text-gray-300 dark:text-gray-600'}`} />
                ))}
              </span>
              <span className="text-xs font-bold text-app-text">John Smith</span>
              <span className="text-xs text-gray-400">May 28, 2026</span>
            </div>
            <p className="text-sm text-gray-650 dark:text-gray-300">
              Very nice and crisp. Delivery took only 2 hours. Tastes organic and authentic. Definitely recommending to my family.
            </p>
          </div>
        </div>
      </section>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-app-text mb-6 flex items-center gap-2">
            <Sparkles className="h-5.5 w-5.5 text-primary animate-pulse" />
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
