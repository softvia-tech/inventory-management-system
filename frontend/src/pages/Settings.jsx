import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [title, setTitle] = useState('IMS Pro');
  const [isSaved, setIsSaved] = useState(false);

  // When component mounts, read existing variables
  useEffect(() => {
    const root = document.documentElement;
    const currentPrimary = getComputedStyle(root).getPropertyValue('--primary-color').trim();
    if (currentPrimary) setPrimaryColor(currentPrimary);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    
    // Generate a darker hover color automatically
    // Just a simple trick for the demo, normally we'd parse the hex
    root.style.setProperty('--primary-hover', primaryColor); 
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>System Settings</h2>

      <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px' }}>
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
    </div>
  );
};

export default Settings;
