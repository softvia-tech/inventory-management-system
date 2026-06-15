import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { Trash2, Upload } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { theme, updateTheme } = useTheme();
  const [primaryColor, setPrimaryColor] = useState(theme.primaryColor || '#3b82f6');
  const [title, setTitle] = useState(theme.systemTitle || 'IMS Pro');
  const [systemLogo, setSystemLogo] = useState(theme.systemLogo || '');
  const [isSaved, setIsSaved] = useState(false);
  
  // Brand Management State
  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  // When component mounts, read existing variables
  useEffect(() => {
    if (isSuperAdmin) {
      fetchApi('/brands').then(data => setBrands(data)).catch(console.error);
    }
  }, [isSuperAdmin]);

  const handleSave = (e) => {
    e.preventDefault();
    updateTheme({ primaryColor, systemTitle: title, systemLogo });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSystemLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSystemLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBrandLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      const added = await fetchApi('/brands', {
        method: 'POST',
        body: JSON.stringify({ name: newBrandName, logoBase64: newBrandLogo })
      });
      setBrands([...brands, added]);
      setNewBrandName('');
      setNewBrandLogo('');
    } catch(err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;
    try {
      await fetchApi(`/brands/${id}`, { method: 'DELETE' });
      setBrands(brands.filter(b => b.id !== id));
    } catch(err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>System Settings</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>Theme & Branding Configuration</h3>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Application Title</label>
              <input 
                type="text" 
                className="input-field" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. My Shop IMS"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>System Logo</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <Upload size={18} />
                <span>{systemLogo ? 'Change System Logo' : 'Upload System Logo (PNG/JPG/SVG)'}</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSystemLogoUpload} />
              </label>
              {systemLogo && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'inline-block' }}>
                  <img src={systemLogo} alt="System Logo preview" style={{ height: '40px', objectFit: 'contain' }} />
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Primary Accent Color</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={primaryColor} 
                  onChange={e => setPrimaryColor(e.target.value)} 
                  style={{ width: '50px', height: '50px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>{primaryColor}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                This instantly overrides the `--primary-color` CSS token globally, changing all buttons, active links, and highlights.
              </p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Save Configuration
            </button>
            
            {isSaved && <div style={{ color: 'var(--success)', fontSize: '14px' }}>Settings saved successfully! The theme has been updated.</div>}
          </form>
        </div>

        {isSuperAdmin && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>Brand Management</h3>
            
            <form onSubmit={handleAddBrand} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Add New Brand</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newBrandName} 
                  onChange={e => setNewBrandName(e.target.value)} 
                  placeholder="Brand Name"
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <Upload size={18} />
                  <span>{newBrandLogo ? 'Logo Selected' : 'Upload Logo Image (PNG/JPG)'}</span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                </label>
                {newBrandLogo && (
                  <div style={{ marginTop: '8px' }}>
                    <img src={newBrandLogo} alt="Logo preview" style={{ height: '40px', objectFit: 'contain' }} />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary">Add Brand</button>
            </form>

            <div>
              <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Existing Brands</h4>
              {brands.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No brands added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {brands.map(brand => (
                    <div key={brand.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {brand.logoBase64 ? (
                           <img src={brand.logoBase64} alt={brand.name} style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px', backgroundColor: 'white' }} />
                        ) : (
                           <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <span style={{ fontSize: '10px' }}>No Logo</span>
                           </div>
                        )}
                        <span style={{ fontWeight: '500' }}>{brand.name}</span>
                      </div>
                      <button onClick={() => handleDeleteBrand(brand.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
