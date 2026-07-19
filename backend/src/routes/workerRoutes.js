const express = require('express');
const router = express.Router();
const { authMiddleware, roleCheck } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  updateLocation,
  getNearbyJobs,
  applyForJob,
  getApplications,
  getRequests,
  respondToRequest,
} = require('../controllers/worker/workerController');

// All routes require authentication and worker role
router.use(authMiddleware);
router.use(roleCheck('worker'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Location routes
router.put('/location', updateLocation);

// Job routes
router.get('/jobs/nearby', getNearbyJobs);
router.post('/jobs/:jobId/apply', applyForJob);

// Application routes
router.get('/applications', getApplications);

// Hiring request routes
router.get('/requests', getRequests);
router.put('/requests/:requestId', respondToRequest);

module.exports = router;
