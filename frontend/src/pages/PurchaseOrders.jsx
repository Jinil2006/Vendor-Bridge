import { useState } from 'react';
import { Search, Download, Printer, Mail, FileText } from 'lucide-react';

const PurchaseOrders = () => {
  const [isViewing, setIsViewing] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  const [pos, setPos] = useState([
    {
      id: 'PO-2023-001',
      date: '2025-06-12',
      invoiceDate: '2025-06-14',
      dueDate: '2025-07-14',
      vendor: { name: 'Infra Supplies Pvt ltd', address: '123 Business Rd, Tech City, 10001', gst: 'GSTIN123456789' },
      items: [
        { name: 'Ergonomic Chair', qty: 10, unitPrice: 200, total: 2000 },
        { name: 'Standing Desk', qty: 5, unitPrice: 400, total: 2000 }
      ],
      subtotal: 4000,
      cgst: 360,
      sgst: 360,
      grandTotal: 4720,
      status: 'Pending Payment'
    }
  ]);

  if (isViewing && selectedPO) {
    return (
      <div className="po-page" style={{ padding: '1rem', animation: 'fadeIn 0.4s ease-out' }}>
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Purchase Order & Invoice</h1>
            <p style={{ color: 'var(--text-muted)' }}>#{selectedPO.id}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setIsViewing(false)} style={{ border: '1px solid var(--border-color)', background: 'transparent' }}>Back to POs</button>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '3rem', maxWidth: '900px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          {/* Header Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '2rem' }}>
            <div>
              <h2 style={{ color: 'var(--primary-color)', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '800' }}>YOUR ORG LOGO</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Your Organization Name<br/>
                456 Enterprise Way, Suite 100<br/>
                Business District, 10002<br/>
                GST: YOURGSTIN987654321
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: '1rem' }}>
                 <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: '600', marginRight: '1rem' }}>PO Number</span>
                 <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedPO.id}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '0.5rem 1rem', textAlign: 'right', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>PO Date:</span><span>{selectedPO.date}</span>
                <span style={{ color: 'var(--text-muted)' }}>Invoice Date:</span><span>{selectedPO.invoiceDate}</span>
                <span style={{ color: 'var(--text-muted)' }}>Due Date:</span><span style={{ color: 'var(--danger)', fontWeight: '600' }}>{selectedPO.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Bill To (Vendor)</h3>
            <p style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{selectedPO.vendor.name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>{selectedPO.vendor.address}<br/>GST: {selectedPO.vendor.gst}</p>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
            <thead>
              <tr style={{ background: 'var(--background-light)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: '600', borderRadius: '8px 0 0 8px' }}>Item Description</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: '600' }}>Qty</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: '600' }}>Unit Price</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: '600', borderRadius: '0 8px 8px 0' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedPO.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.25rem 1rem', fontWeight: '500' }}>{item.name}</td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>{item.qty}</td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>${item.unitPrice.toLocaleString()}</td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: '600' }}>${item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
            <div style={{ width: '350px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>
                <span>Subtotal</span><span>${selectedPO.subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>
                <span>CGST (9%)</span><span>${selectedPO.cgst.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>
                <span>SGST (9%)</span><span>${selectedPO.sgst.toLocaleString()}</span>
              </div>
              <div style={{ height: '2px', background: 'var(--text-dark)', margin: '0.5rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', fontWeight: '800', fontSize: '1.25rem', color: 'var(--primary-color)' }}>
                <span>Grand Total</span><span>${selectedPO.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <span style={{ fontWeight: '600' }}>Status:</span>
               <span style={{ padding: '0.5rem 1rem', background: selectedPO.status === 'Paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: selectedPO.status === 'Paid' ? 'var(--success)' : '#ca8a04', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem' }}>{selectedPO.status}</span>
               {selectedPO.status !== 'Paid' && (
                 <button 
                   className="btn btn-primary" 
                   style={{ padding: '0.5rem 1.5rem', background: 'var(--success)', borderColor: 'var(--success)' }}
                   onClick={() => {
                     const updated = pos.map(p => p.id === selectedPO.id ? { ...p, status: 'Paid' } : p);
                     setPos(updated);
                     setSelectedPO({ ...selectedPO, status: 'Paid' });
                   }}
                 >
                   Mark as Paid
                 </button>
               )}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button className="btn btn-secondary" style={{ padding: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent' }} title="Download PDF" onClick={() => alert("Downloading PDF...")}><Download size={18} /></button>
               <button className="btn btn-secondary" style={{ padding: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent' }} title="Print" onClick={() => window.print()}><Printer size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="po-page" style={{ padding: '1rem', animation: 'fadeIn 0.4s ease-out' }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Purchase Orders</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your purchase orders and invoices.</p>
        </div>
      </div>

      <div className="card table-card" style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div className="table-toolbar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div className="search-box" style={{ display: 'flex', alignItems: 'center', background: 'var(--background-light)', padding: '0.5rem 1rem', borderRadius: '8px', width: '300px' }}>
            <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
            <input type="text" placeholder="Search POs..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>PO#</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>Vendor</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>Amount</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pos.map((po) => (
              <tr key={po.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: '600' }}>{po.id}</td>
                <td style={{ padding: '1rem' }}>{po.vendor.name}</td>
                <td style={{ padding: '1rem' }}>{po.date}</td>
                <td style={{ padding: '1rem', fontWeight: '600' }}>${po.grandTotal.toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.4rem 0.8rem', background: po.status === 'Paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: po.status === 'Paid' ? 'var(--success)' : '#ca8a04', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>{po.status}</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => { setSelectedPO(po); setIsViewing(true); }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrders;
