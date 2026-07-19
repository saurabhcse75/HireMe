import React, { useState, useEffect } from 'react';
import { EmployerService } from '../../services/api';
import { showSuccess, showError } from '../../utils/toastNotification';
import StarRating from '../common/StarRating';
import {
  MapPin,
  Star,
  DollarSign,
  Briefcase,
  Clock,
  Phone,
  Search,
  Send,
  X,
  UserCheck,
  CheckCircle,
  Shield,
  Award,
  Zap,
} from 'lucide-react';

const NearbyWorkers = ({ profile }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(5);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showReviewTab, setShowReviewTab] = useState(false);
  const [review, setReview] = useState({ rating: 5, feedback: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hiredWorkers, setHiredWorkers] = useState(new Set());

  useEffect(() => {
    if (profile?.latitude && profile?.longitude) {
      fetchNearbyWorkers();
      fetchHiredWorkers();
      fetchSentRequests();
    }
  }, [profile?.latitude, profile?.longitude, distance]);

  const fetchSentRequests = async () => {
    try {
      const response = await EmployerService.getSentHiringRequests();
      setSentRequests(new Set(response.data.workerIds));
    } catch (error) {
      console.error('Error fetching sent hiring requests:', error);
    }
  };

  const fetchHiredWorkers = async () => {
    try {
      const response = await EmployerService.getHiredWorkers();
      const hiredIds = new Set((response.data.workers || []).map((w) => w.id));
      setHiredWorkers(hiredIds);
    } catch (error) {
      console.error('Error fetching hired workers:', error);
    }
  };

  const fetchNearbyWorkers = async () => {
    if (!profile?.latitude || !profile?.longitude) {
      setWorkers([]);
      return;
    }
    try {
      setLoading(true);
      const response = await EmployerService.getNearbyWorkers(profile.latitude, profile.longitude, distance);
      setWorkers(response.data.workers);
    } catch (error) {
      console.error('Error fetching nearby workers:', error);
      showError('Failed to fetch nearby workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (workerId) => {
    try {
      setSendingRequest(true);
      await EmployerService.sendHiringRequest(workerId);
      setSentRequests(new Set(sentRequests).add(workerId));
      showSuccess('Hiring request sent successfully!');
      setSelectedWorker(null);
    } catch (error) {
      if (error.response?.status === 409) {
        showError('Hiring request already sent to this worker');
      } else {
        showError('Failed to send hiring request');
      }
    } finally {
      setSendingRequest(false);
    }
  };

  const openWorkerModal = (worker) => {
    setSelectedWorker(worker);
    setShowReviewTab(false);
    setReview({ rating: 5, feedback: '' });
  };

  const handleSubmitReview = async () => {
    const rating = parseInt(review.rating);
    if (!rating || rating < 1 || rating > 5) {
      showError('Please select a rating between 1 and 5');
      return;
    }
    try {
      setSubmittingReview(true);
      await EmployerService.rateWorker(selectedWorker.id, rating, review.feedback);
      showSuccess('Review submitted successfully!');
      setShowReviewTab(false);
      setReview({ rating: 5, feedback: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
      showError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getSkillsArray = (skills) => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string' && skills.trim()) return skills.split(',').map(s => s.trim());
    return [];
  };

  if (!profile?.latitude) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><MapPin size={48} style={{ color: 'var(--gray-300)' }} /></div>
        <div className="empty-state-title">Location not set</div>
        <div className="empty-state-text">Please update your location to find nearby workers</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      {/* Search Bar */}
      <div style={{
        display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end',
        marginBottom: 'var(--space-6)',
        padding: 'var(--space-4)',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--gray-100)',
      }}>
        <div style={{ flex: 1 }}>
          <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>Distance (km)</label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="form-input"
            min="1"
            style={{ padding: '10px var(--space-4)' }}
          />
        </div>
        <button
          className="btn-dash btn-dash--primary"
          onClick={fetchNearbyWorkers}
          disabled={loading}
          style={{ height: 44 }}
        >
          <Search size={16} />
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Workers Grid */}
      {workers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No workers found</div>
          <div className="empty-state-text">Try increasing the distance to find more workers</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
          {workers.map((worker) => {
            const skills = getSkillsArray(worker.skills);
            const isTopRated = parseFloat(worker.rating) >= 4;
            return (
              <div
                key={worker.id}
                style={{
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  background: 'white',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all var(--transition-base)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Header */}
                <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div className="avatar avatar--lg">{worker.name?.charAt(0)?.toUpperCase() || '?'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontWeight: 700, color: 'var(--gray-900)', margin: 0, fontSize: 'var(--text-base)' }}>
                        {worker.name}
                      </h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', margin: '2px 0 var(--space-2)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Phone size={11} /> {worker.mobile_number}
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {worker.status === 'open' && (
                          <span className="badge badge--success"><Zap size={10} /> Available</span>
                        )}
                        {isTopRated && (
                          <span className="badge badge--warning"><Award size={10} /> Top Rated</span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                        <Star size={16} style={{ color: '#facc15', fill: '#facc15' }} />
                        <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--gray-800)' }}>
                          {parseFloat(worker.rating) > 0 ? parseFloat(worker.rating).toFixed(1) : '—'}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: 0 }}>
                        {worker.total_ratings} reviews
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0 }}>
                  {[
                    { icon: MapPin, label: 'Distance', value: `${worker.distance} km`, color: 'var(--blue-600)' },
                    { icon: DollarSign, label: 'Wages', value: `₹${worker.wages_per_hour}/hr`, color: 'var(--green-600)' },
                    { icon: Briefcase, label: 'Experience', value: worker.experience || 'Any', color: 'var(--purple-600)' },
                    { icon: Clock, label: 'Availability', value: worker.availability_time || '—', color: 'var(--amber-600)' },
                  ].map((s, i) => (
                    <div key={s.label} style={{
                      padding: 'var(--space-3) var(--space-4)',
                      borderBottom: i < 2 ? '1px solid var(--gray-100)' : 'none',
                      borderRight: i % 2 === 0 ? '1px solid var(--gray-100)' : 'none',
                    }}>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <s.icon size={11} style={{ color: s.color }} /> {s.label}
                      </p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-700)', margin: 0, textTransform: 'capitalize' }}>
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
                      {skills.length > 4 && (
                        <span className="badge badge--neutral">+{skills.length - 4}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div style={{ padding: 'var(--space-3) var(--space-4) var(--space-4)' }}>
                  <button
                    className={`btn-dash btn-dash--full ${sentRequests.has(worker.id) ? 'btn-dash--secondary' : 'btn-dash--primary'}`}
                    onClick={() => openWorkerModal(worker)}
                    disabled={sentRequests.has(worker.id)}
                  >
                    {sentRequests.has(worker.id) ? (
                      <><CheckCircle size={16} /> Request Sent</>
                    ) : (
                      <><UserCheck size={16} /> View & Hire</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <div className="modal-overlay" onClick={() => setSelectedWorker(null)}>
          <div className="modal-container modal-container--lg" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header modal-header--gradient">
              <button className="modal-close" onClick={() => setSelectedWorker(null)}><X size={16} /></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div className="avatar avatar--xl" style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.2)' }}>
                  {selectedWorker.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: '0 0 4px' }}>{selectedWorker.name}</h2>
                  <p style={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} /> {selectedWorker.mobile_number}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    <Star size={22} style={{ color: '#facc15', fill: '#facc15' }} />
                    <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                      {parseFloat(selectedWorker.rating) > 0 ? parseFloat(selectedWorker.rating).toFixed(1) : '—'}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', opacity: 0.7, margin: 0 }}>
                    ({selectedWorker.total_ratings} reviews)
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-100)', background: '#fafafa', padding: '0 var(--space-6)' }}>
              <button
                onClick={() => setShowReviewTab(false)}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  fontWeight: 600, fontSize: 'var(--text-sm)',
                  border: 'none', background: 'none', cursor: 'pointer',
                  borderBottom: !showReviewTab ? '2px solid var(--indigo-500)' : '2px solid transparent',
                  color: !showReviewTab ? 'var(--indigo-600)' : 'var(--gray-500)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Profile
              </button>
              {hiredWorkers.has(selectedWorker.id) && (
                <button
                  onClick={() => setShowReviewTab(true)}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    fontWeight: 600, fontSize: 'var(--text-sm)',
                    border: 'none', background: 'none', cursor: 'pointer',
                    borderBottom: showReviewTab ? '2px solid var(--indigo-500)' : '2px solid transparent',
                    color: showReviewTab ? 'var(--indigo-600)' : 'var(--gray-500)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <Star size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} /> Review
                </button>
              )}
            </div>

            {/* Body */}
            <div className="modal-body">
              {!showReviewTab ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                    {/* Distance Card */}
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
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', margin: '0 0 4px' }}>Distance</p>
                        <p style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
                          {parseFloat(selectedWorker.distance).toFixed(2)} Km
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
                        <MapPin size={20} />
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
                          ₹{selectedWorker.wages_per_hour}/hr
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

                    {/* Status Card */}
                    <div style={{
                      background: selectedWorker.status === 'open' 
                        ? 'linear-gradient(135deg, #f5f3ff, #ede9fe)' 
                        : 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                      padding: 'var(--space-5)',
                      borderRadius: 'var(--radius-xl)',
                      border: selectedWorker.status === 'open' ? '1px solid #ddd6fe' : '1px solid #fecaca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-xs)',
                    }}>
                      <div>
                        <p style={{ 
                          fontSize: 11, fontWeight: 700, 
                          color: selectedWorker.status === 'open' ? '#7c3aed' : '#dc2626', 
                          textTransform: 'uppercase', margin: '0 0 4px' 
                        }}>Status</p>
                        <p style={{ 
                          fontSize: 'var(--text-lg)', fontWeight: 800, 
                          color: selectedWorker.status === 'open' ? '#4c1d95' : '#7f1d1d', 
                          margin: 0, textTransform: 'capitalize' 
                        }}>
                          {selectedWorker.status === 'open' ? 'Available' : 'Unavailable'}
                        </p>
                      </div>
                      <div style={{
                        width: 42, height: 42,
                        borderRadius: '50%',
                        background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: selectedWorker.status === 'open'
                          ? '0 4px 6px -1px rgba(124, 58, 237, 0.1)'
                          : '0 4px 6px -1px rgba(220, 38, 38, 0.1)',
                        color: selectedWorker.status === 'open' ? '#7c3aed' : '#dc2626',
                      }}>
                        <UserCheck size={20} />
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
                          {selectedWorker.experience || 'Any'} Yrs
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
                  </div>

                  <div style={{ 
                    background: 'white', 
                    padding: 'var(--space-5)', 
                    borderRadius: 'var(--radius-xl)', 
                    border: '1px solid var(--gray-200)', 
                    marginBottom: 'var(--space-4)',
                    boxShadow: 'var(--shadow-xs)' 
                  }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={16} style={{ color: 'var(--indigo-500)' }} /> Working Hours / Availability
                    </p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', margin: 0, fontWeight: 500, background: 'var(--navy-50)', padding: '8px 12px', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
                      {selectedWorker.availability_time || 'Not specified'}
                    </p>
                  </div>

                  <div style={{ 
                    background: 'white', 
                    padding: 'var(--space-5)', 
                    borderRadius: 'var(--radius-xl)', 
                    border: '1px solid var(--gray-200)', 
                    marginBottom: 'var(--space-4)',
                    boxShadow: 'var(--shadow-xs)' 
                  }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Briefcase size={16} style={{ color: 'var(--indigo-500)' }} /> Skills & Expertises
                    </p>
                    {getSkillsArray(selectedWorker.skills).length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {getSkillsArray(selectedWorker.skills).map(skill => (
                          <span key={skill} className="skill-chip" style={{ fontSize: '11px', padding: '6px 12px', borderRadius: 'var(--radius-full)' }}>{skill}</span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)', fontStyle: 'italic', margin: 0 }}>No skills listed</p>
                    )}
                  </div>

                  {hiredWorkers.has(selectedWorker.id) ? (
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', 
                      padding: 'var(--space-4) var(--space-5)', 
                      borderRadius: 'var(--radius-lg)', 
                      border: '1px solid #bbf7d0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--space-3)' 
                    }}>
                      <CheckCircle size={18} style={{ color: '#16a34a' }} />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#14532d' }}>This worker has been hired by you</span>
                    </div>
                  ) : (
                    <div style={{ 
                      background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', 
                      padding: 'var(--space-4) var(--space-5)', 
                      borderRadius: 'var(--radius-lg)', 
                      border: '1px solid #bfdbfe', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--space-3)' 
                    }}>
                      <Shield size={18} style={{ color: '#2563eb' }} />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#1e3a8a' }}>You haven't hired this worker yet</span>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <div style={{ background: 'var(--blue-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--blue-100)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Star size={16} style={{ color: 'var(--blue-600)' }} />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--blue-700)' }}>
                      Share your experience working with {selectedWorker.name}
                    </span>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
                    <label className="form-label" style={{ textAlign: 'center' }}>Rating (1-5 stars)</label>
                    <StarRating value={review.rating} onChange={(val) => setReview({ ...review, rating: val })} size="lg" />
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: 'var(--space-3)' }}>
                      Selected: <strong style={{ color: 'var(--gray-800)' }}>{review.rating}</strong> stars
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Feedback (Optional)</label>
                    <textarea
                      value={review.feedback}
                      onChange={(e) => setReview({ ...review, feedback: e.target.value.slice(0, 500) })}
                      placeholder="Share your experience working with this worker..."
                      className="form-textarea"
                      rows={4}
                      disabled={submittingReview}
                    />
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', textAlign: 'right', marginTop: 'var(--space-1)' }}>
                      {review.feedback.length}/500 characters
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn-dash btn-dash--secondary" style={{ flex: 1 }} onClick={() => setSelectedWorker(null)}>
                Close
              </button>
              {!showReviewTab && (
                <button
                  className={`btn-dash ${sentRequests.has(selectedWorker.id) ? 'btn-dash--secondary' : 'btn-dash--success'}`}
                  style={{ flex: 1 }}
                  onClick={() => handleSendRequest(selectedWorker.id)}
                  disabled={sendingRequest || sentRequests.has(selectedWorker.id)}
                >
                  {sendingRequest ? 'Sending...' : sentRequests.has(selectedWorker.id) ? (
                    <><CheckCircle size={16} /> Request Sent</>
                  ) : (
                    <><Send size={16} /> Send Hire Request</>
                  )}
                </button>
              )}
              {showReviewTab && hiredWorkers.has(selectedWorker.id) && (
                <button
                  className="btn-dash btn-dash--primary"
                  style={{ flex: 1 }}
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyWorkers;
