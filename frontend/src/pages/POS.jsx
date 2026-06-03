import React, { useState } from 'react';
import { ShoppingCart, Search, Trash2 } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';

const POS = () => {
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processScannedBarcode = async (barcodeVal) => {
    setError('');
    try {
      const product = await fetchApi(`/products/barcode/${barcodeVal}`);
      
      const existingItem = cart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity + 1 > product.currentStock) {
          setError('Not enough stock available.');
          return;
        }
        setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        if (product.currentStock < 1) {
          setError('Product is out of stock.');
          return;
        }
        setCart([...cart, { ...product, quantity: 1 }]);
      }
      setBarcode('');
    } catch (err) {
      setError('Product not found or error occurred.');
    }
  };

  useBarcodeScanner((scannedBarcode) => {
    processScannedBarcode(scannedBarcode);
  });

  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    processScannedBarcode(barcode);
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const total = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const payload = {
        paymentMode: "CASH", // Hardcoded for now
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
      };
      const response = await fetchApi('/sales', { method: 'POST', body: JSON.stringify(payload) });
      alert(`Sale processed successfully! Invoice: ${response.invoiceNumber}`);
      setCart([]);
    } catch (err) {
      alert('Checkout failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 80px)' }}>
      {/* Left side: Cart List */}
      <div className="glass-panel" style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><ShoppingCart /> Point of Sale</h2>
        </div>

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>Cart is empty. Scan an item to begin.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.map(item => (
                <div key={item.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>{item.name}</h4>
                    {item.attributes && Object.keys(item.attributes).length > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </div>
                    )}
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>₹{item.sellingPrice.toFixed(2)} x {item.quantity}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontWeight: '600', fontSize: '18px' }}>₹{(item.sellingPrice * item.quantity).toFixed(2)}</span>
                    <button className="btn btn-secondary" onClick={() => removeFromCart(item.id)} style={{ color: 'var(--danger)', padding: '8px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Scanner & Checkout summary */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Scan Barcode</h3>
          <form onSubmit={handleScan} style={{ display: 'flex', gap: '8px' }}>
            <input 
              autoFocus
              type="text" 
              value={barcode} 
              onChange={e => setBarcode(e.target.value)} 
              className="input-field" 
              placeholder="Enter barcode..." 
            />
            <button type="submit" className="btn btn-primary"><Search size={18} /></button>
          </form>
          {error && <div style={{ color: 'var(--danger)', marginTop: '12px', fontSize: '14px' }}>{error}</div>}
        </div>

        <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '18px', color: 'var(--text-secondary)' }}>
            <span>Subtotal</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '28px', fontWeight: 'bold' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary-color)' }}>₹{total.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={handleCheckout} 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '18px' }}
            disabled={cart.length === 0 || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Complete Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
