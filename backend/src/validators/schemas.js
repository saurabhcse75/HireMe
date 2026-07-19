const Joi = require('joi');

// Worker Registration Validation
const workerRegistrationSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  mobileNumber: Joi.string()
    .required()
    .pattern(/^\d{10}$/)
    .messages({
      'string.pattern.base': 'Mobile number must be 10 digits',
    }),
  password: Joi.string().required().min(6).max(50),
  address: Joi.string().required().min(5),
  skills: Joi.array().items(Joi.string()).required().min(1),
  experience: Joi.string().required().valid('0-1', '1-3', '3-5', '5-10', '10+'),
  availabilityTime: Joi.string().required().valid('part-time', 'full-time', 'flexible', 'weekends'),
  wagesPerHour: Joi.number().required().positive(),
}).unknown(true);

// Employer Registration Validation
const employerRegistrationSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  mobileNumber: Joi.string()
    .required()
    .pattern(/^\d{10}$/)
    .messages({
      'string.pattern.base': 'Mobile number must be 10 digits',
    }),
  password: Joi.string().required().min(6).max(50),
  locationName: Joi.string().required().min(3),
  latitude: Joi.number().required().min(-90).max(90),
  longitude: Joi.number().required().min(-180).max(180),
}).unknown(true);

// Login Validation
const loginSchema = Joi.object({
  mobileNumber: Joi.string()
    .required()
    .pattern(/^\d{10}$/)
    .messages({
      'string.pattern.base': 'Mobile number must be 10 digits',
    }),
  password: Joi.string().required(),
}).unknown(true);

// Job Creation Validation
const jobCreationSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10),
  locationName: Joi.string().required().min(3),
  latitude: Joi.number().required().min(-90).max(90),
  longitude: Joi.number().required().min(-180).max(180),
  requiredSkills: Joi.array().items(Joi.string()),
  minExperience: Joi.string().valid('0-1', '1-3', '3-5', '5-10', '10+').allow('', null),
  wagesPerHour: Joi.number().required().positive(),
  workingHours: Joi.number().required().positive(),
});

// Worker Profile Update Validation
const workerProfileUpdateSchema = Joi.object({
  skills: Joi.array().items(Joi.string()),
  experience: Joi.string().valid('0-1', '1-3', '3-5', '5-10', '10+'),
  availabilityTime: Joi.string().valid('part-time', 'full-time', 'flexible', 'weekends'),
  wagesPerHour: Joi.number().positive(),
  address: Joi.string().min(5),
});

// Location Update Validation
const locationUpdateSchema = Joi.object({
  latitude: Joi.number().required().min(-90).max(90),
  longitude: Joi.number().required().min(-180).max(180),
  locationName: Joi.string(),
});

// Rating Validation
const ratingSchema = Joi.object({
  rating: Joi.number().required().min(1).max(5),
  feedback: Joi.string().max(500).allow('', null),
  assignmentId: Joi.number().integer().allow(null),
});

module.exports = {
  workerRegistrationSchema,
  employerRegistrationSchema,
  loginSchema,
  jobCreationSchema,
  workerProfileUpdateSchema,
  locationUpdateSchema,
  ratingSchema,
};
