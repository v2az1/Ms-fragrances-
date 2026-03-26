import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, auth } from '../../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Shield, LogOut, Settings, Package, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function Profile() {
  const { user, profile, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const navigate = useNavigate();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateProfile(user, { displayName: name });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/auth');
    } catch (error: any) {
      toast.error('Failed to logout: ' + error.message);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold mb-12 hover:text-luxury-gold transition-colors"
      >
        <ArrowLeft size={14} /> Back to Home
      </button>
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">My Account</h1>
        <p className="text-luxury-black/60 text-sm uppercase tracking-widest">Manage your profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Sidebar Info */}
        <div className="md:col-span-1 space-y-8">
          <div className="bg-white p-8 border border-luxury-gold/10 text-center">
            <div className="w-24 h-24 bg-luxury-cream rounded-full flex items-center justify-center mx-auto mb-6 text-luxury-gold">
              <User size={48} />
            </div>
            <h2 className="text-xl font-serif mb-1">{user.displayName || 'Valued Customer'}</h2>
            <p className="text-xs text-luxury-black/40 uppercase tracking-widest mb-6">{profile.role}</p>
            
            <div className="space-y-4 pt-6 border-t border-luxury-gold/10">
              <Link 
                to="/orders" 
                className="flex items-center gap-3 text-xs uppercase tracking-widest font-bold hover:text-luxury-gold transition-colors"
              >
                <Package size={16} /> My Orders
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="flex items-center gap-3 text-xs uppercase tracking-widest font-bold text-luxury-gold hover:opacity-80 transition-opacity"
                >
                  <Shield size={16} /> Admin Panel
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 text-xs uppercase tracking-widest font-bold text-red-500 hover:text-red-600 transition-colors w-full"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          <div className="bg-white p-6 border border-luxury-gold/10 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-luxury-gold" />
              <span className="text-luxury-black/60">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-luxury-gold" />
              <span className="text-luxury-black/60">Joined {format(new Date(profile.createdAt), 'MMM yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 border border-luxury-gold/10 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-luxury-gold/10">
              <Settings size={20} className="text-luxury-gold" />
              <h3 className="text-xl font-serif">Profile Settings</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Display Name</label>
                <input
                  type="text"
                  className="luxury-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-luxury-black/40">Email Address (Read Only)</label>
                <input
                  type="email"
                  disabled
                  className="luxury-input opacity-50 cursor-not-allowed"
                  value={user.email || ''}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="luxury-button w-full py-4"
              >
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
