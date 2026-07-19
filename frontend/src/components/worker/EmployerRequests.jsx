import React, { useState, useEffect } from 'react';
import { WorkerService } from '../../services/api';
import { showSuccess, showError } from '../../utils/toastNotification';
import {
  CheckCircle,
  XCircle,
  MapPin,
  CalendarDays,
  Briefcase,
  Clock,
  Phone,
} from 'lucide-react';

const EmployerRequests = ({ onDataChange }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await WorkerService.getRequests();
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, status) => {
    try {
      setRespondingTo(requestId);
      await WorkerService.respondToRequest(requestId, status);
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status, responded_at: new Date().toISOString() } : req
        )
      );
      showSuccess(`Request ${status} successfully`);
      onDataChange?.();
    } catch (error) {
      showError('Failed to respond to request');
      console.error('Error responding to request:', error);
    } finally {
      setRespondingTo(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const respondedRequests = requests.filter((r) => r.status !== 'pending');

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
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h3 style={{
            fontWeight: 700, color: 'var(--gray-800)', marginBottom: 'var(--space-4)',
            fontSize: 'var(--text-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          }}>
            <Clock size={20} style={{ color: 'var(--amber-500)' }} />
            Pending Requests
            <span className="badge badge--warning">{pendingRequests.length}</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  border: '1px solid var(--amber-200)',
                  borderLeft: '4px solid var(--amber-400)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-5)',
                  background: 'white',
                  boxShadow: 'var(--shadow-xs)',
                  animation: 'fadeIn 0.3s ease-out',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                      <div className="avatar avatar--md">{request.employer_name?.charAt(0)?.toUpperCase() || '?'}</div>
                      <div>
                        <h4 style={{ fontWeight: 700, color: 'var(--gray-900)', margin: 0, fontSize: 'var(--text-base)' }}>
                          {request.employer_name}
                        </h4>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} /> Address: {request.location_name || '—'}
                        </p>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={12} /> Mobile: {request.employer_mobile}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', margin: 'var(--space-2) 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalendarDays size={11} /> Sent: {new Date(request.sent_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="badge badge--warning">Pending</span>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                  <button
                    className="btn-dash btn-dash--success"
                    style={{ flex: 1 }}
                    onClick={() => handleRespond(request.id, 'accepted')}
                    disabled={respondingTo === request.id}
                  >
                    <CheckCircle size={16} />
                    {respondingTo === request.id ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    className="btn-dash btn-dash--danger"
                    style={{ flex: 1 }}
                    onClick={() => handleRespond(request.id, 'rejected')}
                    disabled={respondingTo === request.id}
                  >
                    <XCircle size={16} />
                    {respondingTo === request.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Responded Requests */}
      {respondedRequests.length > 0 && (
        <div>
          <h3 style={{
            fontWeight: 700, color: 'var(--gray-800)', marginBottom: 'var(--space-4)',
            fontSize: 'var(--text-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          }}>
            <Briefcase size={20} style={{ color: 'var(--gray-400)' }} />
            Response History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {respondedRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  border: '1px solid var(--gray-200)',
                  borderLeft: `4px solid ${request.status === 'accepted' ? 'var(--green-400)' : 'var(--red-300)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4) var(--space-5)',
                  background: 'white',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div className="avatar avatar--sm">{request.employer_name?.charAt(0)?.toUpperCase() || '?'}</div>
                    <div>
                      <h4 style={{ fontWeight: 600, color: 'var(--gray-800)', margin: 0, fontSize: 'var(--text-sm)' }}>
                        {request.employer_name}
                      </h4>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={11} /> Address: {request.location_name || '—'}
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={11} /> Mobile: {request.employer_mobile}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${request.status === 'accepted' ? 'badge--success' : 'badge--danger'}`}>
                      {request.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                    </span>
                    {request.responded_at && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', margin: 'var(--space-1) 0 0' }}>
                        {new Date(request.responded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🤝</div>
          <div className="empty-state-title">No requests yet</div>
          <div className="empty-state-text">Hire requests from employers will appear here</div>
        </div>
      )}
    </div>
  );
};

export default EmployerRequests;
