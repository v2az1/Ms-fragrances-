import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../lib/utils';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-40 text-center relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:text-luxury-gold transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>
        <ShoppingBag size={48} className="mx-auto mb-8 text-luxury-black/20" />
        <h1 className="text-4xl font-serif mb-6">Your Bag is Empty</h1>
        <p className="text-luxury-black/60 mb-12 uppercase tracking-widest text-sm">Discover our collection and find your signature scent.</p>
        <Link to="/products" className="luxury-button">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold mb-12 hover:text-luxury-gold transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>
      <h1 className="text-4xl md:text-5xl font-serif mb-16">Shopping Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-12">
          {items.map((item) => (
            <motion.div 
              key={`${item.id}-${item.selectedVariant?.size || 'default'}`}
              layout
              className="flex gap-8 pb-12 border-b border-luxury-gold/10"
            >
              <div className="w-32 h-40 bg-white border border-luxury-gold/10 overflow-hidden flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-grow flex flex-col justify-between py-2">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-serif">{item.name}</h3>
                      {item.selectedVariant && (
                        <p className="text-xs text-luxury-gold font-bold mt-1 uppercase tracking-widest">
                          Size: {item.selectedVariant.size}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-luxury-black/40 mb-4">{item.category}</p>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex items-center border border-luxury-black/10">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedVariant?.size)}
                      className="p-2 hover:text-luxury-gold transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedVariant?.size)}
                      className="p-2 hover:text-luxury-gold transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id, item.selectedVariant?.size)}
                    className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 border border-luxury-gold/20 sticky top-32">
            <h2 className="text-xl font-serif mb-8 border-b border-luxury-gold/10 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-luxury-black/60">Subtotal ({totalItems} items)</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-luxury-black/60">Shipping</span>
                <span className="text-green-600 uppercase tracking-widest text-[10px] font-bold">Complimentary</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-serif border-t border-luxury-gold/10 pt-4 mb-10">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="luxury-button w-full flex items-center justify-center gap-3"
            >
              Checkout <ArrowRight size={16} />
            </button>

            <p className="text-[10px] text-center mt-6 text-luxury-black/40 uppercase tracking-widest">
              Taxes and shipping calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
