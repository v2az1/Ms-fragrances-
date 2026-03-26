import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../lib/utils';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { ShieldCheck, Truck, ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        products: items,
        totalPrice,
        customerName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        status: 'Ordered',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error: any) {
      toast.error('Failed to place order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
      <button 
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold mb-12 hover:text-luxury-gold transition-colors"
      >
        <ArrowLeft size={14} /> Back to Bag
      </button>
      <h1 className="text-4xl md:text-5xl font-serif mb-16">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-serif mb-8 border-b border-luxury-gold/10 pb-4">Shipping Details</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="luxury-input"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="luxury-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Delivery Address</label>
              <textarea
                required
                rows={3}
                className="luxury-input resize-none"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Order Notes (Optional)</label>
              <textarea
                rows={2}
                className="luxury-input resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Special instructions for delivery..."
              />
            </div>

            <div className="bg-luxury-cream p-6 border border-luxury-gold/10">
              <div className="flex items-center gap-4 mb-4">
                <Truck className="text-luxury-gold" size={20} />
                <h3 className="text-xs uppercase tracking-widest font-bold">Payment Method</h3>
              </div>
              <p className="text-sm text-luxury-black/70 ml-9">
                Cash on Delivery (COD) - Pay when you receive your fragrance.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="luxury-button w-full py-5"
            >
              {loading ? 'Processing Order...' : 'Place Order'}
            </button>
          </form>
        </motion.div>

        {/* Order Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 border border-luxury-gold/20">
            <h2 className="text-xl font-serif mb-8 border-b border-luxury-gold/10 pb-4">Bag Summary</h2>
            
            <div className="space-y-6 mb-8 max-h-80 overflow-auto pr-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-luxury-cream border border-luxury-gold/10 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-serif">{item.name}</h4>
                    <p className="text-[10px] text-luxury-black/40 uppercase tracking-widest">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium mt-1">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-8 pt-8 border-t border-luxury-gold/10">
              <div className="flex justify-between text-sm">
                <span className="text-luxury-black/60">Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-luxury-black/60">Shipping</span>
                <span className="text-green-600 uppercase tracking-widest text-[10px] font-bold">Free</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-serif border-t border-luxury-gold/10 pt-4">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>

            <div className="mt-12 flex items-center gap-3 text-luxury-black/40">
              <ShieldCheck size={16} />
              <p className="text-[10px] uppercase tracking-widest">Secure Checkout Guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
