const pool = require('../../config/database');

// ==========================================
// HIRING REQUEST QUERIES
// ==========================================

const getRequestsByWorkerUserId = async (userId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT hr.*, e.location_name, u.name as employer_name, u.mobile_number as employer_mobile
     FROM hiring_requests hr
     JOIN workers w ON hr.worker_id = w.id
     JOIN employers e ON hr.employer_id = e.id
     JOIN users u ON e.user_id = u.id
     WHERE w.user_id = ?
     ORDER BY hr.sent_at DESC`,
    [userId]
  );
  return rows;
};

const getPendingRequest = async (employerId, workerId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT id FROM hiring_requests WHERE employer_id = ? AND worker_id = ? AND status = ?',
    [employerId, workerId, 'pending']
  );
  return rows[0];
};

const createHiringRequest = async (employerId, workerId, connection = pool) => {
  const [result] = await connection.query(
    'INSERT INTO hiring_requests (employer_id, worker_id, status) VALUES (?, ?, ?)',
    [employerId, workerId, 'pending']
  );
  return result;
};

const getRequestByIdAndWorkerUserWithLock = async (requestId, userId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT hr.*, w.id as worker_id FROM hiring_requests hr
     JOIN workers w ON hr.worker_id = w.id
     WHERE hr.id = ? AND w.user_id = ? FOR UPDATE`,
    [requestId, userId]
  );
  return rows[0];
};

const updateRequestStatus = async (requestId, status, connection = pool) => {
  const [result] = await connection.query(
    'UPDATE hiring_requests SET status = ?, responded_at = NOW() WHERE id = ?',
    [status, requestId]
  );
  return result;
};

const getSentRequestsByEmployerId = async (employerId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT worker_id FROM hiring_requests WHERE employer_id = ? AND status = ?',
    [employerId, 'pending']
  );
  return rows;
};

module.exports = {
  getRequestsByWorkerUserId,
  getPendingRequest,
  createHiringRequest,
  getRequestByIdAndWorkerUserWithLock,
  updateRequestStatus,
  getSentRequestsByEmployerId,
};
