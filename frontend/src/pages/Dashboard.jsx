import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Clock, Truck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import './Dashboard.css';

// Helper to format time relative to now
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [vendorCount, setVendorCount] = useState(0);
  const [rfqCount, setRfqCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userName, setUserName] = useState('User');
  const [spendingData, setSpendingData] = useState([]);
  const [recentPOs, setRecentPOs] = useState([]);
  const [posThisMonth, setPosThisMonth] = useState('$0');
  const [overdueInvoices, setOverdueInvoices] = useState(0);
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userRole = (user.role || 'Vendor').toLowerCase();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setUserName(user.name);

    const fetchDashboardData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        
        // Fetch vendors count
        const vendorRes = await fetch('http://localhost:5000/api/vendors', { headers });
        const vendorData = await vendorRes.json();
        if (vendorData.success) setVendorCount(vendorData.count);

        // Fetch RFQs count (mock for now until RFQ is fully mounted, but we will mount it soon)
        const rfqRes = await fetch('http://localhost:5000/api/rfqs', { headers }).catch(() => null);
        if (rfqRes) {
            const rfqData = await rfqRes.json();
            if (rfqData.success) setRfqCount(rfqData.count);
        }

        // Fetch Activities
        const activityRes = await fetch('http://localhost:5000/api/activities', { headers });
        const activityData = await activityRes.json();
        if (activityData.success) setRecentActivity(activityData.data);
        
        // Fetch Pending Approvals, Spend, and POs
        const quoteRes = await fetch('http://localhost:5000/api/quotations', { headers }).catch(() => null);
        if (quoteRes) {
            const quoteData = await quoteRes.json();
            if (quoteData.success) {
                const quotations = quoteData.data;
                const pending = quotations.filter(q => q.status === 'Pending').length;
                setPendingCount(pending);

                // Compute Recent POs
                const pos = quotations.slice(0, 5).map(q => ({
                   id: 'PO-' + q._id.substring(0, 5).toUpperCase(),
                   vendor: q.vendor?.name || 'Unknown Vendor',
                   amount: `$${(q.totalAmount * 1.18).toLocaleString()}`,
                   status: q.status
                }));
                setRecentPOs(pos);

                // Compute Monthly Spend (Trailing 6 months)
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const currentMonthIdx = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                let monthlyData = [];
                for (let i = 5; i >= 0; i--) {
                  let m = currentMonthIdx - i;
                  let y = currentYear;
                  if (m < 0) {
                    m += 12;
                    y -= 1;
                  }
                  monthlyData.push({ monthIndex: m, year: y, name: monthNames[m], spend: 0 });
                }

                let monthSpend = 0;
                let overdue = 0;

                quotations.forEach(q => {
                  if (q.status === 'Approved') {
                    const d = new Date(q.createdAt);
                    const m = d.getMonth();
                    const y = d.getFullYear();
                    
                    if (m === currentMonthIdx && y === currentYear) {
                       monthSpend += (q.totalAmount * 1.18);
                    }

                    const monthItem = monthlyData.find(item => item.monthIndex === m && item.year === y);
                    if (monthItem) {
                      monthItem.spend += (q.totalAmount * 1.18);
                    }

                    const daysOld = (new Date() - d) / (1000 * 60 * 60 * 24);
                    if (daysOld > 30) overdue++;
                  }
                });
                
                setSpendingData(monthlyData);
                setPosThisMonth(`$${monthSpend.toLocaleString()}`);
                setOverdueInvoices(overdue);
            }
        }
        
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    
    fetchDashboardData();
  }, []);

  const statCards = [
    { title: "Active RFQ's", value: rfqCount, icon: <FileText size={24} />, color: 'var(--primary-color)' },
    { title: 'Pending Approvals', value: pendingCount, icon: <Clock size={24} />, color: 'var(--warning)' },
    { title: "PO's this month", value: posThisMonth, icon: <CheckCircle size={24} />, color: 'var(--success)' },
    { title: 'Overdue invoices', value: overdueInvoices, icon: <Truck size={24} />, color: 'var(--info)' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{userRole === 'admin' ? 'Master Dashboard' : (userRole === 'vendor' ? 'Vendor Dashboard' : 'Procurement Dashboard')}</h1>
        <p>Welcome back, {userName}! Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div className="stat-card card" key={index}>
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="card activity-card recent-activity">
          <h2>Recent Purchase Orders</h2>
          <table className="dashboard-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>PO#</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Vendor</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Amount</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPOs.map((po, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: '600' }}>{po.id}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>{po.vendor}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>{po.amount}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>{po.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {userRole !== 'vendor' && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-primary" onClick={() => navigate('/rfqs')}>+ new RFQ</button>
              <button className="btn btn-secondary" onClick={() => navigate('/vendors')} style={{ border: '1px solid var(--border-color)', background: 'transparent' }}>Add Vendor</button>
              <button className="btn btn-secondary" onClick={() => navigate('/invoices')} style={{ border: '1px solid var(--border-color)', background: 'transparent' }}>View Invoices</button>
            </div>
          )}
        </div>
        
        {userRole !== 'vendor' && (
          <div className="card quick-actions-card">
            <h2>Spending Trends last 6 months</h2>
            <div style={{ height: '300px', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#8F9BB3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8F9BB3" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                <Bar dataKey="spend" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
