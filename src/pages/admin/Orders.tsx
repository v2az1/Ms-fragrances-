import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Search, Filter, Eye, CheckCircle, Truck, Check, Trash2, X } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await deleteDoc(doc(db, 'orders', orderToDelete));
      toast.success('Order deleted successfully');
      if (selectedOrder?.id === orderToDelete) setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to delete order');
    } finally {
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const openDeleteModal = (id: string) => {
    setOrderToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ordered': return 'text-blue-500 bg-blue-50';
      case 'Confirmed': return 'text-purple-500 bg-purple-50';
      case 'Out for Delivery': return 'text-orange-500 bg-orange-50';
      case 'Delivered': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif text-luxury-black">Order Management</h1>

      <div className="bg-white/80 backdrop-blur-md p-4 border border-white/10 shadow-lg flex items-center gap-4 rounded-lg">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search orders by name or ID..." 
          className="bg-transparent outline-none text-sm w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders List */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-luxury-black/5 text-gray-500 uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={cn(
                      "hover:bg-luxury-gold/5 cursor-pointer transition-colors",
                      selectedOrder?.id === order.id ? 'bg-luxury-gold/10' : ''
                    )}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 font-mono text-[10px] text-gray-500">{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-medium text-luxury-black">{order.customerName}</td>
                    <td className="px-6 py-4 text-gray-500">{format(new Date(order.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-luxury-black">{formatCurrency(order.totalPrice)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Eye size={16} className="text-luxury-gold" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(order.id);
                          }}
                          className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Panel */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-white/90 backdrop-blur-md border border-white/10 shadow-2xl p-6 lg:p-8 sticky top-8 space-y-8 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-serif text-luxury-black">Order Details</h2>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">ID: {selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="lg:hidden">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-medium">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">{selectedOrder.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Address</span>
                  <span className="font-medium text-right max-w-[200px]">{selectedOrder.address}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-luxury-gold mb-4">Items Ordered</h3>
                <div className="space-y-4">
                  {selectedOrder.products.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} <span className="text-[10px] text-gray-400">x{item.quantity}</span></span>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t border-gray-100 pt-4 text-luxury-black">
                    <span>Total Amount</span>
                    <span className="text-lg">{formatCurrency(selectedOrder.totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-3">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Update Order Status</h3>
                <button 
                  onClick={() => updateStatus(selectedOrder.id, 'Confirmed')}
                  disabled={selectedOrder.status !== 'Ordered'}
                  className="w-full flex items-center justify-center gap-2 py-3 text-[10px] uppercase tracking-widest font-bold border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white disabled:opacity-30 transition-all duration-300"
                >
                  <CheckCircle size={14} /> Confirm Order
                </button>
                <button 
                  onClick={() => updateStatus(selectedOrder.id, 'Out for Delivery')}
                  disabled={selectedOrder.status !== 'Confirmed'}
                  className="w-full flex items-center justify-center gap-2 py-3 text-[10px] uppercase tracking-widest font-bold border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white disabled:opacity-30 transition-all duration-300"
                >
                  <Truck size={14} /> Out for Delivery
                </button>
                <button 
                  onClick={() => updateStatus(selectedOrder.id, 'Delivered')}
                  disabled={selectedOrder.status !== 'Out for Delivery'}
                  className="w-full flex items-center justify-center gap-2 py-3 text-[10px] uppercase tracking-widest font-bold border border-green-500 text-green-500 hover:bg-green-500 hover:text-white disabled:opacity-30 transition-all duration-300"
                >
                  <Check size={14} /> Mark Delivered
                </button>
              </div>

              <button 
                onClick={() => openDeleteModal(selectedOrder.id)}
                className="w-full flex items-center justify-center gap-2 py-3 text-[10px] uppercase tracking-widest font-bold bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 rounded"
              >
                <Trash2 size={14} /> Delete Order
              </button>
            </div>
          ) : (
            <div className="bg-white/50 backdrop-blur-sm border border-dashed border-gray-200 p-12 text-center text-gray-400 rounded-xl">
              Select an order from the list to view full details and manage status
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteOrder}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
