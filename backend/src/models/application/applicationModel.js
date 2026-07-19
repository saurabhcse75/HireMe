const pool = require('../../config/database');

// ==========================================
// APPLICATION QUERIES
// ==========================================

const getApplicationByWorkerAndJob = async (jobId, workerId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT id FROM job_applications WHERE job_id = ? AND worker_id = ?',
    [jobId, workerId]
  );
  return rows[0];
};

const createApplication = async (jobId, workerId, connection = pool) => {
  const [result] = await connection.query(
    'INSERT INTO job_applications (job_id, worker_id, status) VALUES (?, ?, ?)',
    [jobId, workerId, 'pending']
  );
  return result;
};

const getApplicationsByWorkerUserId = async (userId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT ja.*, j.title, j.description, j.wages_per_hour, j.working_hours,
            e.location_name, u.name as employer_name
     FROM job_applications ja
     JOIN workers w ON ja.worker_id = w.id
     JOIN jobs j ON ja.job_id = j.id
     JOIN employers e ON j.employer_id = e.id
     JOIN users u ON e.user_id = u.id
     WHERE w.user_id = ?
     ORDER BY ja.applied_at DESC`,
    [userId]
  );
  return rows;
};

const getApplicationsByEmployerId = async (employerId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT ja.*, j.title as job_title, w.address, w.skills, w.experience, w.availability_time, w.wages_per_hour, w.rating, u.name as worker_name, u.mobile_number as worker_mobile
     FROM job_applications ja
     JOIN jobs j ON ja.job_id = j.id
     JOIN workers w ON ja.worker_id = w.id
     JOIN users u ON w.user_id = u.id
     WHERE j.employer_id = ?
     ORDER BY ja.applied_at DESC`,
    [employerId]
  );
  return rows;
};

const getApplicationByIdAndEmployerUserWithLock = async (applicationId, userId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT ja.*, j.employer_id FROM job_applications ja
     JOIN jobs j ON ja.job_id = j.id
     JOIN employers e ON j.employer_id = e.id
     WHERE ja.id = ? AND e.user_id = ? FOR UPDATE`,
    [applicationId, userId]
  );
  return rows[0];
};

const updateApplicationStatus = async (applicationId, status, connection = pool) => {
  const [result] = await connection.query(
    'UPDATE job_applications SET status = ?, responded_at = NOW() WHERE id = ?',
    [status, applicationId]
  );
  return result;
};

const getApplicationsByJobId = async (jobId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT ja.*, w.id as worker_id, u.name, u.mobile_number, w.current_latitude, w.current_longitude,
            w.rating, w.skills, w.experience, w.wages_per_hour, w.availability_time
     FROM job_applications ja
     JOIN workers w ON ja.worker_id = w.id
     JOIN users u ON w.user_id = u.id
     WHERE ja.job_id = ?
     ORDER BY ja.applied_at DESC`,
    [jobId]
  );
  return rows;
};

module.exports = {
  getApplicationByWorkerAndJob,
  createApplication,
  getApplicationsByWorkerUserId,
  getApplicationsByEmployerId,
  getApplicationByIdAndEmployerUserWithLock,
  updateApplicationStatus,
  getApplicationsByJobId,
};
