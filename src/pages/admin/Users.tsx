import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile } from '../../types';
import { format } from 'date-fns';
import { Search, Mail, Calendar, Shield } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile)));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif text-luxury-black">User Management</h1>

      <div className="bg-white/80 backdrop-blur-md p-4 border border-white/10 shadow-lg flex items-center gap-4 rounded-lg">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search users by email or role..." 
          className="bg-transparent outline-none text-sm w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-luxury-black/5 text-gray-500 uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
                <th className="px-6 py-4 font-medium">UID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-luxury-gold/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-luxury-cream rounded-full flex items-center justify-center text-luxury-gold shadow-inner">
                        <Mail size={16} />
                      </div>
                      <span className="font-medium text-luxury-black">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                      user.role === 'admin' ? 'bg-luxury-gold text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-luxury-gold" />
                      {format(new Date(user.createdAt), 'PPP')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-gray-400">{user.uid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
