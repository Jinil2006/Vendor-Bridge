import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  FileSpreadsheet, 
  CheckSquare, 
  Receipt, 
  Activity, 
  BarChart3,
  LogOut,
  ShoppingCart
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('Vendor');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserName(user.name || 'User');
      setUserRole(user.role || 'Vendor');
    }
  }, []);

  // Get initials from name
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Vendors', path: '/vendors', icon: <Users size={20} /> },
    { name: 'RFQs', path: '/rfqs', icon: <FileText size={20} /> },
    { name: 'Quotations', path: '/quotations', icon: <FileSpreadsheet size={20} /> },
    { name: 'Approvals', path: '/approvals', icon: <CheckSquare size={20} /> },
    { name: 'Purchase orders', path: '/purchase-orders', icon: <ShoppingCart size={20} /> },
    { name: 'Invoices', path: '/invoices', icon: <Receipt size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
    { name: 'Activity', path: '/activity', icon: <Activity size={20} /> },
  ];

  const getFilteredNavItems = () => {
    const role = userRole.toLowerCase();
    if (role === 'admin' || role === 'officer') {
      return navItems;
    } else if (role === 'manager') {
      return navItems.filter(item => ['Dashboard', 'Approvals', 'Quotations', 'Reports'].includes(item.name));
    } else {
      return navItems.filter(item => ['Dashboard', 'RFQs', 'Quotations', 'Purchase orders', 'Invoices'].includes(item.name));
    }
  };

  const filteredNavItems = getFilteredNavItems();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>VendorBridge</h2>
      </div>
      
      <div className="sidebar-user">
        <div className="user-avatar">{getInitials(userName)}</div>
        <div className="user-info">
          <p className="user-name">{userName}</p>
          <p className="user-role">{userRole}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {filteredNavItems.map((item) => (
            <li key={item.name}>
              <Link 
                to={item.path} 
                className={`nav-link ${currentPath === item.path ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <Link to="/login" className="nav-link logout-link" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
