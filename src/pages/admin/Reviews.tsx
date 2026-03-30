import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Review } from '../../types';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
      setReviews(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      toast.success('Review deleted');
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-luxury-gold tracking-widest">REVIEWS</h1>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-2">Manage customer feedback</p>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {reviews.length === 0 ? (
            <div className="bg-white/5 border border-white/10 p-12 text-center">
              <MessageSquare className="mx-auto text-luxury-gold/20 mb-4" size={48} />
              <p className="text-white/40 italic">No reviews found</p>
            </div>
          ) : (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/5 border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-luxury-gold font-bold text-sm uppercase tracking-widest">{review.userName}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={star <= review.rating ? "fill-luxury-gold text-luxury-gold" : "text-white/10"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/80 text-sm italic">"{review.comment}"</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">
                    Product ID: {review.productId} • {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-3 text-red-400 hover:bg-red-400/10 transition-colors rounded-full"
                  title="Delete Review"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
