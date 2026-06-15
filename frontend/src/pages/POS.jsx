import React, { useState } from 'react';
import { ShoppingCart, Search, Trash2, X, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';

const POS = () => {
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null); // CASH, CARD, UPI

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

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setSelectedPaymentMode(null);
    setIsCheckoutModalOpen(true);
  };

  const processPayment = async () => {
    if (cart.length === 0 || !selectedPaymentMode) return;
    setIsProcessing(true);
    try {
      const payload = {
        paymentMode: selectedPaymentMode,
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
      };
      const response = await fetchApi('/sales', { method: 'POST', body: JSON.stringify(payload) });
      alert(`Sale processed successfully! Invoice: ${response.invoiceNumber}`);
      setCart([]);
      setIsCheckoutModalOpen(false);
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
            onClick={handleCheckoutClick} 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '18px' }}
            disabled={cart.length === 0 || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Complete Checkout'}
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Select Payment Method</h2>
              <button className="btn btn-secondary" onClick={() => setIsCheckoutModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', margin: '0', color: 'var(--primary-color)' }}>₹{total.toFixed(2)}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Total Amount Due</p>
              </div>

              {!selectedPaymentMode ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ display: 'flex', flexDirection: 'column', padding: '24px', gap: '12px' }}
                    onClick={() => setSelectedPaymentMode('CASH')}
                  >
                    <Banknote size={32} color="#10b981" />
                    <span style={{ fontWeight: 'bold' }}>Cash</span>
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ display: 'flex', flexDirection: 'column', padding: '24px', gap: '12px' }}
                    onClick={() => setSelectedPaymentMode('CARD')}
                  >
                    <CreditCard size={32} color="#3b82f6" />
                    <span style={{ fontWeight: 'bold' }}>Card</span>
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ display: 'flex', flexDirection: 'column', padding: '24px', gap: '12px' }}
                    onClick={() => setSelectedPaymentMode('UPI')}
                  >
                    <Smartphone size={32} color="#8b5cf6" />
                    <span style={{ fontWeight: 'bold' }}>UPI</span>
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  {selectedPaymentMode === 'CASH' ? (
                    <div>
                      <Banknote size={48} color="#10b981" style={{ marginBottom: '16px' }} />
                      <h3 style={{ margin: '0 0 8px 0' }}>Cash Payment</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Collect ₹{total.toFixed(2)} in cash from the customer.</p>
                    </div>
                  ) : (
                    <div>
                      {selectedPaymentMode === 'CARD' ? (
                        <CreditCard size={48} color="#3b82f6" style={{ marginBottom: '16px' }} />
                      ) : (
                        <Smartphone size={48} color="#8b5cf6" style={{ marginBottom: '16px' }} />
                      )}
                      <h3 style={{ margin: '0 0 8px 0' }}>SBI Terminal Payment</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Please enter <strong>₹{total.toFixed(2)}</strong> on the physical SBI POS Terminal.
                      </p>
                      <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', color: 'var(--primary-color)' }}>
                        Wait for the terminal to print the success receipt before confirming here.
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedPaymentMode(null)}>Back</button>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 2 }} 
                      onClick={processPayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Payment Confirmed'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
