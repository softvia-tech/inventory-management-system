import React, { useEffect, useState } from 'react';
import { Package, TrendingUp, DollarSign } from 'lucide-react';
import { fetchApi } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalProducts: 0, totalSales: 0 });

  useEffect(() => {
    // In a real app, we'd fetch specific dashboard metrics here.
    // For now, we just mock or fetch generic lists.
    const loadData = async () => {
      try {
        const products = await fetchApi('/products');
        setStats(prev => ({ ...prev, totalProducts: products.length }));
      } catch (e) { }
    };
    loadData();
  }, []);

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Dashboard Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--primary-color)' }}>
            <Package size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Total Products</p>
            <h3 style={{ margin: 0, fontSize: '24px' }}>{stats.totalProducts}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Sales Today</p>
            <h3 style={{ margin: 0, fontSize: '24px' }}>Coming soon</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
