import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Review } from '../types';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId,
        userId: user.uid,
        userName: profile?.email?.split('@')[0] || 'Anonymous',
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString()
      });
      setComment('');
      setRating(5);
      toast.success('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="mt-24 pt-24 border-t border-luxury-gold/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
          <h2 className="text-3xl font-serif mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={cn(
                    "transition-colors",
                    star <= Math.round(averageRating) ? "fill-luxury-gold text-luxury-gold" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-luxury-black/60">
              {averageRating.toFixed(1)} out of 5 ({reviews.length} reviews)
            </span>
          </div>
        </div>

        {user && (
          <div className="md:w-1/2">
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 border border-luxury-gold/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Your Rating</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={18}
                        className={cn(
                          "transition-all hover:scale-110",
                          star <= rating ? "fill-luxury-gold text-luxury-gold" : "text-gray-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this fragrance..."
                className="w-full p-4 text-sm border border-gray-100 focus:border-luxury-gold focus:outline-none min-h-[100px] transition-colors"
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={submitting}
                className="luxury-button w-full py-3 text-[10px]"
              >
                {submitting ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="space-y-12">
        <AnimatePresence mode="popLayout">
          {reviews.length === 0 ? (
            <p className="text-center text-luxury-black/40 py-12 italic">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="pb-12 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1">{review.userName}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={cn(
                            star <= review.rating ? "fill-luxury-gold text-luxury-gold" : "text-gray-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-luxury-black/40 uppercase tracking-widest">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-luxury-black/70 leading-relaxed text-sm italic">
                  "{review.comment}"
                </p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
