import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, tax, deliveryFee, grandTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 px-4">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-500/10 text-primary mb-6 animate-bounce">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text mb-3">Your Cart is Empty</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
          Looks like you haven't added any fresh groceries to your cart yet. Head back to the store to start shopping!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-8 rounded-full shadow-lg"
        >
          Browse Fresh Grocery
          <ArrowRight className="h-4.5 w-4.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-16 max-w-7xl mx-auto px-2">
      <h1 className="text-3xl font-extrabold tracking-tight text-app-text mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-app-border">
            <span className="text-sm font-semibold text-gray-400">Items ({items.length})</span>
            <button
              onClick={clearCart}
              className="text-xs font-bold text-red-650 hover:text-red-700 hover:underline flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </button>
          </div>

          <div className="divide-y divide-app-border">
            {items.map((item) => (
              <div key={item.productId._id} className="flex gap-4 py-5 first:pt-0">
                {/* Product image */}
                <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-app-border">
                  <img
                    src={item.productId.image}
                    alt={item.productId.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="text-sm sm:text-base font-semibold text-app-text hover:text-primary transition-colors line-clamp-1">
                      <Link to={`/product/${item.productId._id}`}>{item.productId.name}</Link>
                    </h3>
                    <span className="text-sm sm:text-base font-bold text-app-text shrink-0">
                      Rs. {(item.productId.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <span className="text-xs text-gray-500 mb-4">Rs. {item.productId.price.toFixed(2)} each</span>

                  {/* Quantity controls & Delete */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center border border-app-border rounded-full bg-glass-bg">
                      <button
                        onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                        className="p-1.5 text-app-text hover:text-primary"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xs font-bold text-app-text w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                        disabled={item.quantity >= item.productId.stock}
                        className="p-1.5 text-app-text hover:text-primary disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId._id)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-slate-850 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic total checkout summary card */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <h2 className="text-lg font-bold text-app-text border-b border-app-border pb-3">Order Summary</h2>

          {/* Pricing calculations */}
          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-semibold text-app-text">Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Estimated Sales Tax (8%)</span>
              <span className="font-semibold text-app-text">Rs. {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className="font-semibold text-green-500">FREE</span>
              ) : (
                <span className="font-semibold text-app-text">Rs. {deliveryFee.toFixed(2)}</span>
              )}
            </div>

            {deliveryFee > 0 && (
              <p className="text-[10px] text-green-500 font-semibold bg-green-500/10 p-2.5 rounded-xl border border-green-500/20">
                🎉 Add <strong>Rs. {(50 - subtotal).toFixed(2)}</strong> more to unlock FREE Delivery!
              </p>
            )}

            <div className="border-t border-app-border pt-4 flex justify-between text-base font-extrabold text-app-text">
              <span>Grand Total</span>
              <span>Rs. {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout triggers */}
          <button
            onClick={handleCheckout}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Secure lock assurances */}
          <div className="pt-4 border-t border-app-border flex items-center justify-center gap-2 text-xs text-gray-450">
            <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0" />
            <span>Secure Checkout • SSL Encrypted Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
};
