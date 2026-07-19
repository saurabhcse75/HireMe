import React, { useEffect, useState } from 'react';
import { EmployerService } from '../../services/api';
import { showSuccess, showError } from '../../utils/toastNotification';
import StarRating from '../common/StarRating';
import {
  Star,
  Phone,
  CalendarDays,
  DollarSign,
  Briefcase,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
  Clock,
  Award,
} from 'lucide-react';

const HiredWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [ratingModal, setRatingModal] = useState(false);
  const [ratingWorkerId, setRatingWorkerId] = useState(null);
  const [ratingAssignmentId, setRatingAssignmentId] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [subTab, setSubTab] = useState('ongoing');

  useEffect(() => {
    fetchHired();
  }, []);

  const fetchHired = async () => {
    try {
      setLoading(true);
      const res = await EmployerService.getHiredWorkers();
      setWorkers(res.data.workers || []);
    } catch (err) {
      console.error('Error fetching hired workers', err);
      showError('Failed to fetch hired workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (hireId, action) => {
    if (!confirm(`Are you sure you want to ${action} this hire?`)) return;
    try {
      setActionLoading(true);
      await EmployerService.updateHireStatus(hireId, action);
      showSuccess(`Hire ${action}d successfully`);
      fetchHired();
    } catch (err) {
      console.error('Error updating hire status', err);
      showError('Failed to update hire status');
    } finally {
      setActionLoading(false);
    }
  };

  const submitRating = async () => {
    if (!ratingWorkerId) return;
    const rating = parseInt(ratingValue);
    if (!rating || rating < 1 || rating > 5) {
      showError('Please provide a rating between 1 and 5');
      return;
    }
    try {
      setActionLoading(true);
      await EmployerService.rateWorker(ratingWorkerId, rating, ratingFeedback, ratingAssignmentId);
      setRatingSuccess(true);
      setTimeout(() => {
        setRatingModal(false);
        setRatingWorkerId(null);
        setRatingAssignmentId(null);
        setRatingValue(5);
        setRatingFeedback('');
        setRatingSuccess(false);
        fetchHired();
      }, 2000);
    } catch (err) {
      console.error('Error submitting rating', err);
      showError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setActionLoading(false);
    }
  };

  const hireAgain = async (workerId) => {
    if (!workerId) return;
    try {
      setActionLoading(true);
      const result = await EmployerService.sendHiringRequest(workerId);
      showSuccess(result.data.message || 'Worker hired successfully');
      fetchHired();
    } catch (err) {
      console.error('Error sending hiring request', err);
      showError(err.response?.data?.message || 'Failed to send hiring request');
    } finally {
      setActionLoading(false);
    }
  };

  const getSkillsArray = (skills) => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string' && skills.trim()) return skills.split(',').map(s => s.trim());
    return [];
  };

  const filteredWorkers = workers.filter((w) => {
    if (subTab === 'ongoing') {
      return w.status === 'active';
    } else {
      return w.status === 'completed' || w.status === 'cancelled';
    }
  });

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-8)' }}>
        {[1, 2].map(i => (
          <div key={i} className="skeleton skeleton--card" style={{ marginBottom: 'var(--space-4)' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      {/* Filter Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 'var(--space-6)' }}>
        <button
          onClick={() => setSubTab('ongoing')}
          className={`filter-tab ${subTab === 'ongoing' ? 'filter-tab--active' : ''}`}
        >
          🔄 Ongoing ({workers.filter(w => w.status === 'active').length})
        </button>
        <button
          onClick={() => setSubTab('completed')}
          className={`filter-tab ${subTab === 'completed' ? 'filter-tab--active' : ''}`}
        >
          ✅ Completed & Cancelled ({workers.filter(w => w.status === 'completed' || w.status === 'cancelled').length})
        </button>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👷</div>
          <div className="empty-state-title">
            {subTab === 'ongoing' ? 'No ongoing engagements' : 'No completed engagements'}
          </div>
          <div className="empty-state-text">
            {subTab === 'ongoing' 
              ? 'You do not have any active workers right now. Go to "Nearby Workers" to find and hire workers.' 
              : 'All your past finished engagements will be listed here.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-5)' }}>
          {filteredWorkers.map((w) => {
            const skills = getSkillsArray(w.skills);
            return (
              <div
                key={w.hire_id}
                style={{
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  background: 'white',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Header */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--navy-900), var(--navy-700))',
                  padding: 'var(--space-5)',
                  color: 'white',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div className="avatar avatar--md" style={{ boxShadow: '0 0 0 2px rgba(255,255,255,0.2)' }}>
                        {w.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 700, margin: 0, fontSize: 'var(--text-base)' }}>{w.name}</h3>
                        <p style={{ opacity: 0.75, fontSize: 'var(--text-xs)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Phone size={11} /> {w.mobile_number}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={16} style={{ color: '#facc15', fill: '#facc15' }} />
                      <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }}>
                        {w.rating ? parseFloat(w.rating).toFixed(1) : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0 }}>
                  {[
                    { icon: CalendarDays, label: 'Hired On', value: new Date(w.hired_at).toLocaleDateString(), bg: 'var(--blue-50)', color: 'var(--blue-600)' },
                    { icon: DollarSign, label: 'Wages/hr', value: `₹${w.wages_per_hour}`, bg: 'var(--green-50)', color: 'var(--green-600)' },
                    { icon: Briefcase, label: 'Experience', value: w.experience || 'Not specified', bg: 'var(--purple-50)', color: 'var(--purple-600)' },
                    { icon: Clock, label: 'Status', value: w.status === 'completed' ? '✅ Completed' : w.status === 'cancelled' ? '❌ Cancelled' : '🔄 Active', bg: w.status === 'completed' ? 'var(--green-50)' : w.status === 'cancelled' ? 'var(--red-50)' : 'var(--amber-50)', color: w.status === 'completed' ? 'var(--green-600)' : w.status === 'cancelled' ? 'var(--red-600)' : 'var(--amber-600)' },
                  ].map((s, i) => (
                    <div key={s.label} style={{
                      padding: 'var(--space-3) var(--space-4)',
                      background: s.bg,
                      borderBottom: i < 2 ? '1px solid var(--gray-100)' : 'none',
                      borderRight: i % 2 === 0 ? '1px solid var(--gray-100)' : 'none',
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: 'uppercase', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <s.icon size={11} /> {s.label}
                      </p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gray-800)', margin: 0, textTransform: 'capitalize' }}>
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                  <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--gray-100)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                      {skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="skill-chip" style={{ fontSize: 11 }}>{skill}</span>
                      ))}
                      {skills.length > 4 && <span className="badge badge--neutral">+{skills.length - 4}</span>}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ padding: 'var(--space-3) var(--space-4) var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn-dash btn-dash--secondary btn-dash--sm" style={{ flex: 1 }} onClick={() => setSelected(w)}>
                    <Eye size={14} /> View
                  </button>
                  {w.status === 'active' ? (
                    <>
                      <button
                        className="btn-dash btn-dash--success btn-dash--sm"
                        style={{ flex: 1 }}
                        onClick={() => handleUpdate(w.hire_id, 'complete')}
                        disabled={actionLoading}
                      >
                        <CheckCircle size={14} /> Complete
                      </button>
                      <button
                        className="btn-dash btn-dash--danger btn-dash--sm"
                        style={{ flex: 1 }}
                        onClick={() => handleUpdate(w.hire_id, 'cancel')}
                        disabled={actionLoading}
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    </>
                  ) : w.is_rated ? (
                    <button
                      className="btn-dash btn-dash--secondary btn-dash--sm"
                      style={{ flex: 1, cursor: 'not-allowed', color: 'var(--gray-500)', background: 'var(--gray-100)', borderColor: 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      disabled
                    >
                      <CheckCircle size={14} style={{ color: 'var(--green-500)' }} /> Rated
                    </button>
                  ) : (
                    <button
                      className="btn-dash btn-dash--warning btn-dash--sm"
                      style={{ flex: 1 }}
                      onClick={() => { setRatingWorkerId(w.worker_id); setRatingAssignmentId(w.hire_id); setRatingModal(true); setRatingSuccess(false); }}
                    >
                      <Star size={14} /> Rate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-container modal-container--lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header modal-header--gradient">
              <button className="modal-close" onClick={() => setSelected(null)}><X size={16} /></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div className="avatar avatar--xl" style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.2)' }}>
                  {selected.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: '0 0 4px' }}>{selected.name}</h2>
                  <p style={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} /> {selected.mobile_number}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    <Star size={22} style={{ color: '#facc15', fill: '#facc15' }} />
                    <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                      {selected.rating ? parseFloat(selected.rating).toFixed(1) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                {/* Hired On Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #f0f4ff, #e0ebff)',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid #d0dffe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-xs)',
                }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', margin: '0 0 4px' }}>Hired On</p>
                    <p style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
                      {new Date(selected.hired_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{
                    width: 42, height: 42,
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                  }}>
                    <CalendarDays size={20} />
                  </div>
                </div>

                {/* Wages Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-xs)',
                }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', margin: '0 0 4px' }}>Wages/Hour</p>
                    <p style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#14532d', margin: 0 }}>
                      ₹{selected.wages_per_hour}/hr
                    </p>
                  </div>
                  <div style={{
                    width: 42, height: 42,
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.1)',
                    color: '#16a34a',
                  }}>
                    <DollarSign size={20} />
                  </div>
                </div>

                {/* Experience Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-xs)',
                }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', margin: '0 0 4px' }}>Experience</p>
                    <p style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#78350f', margin: 0 }}>
                      {selected.experience || 'Any'} Yrs
                    </p>
                  </div>
                  <div style={{
                    width: 42, height: 42,
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.1)',
                    color: '#d97706',
                  }}>
                    <Award size={20} />
                  </div>
                </div>

                {/* Status Card */}
                <div style={{
                  background: selected.status === 'completed' 
                    ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' 
                    : selected.status === 'cancelled'
                    ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                    : 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-xl)',
                  border: selected.status === 'completed' 
                    ? '1px solid #bbf7d0' 
                    : selected.status === 'cancelled'
                    ? '1px solid #fca5a5'
                    : '1px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-xs)',
                }}>
                  <div>
                    <p style={{ 
                      fontSize: 11, fontWeight: 700, 
                      color: selected.status === 'completed' 
                        ? '#16a34a' 
                        : selected.status === 'cancelled'
                        ? '#dc2626'
                        : '#d97706', 
                      textTransform: 'uppercase', margin: '0 0 4px' 
                    }}>Status</p>
                    <p style={{ 
                      fontSize: 'var(--text-lg)', fontWeight: 800, 
                      color: selected.status === 'completed' 
                        ? '#14532d' 
                        : selected.status === 'cancelled'
                        ? '#991b1b'
                        : '#78350f', 
                      margin: 0, textTransform: 'capitalize' 
                    }}>
                      {selected.status === 'completed' ? 'Completed' : selected.status === 'cancelled' ? 'Cancelled' : 'Active'}
                    </p>
                  </div>
                  <div style={{
                    width: 42, height: 42,
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: selected.status === 'completed'
                      ? '0 4px 6px -1px rgba(22, 163, 74, 0.1)'
                      : selected.status === 'cancelled'
                      ? '0 4px 6px -1px rgba(220, 38, 38, 0.1)'
                      : '0 4px 6px -1px rgba(217, 119, 6, 0.1)',
                    color: selected.status === 'completed' 
                      ? '#16a34a' 
                      : selected.status === 'cancelled'
                      ? '#dc2626'
                      : '#d97706',
                  }}>
                    {selected.status === 'completed' ? (
                      <CheckCircle size={20} />
                    ) : selected.status === 'cancelled' ? (
                      <XCircle size={20} />
                    ) : (
                      <Clock size={20} />
                    )}
                  </div>
                </div>
              </div>

              {getSkillsArray(selected.skills).length > 0 && (
                <div style={{ 
                  background: 'white', 
                  padding: 'var(--space-5)', 
                  borderRadius: 'var(--radius-xl)', 
                  border: '1px solid var(--gray-200)',
                  boxShadow: 'var(--shadow-xs)' 
                }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Briefcase size={16} style={{ color: 'var(--indigo-500)' }} /> Skills & Expertises
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {getSkillsArray(selected.skills).map(skill => (
                      <span key={skill} className="skill-chip" style={{ fontSize: '11px', padding: '6px 12px', borderRadius: 'var(--radius-full)' }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-dash btn-dash--secondary" style={{ flex: 1 }} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="modal-overlay" onClick={() => !actionLoading && setRatingModal(false)}>
          <div className="modal-container modal-container--md" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{
              background: 'linear-gradient(135deg, var(--indigo-600), var(--purple-600))',
              color: 'white',
              textAlign: 'center',
            }}>
              <button className="modal-close" onClick={() => setRatingModal(false)}><X size={16} /></button>
              <Award size={32} style={{ margin: '0 auto var(--space-3)', opacity: 0.9 }} />
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: '0 0 4px' }}>Rate This Worker</h3>
              <p style={{ opacity: 0.8, fontSize: 'var(--text-sm)', margin: 0 }}>Share your experience and help other employers</p>
            </div>

            <div className="modal-body" style={{ padding: 'var(--space-6) var(--space-8)' }}>
              {ratingSuccess ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
                  <div style={{
                    width: 64, height: 64,
                    borderRadius: '50%',
                    background: 'var(--green-50)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto var(--space-4)',
                    animation: 'bounceIn 0.6s ease-out',
                  }}>
                    <CheckCircle size={32} style={{ color: 'var(--green-500)' }} />
                  </div>
                  <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 'var(--space-2)' }}>
                    Rating Submitted! 🎉
                  </h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Thank you for your feedback</p>
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <p className="form-label" style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>How was your experience?</p>
                    <StarRating value={ratingValue} onChange={setRatingValue} size="lg" />
                    <div style={{
                      background: 'var(--amber-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--amber-100)', marginTop: 'var(--space-4)',
                    }}>
                      <p style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--amber-600)', margin: 0 }}>
                        {ratingValue} out of 5 stars
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-2)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'].map(label => (
                      <span key={label} style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)' }}>{label}</span>
                    ))}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Feedback (Optional)</label>
                    <textarea
                      value={ratingFeedback}
                      onChange={(e) => setRatingFeedback(e.target.value.slice(0, 500))}
                      placeholder="Share details about your experience working with this worker..."
                      className="form-textarea"
                      rows={4}
                      disabled={actionLoading}
                    />
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', textAlign: 'right', marginTop: 'var(--space-1)' }}>
                      {ratingFeedback.length}/500
                    </p>
                  </div>
                </>
              )}
            </div>

            {!ratingSuccess && (
              <div className="modal-footer">
                <button
                  className="btn-dash btn-dash--secondary"
                  style={{ flex: 1 }}
                  onClick={() => setRatingModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn-dash btn-dash--primary"
                  style={{ flex: 1 }}
                  onClick={submitRating}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Submit Rating'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HiredWorkers;
