import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useCart } from '../../contexts/CartContext';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success(`${product.name} added to cart`);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold mb-12 hover:text-luxury-gold transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="aspect-[4/5] bg-white border border-luxury-gold/10 overflow-hidden"
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Info Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-bold mb-4">{product.category}</p>
          <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">{product.name}</h1>
          <p className="text-2xl font-medium mb-8">{formatCurrency(product.price)}</p>
          
          <div className="prose prose-sm text-luxury-black/70 mb-12 leading-relaxed max-w-none">
            <p>{product.description}</p>
          </div>

          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-4 text-xs uppercase tracking-widest font-medium">
              <span className="text-luxury-black/40">Availability:</span>
              <span className={product.stock > 0 ? "text-green-600" : "text-red-500"}>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="luxury-button w-full flex items-center justify-center gap-3 py-5"
          >
            <ShoppingBag size={18} />
            Add to Bag
          </button>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-16 pt-16 border-t border-luxury-gold/10">
            <div className="text-center space-y-2">
              <Truck size={20} className="mx-auto text-luxury-gold" />
              <p className="text-[10px] uppercase tracking-widest font-bold">Free Shipping</p>
            </div>
            <div className="text-center space-y-2">
              <ShieldCheck size={20} className="mx-auto text-luxury-gold" />
              <p className="text-[10px] uppercase tracking-widest font-bold">Secure Payment</p>
            </div>
            <div className="text-center space-y-2">
              <RefreshCcw size={20} className="mx-auto text-luxury-gold" />
              <p className="text-[10px] uppercase tracking-widest font-bold">Easy Returns</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
