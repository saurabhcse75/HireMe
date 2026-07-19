const userModel = require('./user/userModel');
const workerModel = require('./worker/workerModel');
const employerModel = require('./employer/employerModel');
const jobModel = require('./job/jobModel');
const applicationModel = require('./application/applicationModel');
const hiringRequestModel = require('./hiringRequest/hiringRequestModel');
const assignmentModel = require('./assignment/assignmentModel');
const ratingModel = require('./rating/ratingModel');

module.exports = {
  ...userModel,
  ...workerModel,
  ...employerModel,
  ...jobModel,
  ...applicationModel,
  ...hiringRequestModel,
  ...assignmentModel,
  ...ratingModel
};
