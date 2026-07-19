import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register' &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const AuthService = {
  login: (mobileNumber, password) =>
    apiClient.post('/auth/login', { mobileNumber, password }),

  registerWorker: (workerData) =>
    apiClient.post('/auth/register/worker', workerData),

  registerEmployer: (employerData) =>
    apiClient.post('/auth/register/employer', employerData),

  getMe: () =>
    apiClient.get('/auth/me'),

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    }
  },
};

const WorkerService = {
  updateLocation: (latitude, longitude) =>
    apiClient.put('/worker/location', { latitude, longitude }),

  getNearbyJobs: (latitude, longitude, filters = {}) =>
    apiClient.get('/worker/jobs/nearby', {
      params: { latitude, longitude, ...filters },
    }),

  applyForJob: (jobId) =>
    apiClient.post(`/worker/jobs/${jobId}/apply`),

  getApplications: () =>
    apiClient.get('/worker/applications'),

  updateProfile: (profileData) =>
    apiClient.put('/worker/profile', profileData),

  getProfile: () =>
    apiClient.get('/worker/profile'),

  respondToRequest: (requestId, status) =>
    apiClient.put(`/worker/requests/${requestId}`, { status }),

  getRequests: () =>
    apiClient.get('/worker/requests'),
};

const EmployerService = {
  updateLocation: (latitude, longitude) =>
    apiClient.put('/employer/location', { latitude, longitude }),

  postJob: (jobData) =>
    apiClient.post('/employer/jobs', jobData),

  getJobs: () =>
    apiClient.get('/employer/jobs'),

  closeJob: (jobId) =>
    apiClient.put(`/employer/jobs/${jobId}/close`),

  getApplications: (jobId) =>
    apiClient.get(`/employer/jobs/${jobId}/applications`),

  respondToApplication: (applicationId, status) =>
    apiClient.put(`/employer/applications/${applicationId}`, { status }),

  getNearbyWorkers: (latitude, longitude, distance = 5) =>
    apiClient.get('/employer/workers/nearby', {
      params: { latitude, longitude, distance },
    }),

  sendHiringRequest: (workerId) =>
    apiClient.post('/employer/hire', { workerId: parseInt(workerId) }),

  getSentHiringRequests: () =>
    apiClient.get('/employer/hiring-requests'),

  rateWorker: (workerId, rating, feedback, assignmentId) =>
    apiClient.post(`/employer/rate/${workerId}`, { rating: parseInt(rating), feedback: feedback || null, assignmentId }),

  getHiredWorkers: () =>
    apiClient.get('/employer/hired'),

  updateHireStatus: (hireId, action) =>
    apiClient.put('/employer/hire/status', { hireId, action }),

  getProfile: () =>
    apiClient.get('/employer/profile'),

  updateProfile: (profileData) =>
    apiClient.put('/employer/profile', profileData),
};

export { AuthService, WorkerService, EmployerService, apiClient };
