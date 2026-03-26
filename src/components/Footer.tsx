import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-luxury-black text-white py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center gap-4">
        <h2 className="text-xl font-serif tracking-[0.3em] mb-2">MS FRAGRANCES</h2>
        <p className="text-[10px] uppercase tracking-widest text-white/40">
          © {new Date().getFullYear()} MS FRAGRANCES. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
