import React, { useState, useEffect } from 'react';
import { WorkerService } from '../../services/api';
import { showSuccess, showError } from '../../utils/toastNotification';
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  MapPin,
  Briefcase,
  CalendarDays,
  X,
  FileText,
} from 'lucide-react';

const MyApplications = ({ onDataChange }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await WorkerService.getApplications();
      setApplications(response.data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      showError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} style={{ color: 'var(--amber-500)' }} />;
      case 'accepted': return <CheckCircle size={16} style={{ color: 'var(--green-500)' }} />;
      case 'rejected': return <XCircle size={16} style={{ color: 'var(--red-500)' }} />;
      default: return <FileText size={16} style={{ color: 'var(--gray-400)' }} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'badge--warning';
      case 'accepted': return 'badge--success';
      case 'rejected': return 'badge--danger';
      default: return 'badge--neutral';
    }
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case 'pending': return 'var(--amber-200)';
      case 'accepted': return 'var(--green-200)';
      case 'rejected': return 'var(--red-200)';
      default: return 'var(--gray-200)';
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending': return 'Your application is waiting for the employer to review it.';
      case 'accepted': return 'Great! The employer has accepted your application.';
      case 'rejected': return 'The employer has rejected your application. Consider applying to other jobs.';
      default: return 'Unknown status';
    }
  };

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter((app) => app.status === filter);

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-8)' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton skeleton--card" style={{ marginBottom: 'var(--space-4)' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'pending', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`filter-tab ${filter === status ? 'filter-tab--active' : ''}`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            {' '}({applications.filter((a) => status === 'all' || a.status === status).length})
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No applications {filter !== 'all' ? `with status "${filter}"` : 'yet'}</div>
          <div className="empty-state-text">Your job applications will appear here</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              onClick={() => setSelectedApplication(application)}
              style={{
                border: '1px solid var(--gray-200)',
                borderLeft: `4px solid ${getStatusBorder(application.status)}`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-5)',
                background: 'white',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                boxShadow: 'var(--shadow-xs)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    {getStatusIcon(application.status)}
                    <h3 style={{ fontWeight: 700, color: 'var(--gray-900)', margin: 0, fontSize: 'var(--text-base)' }}>
                      {application.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Briefcase size={12} /> {application.employer_name}
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} /> {application.location_name}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className={`badge ${getStatusBadge(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: 'var(--space-2)' }}>
                    Click for details
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--gray-100)' }}>
                {[
                  { icon: DollarSign, label: 'Wages', value: `₹${application.wages_per_hour}/hr` },
                  { icon: Clock, label: 'Duration', value: `${application.working_hours} hours` },
                  { icon: CalendarDays, label: 'Applied', value: new Date(application.applied_at).toLocaleDateString() },
                  ...(application.responded_at ? [{ icon: CheckCircle, label: 'Responded', value: new Date(application.responded_at).toLocaleDateString() }] : []),
                ].map(item => (
                  <div key={item.label}>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <item.icon size={11} /> {item.label}
                    </p>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-700)', margin: 0 }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-container modal-container--lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{
              background: selectedApplication.status === 'accepted'
                ? 'linear-gradient(135deg, var(--green-600), var(--green-500))'
                : selectedApplication.status === 'rejected'
                ? 'linear-gradient(135deg, var(--red-600), var(--red-500))'
                : 'linear-gradient(135deg, var(--amber-500), var(--amber-400))',
              color: 'white',
            }}>
              <button className="modal-close" onClick={() => setSelectedApplication(null)}>
                <X size={16} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ fontSize: '2.5rem' }}>{getStatusIcon(selectedApplication.status)}</div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: '0 0 4px' }}>{selectedApplication.title}</h2>
                  <p style={{ opacity: 0.9, margin: 0 }}>from {selectedApplication.employer_name}</p>
                </div>
              </div>
            </div>

            <div className="modal-body">
              {/* Status Banner */}
              <div style={{
                borderLeft: `4px solid ${getStatusBorder(selectedApplication.status)}`,
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: selectedApplication.status === 'accepted' ? 'var(--green-50)'
                  : selectedApplication.status === 'rejected' ? 'var(--red-50)' : 'var(--amber-50)',
                marginBottom: 'var(--space-5)',
              }}>
                <span className={`badge ${getStatusBadge(selectedApplication.status)}`} style={{ marginBottom: 'var(--space-2)', display: 'inline-flex' }}>
                  {selectedApplication.status.toUpperCase()}
                </span>
                <p style={{
                  margin: 'var(--space-2) 0 0',
                  fontSize: 'var(--text-sm)',
                  color: selectedApplication.status === 'accepted' ? 'var(--green-700)'
                    : selectedApplication.status === 'rejected' ? 'var(--red-700)' : 'var(--amber-600)',
                }}>
                  {getStatusDescription(selectedApplication.status)}
                </p>
              </div>

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                {[
                  { label: 'Wages/Hour', value: `₹${selectedApplication.wages_per_hour}`, bg: 'var(--blue-50)', border: 'var(--blue-100)', color: 'var(--blue-600)' },
                  { label: 'Working Hours', value: selectedApplication.working_hours, bg: 'var(--purple-50)', border: 'var(--purple-100)', color: 'var(--purple-600)' },
                  { label: 'Applied On', value: new Date(selectedApplication.applied_at).toLocaleDateString(), bg: 'var(--navy-50)', border: 'var(--navy-100)', color: 'var(--navy-600)' },
                  ...(selectedApplication.responded_at ? [{
                    label: 'Responded On',
                    value: new Date(selectedApplication.responded_at).toLocaleDateString(),
                    bg: 'var(--teal-50)', border: 'var(--teal-500)', color: 'var(--teal-500)',
                  }] : []),
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: `1px solid ${s.border}` }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: 'uppercase', margin: '0 0 var(--space-1)' }}>{s.label}</p>
                    <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--gray-800)', margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Location */}
              <div style={{ background: 'var(--gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', marginBottom: 'var(--space-4)' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', margin: '0 0 var(--space-1)' }}>
                  <MapPin size={11} style={{ verticalAlign: '-1px' }} /> Location
                </p>
                <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--gray-800)', margin: 0 }}>
                  {selectedApplication.location_name}
                </p>
              </div>

              {/* Description */}
              {selectedApplication.description && (
                <div style={{ background: 'var(--gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', margin: '0 0 var(--space-2)' }}>
                    <FileText size={11} style={{ verticalAlign: '-1px' }} /> Job Description
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-700)', lineHeight: 1.6, margin: 0 }}>
                    {selectedApplication.description}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-dash btn-dash--secondary" style={{ flex: 1 }} onClick={() => setSelectedApplication(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
