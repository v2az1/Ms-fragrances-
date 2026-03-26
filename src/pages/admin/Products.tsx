import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { Product } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { Plus, Edit2, Trash2, X, Upload, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmationModal from '../../components/ConfirmationModal';
import { generateProductDescription } from '../../services/gemini';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'floral',
    stock: '',
    image: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData({ ...formData, image: url });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), data);
        toast.success('Product updated');
      } else {
        await addDoc(collection(db, 'products'), data);
        toast.success('Product added');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', description: '', category: 'floral', stock: '', image: '' });
      fetchProducts();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteDoc(doc(db, 'products', productToDelete));
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const openDeleteModal = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      stock: product.stock.toString(),
      image: product.image
    });
    setIsModalOpen(true);
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      toast.error('Please enter a product name first');
      return;
    }

    setGenerating(true);
    try {
      const description = await generateProductDescription(formData.name, formData.category);
      setFormData({ ...formData, description: description || '' });
      toast.success('AI Description generated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate description');
    } finally {
      setGenerating(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif">Product Management</h1>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', price: '', description: '', category: 'floral', stock: '', image: '' });
            setIsModalOpen(true);
          }}
          className="luxury-button flex items-center gap-2"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 border border-gray-100 flex items-center gap-4">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search products..." 
          className="bg-transparent outline-none text-sm w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Table */}
      <div className="bg-white/80 backdrop-blur-md border border-white/10 shadow-xl overflow-x-auto rounded-lg">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-luxury-black/5 text-gray-500 uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-luxury-gold/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={product.image} alt="" className="w-12 h-12 object-cover rounded shadow-sm" referrerPolicy="no-referrer" />
                    <span className="font-medium text-luxury-black">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 uppercase text-[10px] tracking-widest text-gray-600">{product.category}</td>
                <td className="px-6 py-4 font-medium">{formatCurrency(product.price)}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold",
                    product.stock < 10 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                  )}>
                    {product.stock} in stock
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => openEditModal(product)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => openDeleteModal(product.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl p-6 lg:p-8 shadow-2xl max-h-[90vh] overflow-y-auto rounded-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif text-luxury-black">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform duration-300">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500">Product Name</label>
                  <input 
                    type="text" required className="luxury-input" 
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500">Price (PKR)</label>
                  <input 
                    type="number" step="0.01" required className="luxury-input" 
                    value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500">Stock</label>
                  <input 
                    type="number" required className="luxury-input" 
                    value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500">Category</label>
                  <select 
                    className="luxury-input" 
                    value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="floral">Floral</option>
                    <option value="woody">Woody</option>
                    <option value="oriental">Oriental</option>
                    <option value="fresh">Fresh</option>
                    <option value="citrus">Citrus</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500">Image Source</label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer bg-luxury-black text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-luxury-gold transition-colors">
                        <Upload size={14} />
                        Upload File
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest">Or</span>
                      <input 
                        type="url" 
                        placeholder="Paste image URL here..." 
                        className="luxury-input flex-grow"
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                      />
                    </div>
                    {uploading && <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-luxury-gold h-full animate-progress w-1/2" />
                    </div>}
                    {formData.image && (
                      <div className="relative w-24 h-24 group">
                        <img src={formData.image} className="w-full h-full object-cover rounded border border-gray-100" referrerPolicy="no-referrer" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, image: ''})}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">Description</label>
                  <button 
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={generating}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-luxury-gold hover:text-luxury-black transition-colors disabled:opacity-50"
                  >
                    <Sparkles size={12} className={generating ? "animate-pulse" : ""} />
                    {generating ? 'Generating...' : 'AI Generate'}
                  </button>
                </div>
                <textarea 
                  required rows={4} className="luxury-input resize-none" 
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button type="submit" className="luxury-button w-full py-4 shadow-lg shadow-luxury-black/10">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
