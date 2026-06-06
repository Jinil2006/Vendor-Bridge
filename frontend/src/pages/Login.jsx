import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, FileText, Users, TrendingUp, ChevronRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import './Login.css';

const features = [
  { icon: <Users size={28} />, title: 'Vendor Management', desc: 'Register, track, and manage all your vendors in one centralized hub.' },
  { icon: <FileText size={28} />, title: 'Smart RFQs', desc: 'Create Requests for Quotation and invite multiple vendors to bid instantly.' },
  { icon: <Shield size={28} />, title: 'Approval Workflows', desc: 'One-click approval matrices with full audit trail and activity logs.' },
  { icon: <TrendingUp size={28} />, title: 'Real-time Analytics', desc: 'Live dashboards with dynamic stats, charts, and procurement insights.' },
];

const roles = [
  { value: 'Vendor', label: 'Vendor', desc: 'Submit quotes & manage bids', color: '#3b82f6' },
  { value: 'Procurement Officer', label: 'Procurement', desc: 'Create RFQs & manage vendors', color: '#10b981' },
  { value: 'Manager', label: 'Manager', desc: 'Approve quotes & oversee ops', color: '#f59e0b' },
  { value: 'Admin', label: 'Admin', desc: 'Full system access & control', color: '#8b5cf6' },
];

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    name: '', // Kept for backwards compatibility
    email: '',
    password: '',
    phone: '',
    country: '',
    additionalInfo: '',
    photo: null,
    role: 'Procurement Officer'
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgotpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setTimeout(() => setIsForgotPassword(false), 3000);
      } else {
        setError(data.message || 'Request failed');
      }
    } catch (err) {
      setError('Server error. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    // Prepare registration data by combining first and last name into 'name'
    const payload = isLogin 
      ? { email: formData.email, password: formData.password, role: formData.role }
      : { ...formData, name: `${formData.firstName} ${formData.lastName}`.trim() };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ name: data.name, role: data.role }));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Server error. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- FORGOT PASSWORD VIEW ----------
  if (isForgotPassword) {
    return (
      <div className="login-page">
        <div className="login-left">
          <div className="login-left-content">
            <div className="brand-logo">
              <Sparkles size={32} />
              <h1>VendorBridge</h1>
            </div>
            <p className="brand-tagline">Enterprise Procurement Platform</p>
            <div className="features-showcase">
              {features.map((f, i) => (
                <div className={`feature-item ${i === activeFeature ? 'active' : ''}`} key={i}>
                  <div className="feature-icon">{f.icon}</div>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="login-left-decoration">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <button className="back-btn" onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMsg(''); }}>
              <ArrowLeft size={18} /> Back to Sign In
            </button>
            <div className="login-header">
              <h2>Reset Password</h2>
              <p>Enter your email to receive a reset link</p>
            </div>
            
            {error && <div className="alert alert-error">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <form onSubmit={handleForgotPasswordSubmit} className="login-form">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" className="input-field" placeholder="name@company.com" value={formData.email} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                {loading ? <span className="btn-loader"></span> : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---------- MAIN LOGIN / SIGNUP VIEW ----------
  return (
    <div className="login-page">
      {/* LEFT PANEL - Feature Showcase */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="brand-logo">
            <Sparkles size={32} />
            <h1>VendorBridge</h1>
          </div>
          <p className="brand-tagline">Enterprise Procurement & Vendor Management Platform</p>
          
          <div className="features-showcase">
            {features.map((f, i) => (
              <div 
                className={`feature-item ${i === activeFeature ? 'active' : ''}`} 
                key={i}
                onMouseEnter={() => setActiveFeature(i)}
              >
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
                <ChevronRight size={16} className="feature-arrow" />
              </div>
            ))}
          </div>

          <div className="demo-credentials">
            <Sparkles size={14} />
            <span>Demo: <strong>test@example.com</strong> / <strong>password123</strong></span>
          </div>
        </div>

        <div className="login-left-decoration">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
      </div>

      {/* RIGHT PANEL - Auth Form */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Sign in to your procurement dashboard' : 'Join VendorBridge to streamline procurement'}</p>
          </div>
          
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="photo-upload-wrapper">
                <label htmlFor="photo-upload" className="photo-upload-circle">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="photo-preview" />
                  ) : (
                    <div className="photo-placeholder">
                      <span style={{textAlign:'center'}}>Add<br/>photo</span>
                    </div>
                  )}
                </label>
                <input 
                  id="photo-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange} 
                  style={{ display: 'none' }} 
                />
              </div>
            )}

            {!isLogin && (
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" className="input-field" placeholder="John" value={formData.firstName} onChange={handleChange} required={!isLogin} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" className="input-field" placeholder="Doe" value={formData.lastName} onChange={handleChange} required={!isLogin} />
                </div>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label>{isLogin ? 'Username' : 'Email Address'}</label>
                <input type={isLogin ? 'text' : 'email'} name="email" className="input-field" placeholder={isLogin ? "Enter your username or email" : "name@company.com"} value={formData.email} onChange={handleChange} required />
              </div>
              {!isLogin && (
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone" className="input-field" placeholder="+1 234 567 890" value={formData.phone} onChange={handleChange} required={!isLogin} />
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="form-row">
                <div className="form-group">
                  <label>Role (Admin, Officer, Vendor)</label>
                  <select name="role" className="input-field" value={formData.role} onChange={handleChange} required={!isLogin}>
                    <option value="Procurement Officer">Officer</option>
                    <option value="Admin">Admin</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input type="text" name="country" className="input-field" placeholder="United States" value={formData.country} onChange={handleChange} required={!isLogin} />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label>Additional Information ....</label>
                <textarea name="additionalInfo" className="input-field" rows="3" placeholder="Enter additional details..." value={formData.additionalInfo} onChange={handleChange}></textarea>
              </div>
            )}
            
            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input type={showPassword ? 'text' : 'password'} name="password" className="input-field" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>


            {isLogin && (
              <div className="form-options">
                <span className="toggle-link" onClick={() => { setIsForgotPassword(true); setError(''); }}>
                  Forgot Password?
                </span>
              </div>
            )}

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? <span className="btn-loader"></span> : (isLogin ? 'Login Button' : 'Register')}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="toggle-link" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
