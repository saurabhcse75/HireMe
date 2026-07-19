USE hireme_db;

-- workers
ALTER TABLE workers DROP FOREIGN KEY workers_ibfk_1;
ALTER TABLE workers ADD CONSTRAINT workers_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- employers
ALTER TABLE employers DROP FOREIGN KEY employers_ibfk_1;
ALTER TABLE employers ADD CONSTRAINT employers_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- jobs
ALTER TABLE jobs DROP FOREIGN KEY jobs_ibfk_1;
ALTER TABLE jobs ADD CONSTRAINT jobs_ibfk_1 FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- job_applications
ALTER TABLE job_applications DROP FOREIGN KEY job_applications_ibfk_1;
ALTER TABLE job_applications DROP FOREIGN KEY job_applications_ibfk_2;
ALTER TABLE job_applications ADD CONSTRAINT job_applications_ibfk_1 FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE job_applications ADD CONSTRAINT job_applications_ibfk_2 FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- hiring_requests
ALTER TABLE hiring_requests DROP FOREIGN KEY hiring_requests_ibfk_1;
ALTER TABLE hiring_requests DROP FOREIGN KEY hiring_requests_ibfk_2;
ALTER TABLE hiring_requests ADD CONSTRAINT hiring_requests_ibfk_1 FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE hiring_requests ADD CONSTRAINT hiring_requests_ibfk_2 FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- worker_assignments
ALTER TABLE worker_assignments DROP FOREIGN KEY worker_assignments_ibfk_1;
ALTER TABLE worker_assignments DROP FOREIGN KEY worker_assignments_ibfk_2;
ALTER TABLE worker_assignments DROP FOREIGN KEY worker_assignments_ibfk_3;
ALTER TABLE worker_assignments ADD CONSTRAINT worker_assignments_ibfk_1 FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE worker_assignments ADD CONSTRAINT worker_assignments_ibfk_2 FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE worker_assignments ADD CONSTRAINT worker_assignments_ibfk_3 FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ratings
ALTER TABLE ratings DROP FOREIGN KEY ratings_ibfk_1;
ALTER TABLE ratings DROP FOREIGN KEY ratings_ibfk_2;
ALTER TABLE ratings DROP FOREIGN KEY fk_ratings_assignment;
ALTER TABLE ratings ADD CONSTRAINT ratings_ibfk_1 FOREIGN KEY (rater_id) REFERENCES employers(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE ratings ADD CONSTRAINT ratings_ibfk_2 FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE ratings ADD CONSTRAINT fk_ratings_assignment FOREIGN KEY (assignment_id) REFERENCES worker_assignments(id) ON DELETE CASCADE ON UPDATE CASCADE;
