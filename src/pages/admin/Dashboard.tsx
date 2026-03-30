import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  writeBatch,
  doc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, Product, UserProfile } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp,
  Database,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenue: 0,
    totalReviews: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const seedMockProducts = async () => {
    setSeeding(true);
    try {
      const mockProducts = [
        {
          name: "Midnight Rose",
          price: 120,
          description: "A mysterious and seductive blend of dark rose, patchouli, and vanilla. Perfect for evening wear.",
          category: "Perfume",
          stock: 50,
          image: "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        },
        {
          name: "Sandalwood Drift",
          price: 95,
          description: "Warm, creamy sandalwood paired with hints of cardamom and cedar. A grounding unisex scent.",
          category: "Oudh",
          stock: 35,
          image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        },
        {
          name: "Golden Amber",
          price: 150,
          description: "Rich amber, labdanum, and sweet tonka bean. An opulent oriental fragrance that lasts all day.",
          category: "Attar",
          stock: 20,
          image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        },
        {
          name: "Ocean Mist",
          price: 85,
          description: "Crisp sea salt, ozone, and a touch of white jasmine. Refreshing like a morning walk on the beach.",
          category: "Perfume",
          stock: 60,
          image: "https://images.unsplash.com/photo-1512789675414-521645811e4f?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        },
        {
          name: "Velvet Oud",
          price: 210,
          description: "Rare Cambodian oud softened with damask rose and leather. The pinnacle of luxury perfumery.",
          category: "Oudh",
          stock: 15,
          image: "https://images.unsplash.com/photo-1585120040315-2241b774ad0f?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        },
        {
          name: "Citrus Bloom",
          price: 75,
          description: "Zesty bergamot and neroli balanced with a clean musk base. Bright, energetic, and uplifting.",
          category: "Perfume",
          stock: 45,
          image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        },
        {
          name: "Lavender Dreams",
          price: 65,
          description: "Pure French lavender mixed with sweet tonka bean and a hint of vanilla. The ultimate relaxation scent.",
          category: "Perfume",
          stock: 40,
          image: "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        },
        {
          name: "Spiced Cedar",
          price: 110,
          description: "Robust cedarwood infused with black pepper, cinnamon, and a touch of leather. Bold and sophisticated.",
          category: "Oudh",
          stock: 25,
          image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        },
        {
          name: "White Musk",
          price: 55,
          description: "A clean, powdery musk with subtle notes of lily and iris. A timeless classic for everyday elegance.",
          category: "Attar",
          stock: 100,
          image: "https://images.unsplash.com/photo-1512789675414-521645811e4f?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        },
        {
          name: "Jasmine Night",
          price: 135,
          description: "Intoxicating night-blooming jasmine paired with exotic ylang-ylang and a base of creamy sandalwood.",
          category: "Perfume",
          stock: 30,
          image: "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        },
        {
          name: "Bergamot Breeze",
          price: 80,
          description: "Sparkling Italian bergamot combined with green tea and a splash of lemon. Crisp and revitalizing.",
          category: "Perfume",
          stock: 55,
          image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        },
        {
          name: "Vanilla Sky",
          price: 90,
          description: "Creamy Madagascar vanilla with a hint of toasted almond and white musk. Comforting and sweet.",
          category: "Attar",
          stock: 48,
          image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        },
        {
          name: "Forest Rain",
          price: 105,
          description: "The scent of damp earth and pine needles after a heavy rain. Fresh, green, and invigorating.",
          category: "Oudh",
          stock: 32,
          image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        },
        {
          name: "Peony Petals",
          price: 70,
          description: "Soft pink peonies and juicy red apples on a base of suede. Feminine, light, and romantic.",
          category: "Perfume",
          stock: 65,
          image: "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&q=80&w=800",
          createdAt: new Date().toISOString()
        }
      ];

      const batch = writeBatch(db);
      mockProducts.forEach((product) => {
        const newDocRef = doc(collection(db, 'products'));
        batch.set(newDocRef, product);
      });

      await batch.commit();
      toast.success('Mock products seeded successfully!');
      window.location.reload(); // Refresh to see new stats
    } catch (error: any) {
      toast.error('Failed to seed products: ' + error.message);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const productsSnap = await getDocs(collection(db, 'products'));
        const usersSnap = await getDocs(collection(db, 'users'));
        const reviewsSnap = await getDocs(collection(db, 'reviews'));

        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        setStats({
          totalOrders: ordersSnap.size,
          totalProducts: productsSnap.size,
          totalUsers: usersSnap.size,
          revenue: totalRevenue,
          totalReviews: reviewsSnap.size
        });

        const recentQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(recentQ);
        setRecentOrders(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.revenue), icon: TrendingUp, color: 'text-green-600' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-purple-600' },
    { label: 'Total Reviews', value: stats.totalReviews, icon: Star, color: 'text-yellow-600' },
  ];

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-2 text-luxury-black">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Welcome back to the MS Fragrances admin panel.</p>
        </div>
        <button 
          onClick={seedMockProducts}
          disabled={seeding}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold border border-luxury-gold/20 px-4 py-2 hover:bg-luxury-gold hover:text-white transition-all disabled:opacity-50 rounded shadow-sm"
        >
          <Database size={14} />
          {seeding ? 'Seeding...' : 'Seed Mock Products'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-md p-6 border border-white/10 shadow-xl rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 bg-gray-50 rounded-xl ${stat.color} shadow-inner`}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-luxury-black">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden rounded-xl">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-serif text-xl text-luxury-black">Recent Orders</h2>
            <Link to="/admin/orders" className="text-[10px] uppercase tracking-widest font-bold text-luxury-gold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="bg-luxury-black/5 text-gray-500 uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-luxury-gold/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-gray-500">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 font-medium text-luxury-black">{order.customerName}</td>
                    <td className="px-6 py-4">
                      <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-luxury-black">{formatCurrency(order.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-md border border-white/10 shadow-xl p-6 rounded-xl">
          <h2 className="font-serif text-xl text-luxury-black mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/admin/products" className="block w-full luxury-button py-4 text-[10px] shadow-lg shadow-luxury-black/10 text-center">
              Add New Product
            </Link>
            <Link to="/admin/orders" className="block w-full border border-luxury-black py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-luxury-black hover:text-white transition-all duration-300 text-center">
              Manage Orders
            </Link>
            <Link to="/admin/users" className="block w-full border border-luxury-black/10 py-4 text-[10px] uppercase tracking-widest font-bold hover:border-luxury-gold transition-all duration-300 text-center">
              Manage Users
            </Link>
            <Link to="/admin/reviews" className="block w-full border border-luxury-black/10 py-4 text-[10px] uppercase tracking-widest font-bold hover:border-luxury-gold transition-all duration-300 text-center">
              Manage Reviews
            </Link>
            <div className="pt-6 mt-6 border-t border-gray-100">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">System Status</h3>
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                Firebase Connected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
