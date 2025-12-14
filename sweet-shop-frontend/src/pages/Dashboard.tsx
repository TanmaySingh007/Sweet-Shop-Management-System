import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sweetsService, Sweet } from '../services/sweetsService';
import SweetCard from '../components/SweetCard';

const Dashboard = () => {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const data = await sweetsService.getAll();
      setSweets(data);
    } catch (err: any) {
      setError('Failed to load sweets');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (id: string) => {
    try {
      const updatedSweet = await sweetsService.purchase(id);
      setSweets(sweets.map((s) => (s.id === id ? updatedSweet : s)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Purchase failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>Sweet Shop Dashboard</h1>
        <div>
          {isAdmin && (
            <a href="/admin" style={{ marginRight: '15px', textDecoration: 'none' }}>
              Admin Panel
            </a>
          )}
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {sweets.map((sweet) => (
          <SweetCard key={sweet.id} sweet={sweet} onPurchase={handlePurchase} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

