import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  ChevronRight,
  MapPin,
  Bell,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

const DashboardLayout = ({
  role = 'employer',
  user,
  profile,
  navItems = [],
  activeTab,
  onTabChange,
  onLocationUpdate,
  pageTitle,
  pageSubtitle,
  children,
}) => {
  const { logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  const hasLocation = role === 'employer'
    ? profile?.latitude && profile?.longitude
    : profile?.current_latitude && profile?.current_longitude;

  const handleNavClick = (key) => {
    onTabChange(key);
    setSidebarOpen(false);
  };

  // Current page info from navItems
  const currentNav = navItems.find(n => n.key === activeTab);
  const displayTitle = pageTitle || currentNav?.label || 'Dashboard';
  const displaySubtitle = pageSubtitle || currentNav?.subtitle || '';

  return (
    <div className="dashboard-root">
      {/* Mobile Sidebar Toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Backdrop */}
      <div
        className={`sidebar-mobile-backdrop ${sidebarOpen ? 'sidebar-mobile-backdrop--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">HM</div>
          <span className="sidebar-brand-text">HireMe</span>
          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'none',
              marginLeft: 'auto',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 32, height: 32,
              cursor: 'pointer',
              color: 'white',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="sidebar-mobile-close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || (role === 'employer' ? '🏢' : '👤')}
          </div>
          <div className="sidebar-user-name">{user?.name || 'User'}</div>
          <div className="sidebar-role-badge">
            {role === 'employer' ? '🏢 Employer' : `● ${profile?.status || 'Available'}`}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Menu</div>
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                id={`${role}-nav-${item.key}`}
                className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`}
                onClick={() => handleNavClick(item.key)}
              >
                {Icon && <Icon size={20} className="sidebar-nav-item-icon" />}
                <span>{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="sidebar-nav-item-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-divider" />

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-location-btn"
            onClick={logout}
            style={{ borderStyle: 'solid', borderColor: 'rgba(239,68,68,0.2)' }}
          >
            <LogOut size={16} style={{ color: '#f87171' }} />
            <span style={{ color: '#fca5a5' }}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-inner">
            <div className="dashboard-header-left">
              <div className="breadcrumb">
                <span className="breadcrumb-item">Dashboard</span>
                {activeTab !== 'dashboard' && activeTab !== 'overview' && (
                  <>
                    <ChevronRight size={14} className="breadcrumb-separator" />
                    <span className="breadcrumb-current">{displayTitle}</span>
                  </>
                )}
              </div>
              <h1 className="dashboard-header-title">{displayTitle}</h1>
              {displaySubtitle && <p className="dashboard-header-subtitle">{displaySubtitle}</p>}
            </div>
            <div className="dashboard-header-right">
              <button className="notification-bell" aria-label="Notifications">
                <Bell size={20} />
              </button>
              <div className="avatar avatar--md" style={{ cursor: 'pointer' }}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {children}
        </div>
      </div>

      {/* ── Mobile close button style override ── */}
      <style>{`
        @media (max-width: 1024px) {
          .sidebar-mobile-close { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
