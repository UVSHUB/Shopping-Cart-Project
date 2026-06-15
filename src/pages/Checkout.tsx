import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Sparkles, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Checkout: React.FC = () => {
  const { user, token } = useAuth();
  const { items, subtotal, tax, deliveryFee, grandTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '0762127717');
  const [address, setAddress] = useState('Sri lanka 108 nagahawatta Road maharagama');

  const [paymentMethod, setPaymentMethod] = useState('test'); // default to test mode
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Sync user info if loaded late
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '0762127717');
    }
  }, [user]);

  // Redirect if cart is empty and no order success yet
  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      navigate('/cart');
    }
  }, [items, orderSuccess, navigate]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('You must be logged in to place an order.');
      return;
    }

    if (!name || !email || !phone || !address) {
      setError('Please fill in all customer information details.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const orderProducts = items.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        quantity: item.quantity,
        image: item.productId.image
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          customerInfo: { name, email, phone, address },
          products: orderProducts,
          subtotal,
          tax,
          deliveryFee,
          grandTotal
        })
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess(data.order);
        // Clear frontend cart state
        await clearCart();

        // Celebration Confetti!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        setError(data.message || 'Error placing order. Please try again.');
      }
    } catch (err) {
      setError('Network error. Failed to connect to server.');
    } finally {
      setProcessing(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h1 className="text-2xl font-extrabold text-app-text mb-4">Authentication Required</h1>
        <p className="text-sm text-gray-500 mb-8">
          You must be logged in to checkout your items. Please sign in or create an account to proceed.
        </p>
        <Link
          to="/login?redirect=checkout"
          className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-8 rounded-full shadow-lg block text-center"
        >
          Sign In to Checkout
        </Link>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4 space-y-8">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-950/20 text-green-500 mb-2">
          <CheckCircle2 className="h-12 w-12" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-app-text">Order Confirmed!</h1>
          <p className="text-sm text-gray-500 mt-2">
            Thank you for shopping with SmartCart. Your order has been placed successfully and is being prepared.
          </p>
        </div>

        {/* Order Details card */}
        <div className="glass-panel p-6 rounded-3xl text-left space-y-4">
          <h3 className="font-bold text-app-text border-b border-app-border pb-2.5">
            Order Reference: #{orderSuccess._id.slice(-8).toUpperCase()}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Deliver To:</span>
              <p className="font-semibold mt-0.5 text-app-text">{orderSuccess.customerInfo.name}</p>
            </div>
            <div>
              <span className="text-gray-400">Shipping Address:</span>
              <p className="font-semibold mt-0.5 text-app-text">{orderSuccess.customerInfo.address}</p>
            </div>
            <div>
              <span className="text-gray-400">Order Date:</span>
              <p className="font-semibold mt-0.5 text-app-text">{new Date(orderSuccess.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-400">Grand Total:</span>
              <p className="font-extrabold mt-0.5 text-primary">Rs. {orderSuccess.grandTotal.toFixed(2)}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-app-border space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Items Ordered:</h4>
            {orderSuccess.products.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-app-text">
                  {item.name} <strong className="text-gray-400">x{item.quantity}</strong>
                </span>
                <span className="font-semibold text-app-text">Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4.5 justify-center">
          <Link
            to="/products"
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-full shadow transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16 max-w-7xl mx-auto px-2">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mb-8 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Return to Cart
      </Link>

      <h1 className="text-3xl font-extrabold tracking-tight text-app-text mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/35 rounded-2xl p-4 text-sm text-red-500 mb-6 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Customer Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-app-text border-b border-app-border pb-3">Delivery Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-450 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-app-text"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-450 uppercase">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-app-text"
                  placeholder="e.g. +1 (555) 019-2834"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-450 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-app-text"
                  placeholder="e.g. john@example.com"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-450 uppercase">Shipping Address</label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-app-text resize-none"
                  placeholder="Street Address, Apartment/Suite, City, State, ZIP Code"
                />
              </div>
            </div>
          </div>

          {/* Payment gateways section */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-app-text border-b border-app-border pb-3">Payment Method</h2>
            
            <div className="space-y-3">
              {/* Test mode checkbox */}
              <label className="flex items-center gap-3.5 p-4 rounded-2xl border border-primary/30 bg-primary/5 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'test'}
                  onChange={() => setPaymentMethod('test')}
                  className="text-primary focus:ring-primary h-4.5 w-4.5"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-app-text flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-primary" />
                    Demo Sandbox (Cash / Cashless On Delivery)
                  </span>
                  <p className="text-xs text-gray-500">Perfect for local development. Simulates immediate success.</p>
                </div>
              </label>

              {/* Credit card gateway */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-app-border/40 opacity-60">
                <input
                  type="radio"
                  name="payment"
                  disabled
                  className="h-4.5 w-4.5"
                />
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold text-app-text flex items-center gap-1.5">
                      <CreditCard className="h-4.5 w-4.5" />
                      Credit / Debit Card
                    </span>
                    <p className="text-xs text-gray-500">Secure checkout with Stripe.</p>
                  </div>
                  <span className="text-[10px] font-bold bg-gray-200 dark:bg-slate-800 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order review cards */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <h2 className="text-lg font-bold text-app-text border-b border-app-border pb-3">Order Summary</h2>

          {/* Items review */}
          <div className="max-h-60 overflow-y-auto divide-y divide-app-border pr-1">
            {items.map((item) => (
              <div key={item.productId._id} className="flex gap-3 py-3.5 first:pt-0">
                <img src={item.productId.image} alt={item.productId.name} className="h-12 w-12 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-app-text truncate">{item.productId.name}</h4>
                  <span className="text-[10px] text-gray-500">
                    Qty: {item.quantity} • Rs. {(item.productId.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-app-border pt-4 space-y-3 text-sm text-gray-650 dark:text-gray-450">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-app-text">Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Sales Tax</span>
              <span className="font-semibold text-app-text">Rs. {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className="font-semibold text-green-500">FREE</span>
              ) : (
                <span className="font-semibold text-app-text">Rs. {deliveryFee.toFixed(2)}</span>
              )}
            </div>
            <div className="border-t border-app-border pt-3 flex justify-between text-base font-extrabold text-app-text">
              <span>Grand Total</span>
              <span>Rs. {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            {processing ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5" />
                <span>Place Order</span>
              </>
            )}
          </button>

          <div className="flex justify-center items-center gap-1.5 text-[10px] text-gray-450">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Order processed securely</span>
          </div>
        </div>
      </form>
    </div>
  );
};
