import React, { useState, useEffect } from 'react';
import { WorkerService } from '../../services/api';
import {
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Search,
  Filter,
  CheckCircle,
  Send,
  Wrench,
  CalendarDays,
} from 'lucide-react';

const NearbyJobs = ({ profile }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    distance: 5,
    wages: 0,
    hours: 0,
    skills: '',
    experience: '',
  });
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchNearbyJobs();
  }, []);

  const fetchNearbyJobs = async () => {
    if (!profile?.current_latitude || !profile?.current_longitude) {
      return;
    }
    try {
      setLoading(true);
      const response = await WorkerService.getNearbyJobs(
        profile.current_latitude,
        profile.current_longitude,
        {
          distance: filters.distance,
          wages: filters.wages || undefined,
          hours: filters.hours || undefined,
          skills: filters.skills || undefined,
          experience: filters.experience || undefined,
        }
      );
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error fetching nearby jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyJob = async (jobId) => {
    try {
      await WorkerService.applyForJob(jobId);
      setAppliedJobs(new Set(appliedJobs).add(jobId));
      setSuccessMessage('Job application submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      if (error.response?.status === 409) {
        alert('You have already applied for this job');
      } else {
        alert('Failed to apply for job');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (!profile?.current_latitude) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><MapPin size={48} style={{ color: 'var(--gray-300)' }} /></div>
        <div className="empty-state-title">Location not set</div>
        <div className="empty-state-text">Please update your location to see nearby jobs</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      {/* Success Message */}
      {successMessage && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--green-50)', border: '1px solid var(--green-100)',
          borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-5)',
          color: 'var(--green-600)', fontSize: 'var(--text-sm)', fontWeight: 600,
          animation: 'fadeIn 0.3s ease-out',
        }}>
          <CheckCircle size={16} /> {successMessage}
        </div>
      )}

      {/* Filters */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'var(--space-3)', marginBottom: 'var(--space-6)',
        padding: 'var(--space-4)',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--gray-100)',
      }}>
        <div>
          <label className="form-label" style={{ fontSize: 12, marginBottom: 'var(--space-1)' }}>
            <MapPin size={11} style={{ verticalAlign: '-1px' }} /> Distance (km)
          </label>
          <input type="number" name="distance" value={filters.distance} onChange={handleFilterChange}
            className="form-input" min="1" style={{ padding: '8px 12px' }} />
        </div>
        <div>
          <label className="form-label" style={{ fontSize: 12, marginBottom: 'var(--space-1)' }}>
            <DollarSign size={11} style={{ verticalAlign: '-1px' }} /> Min Wages/hr
          </label>
          <input type="number" name="wages" value={filters.wages} onChange={handleFilterChange}
            className="form-input" min="0" placeholder="Any" style={{ padding: '8px 12px' }} />
        </div>
        <div>
          <label className="form-label" style={{ fontSize: 12, marginBottom: 'var(--space-1)' }}>
            <Clock size={11} style={{ verticalAlign: '-1px' }} /> Max Hours
          </label>
          <input type="number" name="hours" value={filters.hours} onChange={handleFilterChange}
            className="form-input" min="0" placeholder="Any" style={{ padding: '8px 12px' }} />
        </div>
        <div>
          <label className="form-label" style={{ fontSize: 12, marginBottom: 'var(--space-1)' }}>
            <Briefcase size={11} style={{ verticalAlign: '-1px' }} /> Experience
          </label>
          <select name="experience" value={filters.experience} onChange={handleFilterChange}
            className="form-select" style={{ padding: '8px 12px' }}>
            <option value="">Any</option>
            <option value="0-1">0-1 years</option>
            <option value="1-3">1-3 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn-dash btn-dash--primary btn-dash--full" onClick={fetchNearbyJobs}
            disabled={loading} style={{ height: 38 }}>
            <Search size={15} /> {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No jobs found</div>
          <div className="empty-state-text">Try adjusting your filters to see more results</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5) var(--space-6)',
                background: 'white',
                boxShadow: 'var(--shadow-xs)',
                transition: 'all var(--transition-base)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--gray-900)', margin: '0 0 4px', fontSize: 'var(--text-lg)' }}>
                    {job.title}
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: 0 }}>{job.employer_name}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--green-600)', margin: '0 0 2px' }}>
                    ₹{job.wages_per_hour}/hr
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', margin: 0 }}>{job.working_hours} hrs/day</p>
                </div>
              </div>

              <p style={{
                color: 'var(--gray-600)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-3)',
                lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {job.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                {[
                  { icon: MapPin, label: 'Location', value: job.location_name },
                  { icon: MapPin, label: 'Distance', value: `${job.distance} km` },
                  { icon: Briefcase, label: 'Experience', value: job.min_experience || 'Any' },
                  { icon: Wrench, label: 'Skills', value: job.required_skills?.join(', ') || 'Any' },
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

              <button
                className={`btn-dash btn-dash--full ${appliedJobs.has(job.id) ? 'btn-dash--secondary' : 'btn-dash--primary'}`}
                onClick={() => handleApplyJob(job.id)}
                disabled={appliedJobs.has(job.id)}
              >
                {appliedJobs.has(job.id) ? (
                  <><CheckCircle size={16} /> Applied</>
                ) : (
                  <><Send size={16} /> Apply Now</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyJobs;
