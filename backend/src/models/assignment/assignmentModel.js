const pool = require('../../config/database');

// ==========================================
// ASSIGNMENT QUERIES
// ==========================================

const createAssignment = async (workerId, employerId, jobId, connection = pool) => {
  const [result] = await connection.query(
    'INSERT INTO worker_assignments (worker_id, employer_id, job_id, status) VALUES (?, ?, ?, ?)',
    [workerId, employerId, jobId, 'active']
  );
  return result;
};

const getHiredWorkers = async (employerId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT wa.id as assignment_id, wa.status as assignment_status, wa.start_date, wa.end_date,
            w.id as worker_id, w.address, w.skills, w.experience, w.availability_time, w.wages_per_hour, w.rating, w.total_ratings, w.status as worker_status,
            u.name as worker_name, u.mobile_number as worker_mobile,
            r.id as rating_id
     FROM worker_assignments wa
     JOIN workers w ON wa.worker_id = w.id
     JOIN users u ON w.user_id = u.id
     LEFT JOIN ratings r ON r.assignment_id = wa.id
     WHERE wa.employer_id = ?
     ORDER BY wa.start_date DESC`,
    [employerId]
  );
  return rows;
};

const getAssignmentByIdAndEmployerWithLock = async (hireId, employerId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT * FROM worker_assignments WHERE id = ? AND employer_id = ? FOR UPDATE',
    [hireId, employerId]
  );
  return rows[0];
};

const getAssignmentByIdAndWorkerAndEmployer = async (assignmentId, workerId, employerId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT id FROM worker_assignments WHERE id = ? AND worker_id = ? AND employer_id = ?',
    [assignmentId, workerId, employerId]
  );
  return rows[0];
};

const updateAssignmentStatus = async (assignmentId, status, connection = pool) => {
  const [result] = await connection.query(
    'UPDATE worker_assignments SET status = ?, end_date = NOW() WHERE id = ?',
    [status, assignmentId]
  );
  return result;
};

const getHiredWorkersForEmployer = async (employerId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT 
      wa.id as hire_id,
      wa.status,
      wa.start_date as hired_at,
      w.id as worker_id,
      w.user_id,
      u.name,
      u.mobile_number,
      w.skills,
      w.experience,
      w.availability_time,
      w.wages_per_hour,
      w.rating,
      w.total_ratings,
      w.status as worker_status,
      r.id as rating_id
     FROM worker_assignments wa
     JOIN workers w ON wa.worker_id = w.id
     JOIN users u ON w.user_id = u.id
     LEFT JOIN ratings r ON r.assignment_id = wa.id
     WHERE wa.employer_id = ? AND wa.status IN ('active', 'completed', 'cancelled')
     ORDER BY wa.start_date DESC`,
    [employerId]
  );
  return rows;
};

module.exports = {
  createAssignment,
  getHiredWorkers,
  getAssignmentByIdAndEmployerWithLock,
  getAssignmentByIdAndWorkerAndEmployer,
  updateAssignmentStatus,
  getHiredWorkersForEmployer,
};
