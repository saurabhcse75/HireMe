const pool = require('../../config/database');

// ==========================================
// USER & AUTH QUERIES
// ==========================================

const getUserById = async (id, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT id, mobile_number, role, name, email FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

const getUserByMobile = async (mobileNumber, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT id, mobile_number, password_hash, role, name FROM users WHERE mobile_number = ?',
    [mobileNumber]
  );
  return rows[0];
};

const createUser = async (mobileNumber, passwordHash, role, name, connection = pool) => {
  const [result] = await connection.query(
    'INSERT INTO users (mobile_number, password_hash, role, name) VALUES (?, ?, ?, ?)',
    [mobileNumber, passwordHash, role, name]
  );
  return result;
};

module.exports = {
  getUserById,
  getUserByMobile,
  createUser,
};
