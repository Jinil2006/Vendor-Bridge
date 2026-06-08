import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, ShieldCheck } from 'lucide-react';
import './Approvals.css';

const Approvals = () => {
  const [quotations, setQuotations] = useState([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const qRes = await fetch('http://localhost:5000/api/quotations', { headers });
      const qData = await qRes.json();
      if (qData.success) {
        // For approvals, we typically only want to show Pending ones
        setQuotations(qData.data.filter(q => q.status === 'Pending'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleApproval = async (id, status) => {
    try {
      const headers = { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      };
      
      const res = await fetch(`http://localhost:5000/api/quotations/${id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      });
      
      const data = await res.json();
      if (data.success) {
        // Remove from pending list
        setQuotations(quotations.filter(q => q._id !== id));
      }
    } catch (err) {
      console.error('Failed to update quotation status', err);
    }
  };

  if (isReviewing && selectedQuote) {
    return (
      <div className="approvals-page">
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Approvals workflow</h1>
            <p style={{ color: 'var(--text-muted)' }}>RFQ: {selectedQuote.rfq?.title || 'Unknown RFQ'}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setIsReviewing(false)} style={{ border: '1px solid var(--border-color)', background: 'transparent' }}>Back to Approvals</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
          {/* Left Column: Approval Chain */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.5rem', display: 'block', textTransform: 'uppercase', color: 'var(--text-dark)' }}>Approval Chain</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '24px', width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
              
              <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><CheckCircle size={14} /></div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>Submitted by vendor</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(selectedQuote.createdAt).toLocaleString()}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--warning)', border: '2px solid #fff' }}></div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>L1 Review (Procurement officer)</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--background-light)', border: '2px solid var(--border-color)' }}></div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-muted)' }}>L2 Approval (Finance)</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--background-light)', border: '2px solid var(--border-color)' }}></div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Generate PO</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Actions */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.5rem', display: 'block', textTransform: 'uppercase', color: 'var(--text-dark)' }}>Quotations Summary</label>
            <div style={{ background: 'var(--surface-light)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Selected Vendor</span>
                <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{selectedQuote.vendor?.name || 'Unknown Vendor'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total amount</span>
                <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>${(selectedQuote.totalAmount * 1.18).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery timeline</span>
                <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>10 days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vendor rating</span>
                <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>4.5/5</span>
              </div>
            </div>

            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: 'var(--text-dark)' }}>Remarks / conditions</label>
            <textarea className="input-field" rows="4" placeholder="Add any conditions for approval..." style={{ marginBottom: '1.5rem' }}></textarea>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" style={{ padding: '0.875rem 2rem', background: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => { handleApproval(selectedQuote._id, 'Approved'); setIsReviewing(false); }}>Approve</button>
              <button className="btn btn-secondary" style={{ padding: '0.875rem 2rem', color: 'var(--danger)', borderColor: 'var(--danger)', background: 'transparent' }} onClick={() => { handleApproval(selectedQuote._id, 'Rejected'); setIsReviewing(false); }}>Reject</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="approvals-page">
      <div className="page-header">
        <div>
          <h1>Approval Workflow</h1>
          <p>Review submitted vendor quotations and approve or reject them.</p>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search by RFQ or Vendor..." />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Pending Approvals...</div>
        ) : quotations.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={48} className="empty-icon" style={{ color: 'var(--success)', opacity: 0.5 }} />
            <h3>All Caught Up!</h3>
            <p>There are no pending quotations awaiting your approval.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>RFQ Reference</th>
                <th>Vendor Details</th>
                <th>Total Value</th>
                <th>Submitted Date</th>
                <th>Review Action</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((quote) => (
                <tr key={quote._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{quote.rfq?.title || 'Unknown RFQ'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {quote.rfq?._id.substring(0, 8)}...</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{quote.vendor?.name || 'Unknown Vendor'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{quote.terms || 'No terms provided'}</div>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: '1.1rem' }}>${quote.totalAmount.toLocaleString()}</td>
                  <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button className="btn btn-primary" style={{ padding: '0.4rem 1.5rem' }} onClick={() => { setSelectedQuote(quote); setIsReviewing(true); }}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Approvals;
