import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Tag, ShoppingCart, UserCheck, BarChart3, X } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

interface Category {
  _id: string;
  name: string;
  image: string;
}

export const AdminDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      navigate('/');
    }
  }, [token, user, navigate]);

  // States
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog Forms State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form Fields
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodStock, setProdStock] = useState('');

  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');

  // Modal Refs
  const productDialogRef = useRef<HTMLDialogElement | null>(null);
  const categoryDialogRef = useRef<HTMLDialogElement | null>(null);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');

      // Fetch stats
      const statsRes = await fetch('/api/orders/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch products
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      // Fetch categories
      const catRes = await fetch('/api/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (err) {
      setError('Error loading administration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Product Modals Triggers
  const openAddProduct = () => {
    setIsEditing(false);
    setCurrentId(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdCategory(categories[0]?.name || '');
    setProdImage('');
    setProdStock('');
    productDialogRef.current?.showModal();
  };

  const openEditProduct = (prod: Product) => {
    setIsEditing(true);
    setCurrentId(prod._id);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdPrice(prod.price.toString());
    setProdCategory(prod.category);
    setProdImage(prod.image);
    setProdStock(prod.stock.toString());
    productDialogRef.current?.showModal();
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name: prodName,
      description: prodDesc,
      price: Number(prodPrice),
      category: prodCategory,
      image: prodImage,
      stock: Number(prodStock)
    };

    try {
      const url = isEditing ? `/api/products/${currentId}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(`Product ${isEditing ? 'updated' : 'created'} successfully!`);
        productDialogRef.current?.close();
        fetchDashboardData();
      } else {
        const data = await res.json();
        setError(data.message || 'Error processing product.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setSuccess('Product deleted successfully!');
        fetchDashboardData();
      } else {
        setError('Error deleting product.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  // Category Modals Triggers
  const openAddCategory = () => {
    setIsEditing(false);
    setCurrentId(null);
    setCatName('');
    setCatImage('');
    categoryDialogRef.current?.showModal();
  };

  const openEditCategory = (cat: Category) => {
    setIsEditing(true);
    setCurrentId(cat._id);
    setCatName(cat.name);
    setCatImage(cat.image);
    categoryDialogRef.current?.showModal();
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name: catName,
      image: catImage
    };

    try {
      const url = isEditing ? `/api/categories/${currentId}` : '/api/categories';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(`Category ${isEditing ? 'updated' : 'created'} successfully!`);
        categoryDialogRef.current?.close();
        fetchDashboardData();
      } else {
        const data = await res.json();
        setError(data.message || 'Error processing category.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setSuccess('Category deleted successfully!');
        fetchDashboardData();
      } else {
        setError('Error deleting category.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <div className="pb-16 max-w-7xl mx-auto px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-app-text">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Manage inventory catalog, categories and view metrics</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 text-xs font-semibold text-red-500 mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-4 text-xs font-semibold text-green-600 mb-6 animate-pulse">
          {success}
        </div>
      )}

      {/* 1. Metrics Overview Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4.5 mb-10">
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <Tag className="h-10 w-10 text-primary shrink-0" />
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Products</span>
              <p className="text-xl font-extrabold text-app-text">{stats.totalProducts}</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <Plus className="h-10 w-10 text-emerald-500 shrink-0" />
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Categories</span>
              <p className="text-xl font-extrabold text-app-text">{stats.totalCategories}</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <UserCheck className="h-10 w-10 text-blue-500 shrink-0" />
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Users</span>
              <p className="text-xl font-extrabold text-app-text">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <ShoppingCart className="h-10 w-10 text-indigo-500 shrink-0" />
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Orders</span>
              <p className="text-xl font-extrabold text-app-text">{stats.totalOrders}</p>
            </div>
          </div>

          <div className="glass-panel col-span-2 lg:col-span-1 p-5 rounded-2xl flex items-center gap-4">
            <BarChart3 className="h-10 w-10 text-amber-500 shrink-0" />
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Revenue</span>
              <p className="text-xl font-extrabold text-primary">Rs. {stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Management Sections Navigation Tabs */}
      <div className="border-b border-app-border flex gap-6 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'products' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-400'
          }`}
        >
          Manage Catalog Items
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'categories' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-400'
          }`}
        >
          Manage Categories
        </button>
      </div>

      {loading ? (
        <div className="h-60 rounded-3xl glass-panel animate-pulse flex items-center justify-center">
          <span className="text-xs text-gray-400 font-medium">Fetching catalog databases...</span>
        </div>
      ) : activeTab === 'products' ? (
        /* 3. Products Table */
        <div className="glass-panel rounded-3xl overflow-hidden border border-app-border">
          <div className="p-5 flex justify-between items-center border-b border-app-border bg-glass-bg/40">
            <h3 className="font-bold text-app-text text-sm">Product List</h3>
            <button
              onClick={openAddProduct}
              className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 px-4 rounded-full shadow"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-app-border text-xs text-gray-400 bg-glass-bg/20 uppercase font-bold">
                  <th className="p-4">Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border text-app-text">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/10">
                    <td className="p-4 flex items-center gap-3">
                      <img src={prod.image} alt={prod.name} className="h-10 w-10 rounded-lg object-cover bg-slate-100" />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{prod.name}</p>
                        <p className="text-[10px] text-gray-500 line-clamp-1">{prod.description}</p>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-500">{prod.category}</td>
                    <td className="p-4 font-bold text-app-text">Rs. {prod.price.toFixed(2)}</td>
                    <td className="p-4">
                      {prod.stock === 0 ? (
                        <span className="text-red-500 font-semibold text-xs">Out of Stock</span>
                      ) : prod.stock <= 5 ? (
                        <span className="text-amber-500 font-semibold text-xs animate-pulse">Low ({prod.stock})</span>
                      ) : (
                        <span className="text-green-500 font-semibold text-xs">{prod.stock} items</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditProduct(prod)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-850"
                          aria-label="Edit"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-slate-850"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 4. Categories Table */
        <div className="glass-panel rounded-3xl overflow-hidden border border-app-border">
          <div className="p-5 flex justify-between items-center border-b border-app-border bg-glass-bg/40">
            <h3 className="font-bold text-app-text text-sm">Categories List</h3>
            <button
              onClick={openAddCategory}
              className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 px-4 rounded-full shadow"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-app-border text-xs text-gray-400 bg-glass-bg/20 uppercase font-bold">
                  <th className="p-4">Category Image</th>
                  <th className="p-4">Category Name</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border text-app-text">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/10">
                    <td className="p-4">
                      <img src={cat.image} alt={cat.name} className="h-10 w-10 rounded-full object-cover bg-slate-100" />
                    </td>
                    <td className="p-4 font-bold text-app-text">{cat.name}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditCategory(cat)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-850"
                          aria-label="Edit"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-slate-850"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Product Form Dialog Modal */}
      <dialog ref={productDialogRef} className="rounded-3xl p-6 glass-panel max-w-md w-full text-app-text bg-glass-bg/95">
        <div className="flex items-center justify-between border-b border-app-border pb-3 mb-4">
          <h3 className="font-bold text-base">{isEditing ? 'Edit Product Details' : 'Add New Catalog Item'}</h3>
          <button onClick={() => productDialogRef.current?.close()} className="text-gray-400 hover:text-app-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleProductSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-450 uppercase">Product Name</label>
            <input
              type="text"
              required
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
              placeholder="e.g. Organic Avocados"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-450 uppercase">Category</label>
            <select
              value={prodCategory}
              onChange={(e) => setProdCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
            >
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-450 uppercase">Price (Rs.)</label>
              <input
                type="number"
                step="0.01"
                required
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                placeholder="2.99"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-450 uppercase">Stock Count</label>
              <input
                type="number"
                required
                value={prodStock}
                onChange={(e) => setProdStock(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                placeholder="50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-450 uppercase">Image URL</label>
            <input
              type="url"
              required
              value={prodImage}
              onChange={(e) => setProdImage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
              placeholder="https://unsplash.com/..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-450 uppercase">Description</label>
            <textarea
              required
              rows={3}
              value={prodDesc}
              onChange={(e) => setProdDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs resize-none"
              placeholder="Detail descriptions of product nutrition, farm sources..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-full shadow transition-all"
          >
            {isEditing ? 'Save Product Changes' : 'Publish Product'}
          </button>
        </form>
      </dialog>

      {/* 6. Category Form Dialog Modal */}
      <dialog ref={categoryDialogRef} className="rounded-3xl p-6 glass-panel max-w-md w-full text-app-text bg-glass-bg/95">
        <div className="flex items-center justify-between border-b border-app-border pb-3 mb-4">
          <h3 className="font-bold text-base">{isEditing ? 'Edit Category' : 'Add New Category'}</h3>
          <button onClick={() => categoryDialogRef.current?.close()} className="text-gray-400 hover:text-app-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-450 uppercase">Category Name</label>
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
              placeholder="e.g. Snacks"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-450 uppercase">Image URL</label>
            <input
              type="url"
              required
              value={catImage}
              onChange={(e) => setCatImage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
              placeholder="https://unsplash.com/..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-full shadow transition-all"
          >
            {isEditing ? 'Save Category Changes' : 'Create Category'}
          </button>
        </form>
      </dialog>
    </div>
  );
};
