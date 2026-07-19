-- HireMe Database Schema

CREATE DATABASE IF NOT EXISTS hireme_db;
USE hireme_db;

-- Users Table (for both Workers and Employers)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  mobile_number VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('worker', 'employer') NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE KEY unique_mobile (mobile_number),
  INDEX idx_role (role),
  INDEX idx_mobile (mobile_number)
);

-- Workers Table
CREATE TABLE workers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  skills JSON NOT NULL, -- Array of skills
  experience VARCHAR(50) NOT NULL, -- e.g., "0-1", "1-3", "3-5", "5-10", "10+"
  availability_time VARCHAR(50) NOT NULL, -- part-time, full-time, flexible, weekends
  wages_per_hour DECIMAL(10, 2) NOT NULL,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  status ENUM('open', 'working', 'unavailable') DEFAULT 'open', -- open: available, working: hired, unavailable: not available
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_ratings INT DEFAULT 0,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_location (current_latitude, current_longitude),
  INDEX idx_status (status),
  INDEX idx_rating (rating)
);

-- Employers Table
CREATE TABLE employers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_ratings INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_location (latitude, longitude),
  INDEX idx_rating (rating)
);

-- Jobs Table
CREATE TABLE jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employer_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  required_skills JSON,
  min_experience VARCHAR(50),
  wages_per_hour DECIMAL(10, 2) NOT NULL,
  working_hours INT, -- hours per day or per job
  status ENUM('open', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_status (status),
  INDEX idx_employer (employer_id),
  INDEX idx_location (latitude, longitude),
  INDEX idx_wages (wages_per_hour)
);

-- Job Applications Table
CREATE TABLE job_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  worker_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_application (job_id, worker_id),
  INDEX idx_status (status),
  INDEX idx_worker (worker_id),
  INDEX idx_applied_at (applied_at)
);

-- Hiring Requests Table (Employer directly requesting a worker)
CREATE TABLE hiring_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employer_id INT NOT NULL,
  worker_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL,
  FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_status (status),
  INDEX idx_worker (worker_id),
  INDEX idx_employer (employer_id),
  INDEX idx_sent_at (sent_at)
);

-- Worker Assignments Table (Track when a worker is hired by an employer)
CREATE TABLE worker_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  worker_id INT NOT NULL,
  employer_id INT NOT NULL,
  job_id INT,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP NULL,
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
);

-- Ratings Table
CREATE TABLE ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rater_id INT NOT NULL, -- Employer rating worker
  worker_id INT NOT NULL,
  assignment_id INT UNIQUE NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rater_id) REFERENCES employers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (assignment_id) REFERENCES worker_assignments(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_worker (worker_id),
  INDEX idx_rater (rater_id)
);

-- Create Indexes for better query performance
CREATE INDEX idx_users_mobile ON users(mobile_number);
CREATE INDEX idx_workers_user_id ON workers(user_id);
CREATE INDEX idx_employers_user_id ON employers(user_id);
CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_applications_worker ON job_applications(worker_id);
CREATE INDEX idx_hiring_requests_worker ON hiring_requests(worker_id);
CREATE INDEX idx_assignments_worker ON worker_assignments(worker_id);

-- Set the default charset to utf8mb4
ALTER DATABASE hireme_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
