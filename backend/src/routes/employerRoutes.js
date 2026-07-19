const express = require('express');
const router = express.Router();
const { authMiddleware, roleCheck } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/employer/employerController');

// All routes require authentication and employer role
router.use(authMiddleware);
router.use(roleCheck('employer'));

// Profile routes
router.get('/profile', getProfile);
router.put('/location', updateLocation);

// Job routes
router.post('/jobs', postJob);
router.get('/jobs', getJobs);
router.put('/jobs/:jobId/close', closeJob);
router.get('/jobs/:jobId/applications', getApplications);

// Application response routes
router.put('/applications/:applicationId', respondToApplication);

// Worker discovery routes
router.get('/workers/nearby', getNearbyWorkers);
router.post('/hire', sendHiringRequest);
router.get('/hiring-requests', getSentHiringRequests);

// Hired workers management
router.get('/hired', getHiredWorkers);
router.put('/hire/status', updateHireStatus);

// Rating routes
router.post('/rate/:workerId', rateWorker);

module.exports = router;
