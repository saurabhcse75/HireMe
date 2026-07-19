const pool = require('../../config/database');
const { calculateDistance, parseSkills } = require('../../utils/helpers');
const { jobCreationSchema, locationUpdateSchema, ratingSchema } = require('../../validators/schemas');
const model = require('../../models');

// Get Employer Profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const employer = await model.getEmployerByUserId(userId);

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    return res.status(200).json({ employer });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update Employer Location
const updateLocation = async (req, res) => {
  try {
    const { error, value } = locationUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userId = req.user.id;
    await model.updateEmployerLocation(userId, value.latitude, value.longitude, value.locationName);

    return res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    return res.status(500).json({ message: 'Error updating location' });
  }
};

// Post a Job
const postJob = async (req, res) => {
  try {
    const { error, value } = jobCreationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userId = req.user.id;

    // Get employer ID
    const employer = await model.getEmployerByUserId(userId);

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const result = await model.createJob(
      employer.id,
      value.title,
      value.description,
      value.locationName,
      value.latitude,
      value.longitude,
      value.requiredSkills || [],
      value.minExperience || null,
      value.wagesPerHour,
      value.workingHours
    );

    return res.status(201).json({
      message: 'Job posted successfully',
      jobId: result.insertId,
    });
  } catch (error) {
    console.error('Post job error:', error);
    return res.status(500).json({ message: 'Error posting job' });
  }
};

// Get Employer's Jobs
const getJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const employer = await model.getEmployerByUserId(userId);

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const jobs = await model.getJobsByEmployerId(employer.id);

    const jobsWithSkills = jobs.map((job) => ({
      ...job,
      required_skills: parseSkills(job.required_skills),
    }));

    return res.status(200).json({ jobs: jobsWithSkills });
  } catch (error) {
    console.error('Get jobs error:', error);
    return res.status(500).json({ message: 'Error fetching jobs' });
  }
};

// Get Applications for a Job
const getApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Get employer profile
    const employer = await model.getEmployerByUserId(userId);
    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    // Verify job belongs to this employer
    const job = await model.getJobByIdAndEmployer(jobId, employer.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applications = await model.getApplicationsByJobId(jobId);

    const applicationsWithSkills = applications.map((app) => ({
      ...app,
      skills: parseSkills(app.skills),
    }));

    return res.status(200).json({ applications: applicationsWithSkills });
  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json({ message: 'Error fetching applications' });
  }
};

// Close a Job
const closeJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Get employer profile
    const employer = await model.getEmployerByUserId(userId);
    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    // Verify job belongs to this employer
    const job = await model.getJobByIdAndEmployer(jobId, employer.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Update job status to closed
    await model.updateJobStatus(jobId, 'closed');

    return res.status(200).json({ message: 'Job closed successfully' });
  } catch (error) {
    console.error('Close job error:', error);
    return res.status(500).json({ message: 'Error closing job' });
  }
};

// Respond to Application
const respondToApplication = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { applicationId } = req.params;
    const { status } = req.body; // 'accepted', 'rejected', or 'cancelled'
    const userId = req.user.id;

    if (!['accepted', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // Get application and verify it belongs to this employer, locking the row for update
      const application = await model.getApplicationByIdAndEmployerUserWithLock(applicationId, userId, connection);

      if (!application) {
        await connection.rollback();
        return res.status(404).json({ message: 'Application not found' });
      }

      // Verify application is still pending
      if (application.status !== 'pending') {
        await connection.rollback();
        return res.status(400).json({ message: 'This application has already been processed' });
      }

      if (status === 'accepted') {
        // Lock the worker row to verify availability
        const worker = await model.getWorkerByIdWithLock(application.worker_id, connection);

        if (!worker) {
          await connection.rollback();
          return res.status(404).json({ message: 'Worker profile not found' });
        }

        if (worker.status !== 'open') {
          await connection.rollback();
          return res.status(400).json({ message: 'This worker is already assigned to another active job.' });
        }

        // Create assignment
        await model.createAssignment(
          application.worker_id,
          application.employer_id,
          application.job_id,
          connection
        );

        // Update worker status to 'working'
        await model.updateWorkerStatus(application.worker_id, 'working', connection);
      }

      // Update application status
      await model.updateApplicationStatus(applicationId, status, connection);

      await connection.commit();

      return res.status(200).json({ message: `Application ${status} successfully` });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Respond to application error:', error);
    return res.status(500).json({ message: 'Error responding to application' });
  } finally {
    connection.release();
  }
};

// Find Nearby Workers
const getNearbyWorkers = async (req, res) => {
  try {
    const { latitude, longitude, distance = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const workers = await model.getAllOpenWorkers();

    // Calculate distance and filter
    const nearbyWorkers = workers
      .map((worker) => {
        const dist = calculateDistance(latitude, longitude, worker.current_latitude, worker.current_longitude);
        return { 
          ...worker, 
          distance: dist.toFixed(2), 
          skills: parseSkills(worker.skills) 
        };
      })
      .filter((worker) => worker.distance <= distance)
      .sort((a, b) => a.distance - b.distance);

    return res.status(200).json({ workers: nearbyWorkers });
  } catch (error) {
    console.error('Get nearby workers error:', error);
    return res.status(500).json({ message: 'Error fetching nearby workers' });
  }
};

// Send Hiring Request
const sendHiringRequest = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { workerId } = req.body;
    const userId = req.user.id;

    // Get employer ID
    const employer = await model.getEmployerByUserId(userId, connection);

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const employerId = employer.id;

    await connection.beginTransaction();

    try {
      // Check if request already exists as pending
      const existing = await model.getPendingRequest(employerId, workerId, connection);

      if (existing) {
        await connection.rollback();
        return res.status(409).json({ message: 'Hiring request already sent' });
      }

      // Otherwise, create new hiring request
      await model.createHiringRequest(employerId, workerId, connection);

      await connection.commit();
      return res.status(201).json({ message: 'Hiring request sent successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Send hiring request error:', error);
    return res.status(500).json({ message: 'Error sending hiring request' });
  } finally {
    connection.release();
  }
};

// Rate Worker
const rateWorker = async (req, res) => {
  try {
    const { error, value } = ratingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const workerId = parseInt(req.params.workerId);
    const userId = req.user.id;
    const { assignmentId } = value;

    if (isNaN(workerId)) {
      return res.status(400).json({ message: 'Invalid worker ID' });
    }

    // Get employer ID
    const employer = await model.getEmployerByUserId(userId);

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const employerId = employer.id;

    if (assignmentId) {
      // Verify assignment
      const assignment = await model.getAssignmentByIdAndWorkerAndEmployer(assignmentId, workerId, employerId);
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      // Check if already rated
      const existing = await model.getRatingByAssignmentId(assignmentId);
      if (existing) {
        return res.status(400).json({ message: 'This hiring engagement has already been rated' });
      }

      // Insert rating linked to assignment
      await model.createRating(employerId, workerId, assignmentId, value.rating, value.feedback || null);
    } else {
      // Fallback: check by worker and employer (legacy/other pathways)
      const existing = await model.getLegacyRating(employerId, workerId);

      if (existing) {
        await model.updateLegacyRating(employerId, workerId, value.rating, value.feedback || null);
      } else {
        await model.createLegacyRating(employerId, workerId, value.rating, value.feedback || null);
      }
    }

    // Recalculate worker's average rating
    const ratings = await model.getAverageRatingForWorker(workerId);

    await model.updateWorkerStats(
      workerId,
      ratings.avg_rating || 0,
      ratings.total || 0
    );

    return res.status(200).json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Rate worker error:', error);
    return res.status(500).json({ message: 'Error submitting rating' });
  }
};

// Get Hired Workers
const getHiredWorkers = async (req, res) => {
  try {
    const userId = req.user.id;
    const employer = await model.getEmployerByUserId(userId);

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    // Get all hired workers (active, completed, cancelled) from worker_assignments
    const hired = await model.getHiredWorkersForEmployer(employer.id);

    const workersWithSkills = hired.map((row) => ({
      hire_source: 'assignment',
      hire_id: row.hire_id,
      status: row.status,
      hired_at: row.hired_at,
      worker_id: row.worker_id,
      user_id: row.user_id,
      name: row.name,
      mobile_number: row.mobile_number,
      skills: parseSkills(row.skills),
      experience: row.experience,
      availability_time: row.availability_time,
      wages_per_hour: row.wages_per_hour,
      rating: row.rating,
      total_ratings: row.total_ratings,
      worker_status: row.worker_status,
      is_rated: !!row.rating_id,
    }));

    return res.status(200).json({ workers: workersWithSkills });
  } catch (error) {
    console.error('Get hired workers error:', error);
    return res.status(500).json({ message: 'Error fetching hired workers' });
  }
};

// Update Hire Status (Complete or Cancel)
const updateHireStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { hireId, action } = req.body; // action: 'complete' or 'cancel'
    const userId = req.user.id;

    console.log('updateHireStatus called with hireId:', hireId, 'action:', action);

    // Validate action
    if (!['complete', 'cancel'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "complete" or "cancel"' });
    }

    // Get employer ID
    const employer = await model.getEmployerByUserId(userId, connection);

    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const employerId = employer.id;

    // Start transaction
    await connection.beginTransaction();

    try {
      // Check if this is a worker_assignment and lock it for update
      const assignment = await model.getAssignmentByIdAndEmployerWithLock(hireId, employerId, connection);

      if (!assignment) {
        await connection.rollback();
        console.log('No assignment found with hireId:', hireId);
        return res.status(404).json({ message: 'Hire assignment not found' });
      }

      const workerId = assignment.worker_id;

      // Verify the assignment is active
      if (assignment.status !== 'active') {
        await connection.rollback();
        return res.status(400).json({ message: 'This assignment is already completed or cancelled' });
      }

      // Lock the worker row to safely update status
      const worker = await model.getWorkerByIdWithLock(workerId, connection);

      if (action === 'complete') {
        // Update assignment status to completed
        await model.updateAssignmentStatus(hireId, 'completed', connection);

        // Set worker status back to 'open' if they are currently working
        if (worker && worker.status === 'working') {
          await model.updateWorkerStatus(workerId, 'open', connection);
        }
      } else if (action === 'cancel') {
        // Update assignment status to cancelled
        await model.updateAssignmentStatus(hireId, 'cancelled', connection);

        // Set worker status back to 'open' if they are currently working
        if (worker && worker.status === 'working') {
          await model.updateWorkerStatus(workerId, 'open', connection);
        }
      }

      await connection.commit();

      return res.status(200).json({
        message: `Hire ${action === 'complete' ? 'completed' : 'cancelled'} successfully`,
        workerId: workerId,
        promptRating: true,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Update hire status error:', error);
    return res.status(500).json({ message: 'Error updating hire status' });
  } finally {
    connection.release();
  }
};

// Get Sent Hiring Requests (worker IDs with pending requests from this employer)
const getSentHiringRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const employer = await model.getEmployerByUserId(userId);
    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }
    const rows = await model.getSentRequestsByEmployerId(employer.id);
    const workerIds = rows.map((r) => r.worker_id);
    return res.status(200).json({ workerIds });
  } catch (error) {
    console.error('Get sent hiring requests error:', error);
    return res.status(500).json({ message: 'Error fetching sent requests' });
  }
};

module.exports = {
  getProfile,
  updateLocation,
  postJob,
  getJobs,
  getApplications,
  respondToApplication,
  closeJob,
  getNearbyWorkers,
  sendHiringRequest,
  getSentHiringRequests,
  rateWorker,
  getHiredWorkers,
  updateHireStatus,
};
