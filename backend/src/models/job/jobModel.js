const pool = require('../../config/database');

// ==========================================
// JOB QUERIES
// ==========================================

const createJob = async (employerId, title, description, locationName, latitude, longitude, requiredSkills, minExperience, wagesPerHour, workingHours, connection = pool) => {
  const [result] = await connection.query(
    `INSERT INTO jobs (employer_id, title, description, location_name, latitude, longitude, required_skills, min_experience, wages_per_hour, working_hours)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [employerId, title, description, locationName, latitude, longitude, JSON.stringify(requiredSkills), minExperience, wagesPerHour, workingHours]
  );
  return result;
};

const getJobsByEmployerId = async (employerId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC',
    [employerId]
  );
  return rows;
};

const getJobByIdAndEmployer = async (jobId, employerId, connection = pool) => {
  const [rows] = await connection.query(
    'SELECT id FROM jobs WHERE id = ? AND employer_id = ?',
    [jobId, employerId]
  );
  return rows[0];
};

const updateJobStatus = async (jobId, status, connection = pool) => {
  const [result] = await connection.query(
    'UPDATE jobs SET status = ? WHERE id = ?',
    [status, jobId]
  );
  return result;
};

module.exports = {
  createJob,
  getJobsByEmployerId,
  getJobByIdAndEmployer,
  updateJobStatus,
};
