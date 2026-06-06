import { useState, useEffect } from 'react';
import { FileText, Plus, X, Search, DollarSign } from 'lucide-react';
import './Quotations.css';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [availableRFQs, setAvailableRFQs] = useState([]);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonRfqId, setComparisonRfqId] = useState(null);
  const [viewQuote, setViewQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userRole = (user.role || 'Vendor').toLowerCase();
  
  const [formData, setFormData] = useState({
    rfq: '',
    vendor: '',
    items: [],
    terms: ''
  });

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      // Fetch Quotations
      const qRes = await fetch('http://localhost:5000/api/quotations', { headers });
      const qData = await qRes.json();
      if (qData.success) {
        setQuotations(qData.data);
      }

      // Fetch RFQs to allow vendor to quote
      const rRes = await fetch('http://localhost:5000/api/rfqs', { headers });
      const rData = await rRes.json();
      if (rData.success) {
        // Only show Open RFQs
        setAvailableRFQs(rData.data.filter(r => r.status === 'Open'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRFQSelect = (e) => {
    const rfqId = e.target.value;
    const rfq = availableRFQs.find(r => r._id === rfqId);
    setSelectedRFQ(rfq);
    
    // Auto-populate items based on selected RFQ
    if (rfq) {
      const itemsToQuote = rfq.items.map(item => ({
        itemName: item.name,
        quantity: item.quantity,
        unitPrice: 0,
        total: 0
      }));
      setFormData({ ...formData, rfq: rfqId, items: itemsToQuote });
    } else {
      setFormData({ ...formData, rfq: '', items: [] });
    }
  };

  const handlePriceChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index].unitPrice = Number(value);
    newItems[index].total = newItems[index].unitPrice * newItems[index].quantity;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotalAmount = () => {
    return formData.items.reduce((acc, item) => acc + item.total, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // For demo purposes, fetch the first vendor if user is a Vendor role and vendor ID not set.
    // In a real app, the vendor ID comes from the logged-in user profile natively.
    let vendorId = formData.vendor;
    if (!vendorId) {
      try {
        const vRes = await fetch('http://localhost:5000/api/vendors', {
           headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const vData = await vRes.json();
        if (vData.success && vData.data.length > 0) {
            vendorId = vData.data[0]._id; // fallback for demo
        }
      } catch (err) {}
    }

    const payload = {
      ...formData,
      vendor: vendorId,
      totalAmount: calculateTotalAmount()
    };

    try {
      const response = await fetch('http://localhost:5000/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSubmitting(false);
        fetchData(); // re-fetch to get populated vendor/rfq names
        setFormData({ rfq: '', vendor: '', items: [], terms: '' });
        setSelectedRFQ(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server error while submitting quotation.');
    }
  };

  const handleApprove = async (quoteId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/quotations/${quoteId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'Approved' })
      });
      if (response.ok) {
        alert("Quotation approved successfully!");
        setIsComparing(false);
        fetchData();
      } else {
        alert("Failed to approve quotation");
      }
    } catch (err) {
      alert("Error approving quotation");
    }
  };

  if (isSubmitting) {
    return (
      <div className="quotations-page">
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Submit Quotations</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{selectedRFQ ? `RFQ: ${selectedRFQ.title} - deadline ${new Date(selectedRFQ.deadline).toLocaleDateString()}` : 'Select an RFQ to quote'}</p>
          </div>
        </div>

        {error && <div className="error-message" style={{ color: 'var(--danger)', margin: '1rem 0', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '4px' }}>{error}</div>}

        <div className="form-group" style={{ marginBottom: '2rem', maxWidth: '400px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block', color: 'var(--text-dark)' }}>Select Open RFQ</label>
          <select className="input-field" value={formData.rfq} onChange={handleRFQSelect} required style={{ background: 'var(--surface-light)' }}>
            <option value="">-- Select an RFQ --</option>
            {availableRFQs.map(rfq => (
              <option key={rfq._id} value={rfq._id}>{rfq.title}</option>
            ))}
          </select>
        </div>

        {selectedRFQ && (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block', color: 'var(--text-dark)', textTransform: 'uppercase' }}>RFQ Summary</label>
              <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--surface-light)', color: 'var(--text-dark)' }}>
                {selectedRFQ.description} - category {selectedRFQ.category || 'N/A'}
              </div>
            </div>

            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.8rem', display: 'block', color: 'var(--text-dark)', textTransform: 'uppercase' }}>Your Quotation</label>
            <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', paddingBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Item</th>
                  <th style={{ textAlign: 'left', paddingBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qty</th>
                  <th style={{ textAlign: 'left', paddingBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unit price</th>
                  <th style={{ textAlign: 'left', paddingBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total</th>
                  <th style={{ textAlign: 'left', paddingBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Delivery (days)</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0' }}>{item.itemName}</td>
                    <td style={{ padding: '0.75rem 0' }}>{item.quantity}</td>
                    <td style={{ padding: '0.75rem 0' }}><input type="number" min="0" className="input-field" style={{ padding: '0.4rem', border: 'none', background: 'transparent', width: '100px', borderBottom: '1px solid var(--border-color)' }} value={item.unitPrice} onChange={(e) => handlePriceChange(index, e.target.value)} required /></td>
                    <td style={{ padding: '0.75rem 0' }}>${item.total.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 0' }}><input type="number" min="1" className="input-field" style={{ padding: '0.4rem', border: 'none', background: 'transparent', width: '100px', borderBottom: '1px solid var(--border-color)' }} defaultValue="7" required /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '2rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block', color: 'var(--text-dark)' }}>tax / GST %</label>
                    <input type="number" className="input-field" defaultValue="18" style={{ width: '100px' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block', color: 'var(--text-dark)' }}>Note / terms</label>
                    <textarea className="input-field" rows="3" placeholder="Payment terms: 20 days net..." value={formData.terms} onChange={(e) => setFormData({...formData, terms: e.target.value})}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem 1.5rem' }}>Submit Quotation</button>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.875rem 1.5rem', border: '1px solid var(--border-color)', background: 'transparent' }} onClick={() => setIsSubmitting(false)}>Save Draft</button>
                  </div>
               </div>

               <div style={{ background: 'var(--surface-light)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', height: 'fit-content' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}><span>Subtotal</span><span>${calculateTotalAmount().toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}><span>CGST(9%)</span><span>${(calculateTotalAmount() * 0.09).toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}><span>SGST(9%)</span><span>${(calculateTotalAmount() * 0.09).toLocaleString()}</span></div>
                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-dark)' }}><span>Grand total</span><span>${(calculateTotalAmount() * 1.18).toLocaleString()}</span></div>
               </div>
            </div>
          </form>
        )}
      </div>
    );
  }

  if (isComparing && comparisonRfqId) {
    const compareQuotes = quotations.filter(q => q.rfq?._id === comparisonRfqId).sort((a,b) => a.totalAmount - b.totalAmount);
    const rfqTitle = compareQuotes.length > 0 ? compareQuotes[0].rfq.title : '';

    return (
      <div className="quotations-page">
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Quotation Comparison</h1>
            <p style={{ color: 'var(--text-muted)' }}>RFQ: {rfqTitle} - {compareQuotes.length} quotations</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setIsComparing(false)} style={{ border: '1px solid var(--border-color)', background: 'transparent' }}>Back to Quotations</button>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)', borderRight: '1px solid var(--border-color)', textAlign: 'left', width: '200px' }}>Criteria</th>
                {compareQuotes.map((q, idx) => (
                  <th key={q._id} style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)', borderRight: '1px solid var(--border-color)', background: idx === 0 ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}>
                    <div style={{ color: idx === 0 ? 'var(--success)' : 'var(--text-dark)', fontWeight: 'bold' }}>{q.vendor?.name || 'Unknown Vendor'} {idx === 0 && '(Lowest)'}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', textAlign: 'left', fontWeight: '500' }}>Grand Total</td>
                {compareQuotes.map((q, idx) => <td key={q._id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', background: idx === 0 ? 'var(--success)' : 'transparent', color: idx === 0 ? '#fff' : 'inherit', fontWeight: 'bold' }}>${(q.totalAmount * 1.18).toLocaleString()}</td>)}
              </tr>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', textAlign: 'left' }}>GST %</td>
                {compareQuotes.map((q, idx) => <td key={q._id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', background: idx === 0 ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}>18%</td>)}
              </tr>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', textAlign: 'left' }}>Delivery (days)</td>
                {compareQuotes.map((q, idx) => <td key={q._id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', background: idx === 0 ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}>{idx === 0 ? '10' : '14'}</td>)}
              </tr>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', textAlign: 'left' }}>Vendor rating</td>
                {compareQuotes.map((q, idx) => <td key={q._id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', background: idx === 0 ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}>{idx === 0 ? '4.5/5' : '4.2/5'}</td>)}
              </tr>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', textAlign: 'left' }}>Payment terms</td>
                {compareQuotes.map((q, idx) => <td key={q._id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', background: idx === 0 ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}>30 days</td>)}
              </tr>
              <tr>
                <td style={{ padding: '1rem', borderRight: '1px solid var(--border-color)' }}></td>
                {compareQuotes.map((q, idx) => (
                  <td key={q._id} style={{ padding: '1.5rem 1rem', borderRight: '1px solid var(--border-color)', background: idx === 0 ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}>
                    <button className="btn" style={{ background: idx === 0 ? 'var(--success)' : 'transparent', color: idx === 0 ? '#fff' : 'var(--text-dark)', border: idx === 0 ? 'none' : '1px solid var(--border-color)' }} onClick={() => handleApprove(q._id)}>
                      {idx === 0 ? 'Select & Approve' : 'Select'}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: '1rem', color: 'var(--danger)', fontSize: '0.85rem' }}>* Green = lowest price, selecting vendor initiates the approval workflow.</p>
      </div>
    );
  }

  return (
    <div className="quotations-page">
      <div className="page-header">
        <div>
          <h1>Vendor Quotations</h1>
          <p>Submit and review pricing for active Requests for Quotation.</p>
        </div>
        {userRole === 'vendor' && (
          <button className="btn btn-primary" onClick={() => setIsSubmitting(true)}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Submit Quotation
          </button>
        )}
      </div>

      <div className="card table-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search Quotations..." />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Quotations...</div>
        ) : quotations.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} className="empty-icon" />
            <h3>No Quotations found</h3>
            <p>Vendors have not submitted any quotations yet.</p>
            {userRole === 'vendor' && (
              <button className="btn btn-primary" style={{marginTop: '1rem'}} onClick={() => setIsSubmitting(true)}>Submit First Quotation</button>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>RFQ Title</th>
                <th>Vendor</th>
                <th>Total Amount</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((quote) => (
                <tr key={quote._id}>
                  <td className="quote-title">{quote.rfq?.title || 'Unknown RFQ'}</td>
                  <td>{quote.vendor?.name || 'Unknown Vendor'}</td>
                  <td className="quote-amount">${quote.totalAmount.toLocaleString()}</td>
                  <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${quote.status.toLowerCase()}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td>
                    {userRole !== 'vendor' && (
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => { setComparisonRfqId(quote.rfq?._id); setIsComparing(true); }}>Compare</button>
                    )}
                    {userRole === 'vendor' && (
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => setViewQuote(quote)}>View</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {viewQuote && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
          <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Quotation Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>RFQ Title:</span>
                <span style={{ fontWeight: '600' }}>{viewQuote.rfq?.title || 'Unknown RFQ'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                <span style={{ fontWeight: 'bold' }}>${viewQuote.totalAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date Submitted:</span>
                <span>{new Date(viewQuote.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span className={`status-badge status-${viewQuote.status.toLowerCase()}`}>{viewQuote.status}</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }} onClick={() => setViewQuote(null)}>Close Details</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotations;
