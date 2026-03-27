import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, X } from 'lucide-react';

export default function ProductList() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categoryFilter || 'all');

  const categories = ['all', 'Attar', 'Oudh', 'Perfume'];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        
        if (activeCategory !== 'all') {
          q = query(collection(db, 'products'), where('category', '==', activeCategory), orderBy('createdAt', 'desc'));
        }
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">The Collection</h1>
          <p className="text-luxury-black/60 text-sm uppercase tracking-widest">
            {activeCategory === 'all' ? 'All Fragrances' : `${activeCategory} Collection`}
          </p>
        </div>

        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold border border-luxury-black/10 px-6 py-3 hover:border-luxury-gold transition-colors"
        >
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* Filter Sidebar/Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-12 border-b border-luxury-gold/10 pb-8"
          >
            <div className="flex flex-wrap gap-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 text-xs uppercase tracking-widest font-medium transition-all ${
                    activeCategory === cat 
                      ? "bg-luxury-black text-white" 
                      : "bg-white text-luxury-black/60 hover:text-luxury-black border border-luxury-black/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
              <div className="h-4 bg-gray-200 animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-40">
          <p className="text-luxury-black/40 uppercase tracking-widest">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">
          {products.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <Link to={`/product/${product.id}`}>
                <div className="aspect-[3/4] overflow-hidden mb-6 bg-white border border-luxury-gold/10 relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-red-500">Out of Stock</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-luxury-black/40 mb-2">{product.category}</p>
                <h4 className="text-lg font-serif mb-2 group-hover:text-luxury-gold transition-colors">{product.name}</h4>
                <p className="text-sm font-medium">{formatCurrency(product.price)}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
