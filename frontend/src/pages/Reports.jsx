import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, FileText, CheckSquare, ArrowUpRight, ArrowDownRight, DollarSign, RefreshCw, Download } from 'lucide-react';
import './Reports.css';

const COLORS = ['#6C47FF', '#00D4AA', '#FFD700', '#FF6B6B'];

const Reports = () => {
  const [stats, setStats] = useState({
    totalSpend: 0,
    activeVendors: 0,
    poFulfillment: 0,
    overdueInvoices: 0
  });

  const [monthlySpendData, setMonthlySpendData] = useState([]);
  const [vendorPerformanceData, setVendorPerformanceData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [rfqStatusData, setRfqStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        
        const [vendorsRes, rfqsRes, quotationsRes] = await Promise.all([
          fetch('http://localhost:5000/api/vendors', { headers }),
          fetch('http://localhost:5000/api/rfqs', { headers }),
          fetch('http://localhost:5000/api/quotations', { headers })
        ]);

        const vendorsData = await vendorsRes.json();
        const rfqsData = await rfqsRes.json();
        const quotationsData = await quotationsRes.json();

        if (vendorsData.success && rfqsData.success && quotationsData.success) {
          const vendors = vendorsData.data;
          const rfqs = rfqsData.data;
          const quotations = quotationsData.data;

          // Compute Stats
          const activeVendors = vendors.filter(v => v.status === 'Active').length;
          const rfqsGenerated = rfqs.length;
          
          let totalSpend = 0;
          let approvedCount = 0;
          
          quotations.forEach(q => {
            if (q.status === 'Approved') {
              totalSpend += q.totalAmount;
              approvedCount++;
            }
          });

          const poFulfillment = rfqsGenerated > 0 ? Math.round((rfqs.filter(r => r.status === 'Awarded').length / rfqsGenerated) * 100) : 0;
          
          const overdueInvoices = quotations.filter(q => {
             if (q.status !== 'Approved') return false;
             const daysOld = (new Date() - new Date(q.createdAt)) / (1000 * 60 * 60 * 24);
             return daysOld > 30;
          }).length;

          setStats({
            totalSpend,
            activeVendors,
            poFulfillment,
            overdueInvoices
          });

          // Compute Monthly Spend (Trailing 7 months)
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const currentMonth = new Date().getMonth();
          let monthlyData = [];
          for (let i = 6; i >= 0; i--) {
            let m = currentMonth - i;
            let y = new Date().getFullYear();
            if (m < 0) {
              m += 12;
              y -= 1;
            }
            monthlyData.push({ monthIndex: m, year: y, name: monthNames[m], spend: 0, budget: 6000 });
          }

          quotations.forEach(q => {
            if (q.status === 'Approved') {
              const d = new Date(q.createdAt);
              const m = d.getMonth();
              const y = d.getFullYear();
              const monthItem = monthlyData.find(item => item.monthIndex === m && item.year === y);
              if (monthItem) {
                monthItem.spend += q.totalAmount;
              }
            }
          });
          setMonthlySpendData(monthlyData);

          // Compute Category Spend
          const catMap = {};
          quotations.forEach(q => {
            if (q.status === 'Approved') {
               const vendorId = q.vendor._id || q.vendor;
               const vendorObj = vendors.find(v => v._id === vendorId);
               const catName = vendorObj ? vendorObj.category : 'Other';
               catMap[catName] = (catMap[catName] || 0) + q.totalAmount;
            }
          });
          const catData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] }));
          setCategoryData(catData);

          // Compute Vendor Performance (Top Vendors by Quotes Submitted/Approved)
          const vendorMap = {};
          vendors.forEach(v => {
            vendorMap[v._id] = { name: v.name, submittedCount: 0, approvedCount: 0 }; 
          });
          
          quotations.forEach(q => {
             const vId = q.vendor._id || q.vendor;
             if (vendorMap[vId]) {
                vendorMap[vId].submittedCount += 1;
                if (q.status === 'Approved') {
                   vendorMap[vId].approvedCount += 1;
                }
             }
          });
          
          let perfData = Object.values(vendorMap)
             .sort((a,b) => b.submittedCount - a.submittedCount)
             .slice(0, 4);
             
          if (perfData.length === 0) {
              perfData = vendors.slice(0, 4).map(v => ({ name: v.name, submittedCount: 0, approvedCount: 0 }));
          }
          setVendorPerformanceData(perfData);

          // Compute RFQ Status (Quarterly approximation)
          const qStatus = {
             'Q1': { name: 'Q1', submitted: 0, approved: 0, rejected: 0 },
             'Q2': { name: 'Q2', submitted: 0, approved: 0, rejected: 0 },
             'Q3': { name: 'Q3', submitted: 0, approved: 0, rejected: 0 },
             'Q4': { name: 'Q4', submitted: 0, approved: 0, rejected: 0 },
          };
          
          rfqs.forEach(r => {
             const d = new Date(r.createdAt);
             const q = Math.floor(d.getMonth() / 3) + 1; // 1, 2, 3, 4
             const qName = 'Q' + q;
             qStatus[qName].submitted += 1;
             if (r.status === 'Awarded') qStatus[qName].approved += 1;
             if (r.status === 'Closed') qStatus[qName].rejected += 1; 
          });
          setRfqStatusData(Object.values(qStatus));

        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  const exportFullReport = () => {
    const reportContent = `
PROCUREMENT PERFORMANCE REPORT
==============================
Date: ${new Date().toLocaleDateString()}

SUMMARY STATS:
Total Spend (YTD): $${stats.totalSpend.toLocaleString()}
Active Vendors: ${stats.activeVendors}
PO Fulfillment: ${stats.poFulfillment}%
Overdue Invoices: ${stats.overdueInvoices}

CATEGORIES SPEND:
${categoryData.map(c => `- ${c.name}: $${c.value.toLocaleString()}`).join('\n')}

VENDOR PERFORMANCE (Quotes Submitted / Approved):
${vendorPerformanceData.map(v => `- ${v.name}: ${v.submittedCount} / ${v.approvedCount}`).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Procurement_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading reports...</div>;
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Comprehensive overview of your procurement performance and spending trends.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={exportFullReport}>
            <Download size={16} /> Export Full Report
          </button>
        </div>
      </div>


      {/* Top Stat Cards */}
      <div className="reports-stats-grid">
        <div className="report-stat-card">
          <div className="rsc-header">
            <span className="rsc-title">Total Spend (YTD)</span>
            <div className="rsc-icon" style={{background: 'rgba(108, 71, 255, 0.1)', color: '#6C47FF'}}><DollarSign size={20} /></div>
          </div>
          <div className="rsc-value">${stats.totalSpend.toLocaleString()}</div>
          <div className="rsc-trend positive">
            <ArrowUpRight size={14} /> 12.5% vs last year
          </div>
        </div>

        <div className="report-stat-card">
          <div className="rsc-header">
            <span className="rsc-title">Active Vendors</span>
            <div className="rsc-icon" style={{background: 'rgba(0, 212, 170, 0.1)', color: '#00D4AA'}}><Users size={20} /></div>
          </div>
          <div className="rsc-value">{stats.activeVendors}</div>
          <div className="rsc-trend positive">
            <ArrowUpRight size={14} /> 4 new this month
          </div>
        </div>

        <div className="report-stat-card">
          <div className="rsc-header">
            <span className="rsc-title">PO Fulfillment</span>
            <div className="rsc-icon" style={{background: 'rgba(255, 215, 0, 0.1)', color: '#FFD700'}}><CheckSquare size={20} /></div>
          </div>
          <div className="rsc-value">{stats.poFulfillment}%</div>
          <div className="rsc-trend positive">
            <ArrowUpRight size={14} /> 2.1% vs last month
          </div>
        </div>

        <div className="report-stat-card">
          <div className="rsc-header">
            <span className="rsc-title">Overdue Invoices</span>
            <div className="rsc-icon" style={{background: 'rgba(255, 107, 107, 0.1)', color: '#FF6B6B'}}><FileText size={20} /></div>
          </div>
          <div className="rsc-value">{stats.overdueInvoices}</div>
          <div className="rsc-trend negative">
            <ArrowDownRight size={14} /> Needs attention
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="charts-grid">
        {/* Monthly Spend Area Chart */}
        <div className="chart-card span-2">
          <div className="chart-header">
            <h3>Monthly Procurement Spend vs Budget</h3>
            <p>Trailing 7 months spending analysis</p>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C47FF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6C47FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#8F9BB3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8F9BB3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="spend" stroke="#6C47FF" fillOpacity={1} fill="url(#colorSpend)" name="Actual Spend" />
                <Line type="monotone" dataKey="budget" stroke="#00D4AA" strokeDasharray="5 5" name="Budget Limit" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Spend by Category</h3>
            <p>Distribution of expenditures</p>
          </div>
          <div className="chart-wrapper flex-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Performance Bar Chart */}
        <div className="chart-card span-2">
          <div className="chart-header">
            <h3>Top Vendor Performance</h3>
            <p>Scorecard based on Quotes Submitted and Approved</p>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorPerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#8F9BB3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8F9BB3" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                />
                <Legend />
                <Bar dataKey="submittedCount" name="Quotes Submitted" fill="#00D4AA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approvedCount" name="Quotes Approved" fill="#6C47FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RFQ Status Line Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>RFQ Conversion Funnel</h3>
            <p>Quarterly status of RFQs</p>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rfqStatusData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#8F9BB3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8F9BB3" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="submitted" stroke="#6C47FF" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="approved" stroke="#00D4AA" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="rejected" stroke="#FF6B6B" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
