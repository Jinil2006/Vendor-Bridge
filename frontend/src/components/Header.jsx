import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Sun, Moon, PlayCircle, X, Check } from 'lucide-react';
import './Header.css';

const Header = ({ setRunTour }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New RFQ received from Acme Corp', time: '10 mins ago', read: false },
    { id: 2, text: 'PO #1042 approved by finance', time: '1 hour ago', read: false },
    { id: 3, text: 'Vendor TechSolutions updated profile', time: '2 hours ago', read: false }
  ]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Handle click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Function to simulate incoming notifications randomly
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 15s to get a notification
        const randomNotifications = [
          'Budget limit nearing for Q3',
          'New message from Global Supplies',
          'Invoice #9923 requires approval',
          'Delivery from Office Plus delayed',
          'Contract with TechSolutions expiring soon'
        ];
        const randomText = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        const newNotif = {
          id: Date.now(),
          text: randomText,
          time: 'Just now',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 5)); // Keep max 5
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="header-search">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Search RFQs, Vendors, POs..." 
          className="search-input"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              alert('Global search is a work in progress! Please use the search boxes on the individual Vendors, RFQs, or Quotations pages to find specific records.');
              e.target.value = '';
            }
          }}
        />
      </div>
      
      <div className="header-actions">

        <button className="icon-btn" onClick={toggleTheme} title="Toggle Light/Dark Mode">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="notification-container" ref={dropdownRef}>
          <button 
            className="icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-btn" onClick={markAllAsRead}>
                    <Check size={14} /> Mark all read
                  </button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">No new notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${notif.read ? 'read' : 'unread'}`}>
                      <div className="notification-content" onClick={() => markAsRead(notif.id)}>
                        <p>{notif.text}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                      <button className="notification-close" onClick={() => removeNotification(notif.id)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

