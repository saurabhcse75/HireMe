import React, { useState, useEffect } from 'react';
import { EmployerService } from '../../services/api';
import {
  MapPin,
  Clock,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Lock,
  Briefcase,
  Phone,
  Star,
  DollarSign,
  UserCheck,
  UserX,
  AlertTriangle,
  Filter,
} from 'lucide-react';

const ManageJobs = ({ onDataChange }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const [applications, setApplications] = useState({});
  const [respondingTo, setRespondingTo] = useState(null);
  const [closingJob, setClosingJob] = useState(null);
  const [confirmClose, setConfirmClose] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await EmployerService.getJobs();
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      const response = await EmployerService.getApplications(jobId);
      setApplications((prev) => ({ ...prev, [jobId]: response.data.applications || [] }));
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleToggleJob = (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
    } else {
      setExpandedJob(jobId);
      fetchApplications(jobId);
    }
  };

  const handleRespond = async (applicationId, jobId, status) => {
    try {
      setRespondingTo(applicationId);
      await EmployerService.respondToApplication(applicationId, status);
      const response = await EmployerService.getApplications(jobId);
      setApplications((prev) => ({ ...prev, [jobId]: response.data.applications || [] }));
      onDataChange?.();
    } catch (error) {
      alert('Failed to respond to application');
      console.error('Error responding to application:', error);
    } finally {
      setRespondingTo(null);
    }
  };

  const handleCloseJob = async (jobId) => {
    try {
      setClosingJob(jobId);
      await EmployerService.closeJob(jobId);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'closed' } : j)));
      setConfirmClose(null);
      onDataChange?.();
    } catch (error) {
      alert('Failed to close job');
      console.error('Error closing job:', error);
    } finally {
      setClosingJob(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: 'badge--warning',
      accepted: 'badge--success',
      rejected: 'badge--danger',
    };
    return map[status] || 'badge--neutral';
  };

  const jobStatusBadge = (status) => {
    if (status === 'open') return 'badge--success';
    if (status === 'closed') return 'badge--neutral';
    return 'badge--info';
  };

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

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
      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <Filter size={16} style={{ color: 'var(--gray-400)' }} />
        {['all', 'open', 'closed'].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {' '}({jobs.filter(j => f === 'all' || j.status === f).length})
          </button>
        ))}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No jobs {filter !== 'all' ? `with status "${filter}"` : 'posted yet'}</div>
          <div className="empty-state-text">Post your first job to start receiving applications</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filteredJobs.map((job) => {
            const isExpanded = expandedJob === job.id;
            const isClosed = job.status === 'closed';

            return (
              <div
                key={job.id}
                style={{
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  background: 'white',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all var(--transition-base)',
                }}
              >
                {/* Job Header */}
                <div style={{ padding: 'var(--space-5) var(--space-6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                        <h3 style={{ fontWeight: 700, color: 'var(--gray-900)', margin: 0, fontSize: 'var(--text-lg)' }}>
                          {job.title}
                        </h3>
                        <span className={`badge ${jobStatusBadge(job.status)}`}>{job.status}</span>
                      </div>
                      <p style={{
                        color: 'var(--gray-500)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-3)',
                        lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {job.description}
                      </p>

                      <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap', fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={14} /> {job.location_name}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Briefcase size={14} /> {job.min_experience || 'Any'} exp
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={14} /> {job.working_hours} hrs/day
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CalendarDays size={14} /> {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {job.required_skills?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                          {job.required_skills.map((skill) => (
                            <span key={skill} className="skill-chip">{skill}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Wage + Actions */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--green-600)', margin: '0 0 var(--space-1)' }}>
                        ₹{job.wages_per_hour}/hr
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                        {!isClosed && (
                          confirmClose === job.id ? (
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                              <button
                                className="btn-dash btn-dash--danger btn-dash--sm"
                                onClick={() => handleCloseJob(job.id)}
                                disabled={closingJob === job.id}
                              >
                                {closingJob === job.id ? 'Closing…' : 'Confirm'}
                              </button>
                              <button
                                className="btn-dash btn-dash--secondary btn-dash--sm"
                                onClick={() => setConfirmClose(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn-dash btn-dash--secondary btn-dash--sm"
                              onClick={(e) => { e.stopPropagation(); setConfirmClose(job.id); }}
                              style={{ color: 'var(--red-500)', borderColor: 'var(--red-200)' }}
                            >
                              <Lock size={13} /> Close Job
                            </button>
                          )
                        )}
                        <button
                          className="btn-dash btn-dash--secondary btn-dash--sm"
                          onClick={() => handleToggleJob(job.id)}
                          style={isExpanded ? { background: 'var(--navy-50)', borderColor: 'var(--navy-200)' } : {}}
                        >
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          {isExpanded ? 'Hide' : 'Applications'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applications Panel */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid var(--gray-100)',
                    background: 'var(--gray-50)',
                    padding: 'var(--space-5) var(--space-6)',
                    animation: 'fadeIn 0.2s ease-out',
                  }}>
                    {!applications[job.id] ? (
                      <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--gray-500)' }}>
                        Loading applications…
                      </div>
                    ) : applications[job.id].length === 0 ? (
                      <div className="empty-state" style={{ padding: 'var(--space-6) 0' }}>
                        <div className="empty-state-icon">📨</div>
                        <div className="empty-state-title">No applications yet</div>
                        <div className="empty-state-text">Applications for this job will appear here</div>
                      </div>
                    ) : (
                      <>
                        <h4 style={{
                          fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 var(--space-4)',
                          fontSize: 'var(--text-base)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                        }}>
                          Applications
                          <span className="badge badge--info">{applications[job.id].length}</span>
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                          {applications[job.id].map((app) => (
                            <div
                              key={app.id}
                              style={{
                                background: 'white',
                                border: '1px solid var(--gray-200)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--space-4) var(--space-5)',
                                boxShadow: 'var(--shadow-xs)',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                  <div className="avatar avatar--md">{app.name?.charAt(0)?.toUpperCase() || '?'}</div>
                                  <div>
                                    <p style={{ fontWeight: 700, color: 'var(--gray-900)', margin: 0, fontSize: 'var(--text-sm)' }}>
                                      {app.name}
                                    </p>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Phone size={11} /> {app.mobile_number}
                                    </p>
                                  </div>
                                </div>
                                <span className={`badge ${statusBadge(app.status)}`}>{app.status}</span>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                                {[
                                  { icon: Star, label: 'Rating', value: app.rating || '—' },
                                  { icon: Briefcase, label: 'Experience', value: app.experience || 'Any' },
                                  { icon: DollarSign, label: 'Expected', value: `₹${app.wages_per_hour}/hr` },
                                  { icon: CalendarDays, label: 'Applied', value: new Date(app.applied_at).toLocaleDateString() },
                                ].map((item) => (
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

                              {app.skills?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                  {app.skills.map((s) => (
                                    <span key={s} className="skill-chip" style={{ fontSize: 11 }}>{s}</span>
                                  ))}
                                </div>
                              )}

                              {app.status === 'pending' && (
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                  <button
                                    className="btn-dash btn-dash--success btn-dash--sm"
                                    style={{ flex: 1 }}
                                    onClick={() => handleRespond(app.id, job.id, 'accepted')}
                                    disabled={respondingTo === app.id}
                                  >
                                    <UserCheck size={14} /> Accept
                                  </button>
                                  <button
                                    className="btn-dash btn-dash--danger btn-dash--sm"
                                    style={{ flex: 1 }}
                                    onClick={() => handleRespond(app.id, job.id, 'rejected')}
                                    disabled={respondingTo === app.id}
                                  >
                                    <UserX size={14} /> Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
