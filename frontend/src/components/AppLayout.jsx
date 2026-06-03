import React from 'react';
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div style={{ padding: '0 0 24px 0' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
