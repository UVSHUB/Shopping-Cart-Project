import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  grandTotal: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart initially
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (token) {
        // Logged in: Fetch from database
        try {
          const res = await fetch('/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setItems(data.products || []);
          }
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      } else {
        // Logged out: Fetch from localStorage
        const localCart = localStorage.getItem('smartcart_local_cart');
        if (localCart) {
          setItems(JSON.parse(localCart));
        } else {
          setItems([]);
        }
      }
      setLoading(false);
    };

    loadCart();
  }, [token]);

  // Sync to database or localStorage on changes
  const syncCart = async (newItems: CartItem[]) => {
    setItems(newItems);
    if (token) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            products: newItems.map(item => ({
              productId: item.productId._id,
              quantity: item.quantity
            }))
          })
        });
      } catch (error) {
        console.error('Error syncing cart:', error);
      }
    } else {
      localStorage.setItem('smartcart_local_cart', JSON.stringify(newItems));
    }
  };

  // Merge guest cart on login
  useEffect(() => {
    const mergeCarts = async () => {
      if (token && user) {
        const localCart = localStorage.getItem('smartcart_local_cart');
        if (localCart) {
          const guestItems: CartItem[] = JSON.parse(localCart);
          if (guestItems.length > 0) {
            try {
              // 1. Fetch current server cart
              const res = await fetch('/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
              });
              let serverItems: CartItem[] = [];
              if (res.ok) {
                const data = await res.json();
                serverItems = data.products || [];
              }

              // 2. Merge items
              const mergedMap = new Map<string, CartItem>();
              serverItems.forEach(item => mergedMap.set(item.productId._id, item));
              guestItems.forEach(item => {
                const existing = mergedMap.get(item.productId._id);
                if (existing) {
                  existing.quantity += item.quantity;
                } else {
                  mergedMap.set(item.productId._id, item);
                }
              });

              const mergedList = Array.from(mergedMap.values());
              await syncCart(mergedList);
              localStorage.removeItem('smartcart_local_cart');
            } catch (error) {
              console.error('Error merging carts:', error);
            }
          }
        }
      }
    };

    mergeCarts();
  }, [token, user]);

  const addToCart = async (product: any, quantity = 1) => {
    const existingIndex = items.findIndex(item => item.productId._id === product._id);
    let newItems = [...items];

    if (existingIndex > -1) {
      const newQty = newItems[existingIndex].quantity + quantity;
      newItems[existingIndex].quantity = Math.min(newQty, product.stock);
    } else {
      newItems.push({
        productId: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock
        },
        quantity: Math.min(quantity, product.stock)
      });
    }

    await syncCart(newItems);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    let newItems = items
      .map(item => {
        if (item.productId._id === productId) {
          return {
            ...item,
            quantity: Math.min(quantity, item.productId.stock)
          };
        }
        return item;
      })
      .filter(item => item.quantity > 0);

    await syncCart(newItems);
  };

  const removeFromCart = async (productId: string) => {
    const newItems = items.filter(item => item.productId._id !== productId);
    await syncCart(newItems);
  };

  const clearCart = async () => {
    setItems([]);
    if (token) {
      try {
        await fetch('/api/cart', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      localStorage.removeItem('smartcart_local_cart');
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% sales tax
  const deliveryFee = subtotal > 50 || subtotal === 0 ? 0 : 5.0; // Free delivery over $50
  const grandTotal = subtotal + tax + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        tax,
        deliveryFee,
        grandTotal,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
