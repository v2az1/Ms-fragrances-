import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const q = query(collection(db, 'products'), limit(4));
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setFeaturedProducts(products);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1920" 
            alt="Luxury Perfume" 
            className="w-full h-full object-cover brightness-50"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-xs uppercase tracking-[0.5em] mb-6 text-luxury-gold font-bold"
          >
            The Art of Fragrance
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-8xl font-serif mb-8 leading-tight"
          >
            Elegance in Every Drop
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/products" className="luxury-button border border-white hover:border-luxury-gold">
              Explore Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-bold mb-4">Curated Selection</h2>
            <h3 className="text-4xl md:text-5xl font-serif leading-tight">Our Signature Scents</h3>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-xs uppercase tracking-widest font-bold hover:text-luxury-gold transition-colors">
            View All Products <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-[3/4] overflow-hidden mb-6 bg-white border border-luxury-gold/10">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-luxury-black/40 mb-2">{product.category}</p>
                  <h4 className="text-lg font-serif mb-2 group-hover:text-luxury-gold transition-colors">{product.name}</h4>
                  <p className="text-sm font-medium">{formatCurrency(product.price)}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Brand Story */}
      <section className="bg-luxury-black text-white py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center text-center">
          <div className="max-w-3xl space-y-8">
            <h2 className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-bold">Our Philosophy</h2>
            <h3 className="text-4xl md:text-6xl font-serif leading-tight">A Legacy of Scent</h3>
            <p className="text-white/60 leading-relaxed text-lg">
              At MS Fragrances, we believe that a scent is more than just a fragrance—it's a memory, an identity, and a statement. Our master perfumers combine traditional techniques with modern innovation to create scents that are truly unique.
            </p>
            <p className="text-white/60 leading-relaxed text-lg">
              Each bottle is a masterpiece, crafted with the finest ingredients sourced from around the globe. From the fields of Grasse to the forests of the East, we bring you the world in a single drop.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
