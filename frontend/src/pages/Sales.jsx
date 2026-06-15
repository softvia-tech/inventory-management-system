import React, { useState, useEffect } from 'react';
import { fetchApi, processReturn } from '../services/api';
import { Receipt, X, RotateCcw, Search } from 'lucide-react';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [returnQuantities, setReturnQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

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

  const openReturnModal = (transaction) => {
    setSelectedTransaction(transaction);
    setReturnQuantities({});
    setIsReturnModalOpen(true);
  };

  const handleReturnQuantityChange = (itemId, qty, max) => {
    let val = parseInt(qty, 10) || 0;
    if (val < 0) val = 0;
    if (val > max) val = max;
    setReturnQuantities(prev => ({ ...prev, [itemId]: val }));
  };

  const submitReturn = async (e) => {
    e.preventDefault();
    const itemsToReturn = Object.entries(returnQuantities)
      .map(([salesItemId, qty]) => ({ salesItemId, quantityToReturn: qty }))
      .filter(item => item.quantityToReturn > 0);
      
    if (itemsToReturn.length === 0) {
      alert("Please enter at least one quantity to return.");
      return;
    }
    
    try {
      await processReturn(selectedTransaction.id, { items: itemsToReturn });
      setIsReturnModalOpen(false);
      loadSales(); 
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading sales history...</div>;

  const filteredSales = sales.filter(s => 
    s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--primary-color)', padding: '8px', borderRadius: '8px' }}>
            <Receipt size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '28px', margin: 0 }}>Sales History</h2>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '38px' }}
          />
        </div>
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
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '16px', fontWeight: '500', color: 'var(--primary-color)' }}>{s.invoiceNumber}</td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{new Date(s.timestamp).toLocaleString()}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', fontSize: '12px' }}>
                    {s.paymentMode}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {s.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '13px', color: 'var(--text-main)', display: 'flex', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: '500', minWidth: '30px', color: 'var(--primary-color)' }}>{item.quantitySold}x</span> 
                        <span style={{ flex: 1 }}>
                          {item.productName}
                          {item.attributes && Object.keys(item.attributes).length > 0 && (
                            <span style={{ color: 'var(--text-secondary)', marginLeft: '6px', fontSize: '11px' }}>
                              ({Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')})
                            </span>
                          )}
                        </span>
                        {item.quantityReturned > 0 && (
                           <span style={{ color: 'var(--danger)', marginLeft: '8px', fontSize: '12px', fontWeight: '500' }}>(Returned: {item.quantityReturned})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '16px', fontWeight: 'bold' }}>
                   <div>₹{s.totalAmount.toFixed(2)}</div>
                   {s.refundedAmount > 0 && <div style={{ fontSize: '12px', color: 'var(--danger)' }}>-₹{s.refundedAmount.toFixed(2)} Refund</div>}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    backgroundColor: s.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : s.status === 'PARTIAL_REFUND' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: s.status === 'COMPLETED' ? 'var(--success)' : s.status === 'PARTIAL_REFUND' ? 'var(--warning)' : 'var(--danger)'
                  }}>
                    {(s.status || 'COMPLETED').replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  {s.status !== 'REFUNDED' && (
                    <button onClick={() => openReturnModal(s)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <RotateCcw size={14} /> Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredSales.length === 0 && (
              <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No matching sales found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Return Modal */}
      {isReturnModalOpen && selectedTransaction && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '700px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '24px' }}>Process Return</h3>
              <button onClick={() => setIsReturnModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>Invoice: <span style={{ color: 'white' }}>{selectedTransaction.invoiceNumber}</span></p>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Date: <span style={{ color: 'white' }}>{new Date(selectedTransaction.timestamp).toLocaleString()}</span></p>
            </div>

            <form onSubmit={submitReturn}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Product</th>
                    <th style={{ padding: '12px' }}>Price</th>
                    <th style={{ padding: '12px' }}>Sold</th>
                    <th style={{ padding: '12px' }}>Returned</th>
                    <th style={{ padding: '12px' }}>Return Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransaction.items.map(item => {
                    const maxReturnable = item.quantitySold - (item.quantityReturned || 0);
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px' }}>
                          <div>{item.productName}</div>
                          {item.attributes && Object.keys(item.attributes).length > 0 && (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                              {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>₹{item.unitPriceAtSale.toFixed(2)}</td>
                        <td style={{ padding: '12px' }}>{item.quantitySold}</td>
                        <td style={{ padding: '12px' }}>{item.quantityReturned || 0}</td>
                        <td style={{ padding: '12px' }}>
                          <input 
                            type="number" 
                            min="0" 
                            max={maxReturnable}
                            className="input-field"
                            style={{ width: '80px', padding: '6px' }}
                            value={returnQuantities[item.id] || 0}
                            onChange={(e) => handleReturnQuantityChange(item.id, e.target.value, maxReturnable)}
                            disabled={maxReturnable === 0}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Refund Preview:</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--danger)' }}>
                    ₹{Object.entries(returnQuantities).reduce((acc, [id, qty]) => {
                      const item = selectedTransaction.items.find(i => i.id === id);
                      return acc + (item ? item.unitPriceAtSale * qty : 0);
                    }, 0).toFixed(2)}
                  </p>
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', backgroundColor: 'var(--danger)', color: 'white' }}>
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
