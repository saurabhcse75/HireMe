const pool = require('../../config/database');
const { calculateDistance, parseSkills } = require('../../utils/helpers');
const { workerProfileUpdateSchema, locationUpdateSchema } = require('../../validators/schemas');
const model = require('../../models');

// Get Worker Profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const worker = await model.getWorkerByUserId(userId);

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    worker.skills = parseSkills(worker.skills);

    return res.status(200).json({ worker });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update Worker Profile
const updateProfile = async (req, res) => {
  try {
    const { error, value } = workerProfileUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userId = req.user.id;
    const updates = {};
    const params = [];

    if (value.skills) {
      updates['skills'] = '?';
      params.push(JSON.stringify(value.skills));
    }
    if (value.experience) {
      updates['experience'] = '?';
      params.push(value.experience);
    }
    if (value.availabilityTime) {
      updates['availability_time'] = '?';
      params.push(value.availabilityTime);
    }
    if (value.wagesPerHour) {
      updates['wages_per_hour'] = '?';
      params.push(value.wagesPerHour);
    }
    if (value.address) {
      updates['address'] = '?';
      params.push(value.address);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const updateStr = Object.keys(updates)
      .map((key) => `${key} = ${updates[key]}`)
      .join(', ');

    await model.updateWorkerProfile(userId, updateStr, params);

    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Error updating profile' });
  }
};

// Update Worker Location
const updateLocation = async (req, res) => {
  try {
    const { error, value } = locationUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userId = req.user.id;
    await model.updateWorkerLocation(userId, value.latitude, value.longitude);

    return res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    return res.status(500).json({ message: 'Error updating location' });
  }
};

// Get Nearby Jobs
const getNearbyJobs = async (req, res) => {
  try {
    const { latitude, longitude, distance = 5, wages, hours, skills, experience } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const jobs = await model.getNearbyJobs({ wages, hours, experience });

    // Filter by distance and calculate distance for each job
    const nearbyJobs = jobs
      .map((job) => {
        const dist = calculateDistance(latitude, longitude, job.latitude, job.longitude);
        return { 
          ...job, 
          distance: dist.toFixed(2), 
          required_skills: parseSkills(job.required_skills) 
        };
      })
      .filter((job) => job.distance <= distance)
      .sort((a, b) => a.distance - b.distance);

    return res.status(200).json({ jobs: nearbyJobs });
  } catch (error) {
    console.error('Get nearby jobs error:', error);
    return res.status(500).json({ message: 'Error fetching nearby jobs' });
  }
};

// Apply for Job
const applyForJob = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Get worker profile
    const worker = await model.getWorkerByUserId(userId, connection);
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const workerId = worker.id;

    // Check if already applied
    const existing = await model.getApplicationByWorkerAndJob(jobId, workerId, connection);
    if (existing) {
      return res.status(409).json({ message: 'Already applied for this job' });
    }

    // Create application
    await model.createApplication(jobId, workerId, connection);

    return res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply for job error:', error);
    return res.status(500).json({ message: 'Error applying for job' });
  } finally {
    connection.release();
  }
};

// Get Worker Applications
const getApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await model.getApplicationsByWorkerUserId(userId);
    return res.status(200).json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json({ message: 'Error fetching applications' });
  }
};

// Get Hiring Requests
const getRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await model.getRequestsByWorkerUserId(userId);
    return res.status(200).json({ requests });
  } catch (error) {
    console.error('Get requests error:', error);
    return res.status(500).json({ message: 'Error fetching requests' });
  }
};

// Respond to Hiring Request
const respondToRequest = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const userId = req.user.id;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // Get request and verify it belongs to this worker, locking the row for update
      const request = await model.getRequestByIdAndWorkerUserWithLock(requestId, userId, connection);

      if (!request) {
        await connection.rollback();
        return res.status(404).json({ message: 'Request not found' });
      }

      // Verify the request is still pending
      if (request.status !== 'pending') {
        await connection.rollback();
        return res.status(400).json({ message: 'This request has already been processed' });
      }

      if (status === 'accepted') {
        // Lock the worker row to verify availability
        const worker = await model.getWorkerByIdWithLock(request.worker_id, connection);

        if (!worker) {
          await connection.rollback();
          return res.status(404).json({ message: 'Worker profile not found' });
        }

        if (worker.status !== 'open') {
          await connection.rollback();
          return res.status(400).json({ message: 'You are currently assigned to another active job. Please complete it first.' });
        }

        // Create assignment (without specific jobId since it was direct request)
        await model.createAssignment(request.worker_id, request.employer_id, null, connection);

        // Update worker status to 'working'
        await model.updateWorkerStatus(request.worker_id, 'working', connection);
      }

      // Update request status
      await model.updateRequestStatus(requestId, status, connection);

      await connection.commit();

      return res.status(200).json({ message: `Request ${status} successfully` });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Respond to request error:', error);
    return res.status(500).json({ message: 'Error responding to request' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateLocation,
  getNearbyJobs,
  applyForJob,
  getApplications,
  getRequests,
  respondToRequest,
};
