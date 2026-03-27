import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, ProductVariant } from '../types';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variantSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantSize?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Load cart from localStorage or Firestore
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        const cartDoc = await getDoc(doc(db, 'carts', user.uid));
        if (cartDoc.exists()) {
          setItems(cartDoc.data().items || []);
          return;
        }
      }
      
      const savedCart = localStorage.getItem('ms_fragrances_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    };
    
    loadCart();
  }, [user]);

  // Sync cart to localStorage and Firestore
  useEffect(() => {
    localStorage.setItem('ms_fragrances_cart', JSON.stringify(items));
    
    if (user) {
      // Sanitize items to remove undefined values for Firestore
      const sanitizedItems = JSON.parse(JSON.stringify(items));
      setDoc(doc(db, 'carts', user.uid), { items: sanitizedItems }, { merge: true });
    }
  }, [items, user]);

  const addToCart = (product: Product, variant?: ProductVariant) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.selectedVariant?.size === variant?.size
      );
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.selectedVariant?.size === variant?.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedVariant: variant, price: variant ? variant.price : product.price }];
    });
  };

  const removeFromCart = (productId: string, variantSize?: string) => {
    setItems((prev) => prev.filter((item) => !(item.id === productId && item.selectedVariant?.size === variantSize)));
  };

  const updateQuantity = (productId: string, quantity: number, variantSize?: string) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === productId && item.selectedVariant?.size === variantSize ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
