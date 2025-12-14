import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sweetsService, Sweet, CreateSweetDto } from '../services/sweetsService';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const data = await sweetsService.getAll();
      setSweets(data);
    } catch (err) {
      console.error('Failed to load sweets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateSweetDto) => {
    try {
      await sweetsService.create(data);
      fetchSweets();
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create sweet');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sweet?')) return;
    try {
      await sweetsService.delete(id);
      fetchSweets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete sweet');
    }
  };

  const handleRestock = async (id: string, quantity: number) => {
    try {
      await sweetsService.restock(id, quantity);
      fetchSweets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to restock');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>Admin Dashboard</h1>
        <div>
          <a href="/dashboard" style={{ marginRight: '15px', textDecoration: 'none' }}>
            Dashboard
          </a>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <button onClick={() => setShowAddForm(true)} style={{ marginBottom: '20px', padding: '10px 20px' }}>
        Add New Sweet
      </button>

      {showAddForm && <AddSweetForm onSubmit={handleCreate} onCancel={() => setShowAddForm(false)} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {sweets.map((sweet) => (
          <div key={sweet.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h3>{sweet.name}</h3>
            <p>Category: {sweet.category}</p>
            <p>Price: ₹{sweet.price}</p>
            <p>Stock: {sweet.quantity}</p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <input
                type="number"
                placeholder="Restock qty"
                min="1"
                style={{ width: '100px', padding: '5px' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    const qty = parseInt(input.value);
                    if (qty > 0) {
                      handleRestock(sweet.id, qty);
                      input.value = '';
                    }
                  }
                }}
              />
              <button onClick={() => handleDelete(sweet.id)} style={{ padding: '5px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AddSweetForm = ({ onSubmit, onCancel }: { onSubmit: (data: CreateSweetDto) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState<CreateSweetDto>({
    name: '',
    category: '',
    price: 0,
    quantity: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
      <h3>Add New Sweet</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
            min="0"
            step="0.01"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="number"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            required
            min="0"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Create
          </button>
          <button type="button" onClick={onCancel} style={{ padding: '10px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminDashboard;

