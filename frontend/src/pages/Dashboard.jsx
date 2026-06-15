import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, DollarSign } from 'lucide-react';
import { fetchApi } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const BRAND_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', 
  '#ec4899', '#f43f5e'
];

const getBrandColor = (brandName) => {
  if (!brandName) return '#94a3b8';
  let hash = 0;
  for (let i = 0; i < brandName.length; i++) {
    hash = brandName.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return BRAND_COLORS[hash % BRAND_COLORS.length];
};

const Dashboard = () => {
  const [stats, setStats] = useState({ totalProducts: 0, totalSales: 0, totalBasePrice: 0 });
  const [brandStats, setBrandStats] = useState([]);
  const [frequency, setFrequency] = useState('ALL_TIME');
  const [salesReport, setSalesReport] = useState({ cumulativeSalesTillDateBasePrice: 0, brandReports: [] });

  useEffect(() => {
    // In a real app, we'd fetch specific dashboard metrics here.
    // For now, we just mock or fetch generic lists.
    const loadData = async () => {
      try {
        const [products, fetchedBrands] = await Promise.all([
          fetchApi('/products'),
          fetchApi('/brands').catch(() => []) // Catch in case of error so it doesn't break products
        ]);
        
        let globalTotalBasePrice = 0;
        
        const logoMap = {};
        fetchedBrands.forEach(b => {
           logoMap[b.name.toLowerCase()] = b.logoBase64;
        });

        const brandsMap = {};
        products.forEach(p => {
          const brand = p.brand || 'Unbranded';
          if (!brandsMap[brand]) {
            brandsMap[brand] = { 
               name: brand, 
               count: 0, 
               totalBasePrice: 0,
               logo: logoMap[brand.toLowerCase()] || null
            };
          }
          brandsMap[brand].count += p.currentStock || 0;
          const productTotalBasePrice = (p.costPrice || 0) * (p.currentStock || 0);
          brandsMap[brand].totalBasePrice += productTotalBasePrice;
          globalTotalBasePrice += productTotalBasePrice;
        });
        
        setStats(prev => ({ ...prev, totalProducts: products.length, totalBasePrice: globalTotalBasePrice }));
        
        setBrandStats(Object.values(brandsMap).sort((a, b) => b.count - a.count));
      } catch (e) { }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadSalesReport = async () => {
      try {
        const report = await fetchApi(`/sales/report?frequency=${frequency}`);
        setSalesReport(report);
      } catch (e) { }
    };
    loadSalesReport();
  }, [frequency]);

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Dashboard Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Total Products & Brands */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--primary-color)' }}>
                <Package size={28} />
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Total Products</p>
                <h3 style={{ margin: 0, fontSize: '24px' }}>{stats.totalProducts}</h3>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
               <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Total Base Price</p>
               <h3 style={{ margin: 0, fontSize: '24px' }}>₹{stats.totalBasePrice?.toFixed(2) || '0.00'}</h3>
            </div>
          </div>

          <h3 style={{ fontSize: '22px', margin: '8px 0 0 0' }}>Brand Specific Inventory</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {brandStats.map((brand, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     {brand.logo ? (
                       <img src={brand.logo} alt={brand.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '12px', backgroundColor: 'white' }} />
                     ) : (
                       <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Package size={24} />
                       </div>
                     )}
                     <h4 style={{ margin: 0, fontSize: '18px', textTransform: 'capitalize' }}>{brand.name}</h4>
                  </div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: getBrandColor(brand.name), border: '1px solid rgba(255,255,255,0.1)' }}></div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '12px' }}>Total Count</p>
                      <Link 
                         to={`/inventory?brand=${encodeURIComponent(brand.name)}`} 
                         style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-color)', textDecoration: 'none' }}
                         className="hover-underline"
                      >
                         {brand.count}
                      </Link>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '12px' }}>Total Base Price</p>
                      <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>₹{brand.totalBasePrice.toFixed(2)}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
              <TrendingUp size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Sales Till Date (Base Price)</p>
              <h3 style={{ margin: 0, fontSize: '24px' }}>
                 ₹{salesReport.cumulativeSalesTillDateBasePrice?.toFixed(2) || '0.00'}
              </h3>
            </div>
          </div>

          {/* Sales Report Section below Sales Till Date */}
          <div style={{ marginTop: '8px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '22px', margin: 0 }}>Sales Report</h3>
                <select 
                   value={frequency} 
                   onChange={(e) => setFrequency(e.target.value)}
                   className="glass-panel"
                   style={{ padding: '8px 16px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.2)', color: 'white', outline: 'none', cursor: 'pointer' }}
                >
                   <option value="TODAY">Today</option>
                   <option value="THIS_WEEK">This Week</option>
                   <option value="THIS_MONTH">This Month</option>
                   <option value="THIS_YEAR">This Year</option>
                   <option value="ALL_TIME">All Time</option>
                </select>
             </div>

             <div className="glass-panel" style={{ padding: '24px', height: '400px' }}>
                {salesReport.brandReports && salesReport.brandReports.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesReport.brandReports} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#ffffff11" vertical={false} />
                         <XAxis dataKey="brand" stroke="#ffffff88" fontSize={12} tickLine={false} axisLine={false} />
                         <YAxis stroke="#ffffff88" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#e2e8f0', fontSize: '14px' }}
                            formatter={(value) => `₹${value?.toFixed(2) || '0.00'}`}
                         />
                         <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                         <Bar dataKey="totalBasePrice" name="Base Price Sale" radius={[4, 4, 0, 0]}>
                            {salesReport.brandReports.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={getBrandColor(entry.brand)} />
                            ))}
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                ) : (
                   <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                      No sales data for selected period
                   </div>
                )}
             </div>
          </div>

        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
