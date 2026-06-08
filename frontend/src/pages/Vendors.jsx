import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import './Vendors.css';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [viewVendor, setViewVendor] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userRole = (user.role || 'Vendor').toLowerCase();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    gstNumber: '',
    contactPerson: ''
  });

  const fetchVendors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vendors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setVendors(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setVendors([data.data, ...vendors]);
        setIsModalOpen(false);
        setFormData({ name: '', email: '', phone: '', category: '', gstNumber: '', contactPerson: '' }); // reset
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server error while adding vendor.');
    }
  };

  const deleteVendor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/vendors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setVendors(vendors.filter(v => v._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (vendor.gstNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (vendor.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || vendor.status.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  if (userRole === 'vendor') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Your role does not have permission to view the vendor registry.</p>
      </div>
    );
  }

  return (
    <div className="vendors-page">
      <div className="page-header table-toolbar">
        <div>
          <h1>Vendors</h1>
          <p>Manage supplier profiles and registrations</p>
        </div>
        {userRole === 'admin' && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Vendor
          </button>
        )}
      </div>

      <div className="vendors-controls" style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="search by name, gst number, category..." 
          className="input-field" 
          style={{ width: '100%', maxWidth: '600px', marginBottom: '1rem', padding: '0.875rem' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="tabs" style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'Active', 'Pending', 'Blocked'].map(tab => {
            const count = tab === 'All' ? vendors.length : vendors.filter(v => v.status.toLowerCase() === tab.toLowerCase()).length;
            return (
              <button 
                key={tab}
                className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                style={activeTab !== tab ? { background: 'transparent', border: '1px solid var(--border-color)' } : {}}
                onClick={() => setActiveTab(tab)}
              >
                {tab} ({count})
              </button>
            )
          })}
        </div>
      </div>

      <div className="card table-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading vendors...</div>
        ) : vendors.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No vendors found. Add your first vendor!
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Category</th>
                <th>Contact</th>
                <th>GST Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>
                    <div className="vendor-name">{vendor.name}</div>
                    <div className="vendor-email">{vendor.email}</div>
                  </td>
                  <td>{vendor.category}</td>
                  <td>
                    <div>{vendor.contactPerson || 'N/A'}</div>
                    <div className="vendor-phone">{vendor.phone}</div>
                  </td>
                  <td>{vendor.gstNumber}</td>
                  <td>
                    <span className={`status-badge status-${vendor.status.toLowerCase()}`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', border: '1px solid var(--border-color)', background: 'transparent' }} onClick={() => setViewVendor(vendor)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Vendor Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Vendor</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            {error && <div className="error-message" style={{ color: 'var(--danger)', marginBottom: '1rem', backgroundColor: '#fee2e2', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Vendor Name / Company</label>
                <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone" className="input-field" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" name="category" className="input-field" placeholder="e.g. IT, Office Supplies" value={formData.category} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>GST Number</label>
                  <input type="text" name="gstNumber" className="input-field" value={formData.gstNumber} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Contact Person (Optional)</label>
                <input type="text" name="contactPerson" className="input-field" value={formData.contactPerson} onChange={handleChange} />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Vendor Modal */}
      {viewVendor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Vendor Details</h2>
              <button className="icon-btn" onClick={() => setViewVendor(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Company Name</span>
                <span style={{ fontWeight: 'bold' }}>{viewVendor.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Email</span>
                <span>{viewVendor.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Phone</span>
                <span>{viewVendor.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Category</span>
                <span>{viewVendor.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>GST Number</span>
                <span>{viewVendor.gstNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Status</span>
                <span className={`status-badge status-${viewVendor.status.toLowerCase()}`}>{viewVendor.status}</span>
              </div>
              
              <div className="modal-actions" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setViewVendor(null)}>Close</button>
                {userRole === 'admin' && (
                  <button type="button" className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => { deleteVendor(viewVendor._id); setViewVendor(null); }}>Delete Vendor</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
