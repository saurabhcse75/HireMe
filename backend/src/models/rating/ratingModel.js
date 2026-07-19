const pool = require('../../config/database');

// ==========================================
// RATING QUERIES
// ==========================================

const getRatingByAssignmentId = async (assignmentId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT id FROM ratings WHERE assignment_id = ?',
    [assignmentId]
  );
  return rows[0];
};

const createRating = async (raterId, workerId, assignmentId, rating, feedback, connection = pool) => {
  const [result] = await connection.query(
    'INSERT INTO ratings (rater_id, worker_id, assignment_id, rating, feedback) VALUES (?, ?, ?, ?, ?)',
    [raterId, workerId, assignmentId, rating, feedback]
  );
  return result;
};

const getAverageRatingForWorker = async (workerId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM ratings WHERE worker_id = ?',
    [workerId]
  );
  return rows[0];
};

const updateWorkerStats = async (workerId, avgRating, totalRatings, connection = pool) => {
  const [result] = await connection.query(
    'UPDATE workers SET rating = ?, total_ratings = ? WHERE id = ?',
    [avgRating, totalRatings, workerId]
  );
  return result;
};

const getLegacyRating = async (employerId, workerId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT id FROM ratings WHERE rater_id = ? AND worker_id = ? AND assignment_id IS NULL',
    [employerId, workerId]
  );
  return rows[0];
};

const createLegacyRating = async (employerId, workerId, rating, feedback, connection = pool) => {
  const [result] = await connection.query(
    'INSERT INTO ratings (rater_id, worker_id, rating, feedback) VALUES (?, ?, ?, ?)',
    [employerId, workerId, rating, feedback]
  );
  return result;
};

const updateLegacyRating = async (employerId, workerId, rating, feedback, connection = pool) => {
  const [result] = await connection.query(
    'UPDATE ratings SET rating = ?, feedback = ?, rated_at = NOW() WHERE rater_id = ? AND worker_id = ? AND assignment_id IS NULL',
    [rating, feedback, employerId, workerId]
  );
  return result;
};

module.exports = {
  getRatingByAssignmentId,
  createRating,
  getAverageRatingForWorker,
  updateWorkerStats,
  getLegacyRating,
  createLegacyRating,
  updateLegacyRating,
};
