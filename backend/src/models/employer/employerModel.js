const pool = require('../../config/database');

// ==========================================
// EMPLOYER QUERIES
// ==========================================

const getEmployerByUserId = async (userId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT e.*, u.name, u.mobile_number, u.email
     FROM employers e
     JOIN users u ON e.user_id = u.id
     WHERE u.id = ?`,
    [userId]
  );
  return rows[0];
};

const getEmployerById = async (id, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT * FROM employers WHERE id = ?',
    [id]
  );
  return rows[0];
};

const createEmployerProfile = async (userId, locationName, latitude, longitude, connection = pool) => {
  const [result] = await connection.query(
    `INSERT INTO employers (user_id, location_name, latitude, longitude)
     VALUES (?, ?, ?, ?)`,
    [userId, locationName, latitude, longitude]
  );
  return result;
};

const updateEmployerLocation = async (userId, latitude, longitude, locationName, connection = pool) => {
  const [result] = await connection.query(
    'UPDATE employers SET latitude = ?, longitude = ?, location_name = ? WHERE user_id = ?',
    [latitude, longitude, locationName, userId]
  );
  return result;
};

module.exports = {
  getEmployerByUserId,
  getEmployerById,
  createEmployerProfile,
  updateEmployerLocation,
};
