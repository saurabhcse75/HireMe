import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { EmployerService } from '../services/api';
import DashboardLayout from '../components/common/DashboardLayout';
import PostJob from '../components/employer/PostJob';
import ManageJobs from '../components/employer/ManageJobs';
import NearbyWorkers from '../components/employer/NearbyWorkers';
import HiredWorkers from '../components/employer/HiredWorkers';
import { showSuccess, showError } from '../utils/toastNotification';
import { getCurrentLocation } from '../utils/geolocation';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Search,
  Users,
  Briefcase,
  Inbox,
  UserCheck,
  Star,
  MapPin,
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
  X,
} from 'lucide-react';

const EmployerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    postedJobs: 0,
    applications: 0,
    hiredWorkers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentHires, setRecentHires] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLocationUpdate = async () => {
    try {
      setUpdatingLocation(true);
      const location = await getCurrentLocation();
      await EmployerService.updateLocation(location.latitude, location.longitude);
      setProfile(prev => ({ ...prev, latitude: location.latitude, longitude: location.longitude }));
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

  const fetchDashboardData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [profileRes, jobsRes] = await Promise.all([
        EmployerService.getProfile(),
        EmployerService.getJobs(),
      ]);

      setProfile(profileRes.data.employer);

      let totalApplications = 0;
      let hiredWorkers = 0;

      for (const job of jobsRes.data.jobs) {
        try {
          const appRes = await EmployerService.getApplications(job.id);
          const applications = appRes.data.applications || [];
          totalApplications += applications.filter((app) => app.status === 'pending').length;
          hiredWorkers += applications.filter((app) => app.status === 'accepted').length;
        } catch (error) {
          console.error('Error fetching applications for job:', error);
        }
      }

      try {
        const hiredRes = await EmployerService.getHiredWorkers();
        const hiredList = hiredRes.data.workers || [];
        hiredWorkers = hiredList.filter(w => w.status === 'active').length;
        setRecentHires(hiredList.slice(0, 3));
      } catch (err) {
        console.warn('Could not fetch hired workers count from API', err);
      }

      const topJobs = (jobsRes.data.jobs || []).filter(j => j.status === 'open').slice(0, 3);
      setRecentJobs(topJobs);

      try {
        const apps = [];
        for (const job of topJobs) {
          try {
            const appRes = await EmployerService.getApplications(job.id);
            const jobApps = (appRes.data.applications || []).filter((app) => app.status === 'pending');
            apps.push(...jobApps.slice(0, 2));
          } catch (e) { /* ignore */ }
        }
        setRecentApplications(apps.slice(0, 3));
      } catch (e) {
        setRecentApplications([]);
      }

      setStats({
        postedJobs: jobsRes.data.jobs.filter(j => j.status === 'open').length,
        applications: totalApplications,
        hiredWorkers,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const navItems = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'Overview', subtitle: 'Your dashboard at a glance' },
    { key: 'post', icon: PlusCircle, label: 'Post Job', subtitle: 'Create a new job listing' },
    { key: 'myJobs', icon: ClipboardList, label: 'Posted Jobs', subtitle: 'View and manage your job postings', badge: stats.postedJobs || null },
    { key: 'nearby', icon: Search, label: 'Nearby Workers', subtitle: 'Find available workers near you' },
    { key: 'workers', icon: Users, label: 'Manage Workers', subtitle: 'View and manage your hired team', badge: stats.hiredWorkers || null },
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
        role="employer"
        user={user}
        profile={profile}
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLocationUpdate={openLocationModal}
        pageTitle={activeTab === 'dashboard' ? `Welcome back, ${user?.name} 👋` : undefined}
        pageSubtitle={activeTab === 'dashboard' ? 'Manage your jobs, applications, and team' : undefined}
      >
        {/* ══ Overview Tab ══ */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            {/* Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="stat-card stat-card--navy" onClick={() => setActiveTab('myJobs')}>
                <div className="stat-icon stat-icon--navy"><Briefcase size={24} /></div>
                <div className="stat-value">{stats.postedJobs}</div>
                <div className="stat-label">Active Jobs</div>
                <div className="stat-trend stat-trend--up">
                  <TrendingUp size={12} /> Active
                </div>
              </div>

              <div className="stat-card stat-card--amber" onClick={() => setActiveTab('myJobs')}>
                <div className="stat-icon stat-icon--amber"><Inbox size={24} /></div>
                <div className="stat-value">{stats.applications}</div>
                <div className="stat-label">Applications</div>
                <div className="stat-trend stat-trend--up">
                  <TrendingUp size={12} /> Received
                </div>
              </div>

              <div className="stat-card stat-card--green" onClick={() => setActiveTab('workers')}>
                <div className="stat-icon stat-icon--green"><UserCheck size={24} /></div>
                <div className="stat-value">{stats.hiredWorkers}</div>
                <div className="stat-label">Workers Hired</div>
              </div>

              <div className="stat-card stat-card--indigo" onClick={openLocationModal} style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon--indigo"><MapPin size={24} /></div>
                <div className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>
                  {profile?.latitude ? '✓ Set' : '—'}
                </div>
                <div className="stat-label">Business Location</div>
                {profile?.latitude && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: 4 }}>
                    {parseFloat(profile.latitude).toFixed(4)}, {parseFloat(profile.longitude).toFixed(4)}
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
                  { label: 'Post a Job', icon: PlusCircle, tab: 'post' },
                  { label: 'View Posted Jobs', icon: ClipboardList, tab: 'myJobs' },
                  { label: 'Find Workers', icon: Search, tab: 'nearby' },
                  { label: 'Manage Team', icon: Users, tab: 'workers' },
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
              {/* Recent Jobs */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">
                    <Briefcase size={18} style={{ color: 'var(--navy-600)' }} />
                    Recent Jobs
                  </div>
                  <button
                    className="btn-dash btn-dash--ghost btn-dash--sm"
                    onClick={() => setActiveTab('myJobs')}
                  >
                    View all
                  </button>
                </div>
                {recentJobs.length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-title">No jobs yet</div>
                    <div className="empty-state-text">Post your first job to start receiving applications</div>
                    <button className="btn-dash btn-dash--primary btn-dash--sm" onClick={() => setActiveTab('post')}>
                      <PlusCircle size={14} /> Post a Job
                    </button>
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
                          <span style={{ margin: '0 6px', color: 'var(--gray-300)' }}>•</span>
                          ₹{j.wages_per_hour}/hr
                        </div>
                      </div>
                      <div className="activity-item-meta">
                        <CalendarDays size={11} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
                        {new Date(j.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Recent Applications */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">
                    <Inbox size={18} style={{ color: 'var(--amber-500)' }} />
                    Recent Applications
                  </div>
                  <button
                    className="btn-dash btn-dash--ghost btn-dash--sm"
                    onClick={() => setActiveTab('myJobs')}
                  >
                    View all
                  </button>
                </div>
                {recentApplications.length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
                    <div className="empty-state-icon">📨</div>
                    <div className="empty-state-title">No applications</div>
                    <div className="empty-state-text">Applications from workers will appear here</div>
                  </div>
                ) : (
                  recentApplications.map((a) => (
                    <div key={a.id} className="activity-item">
                      <div className="avatar avatar--sm">{a.name?.charAt(0)?.toUpperCase() || '?'}</div>
                      <div className="activity-item-content">
                        <div className="activity-item-title">{a.name}</div>
                        <div className="activity-item-subtitle">
                          ₹{a.wages_per_hour}/hr • {a.experience || 'Any'} exp
                        </div>
                      </div>
                      <div className="activity-item-meta">
                        {new Date(a.applied_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Recent Hires */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">
                    <UserCheck size={18} style={{ color: 'var(--green-600)' }} />
                    Recent Hires
                  </div>
                  <button
                    className="btn-dash btn-dash--ghost btn-dash--sm"
                    onClick={() => setActiveTab('workers')}
                  >
                    View all
                  </button>
                </div>
                {recentHires.length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">No hires yet</div>
                    <div className="empty-state-text">Workers you hire will appear here</div>
                    <button className="btn-dash btn-dash--primary btn-dash--sm" onClick={() => setActiveTab('nearby')}>
                      <Search size={14} /> Find Workers
                    </button>
                  </div>
                ) : (
                  recentHires.map((h) => (
                    <div key={h.hire_id} className="activity-item">
                      <div className="avatar avatar--sm">{h.name?.charAt(0)?.toUpperCase() || '?'}</div>
                      <div className="activity-item-content">
                        <div className="activity-item-title">{h.name}</div>
                        <div className="activity-item-subtitle">
                          ₹{h.wages_per_hour}/hr • {h.experience || 'Any'} exp
                        </div>
                      </div>
                      <div className="activity-item-meta">
                        {new Date(h.hired_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ Post Job Tab ══ */}
        {activeTab === 'post' && (
          <div className="animate-fade-in">
            <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 'var(--space-6) var(--space-8)' }}>
                <PostJob onPosted={fetchDashboardData} />
              </div>
            </div>
          </div>
        )}

        {/* ══ Posted Jobs Tab ══ */}
        {activeTab === 'myJobs' && (
          <div className="animate-fade-in">
            <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
              <ManageJobs onDataChange={fetchDashboardData} />
            </div>
          </div>
        )}

        {/* ══ Nearby Workers Tab ══ */}
        {activeTab === 'nearby' && (
          <div className="animate-fade-in">
            <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
              <NearbyWorkers profile={profile} />
            </div>
          </div>
        )}

        {/* ══ Manage Workers Tab ══ */}
        {activeTab === 'workers' && (
          <div className="animate-fade-in">
            <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
              <HiredWorkers />
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
                Updating Business Location
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

export default EmployerDashboard;
