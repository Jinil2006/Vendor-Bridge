import { useState } from 'react';
import { FileText, CheckCircle, Receipt, Users, Activity as ActivityIcon } from 'lucide-react';

const Activity = () => {
  const [activeTab, setActiveTab] = useState('All');

  const activities = [
    { id: 1, type: 'RFQ', text: 'You submitted a quotation for Office furniture procurement Q2', time: '10 mins ago', icon: <FileText size={18} color="var(--primary-color)" /> },
    { id: 2, type: 'Approvals', text: 'Admin approved Infra Supplies Pvt ltd for Office furniture', time: '2 hours ago', icon: <CheckCircle size={18} color="var(--success)" /> },
    { id: 3, type: 'Vendors', text: 'New vendor TechCore LTD registered', time: 'Yesterday', icon: <Users size={18} color="var(--info)" /> },
    { id: 4, type: 'Invoices', text: 'Invoice INV-2025-089 marked as Paid', time: '2 days ago', icon: <Receipt size={18} color="#ca8a04" /> },
    { id: 5, type: 'Approvals', text: 'Procurement Officer requested L1 Review for PO-102', time: '3 days ago', icon: <CheckCircle size={18} color="var(--success)" /> },
  ];

  const filteredActivities = activeTab === 'All' ? activities : activities.filter(a => a.type === activeTab);

  return (
    <div className="activity-page" style={{ padding: '1rem', animation: 'fadeIn 0.4s ease-out' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Activity & Logs</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track all system events and vendor interactions.</p>
        </div>
      </div>

      <div className="vendors-controls" style={{ marginBottom: '1.5rem' }}>
        <div className="tabs" style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'RFQ', 'Approvals', 'Invoices', 'Vendors'].map(tab => (
            <button 
              key={tab}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
              style={activeTab !== tab ? { background: 'transparent', border: '1px solid var(--border-color)' } : {}}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredActivities.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No activities found for this category.</div>
          ) : (
            filteredActivities.map((act) => (
              <div key={act.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--background-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {act.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-dark)', lineHeight: '1.5' }}>{act.text}</p>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{act.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;
