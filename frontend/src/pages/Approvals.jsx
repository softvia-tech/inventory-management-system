import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import { fetchApi } from '../services/api';

const Approvals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState({});

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      const data = await fetchApi('/users/pending');
      setUsers(data);
      
      // Initialize default roles for dropdowns
      const initialRoles = {};
      data.forEach(u => initialRoles[u.id] = 'POS_ADMIN');
      setSelectedRoles(initialRoles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (id, role) => {
    setSelectedRoles({ ...selectedRoles, [id]: role });
  };

  const handleApprove = async (id) => {
    try {
      const role = selectedRoles[id];
      await fetchApi(`/users/${id}/approve?role=${role}`, { method: 'POST' });
      setUsers(users.filter(u => u.id !== id));
      alert('User approved successfully!');
    } catch (e) {
      alert('Failed to approve user: ' + e.message);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      await fetchApi(`/users/${id}/reject`, { method: 'POST' });
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      alert('Failed to reject user: ' + e.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--primary-color)', padding: '8px', borderRadius: '8px' }}>
          <Users size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '28px', margin: 0 }}>User Approvals</h2>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '16px' }}>Mobile Number</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px' }}>Assign Role</th>
              <th style={{ padding: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '16px', fontWeight: '500' }}>{u.mobileNumber}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', fontSize: '12px' }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <select 
                    className="input-field" 
                    value={selectedRoles[u.id]} 
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    style={{ padding: '6px 12px', width: 'auto' }}
                  >
                    <option value="POS_ADMIN">POS Admin (Cashier)</option>
                    <option value="INVENTORY_ADMIN">Inventory Admin</option>
                  </select>
                </td>
                <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleApprove(u.id)} className="btn btn-secondary" style={{ padding: '6px', color: 'var(--success)' }} title="Approve">
                    <CheckCircle size={20} />
                  </button>
                  <button onClick={() => handleReject(u.id)} className="btn btn-secondary" style={{ padding: '6px', color: 'var(--danger)' }} title="Reject">
                    <XCircle size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No pending approvals.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Approvals;
