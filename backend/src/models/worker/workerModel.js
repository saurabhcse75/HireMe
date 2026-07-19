const pool = require('../../config/database');

// ==========================================
// WORKER QUERIES
// ==========================================

const getWorkerByUserId = async (userId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT w.*, u.name, u.mobile_number, u.email
     FROM workers w
     JOIN users u ON w.user_id = u.id
     WHERE u.id = ?`,
    [userId]
  );
  return rows[0];
};

const createWorkerProfile = async (userId, address, skills, experience, availabilityTime, wagesPerHour, connection = pool) => {
  const [result] = await connection.query(
    `INSERT INTO workers (user_id, address, skills, experience, availability_time, wages_per_hour, status)
     VALUES (?, ?, ?, ?, ?, ?, 'open')`,
    [userId, address, JSON.stringify(skills), experience, availabilityTime, wagesPerHour]
  );
  return result;
};

const updateWorkerProfile = async (userId, updateFields, params, connection = pool) => {
  const [result] = await connection.query(
    `UPDATE workers SET ${updateFields} WHERE user_id = ?`,
    [...params, userId]
  );
  return result;
};

const updateWorkerLocation = async (userId, latitude, longitude, connection = pool) => {
  const [result] = await connection.query(
    'UPDATE workers SET current_latitude = ?, current_longitude = ? WHERE user_id = ?',
    [latitude, longitude, userId]
  );
  return result;
};

const getWorkerById = async (id, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT * FROM workers WHERE id = ?',
    [id]
  );
  return rows[0];
};

const getWorkerByIdWithLock = async (id, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT * FROM workers WHERE id = ? FOR UPDATE',
    [id]
  );
  return rows[0];
};

const updateWorkerStatus = async (workerId, status, connection = pool) => {
  const [result] = await connection.query(
    'UPDATE workers SET status = ? WHERE id = ?',
    [status, workerId]
  );
  return result;
};

const getNearbyJobs = async (filters = {}, connection = pool) => {
  let query = `
    SELECT j.*, e.location_name as employer_location, u.name as employer_name
    FROM jobs j
    JOIN employers e ON j.employer_id = e.id
    JOIN users u ON e.user_id = u.id
    WHERE j.status = 'open'
  `;
  const params = [];

  if (filters.wages) {
    query += ' AND j.wages_per_hour >= ?';
    params.push(filters.wages);
  }

  if (filters.hours) {
    query += ' AND j.working_hours <= ?';
    params.push(filters.hours);
  }

  if (filters.experience) {
    query += ' AND (j.min_experience IS NULL OR j.min_experience = ?)';
    params.push(filters.experience);
  }

  const [rows] = await connection.query(query, params);
  return rows;
};

const getAllOpenWorkers = async (connection = pool) => {
  const [rows] = await connection.query(
    `SELECT w.*, u.name, u.mobile_number, u.email
     FROM workers w
     JOIN users u ON w.user_id = u.id
     WHERE w.status = 'open' AND w.current_latitude IS NOT NULL AND w.current_longitude IS NOT NULL`
  );
  return rows;
};

module.exports = {
  getWorkerByUserId,
  createWorkerProfile,
  updateWorkerProfile,
  updateWorkerLocation,
  getWorkerById,
  getWorkerByIdWithLock,
  updateWorkerStatus,
  getNearbyJobs,
  getAllOpenWorkers,
};
