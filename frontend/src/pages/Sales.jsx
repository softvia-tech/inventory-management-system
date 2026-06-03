import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { Receipt } from 'lucide-react';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const data = await fetchApi('/sales');
      // Sort by timestamp descending
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setSales(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading sales history...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--primary-color)', padding: '8px', borderRadius: '8px' }}>
          <Receipt size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '28px', margin: 0 }}>Sales History</h2>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '16px' }}>Invoice Number</th>
              <th style={{ padding: '16px' }}>Date</th>
              <th style={{ padding: '16px' }}>Payment Mode</th>
              <th style={{ padding: '16px' }}>Items</th>
              <th style={{ padding: '16px' }}>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '16px', fontWeight: '500', color: 'var(--primary-color)' }}>{s.invoiceNumber}</td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{new Date(s.timestamp).toLocaleString()}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', fontSize: '12px' }}>
                    {s.paymentMode}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>{s.items.length}</td>
                <td style={{ padding: '16px', fontWeight: 'bold' }}>₹{s.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No sales recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
