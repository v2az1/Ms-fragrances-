import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { auth } from '../firebase';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, profile, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      isScrolled ? "bg-white/90 backdrop-blur-md py-4 shadow-sm" : "bg-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-luxury-black"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="text-2xl font-serif tracking-[0.3em] text-luxury-black">
          MS FRAGRANCES
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12 text-xs uppercase tracking-widest font-medium">
          <Link to="/" className="hover:text-luxury-gold transition-colors">Home</Link>
          <Link to="/products" className="hover:text-luxury-gold transition-colors">Collection</Link>
          {isAdmin && (
            <Link to="/admin" className="text-luxury-gold font-bold">Admin Panel</Link>
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-6">
          <Link to="/cart" className="relative group">
            <ShoppingBag size={20} className="group-hover:text-luxury-gold transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-luxury-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="group">
                <User size={20} className="group-hover:text-luxury-gold transition-colors" />
              </Link>
              <button onClick={handleLogout} className="group">
                <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="text-xs uppercase tracking-widest font-semibold hover:text-luxury-gold transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-luxury-gold/10 p-8 flex flex-col gap-6 text-center text-xs uppercase tracking-widest font-medium animate-in fade-in slide-in-from-top-4">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setIsMenuOpen(false)}>Collection</Link>
          {user && <Link to="/profile" onClick={() => setIsMenuOpen(false)}>My Profile</Link>}
          {user && <Link to="/orders" onClick={() => setIsMenuOpen(false)}>My Orders</Link>}
          {isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>}
        </div>
      )}
    </nav>
  );
}
