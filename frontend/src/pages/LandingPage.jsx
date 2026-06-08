import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Users, FileText, BarChart3, Shield, Receipt,
  ChevronRight, Play, ArrowRight, CheckCircle,
  TrendingUp, FileSpreadsheet, Menu, X
} from 'lucide-react';
import './LandingPage.css';

// ==================== COUNTER HOOK ====================
const useCountUp = (target, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return [count, ref];
};

// ==================== SCROLL REVEAL HOOK ====================
const useScrollReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
};

// ==================== SECTION COMPONENT ====================
const Section = ({ children, className = '', id }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <section ref={ref} id={id} className={`lp-section ${className} ${visible ? 'visible' : ''}`}>
      {children}
    </section>
  );
};

// ==================== MAIN LANDING PAGE ====================
const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Counter values
  const [vendors, vendorsRef] = useCountUp(10000, 2500);
  const [accuracy, accuracyRef] = useCountUp(98, 2000);
  const [timeSaved, timeSavedRef] = useCountUp(60, 2000);
  const [orgs, orgsRef] = useCountUp(500, 2500);

  // Metric counters
  const [m1, m1Ref] = useCountUp(8, 1500);
  const [m2, m2Ref] = useCountUp(100, 2000);
  const [m3, m3Ref] = useCountUp(4, 1000);

  const workflowSteps = [
    { icon: <FileText size={24} />, title: 'Create RFQ' },
    { icon: <Users size={24} />, title: 'Vendor Invite' },
    { icon: <FileSpreadsheet size={24} />, title: 'Quotations' },
    { icon: <BarChart3 size={24} />, title: 'Compare Quotes' },
    { icon: <CheckCircle size={24} />, title: 'Approval' },
    { icon: <Shield size={24} />, title: 'Purchase Order' },
    { icon: <Receipt size={24} />, title: 'Invoice' },
  ];

  const features = [
    { icon: <Users size={28} />, title: 'Vendor Management', desc: 'Centralized registry with smart categorization and live tracking.', color: '#6C47FF' },
    { icon: <BarChart3 size={28} />, title: 'Live Dashboard', desc: 'Real-time metrics, activity feeds, and procurement insights.', color: '#00D4AA' },
    { icon: <FileSpreadsheet size={28} />, title: 'Quotation Comparison', desc: 'Compare vendor quotations side-by-side automatically.', color: '#FFD700' },
    { icon: <Shield size={28} />, title: 'Approval Workflows', desc: 'Multi-level approval matrices with role-based access.', color: '#FF6B6B' },
    { icon: <Receipt size={28} />, title: 'Invoice Generation', desc: 'Auto-generate invoices from approved POs seamlessly.', color: '#4ECDC4' },
    { icon: <TrendingUp size={28} />, title: 'Reports & Analytics', desc: 'Comprehensive analytics with visual data trends.', color: '#A78BFA' },
  ];

  const roles = [
    { title: 'Procurement Officer', desc: 'Creates RFQs and manages vendors.', icon: <FileText size={28} />, color: '#6C47FF' },
    { title: 'Vendor', desc: 'Submits quotations and manages bids.', icon: <Users size={28} />, color: '#00D4AA' },
    { title: 'Manager', desc: 'Approves quotes and oversees operations.', icon: <CheckCircle size={28} />, color: '#FFD700' },
    { title: 'Admin', desc: 'Full system control and user management.', icon: <Shield size={28} />, color: '#FF6B6B' },
  ];

  return (
    <div className="lp-wrapper">
      {/* ========== NAVBAR ========== */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="lp-nav-container">
          <div className="lp-logo" onClick={() => scrollTo('hero')}>
            <Zap size={24} className="lp-logo-icon" />
            <span className="lp-logo-text">VendorBridge</span>
          </div>

          <div className={`lp-links ${mobileMenu ? 'open' : ''}`}>
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('workflow')}>Workflow</button>
            <button onClick={() => scrollTo('roles')}>Roles</button>
            <button onClick={() => scrollTo('metrics')}>Analytics</button>
            <button className="lp-nav-cta" onClick={() => navigate('/login')}>
              Get Started <ArrowRight size={16} />
            </button>
          </div>

          <button className="lp-mobile-btn" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className="lp-hero" id="hero">
        <div className="lp-hero-bg">
          <div className="lp-grid-pattern"></div>
          <div className="lp-orb lp-orb-1"></div>
          <div className="lp-orb lp-orb-2"></div>
          <div className="lp-orb lp-orb-3"></div>
        </div>

        <div className="lp-hero-content">
          <h1 className="lp-hero-title">
            Smarter Procurement,<br />
            <span className="lp-text-gradient">Zero Chaos</span>
          </h1>

          <p className="lp-hero-subtitle">
            VendorBridge helps companies manage vendors, RFQs, approvals, purchase orders, and invoices seamlessly from one intuitive platform.
          </p>

          <div className="lp-hero-actions">
            <button className="lp-btn-primary" onClick={() => navigate('/login')}>
              Start Free Trial <ArrowRight size={18} />
            </button>
          </div>

          <div className="lp-hero-stats">
            <div className="lp-stat-item" ref={vendorsRef}>
              <h3>{vendors.toLocaleString()}+</h3>
              <p>Vendors</p>
            </div>
            <div className="lp-stat-item" ref={accuracyRef}>
              <h3>{accuracy}%</h3>
              <p>Accuracy</p>
            </div>
            <div className="lp-stat-item" ref={timeSavedRef}>
              <h3>{timeSaved}%</h3>
              <p>Time Saved</p>
            </div>
            <div className="lp-stat-item" ref={orgsRef}>
              <h3>{orgs}+</h3>
              <p>Organizations</p>
            </div>
          </div>
        </div>

        {/* Floating Glass Cards */}
        <div className="lp-float-card lp-float-1">
          <CheckCircle size={20} color="#00D4AA" />
          <div className="lp-fc-text">
            <strong>Quotation Approved</strong>
            <span>Acme Corp • $12,400</span>
          </div>
        </div>
        <div className="lp-float-card lp-float-2">
          <FileText size={20} color="#6C47FF" />
          <div className="lp-fc-text">
            <strong>New RFQ Created</strong>
            <span>Q3 Hardware Refresh</span>
          </div>
        </div>
      </section>

      {/* ========== WORKFLOW ========== */}
      <Section id="workflow" className="lp-workflow">
        <div className="lp-section-header">
          <h2>Procurement Process, <span className="lp-text-gradient">Streamlined</span></h2>
          <p>A connected workflow that brings efficiency to every step.</p>
        </div>

        <div className="lp-workflow-timeline">
          {workflowSteps.map((step, i) => (
            <div className="lp-workflow-step" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="lp-ws-icon">{step.icon}</div>
              <h4>{step.title}</h4>
              {i < workflowSteps.length - 1 && <div className="lp-ws-arrow"><ChevronRight size={24} /></div>}
            </div>
          ))}
        </div>
      </Section>

      {/* ========== FEATURES ========== */}
      <Section id="features" className="lp-features">
        <div className="lp-section-header">
          <h2>Everything You Need</h2>
          <p>Powerful features designed for modern procurement teams.</p>
        </div>

        <div className="lp-features-grid">
          {features.map((f, i) => (
            <div className="lp-feature-card" key={i} style={{ '--accent': f.color, animationDelay: `${i * 0.1}s` }}>
              <div className="lp-fc-icon" style={{ background: `${f.color}20`, color: f.color }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ========== METRICS ========== */}
      <Section id="metrics" className="lp-metrics">
        <div className="lp-metrics-grid">
          <div className="lp-metric-card" ref={m1Ref}>
            <h3>{m1}x</h3>
            <p>Faster Procurement</p>
          </div>
          <div className="lp-metric-card" ref={m2Ref}>
            <h3>{m2}%</h3>
            <p>Audit Trail</p>
          </div>
          <div className="lp-metric-card" ref={m3Ref}>
            <h3>{m3}</h3>
            <p>Role Levels</p>
          </div>
          <div className="lp-metric-card">
            <h3>∞</h3>
            <p>Infinite Scalability</p>
          </div>
        </div>
      </Section>

      {/* ========== ROLES ========== */}
      <Section id="roles" className="lp-roles">
        <div className="lp-section-header">
          <h2>Built For Every Role</h2>
        </div>

        <div className="lp-roles-grid">
          {roles.map((role, i) => (
            <div className="lp-role-card" key={i} style={{ '--role-color': role.color }}>
              <div className="lp-rc-icon" style={{ color: role.color }}>
                {role.icon}
              </div>
              <h3>{role.title}</h3>
              <p>{role.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ========== CTA ========== */}
      <Section className="lp-cta">
        <div className="lp-cta-glow"></div>
        <div className="lp-cta-content">
          <h2>Ready to Modernize Procurement?</h2>
          <p>Join 500+ organizations that have transformed their vendor management.</p>
          <div className="lp-cta-actions">
            <button className="lp-btn-primary" onClick={() => navigate('/login')}>
              Start Free Trial <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </Section>

      {/* ========== FOOTER ========== */}
      <footer className="lp-footer">
        <div className="lp-footer-content">
          <div className="lp-footer-brand">
            <div className="lp-logo">
              <Zap size={20} className="lp-logo-icon" />
              <span>VendorBridge</span>
            </div>
            <p>Modern ERP platform for procurement and vendor management.</p>
          </div>
          <div className="lp-footer-links">
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('workflow')}>Workflow</button>
            <button onClick={() => scrollTo('roles')}>Roles</button>
            <button onClick={() => navigate('/login')}>Login</button>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>© 2026 VendorBridge. Built for Odoo Hackathon.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
