import { useState, useEffect } from 'react';
import { Plus, X, Search, FileText } from 'lucide-react';
import './RFQs.css';

const RFQs = () => {
  const [rfqs, setRfqs] = useState([]);
  const [availableVendors, setAvailableVendors] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userRole = (user.role || 'Vendor').toLowerCase();
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    deadline: '',
    vendors: [],
    items: [{ name: '', quantity: 1, unit: 'NOS' }]
  });

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      const rfqRes = await fetch('http://localhost:5000/api/rfqs', { headers });
      const rfqData = await rfqRes.json();
      if (rfqData.success) {
        setRfqs(rfqData.data);
      }

      const vendorRes = await fetch('http://localhost:5000/api/vendors', { headers });
      const vendorData = await vendorRes.json();
      if (vendorData.success) {
        setAvailableVendors(vendorData.data);
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

  const handleChange = (e) => {
    if (e.target.name === 'vendors') {
      const options = e.target.options;
      const selected = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selected.push(options[i].value);
        }
      }
      setFormData({ ...formData, vendors: selected });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, unit: 'pcs' }]
    });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/rfqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRfqs([data.data, ...rfqs]);
        setIsModalOpen(false);
        setFormData({ title: '', description: '', deadline: '', vendors: [], items: [{ name: '', quantity: 1, unit: 'pcs' }] });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server error while creating RFQ.');
    }
  };

  if (isCreating) {
    return (
      <div className="rfqs-page">
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Create</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>new request for quotation</p>
          </div>
        </div>

        <div className="steps-indicator" style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', maxWidth: '800px' }}>
          <div className="step active" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
          <div style={{ flex: 1, height: '2px', background: 'var(--border-color)', margin: '0 1rem' }}></div>
          <div className="step" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--border-color)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
          <div style={{ flex: 1, height: '2px', background: 'var(--border-color)', margin: '0 1rem' }}></div>
          <div className="step" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--border-color)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
        </div>

        {error && <div className="error-message" style={{ color: 'var(--danger)', margin: '1rem 0', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          {/* Left Column */}
          <div className="left-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block', color: 'var(--text-dark)' }}>RFQ's title*</label>
              <input type="text" name="title" className="input-field" placeholder="Office Furniture procurement Q2" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block', color: 'var(--text-dark)' }}>Category</label>
              <input type="text" name="category" className="input-field" placeholder="Furniture" value={formData.category} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block', color: 'var(--text-dark)' }}>Deadline*</label>
              <input type="date" name="deadline" className="input-field" value={formData.deadline} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block', color: 'var(--text-dark)' }}>Description</label>
              <textarea name="description" className="input-field" rows="4" placeholder="Ergonomic chairs and standing desks for 3rd floor" value={formData.description} onChange={handleChange}></textarea>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="line-items">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.8rem', display: 'block', textTransform: 'uppercase', color: 'var(--text-dark)' }}>Line Items</label>
              <table style={{ width: '100%', marginBottom: '1rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', paddingBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Item</th>
                    <th style={{ textAlign: 'left', paddingBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qty</th>
                    <th style={{ textAlign: 'left', paddingBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unit</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 0' }}><input type="text" className="input-field" style={{ padding: '0.4rem', border: 'none', background: 'transparent' }} placeholder="Ergonomic chair" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} required /></td>
                      <td style={{ padding: '0.75rem 0' }}><input type="number" min="1" className="input-field" style={{ padding: '0.4rem', border: 'none', background: 'transparent', width: '60px' }} value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required /></td>
                      <td style={{ padding: '0.75rem 0' }}>
                        <select className="input-field" style={{ padding: '0.4rem', border: 'none', background: 'transparent' }} value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)}>
                          <option value="NOS">NOS</option>
                          <option value="pcs">pcs</option>
                          <option value="kg">kg</option>
                        </select>
                      </td>
                      <td>
                        {formData.items.length > 1 && (
                          <button type="button" onClick={() => removeItemRow(index)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.4rem' }}><X size={16} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', border: '1px solid var(--border-color)', background: 'transparent' }} onClick={addItemRow}>+ add line item</button>
            </div>

            <div className="assign-vendors">
               <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.8rem', display: 'block', textTransform: 'uppercase', color: 'var(--text-dark)' }}>Assign Vendors</label>
               <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                     {formData.vendors.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No vendors assigned yet.</span>}
                     {formData.vendors.map(vId => {
                       const vendor = availableVendors.find(v => v._id === vId);
                       return (
                         <div key={vId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--surface-light)', borderRadius: '4px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{vendor?.name || vId}</span>
                            <button type="button" onClick={() => {
                              setFormData({...formData, vendors: formData.vendors.filter(id => id !== vId)});
                            }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>
                         </div>
                       )
                     })}
                  </div>
                  <select className="input-field" style={{ marginBottom: '0.5rem', background: 'var(--surface-light)' }} onChange={(e) => {
                    if (e.target.value && !formData.vendors.includes(e.target.value)) {
                       setFormData({...formData, vendors: [...formData.vendors, e.target.value]});
                    }
                    e.target.value = '';
                  }}>
                    <option value="">+ add vendor</option>
                    {availableVendors.map(v => (
                      <option key={v._id} value={v._id}>{v.name}</option>
                    ))}
                  </select>
               </div>
            </div>
          </div>

          {/* Full Width Footer area */}
          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-color)', paddingTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem' }}>Save & Send to Vendors</button>
               <button type="button" className="btn btn-secondary" style={{ padding: '0.875rem', border: '1px solid var(--border-color)', background: 'transparent' }} onClick={() => setIsCreating(false)}>Save as Draft</button>
            </div>
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', background: 'var(--surface-light)' }}>
               Drag & drop files or click to upload
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rfqs-page">
      <div className="page-header">
        <div>
          <h1>Requests for Quotation (RFQs)</h1>
          <p>Create and manage your procurement requests dynamically.</p>
        </div>
        {userRole !== 'vendor' && (
          <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Create RFQ
          </button>
        )}
      </div>

      <div className="card table-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search RFQs..." />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading RFQs...</div>
        ) : rfqs.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} className="empty-icon" />
            <h3>No RFQs found</h3>
            <p>You haven't created any Requests for Quotation yet.</p>
            <button className="btn btn-primary" style={{marginTop: '1rem'}} onClick={() => setIsModalOpen(true)}>Create First RFQ</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>RFQ Title</th>
                <th>Deadline</th>
                <th>Vendors Invited</th>
                <th>Items Count</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq) => (
                <tr key={rfq._id} className="rfq-row">
                  <td>
                    <div className="rfq-title">{rfq.title}</div>
                    <div className="rfq-desc">{rfq.description.substring(0, 50)}...</div>
                  </td>
                  <td>{new Date(rfq.deadline).toLocaleDateString()}</td>
                  <td>{rfq.vendors ? rfq.vendors.length : 0} Vendor(s)</td>
                  <td>{rfq.items.length} item(s)</td>
                  <td>
                    <span className={`status-badge status-${rfq.status.toLowerCase()}`}>
                      {rfq.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal removed as we now use full page create view */}
    </div>
  );
};

export default RFQs;
