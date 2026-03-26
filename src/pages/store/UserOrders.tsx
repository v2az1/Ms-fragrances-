import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { motion } from 'motion/react';
import { Package, ChevronRight, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function UserOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ordered': return 'text-blue-500 bg-blue-50';
      case 'Confirmed': return 'text-purple-500 bg-purple-50';
      case 'Out for Delivery': return 'text-orange-500 bg-orange-50';
      case 'Delivered': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
      <button 
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold mb-12 hover:text-luxury-gold transition-colors"
      >
        <ArrowLeft size={14} /> Back to Profile
      </button>
      <h1 className="text-4xl md:text-5xl font-serif mb-16">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-40 bg-white border border-luxury-gold/10">
          <Package size={48} className="mx-auto mb-6 text-luxury-black/10" />
          <p className="text-luxury-black/40 uppercase tracking-widest">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-luxury-gold/10 p-8"
            >
              <div className="flex flex-col md:flex-row justify-between gap-8 mb-8 pb-8 border-b border-luxury-gold/10">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-luxury-black/40 font-bold">Order ID</p>
                  <p className="text-sm font-mono">{order.id}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-luxury-black/40 font-bold">Date</p>
                  <p className="text-sm">{format(new Date(order.createdAt), 'PPP')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-luxury-black/40 font-bold">Status</p>
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-luxury-black/40 font-bold">Total</p>
                  <p className="text-sm font-bold">{formatCurrency(order.totalPrice)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold">Items</h3>
                  {order.products.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-12 h-16 bg-luxury-cream border border-luxury-gold/10 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="text-sm font-serif">{item.name}</p>
                        <p className="text-[10px] text-luxury-black/40 uppercase tracking-widest">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold">Delivery Address</h3>
                  <div className="text-sm text-luxury-black/70 space-y-1">
                    <p className="font-bold text-luxury-black">{order.customerName}</p>
                    <p>{order.phone}</p>
                    <p className="whitespace-pre-line">{order.address}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
