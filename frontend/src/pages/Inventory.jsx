import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { Plus, Edit2, PackagePlus, X, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const filterBrand = searchParams.get('brand') || '';
  
  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    sku: '', barcode: '', name: '', category: '', brand: '', costPrice: '', profitPercentage: '', initialStock: ''
  });
  const [attributes, setAttributes] = useState([{ key: '', value: '' }]);

  // Stock Modal State
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockFormData, setStockFormData] = useState({ id: null, name: '', quantity: 0, reason: '' });

  // Scan Modal State
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanBarcode, setScanBarcode] = useState('');
  const [selectedBrandForAdd, setSelectedBrandForAdd] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const [dbBrands, setDbBrands] = useState([]);

  const loadProducts = async () => {
    try {
      const [productsData, brandsData] = await Promise.all([
         fetchApi('/products'),
         fetchApi('/brands').catch(() => [])
      ]);
      setProducts(productsData);
      setDbBrands(brandsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openScanModal = (brand = '') => {
    setScanBarcode('');
    setSelectedBrandForAdd(brand);
    setIsScanModalOpen(true);
  };

  const processScannedBarcode = async (barcodeVal) => {
    try {
      const product = await fetchApi(`/products/barcode/${barcodeVal}`);
      setIsScanModalOpen(false);
      openStockModal(product);
    } catch (err) {
      setIsScanModalOpen(false);
      openAddModal(barcodeVal, selectedBrandForAdd);
    }
  };

  useBarcodeScanner((barcode) => {
    processScannedBarcode(barcode);
  });

  const handleScanNext = async (e) => {
    e.preventDefault();
    if (!scanBarcode.trim()) return;
    processScannedBarcode(scanBarcode);
  };

  const openAddModal = (initialBarcode = '', prefillBrand = '') => {
    setEditingProductId(null);
    setFormData({ sku: '', barcode: initialBarcode, name: '', category: '', brand: prefillBrand, costPrice: '', profitPercentage: '', initialStock: '' });
    setAttributes([{ key: '', value: '' }]);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProductId(product.id);
    setFormData({
      sku: product.sku || '',
      barcode: product.barcode || '',
      name: product.name || '',
      category: product.category || '',
      brand: product.brand || '',
      costPrice: product.costPrice || '',
      profitPercentage: product.profitPercentage || ''
    });
    if (product.attributes && Object.keys(product.attributes).length > 0) {
      setAttributes(Object.entries(product.attributes).map(([k, v]) => ({ key: k, value: v })));
    } else {
      setAttributes([{ key: '', value: '' }]);
    }
    setIsModalOpen(true);
  };

  const handleAddAttribute = () => setAttributes([...attributes, { key: '', value: '' }]);
  const handleRemoveAttribute = (index) => setAttributes(attributes.filter((_, i) => i !== index));
  const handleAttributeChange = (index, field, val) => {
    const newAttrs = [...attributes];
    newAttrs[index][field] = val;
    setAttributes(newAttrs);
  };

  const generateSKU = () => {
    const parts = [];
    if (formData.brand) parts.push(formData.brand.substring(0, 3).toUpperCase());
    if (formData.category) parts.push(formData.category.substring(0, 3).toUpperCase());
    
    if (formData.name) {
      const initials = formData.name.split(' ').map(w => w[0]).join('').toUpperCase();
      parts.push(initials);
    }

    attributes.forEach(attr => {
      if (attr.value) parts.push(attr.value.substring(0, 4).toUpperCase());
    });

    setFormData({ ...formData, sku: parts.join('-') });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const attrMap = {};
    attributes.forEach(attr => {
      if (attr.key.trim() && attr.value.trim()) {
        attrMap[attr.key.trim()] = attr.value.trim();
      }
    });

    const payload = {
      ...formData,
      costPrice: parseFloat(formData.costPrice),
      profitPercentage: parseFloat(formData.profitPercentage || 0),
      initialStock: parseInt(formData.initialStock || 0),
      attributes: attrMap
    };

    try {
      if (editingProductId) {
        await fetchApi(`/products/${editingProductId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await fetchApi('/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const openStockModal = (product) => {
    setStockFormData({ id: product.id, name: product.name, quantity: 0, reason: '' });
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchApi(`/products/${stockFormData.id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: parseInt(stockFormData.quantity), reason: stockFormData.reason })
      });
      setIsStockModalOpen(false);
      loadProducts();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const uniqueBrandsFromProducts = Array.from(new Set(products.map(p => p.brand).filter(b => b && b.trim() !== '')));
  
  // Combine db brands and unique brands
  const combinedBrands = [...dbBrands];
  uniqueBrandsFromProducts.forEach(productBrand => {
      if (!combinedBrands.find(b => b.name.toLowerCase() === productBrand.toLowerCase())) {
          combinedBrands.push({ id: productBrand, name: productBrand, logoBase64: null });
      }
  });

  if (loading) return <div>Loading inventory...</div>;

  const filteredProducts = filterBrand 
    ? products.filter(p => p.brand && p.brand.toLowerCase() === filterBrand.toLowerCase()) 
    : products;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '28px', margin: 0 }}>Inventory Management</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {combinedBrands.map(brand => (
            <button key={brand.id} className="btn btn-primary" onClick={() => openScanModal(brand.name)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
              {brand.logoBase64 ? (
                <img src={brand.logoBase64} alt={brand.name} style={{ height: '20px', width: '20px', objectFit: 'contain', borderRadius: '4px', backgroundColor: 'white' }} />
              ) : (
                <Plus size={18} />
              )}
              {brand.name}
            </button>
          ))}
          <button className="btn btn-secondary" onClick={() => openScanModal('')}>
            <Plus size={18} /> {combinedBrands.length > 0 ? 'Other Brand / Item' : 'Scan / Add Item'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Filter by Brand:</span>
        <select 
           value={filterBrand} 
           onChange={(e) => setSearchParams(e.target.value ? { brand: e.target.value } : {})}
           className="glass-panel"
           style={{ padding: '8px 16px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.2)', color: 'white', outline: 'none', cursor: 'pointer' }}
        >
           <option value="">All Brands</option>
           {combinedBrands.map(b => (
              <option key={b.name} value={b.name}>{b.name}</option>
           ))}
        </select>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '16px' }}>SKU</th>
              <th style={{ padding: '16px' }}>Product</th>
              <th style={{ padding: '16px' }}>Category / Brand</th>
              <th style={{ padding: '16px' }}>Stock</th>
              <th style={{ padding: '16px' }}>Selling Price</th>
              <th style={{ padding: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{p.sku}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: '500' }}>{p.name}</div>
                  {p.attributes && Object.keys(p.attributes).length > 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {Object.entries(p.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px' }}>
                  <div>{p.category || '-'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.brand || '-'}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', 
                    backgroundColor: p.currentStock < 5 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    color: p.currentStock < 5 ? 'var(--danger)' : 'var(--success)'
                  }}>
                    {p.currentStock}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>₹{p.sellingPrice.toFixed(2)}</td>
                <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEditModal(p)} className="btn btn-secondary" style={{ padding: '6px' }} title="Edit Details"><Edit2 size={16} /></button>
                  <button onClick={() => openStockModal(p)} className="btn btn-secondary" style={{ padding: '6px', color: 'var(--primary-color)' }} title="Adjust Stock"><PackagePlus size={16} /></button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Scan Barcode Modal */}
      {isScanModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Scan / Add Item</h3>
              <button onClick={() => setIsScanModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Scan or enter the item's barcode.
            </p>
            <form onSubmit={handleScanNext} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="text" 
                required 
                autoFocus
                className="input-field" 
                placeholder="Barcode" 
                value={scanBarcode} 
                onChange={e => setScanBarcode(e.target.value)} 
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '8px' }}>Continue</button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '24px' }}>{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                  <input className="input-field" placeholder="SKU *" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} style={{ flex: 1 }} disabled={!!editingProductId} />
                  {!editingProductId && <button type="button" onClick={generateSKU} className="btn btn-secondary" style={{ padding: '0 12px', fontSize: '12px', whiteSpace: 'nowrap' }}>Auto</button>}
                </div>
                <input className="input-field" placeholder="Barcode" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} style={{ flex: 1 }} disabled={!!editingProductId} />
              </div>
              <input className="input-field" placeholder="Product Name *" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <input className="input-field" placeholder="Category (e.g. Outerwear)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ flex: 1 }} />
                <input className="input-field" placeholder="Brand (e.g. North Face)" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} style={{ flex: 1 }} />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <input type="number" step="0.01" className="input-field" placeholder="Cost Price *" required value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} style={{ flex: 1 }} />
                <input type="number" step="0.01" className="input-field" placeholder="Profit Margin %" value={formData.profitPercentage} onChange={e => setFormData({...formData, profitPercentage: e.target.value})} style={{ flex: 1 }} />
                {!editingProductId && (
                  <input type="number" className="input-field" placeholder="Initial Stock" value={formData.initialStock} onChange={e => setFormData({...formData, initialStock: e.target.value})} style={{ flex: 1 }} />
                )}
              </div>

              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Product Variants / Attributes</label>
                  <button type="button" onClick={handleAddAttribute} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>+ Add Attribute</button>
                </div>
                {attributes.map((attr, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input className="input-field" placeholder="e.g. Size" value={attr.key} onChange={e => handleAttributeChange(index, 'key', e.target.value)} style={{ flex: 1 }} />
                    <input className="input-field" placeholder="e.g. L" value={attr.value} onChange={e => handleAttributeChange(index, 'value', e.target.value)} style={{ flex: 1 }} />
                    <button type="button" onClick={() => handleRemoveAttribute(index)} className="btn btn-secondary" style={{ padding: '8px', color: 'var(--danger)' }}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '16px' }}>
                {editingProductId ? 'Save Changes' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isStockModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Adjust Stock</h3>
              <button onClick={() => setIsStockModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Adjusting stock for <strong>{stockFormData.name}</strong>. Use positive numbers to add stock, negative to remove.
            </p>
            <form onSubmit={handleStockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="number" 
                required 
                className="input-field" 
                placeholder="Quantity (+/-)" 
                value={stockFormData.quantity} 
                onChange={e => setStockFormData({...stockFormData, quantity: e.target.value})} 
              />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Reason (Optional)" 
                value={stockFormData.reason} 
                onChange={e => setStockFormData({...stockFormData, reason: e.target.value})} 
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '8px' }}>Confirm Adjustment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
