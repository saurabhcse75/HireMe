import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { WorkerService } from '../services/api';
import DashboardLayout from '../components/common/DashboardLayout';
import NearbyJobs from '../components/worker/NearbyJobs';
import MyApplications from '../components/worker/MyApplications';
import EmployerRequests from '../components/worker/EmployerRequests';
import { showSuccess, showError } from '../utils/toastNotification';
import { getCurrentLocation } from '../utils/geolocation';
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  Handshake,
  CircleDot,
  Briefcase,
  Clock,
  Star,
  TrendingUp,
  Search,
  ArrowUpRight,
  X,
  Phone,
} from 'lucide-react';

const WorkerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ appliedJobs: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, applicationsRes, requestsRes] = await Promise.all([
        WorkerService.getProfile(),
        WorkerService.getApplications(),
        WorkerService.getRequests(),
      ]);

      const worker = profileRes.data.worker;
      setProfile(worker);
      
      const apps = applicationsRes.data.applications || [];
      const reqs = requestsRes.data.requests || [];

      setRecentApplications(apps.slice(0, 3));
      setRecentRequests(reqs.slice(0, 3));

      const pendingApps = apps.filter((app) => app.status === 'pending').length;
      const pendingReqs = reqs.filter((req) => req.status === 'pending').length;

      setStats({
        appliedJobs: pendingApps,
        pendingRequests: pendingReqs,
      });

      if (worker && worker.current_latitude && worker.current_longitude) {
        try {
          const jobsRes = await WorkerService.getNearbyJobs(worker.current_latitude, worker.current_longitude);
          setRecentJobs((jobsRes.data.jobs || []).slice(0, 3));
        } catch (jobErr) {
          console.warn('Error fetching nearby jobs for overview:', jobErr);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = async () => {
    try {
      setUpdatingLocation(true);
      const location = await getCurrentLocation();
      await WorkerService.updateLocation(location.latitude, location.longitude);
      setProfile(prev => ({ ...prev, current_latitude: location.latitude, current_longitude: location.longitude }));
      showSuccess('Location updated successfully!');
      setShowLocationModal(false);
    } catch (error) {
      console.error('Error updating location:', error);
      if (error.code === 1) {
        showError('Location permission denied. Please enable location access in your browser settings');
      } else if (error.code === 2) {
        showError('Location information is unavailable');
      } else if (error.code === 3) {
        showError('Location request timed out');
      } else {
        showError(error.response?.data?.message || 'Failed to update location');
      }
    } finally {
      setUpdatingLocation(false);
    }
  };

  const openLocationModal = () => {
    setShowLocationModal(true);
    handleLocationUpdate();
  };

  const getStatusColor = (status) => {
    if (status === 'open') return 'var(--green-600)';
    if (status === 'working') return 'var(--blue-600)';
    return 'var(--gray-500)';
  };

  const navItems = [
    { key: 'overview', icon: LayoutDashboard, label: 'Overview', subtitle: 'Your dashboard at a glance' },
    { key: 'jobs', icon: MapPin, label: 'Nearby Jobs', subtitle: 'Jobs available near your location' },
    { key: 'applications', icon: ClipboardList, label: 'My Applications', subtitle: 'Track all your job applications', badge: stats.appliedJobs || null },
    { key: 'requests', icon: Handshake, label: 'Employer Requests', subtitle: 'Respond to direct hire requests', badge: stats.pendingRequests || null },
  ];

  // Loading screen
  if (loading) {
    return (
      <div className="dashboard-root" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48,
            border: '4px solid var(--gray-200)',
            borderTop: '4px solid var(--indigo-500)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px',
          }} />
          <p style={{ color: 'var(--gray-500)', fontWeight: 500, fontSize: '0.95rem' }}>
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardLayout
        role="worker"
        user={user}
        profile={profile}
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLocationUpdate={openLocationModal}
        pageTitle={activeTab === 'overview' ? `Welcome back, ${user?.name} 👋` : undefined}
        pageSubtitle={activeTab === 'overview' ? 'Manage your job applications and employer requests' : undefined}
      >
        {/* ══ Overview Tab ══ */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            {/* Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="stat-card stat-card--green">
                <div className="stat-icon stat-icon--green"><CircleDot size={24} /></div>
                <div className="stat-value" style={{ fontSize: 'var(--text-2xl)', textTransform: 'capitalize', color: getStatusColor(profile?.status) }}>
                  {profile?.status || 'Open'}
                </div>
                <div className="stat-label">Current Status</div>
              </div>

              <div className="stat-card stat-card--navy" onClick={() => setActiveTab('applications')}>
                <div className="stat-icon stat-icon--navy"><Briefcase size={24} /></div>
                <div className="stat-value">{stats.appliedJobs}</div>
                <div className="stat-label">Applied Jobs</div>
                <div className="stat-trend stat-trend--up">
                  <TrendingUp size={12} /> Applied
                </div>
              </div>

              <div className="stat-card stat-card--amber" onClick={() => setActiveTab('requests')}>
                <div className="stat-icon stat-icon--amber"><Clock size={24} /></div>
                <div className="stat-value">{stats.pendingRequests}</div>
                <div className="stat-label">Pending Requests</div>
                {stats.pendingRequests > 0 && (
                  <div className="stat-trend stat-trend--up">
                    <TrendingUp size={12} /> New
                  </div>
                )}
              </div>

              <div className="stat-card stat-card--yellow">
                <div className="stat-icon stat-icon--yellow"><Star size={24} /></div>
                <div className="stat-value">
                  {profile?.rating && parseFloat(profile.rating) > 0
                    ? parseFloat(profile.rating).toFixed(1) : '—'}
                </div>
                <div className="stat-label">Your Rating</div>
                {profile?.total_ratings > 0 && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: 4 }}>
                    {profile.total_ratings} review{profile.total_ratings !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <div className="stat-card stat-card--indigo" onClick={openLocationModal} style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon--indigo"><MapPin size={24} /></div>
                <div className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>
                  {profile?.current_latitude ? '✓ Set' : '—'}
                </div>
                <div className="stat-label">Current Location</div>
                {profile?.current_latitude && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: 4 }}>
                    {parseFloat(profile.current_latitude).toFixed(4)}, {parseFloat(profile.current_longitude).toFixed(4)}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dash-card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="dash-card-header">
                <div className="dash-card-title">Quick Actions</div>
              </div>
              <div className="quick-actions">
                {[
                  { label: 'Browse Nearby Jobs', icon: Search, tab: 'jobs' },
                  { label: 'View Applications', icon: ClipboardList, tab: 'applications' },
                  { label: 'Employer Requests', icon: Handshake, tab: 'requests' },
                ].map((action) => (
                  <button
                    key={action.tab}
                    className="quick-action-btn"
                    onClick={() => setActiveTab(action.tab)}
                  >
                    <action.icon size={18} />
                    {action.label}
                    <ArrowUpRight size={14} style={{ opacity: 0.4 }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
              {/* Nearby Jobs */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">
                    <Briefcase size={18} style={{ color: 'var(--navy-600)' }} />
                    Nearby Jobs
                  </div>
                  <button
                    className="btn-dash btn-dash--ghost btn-dash--sm"
                    onClick={() => setActiveTab('jobs')}
                  >
                    View all
                  </button>
                </div>
                {recentJobs.length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-title">No jobs nearby</div>
                    <div className="empty-state-text">
                      {profile?.current_latitude 
                        ? 'There are no active jobs near you right now.' 
                        : 'Set your location to find jobs near you.'}
                    </div>
                    {!profile?.current_latitude && (
                      <button className="btn-dash btn-dash--primary btn-dash--sm" onClick={openLocationModal}>
                        <MapPin size={14} /> Set Location
                      </button>
                    )}
                  </div>
                ) : (
                  recentJobs.map((j) => (
                    <div key={j.id} className="activity-item">
                      <div className="activity-item-icon" style={{ background: 'var(--navy-50)', color: 'var(--navy-600)' }}>
                        <Briefcase size={16} />
                      </div>
                      <div className="activity-item-content">
                        <div className="activity-item-title">{j.title}</div>
                        <div className="activity-item-subtitle">
                          <MapPin size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> {j.location_name}
                          {j.distance != null && ` (${parseFloat(j.distance).toFixed(1)} km)`}
                        </div>
                      </div>
                      <div className="activity-item-meta" style={{ fontWeight: 600, color: 'var(--green-600)' }}>
                        ₹{j.wages_per_hour}/hr
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Recent Applications */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">
                    <ClipboardList size={18} style={{ color: 'var(--indigo-600)' }} />
                    Recent Applications
                  </div>
                  <button
                    className="btn-dash btn-dash--ghost btn-dash--sm"
                    onClick={() => setActiveTab('applications')}
                  >
                    View all
                  </button>
                </div>
                {recentApplications.length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
                    <div className="empty-state-icon">📨</div>
                    <div className="empty-state-title">No applications</div>
                    <div className="empty-state-text">Apply to jobs to track their status here</div>
                    <button className="btn-dash btn-dash--primary btn-dash--sm" onClick={() => setActiveTab('jobs')}>
                      <Search size={14} /> Find Jobs
                    </button>
                  </div>
                ) : (
                  recentApplications.map((a) => (
                    <div key={a.id} className="activity-item">
                      <div className="activity-item-icon" style={{ background: 'var(--indigo-50)', color: 'var(--indigo-600)' }}>
                        <ClipboardList size={16} />
                      </div>
                      <div className="activity-item-content">
                        <div className="activity-item-title">{a.title}</div>
                        <div className="activity-item-subtitle">
                          {a.employer_name} • ₹{a.wages_per_hour}/hr
                        </div>
                      </div>
                      <div className="activity-item-meta">
                        <span className={`badge ${
                          a.status === 'accepted' ? 'badge--success' : a.status === 'rejected' ? 'badge--danger' : 'badge--warning'
                        }`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Recent Employer Requests */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">
                    <Handshake size={18} style={{ color: 'var(--amber-500)' }} />
                    Employer Requests
                  </div>
                  <button
                    className="btn-dash btn-dash--ghost btn-dash--sm"
                    onClick={() => setActiveTab('requests')}
                  >
                    View all
                  </button>
                </div>
                {recentRequests.length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
                    <div className="empty-state-icon">🤝</div>
                    <div className="empty-state-title">No requests yet</div>
                    <div className="empty-state-text">Direct hire requests from employers will appear here</div>
                  </div>
                ) : (
                  recentRequests.map((r) => (
                    <div key={r.id} className="activity-item">
                      <div className="avatar avatar--sm" style={{ flexShrink: 0 }}>
                        {r.employer_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="activity-item-content">
                        <div className="activity-item-title">{r.employer_name}</div>
                        <div className="activity-item-subtitle" style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px' }}>
                          <span style={{ display: 'block', marginBottom: '2px' }}>
                            <MapPin size={10} style={{ display: 'inline', verticalAlign: '-1px' }} /> Address: {r.employer_address || r.location_name}
                          </span>
                          <span style={{ display: 'block', marginBottom: '2px' }}>
                            <Phone size={10} style={{ display: 'inline', verticalAlign: '-1px' }} /> Mobile: {r.employer_mobile}
                          </span>
                          <span>₹{r.wages_per_hour}/hr • {r.working_hours} hrs</span>
                        </div>
                      </div>
                      <div className="activity-item-meta">
                        <span className={`badge ${
                          r.status === 'accepted' ? 'badge--success' : r.status === 'rejected' ? 'badge--danger' : 'badge--warning'
                        }`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ Nearby Jobs Tab ══ */}
        {activeTab === 'jobs' && (
          <div className="animate-fade-in">
            <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
              <NearbyJobs profile={profile} />
            </div>
          </div>
        )}

        {/* ══ My Applications Tab ══ */}
        {activeTab === 'applications' && (
          <div className="animate-fade-in">
            <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
              <MyApplications onDataChange={fetchDashboardData} />
            </div>
          </div>
        )}

        {/* ══ Employer Requests Tab ══ */}
        {activeTab === 'requests' && (
          <div className="animate-fade-in">
            <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
              <EmployerRequests onDataChange={fetchDashboardData} />
            </div>
          </div>
        )}
      </DashboardLayout>

      {/* ══ Location Update Modal ══ */}
      {showLocationModal && (
        <div className="modal-overlay" onClick={() => !updatingLocation && setShowLocationModal(false)}>
          <div className="modal-container modal-container--sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header modal-header--gradient" style={{ textAlign: 'center' }}>
              <button className="modal-close" onClick={() => setShowLocationModal(false)}>
                <X size={16} />
              </button>
              <MapPin size={32} style={{ margin: '0 auto 12px', opacity: 0.9 }} />
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0 }}>
                Updating Your Location
              </h3>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              {updatingLocation ? (
                <>
                  <div style={{
                    width: 56, height: 56,
                    border: '4px solid var(--gray-200)',
                    borderTop: '4px solid var(--indigo-500)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 20px',
                  }} />
                  <p style={{ fontWeight: 600, color: 'var(--gray-700)', marginBottom: 8 }}>
                    Getting your location...
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)' }}>
                    Please allow location access when prompted
                  </p>
                </>
              ) : (
                <>
                  <div style={{
                    width: 56, height: 56,
                    borderRadius: '50%',
                    background: 'var(--green-50)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    animation: 'scaleIn 0.4s ease-out',
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green-500)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p style={{ fontWeight: 700, color: 'var(--green-600)', fontSize: 'var(--text-lg)', marginBottom: 16 }}>
                    Location updated successfully!
                  </p>
                  <button
                    className="btn-dash btn-dash--primary btn-dash--full"
                    onClick={() => setShowLocationModal(false)}
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkerDashboard;
