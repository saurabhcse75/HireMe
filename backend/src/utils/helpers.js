const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (user) => {
  const payload = {
    id: user.id,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Hash Password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare Password
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// Calculate Distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Validate Coordinates
const validateCoordinates = (latitude, longitude) => {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
};

// Parse Skills - handles both JSON arrays and plain strings
const parseSkills = (skillsData) => {
  if (!skillsData) return [];

  // Already a parsed array (e.g. MySQL2 auto-parses JSON columns)
  if (Array.isArray(skillsData)) return skillsData;

  try {
    // Try parsing as JSON string
    const parsed = JSON.parse(skillsData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    // If it's not valid JSON, treat it as a comma-separated plain string
    if (typeof skillsData === 'string' && skillsData.trim()) {
      return skillsData.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  calculateDistance,
  validateCoordinates,
  parseSkills,
};
