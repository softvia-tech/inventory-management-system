import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Receipt, Settings, LogOut, Package2, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'INVENTORY_ADMIN', 'POS_ADMIN'] },
    { name: 'Inventory', path: '/inventory', icon: Package, roles: ['SUPER_ADMIN', 'INVENTORY_ADMIN'] },
    { name: 'Point of Sale', path: '/pos', icon: ShoppingCart, roles: ['SUPER_ADMIN', 'POS_ADMIN'] },
    { name: 'Sales History', path: '/sales', icon: Receipt, roles: ['SUPER_ADMIN', 'INVENTORY_ADMIN', 'POS_ADMIN'] },
    { name: 'Approvals', path: '/approvals', icon: Users, roles: ['SUPER_ADMIN'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['SUPER_ADMIN'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-surface)',
      backdropFilter: 'var(--glass-blur)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ background: 'var(--primary-color)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
          <Package2 size={24} color="white" />
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, letterSpacing: '0.5px' }}>IMS Pro</h1>
      </div>

      <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                transition: 'all 0.2s',
                fontWeight: isActive ? '500' : '400',
              })}
            >
              <Icon size={20} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div style={{ padding: '24px 16px', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ marginBottom: '16px', padding: '0 16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>{user?.mobileNumber}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user?.role.replace('_', ' ')}</div>
        </div>
        
        <button 
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%',
            background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer',
            borderRadius: '8px', transition: 'background 0.2s', textAlign: 'left', fontSize: '16px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
