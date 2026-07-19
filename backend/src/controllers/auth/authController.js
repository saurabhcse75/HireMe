const pool = require('../../config/database');
const { hashPassword, comparePassword, generateToken } = require('../../utils/helpers');
const {
  workerRegistrationSchema,
  employerRegistrationSchema,
  loginSchema,
} = require('../../validators/schemas');
const model = require('../../models');

// Register Worker
const registerWorker = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Validate request
    const { error, value } = workerRegistrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if mobile number already exists
    const existingUser = await model.getUserByMobile(value.mobileNumber, connection);

    if (existingUser) {
      return res.status(409).json({ message: 'Mobile number already registered' });
    }

    // Hash password
    const passwordHash = await hashPassword(value.password);

    // Start transaction
    await connection.beginTransaction();

    try {
      // Create user
      const userResult = await model.createUser(
        value.mobileNumber,
        passwordHash,
        'worker',
        value.name,
        connection
      );

      const userId = userResult.insertId;

      // Create worker profile
      await model.createWorkerProfile(
        userId,
        value.address,
        value.skills,
        value.experience,
        value.availabilityTime,
        value.wagesPerHour,
        connection
      );

      await connection.commit();

      // Fetch complete user info
      const user = await model.getUserById(userId, connection);

      const token = generateToken(user);

      return res.status(201).json({
        message: 'Worker registered successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          mobileNumber: user.mobile_number,
          role: user.role,
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Register worker error:', error);
    return res.status(500).json({ message: 'Registration failed' });
  } finally {
    connection.release();
  }
};

// Register Employer
const registerEmployer = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Validate request
    const { error, value } = employerRegistrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if mobile number already exists
    const existingUser = await model.getUserByMobile(value.mobileNumber, connection);

    if (existingUser) {
      return res.status(409).json({ message: 'Mobile number already registered' });
    }

    // Hash password
    const passwordHash = await hashPassword(value.password);

    // Start transaction
    await connection.beginTransaction();

    try {
      // Create user
      const userResult = await model.createUser(
        value.mobileNumber,
        passwordHash,
        'employer',
        value.name,
        connection
      );

      const userId = userResult.insertId;

      // Create employer profile
      await model.createEmployerProfile(
        userId,
        value.locationName,
        value.latitude,
        value.longitude,
        connection
      );

      await connection.commit();

      // Fetch complete user info
      const user = await model.getUserById(userId, connection);

      const token = generateToken(user);

      return res.status(201).json({
        message: 'Employer registered successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          mobileNumber: user.mobile_number,
          role: user.role,
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Register employer error:', error);
    return res.status(500).json({ message: 'Registration failed' });
  } finally {
    connection.release();
  }
};

// Login
const login = async (req, res) => {
  try {
    // Validate request
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Find user by mobile number
    const user = await model.getUserByMobile(value.mobileNumber);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isPasswordValid = await comparePassword(value.password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        mobileNumber: user.mobile_number,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed' });
  }
};

// Get current logged-in user profile
const getMe = async (req, res) => {
  try {
    const user = await model.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        mobileNumber: user.mobile_number,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ message: 'Failed to retrieve user' });
  }
};

// Logout user
const logout = async (req, res) => {
  return res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  registerWorker,
  registerEmployer,
  login,
  getMe,
  logout,
};
