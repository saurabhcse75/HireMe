const authController = require('./auth/authController');
const employerController = require('./employer/employerController');
const workerController = require('./worker/workerController');

module.exports = {
  ...authController,
  ...employerController,
  ...workerController,
};
