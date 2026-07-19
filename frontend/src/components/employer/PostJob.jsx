import React, { useState, useEffect } from 'react';
import { EmployerService } from '../../services/api';
import {
  FileText,
  MapPin,
  Settings,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Navigation,
  Plus,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  { label: 'Details', icon: FileText },
  { label: 'Location', icon: MapPin },
  { label: 'Requirements', icon: Settings },
  { label: 'Review', icon: CheckCircle },
];

const PostJob = ({ onPosted }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    locationName: '',
    latitude: '',
    longitude: '',
    requiredSkills: [],
    minExperience: '',
    wagesPerHour: '',
    workingHours: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [locationStatus, setLocationStatus] = useState('pending'); // 'pending', 'fetching', 'success', 'error'

  useEffect(() => {
    fetchLocationBackground();
  }, []);

  const fetchLocationBackground = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('fetching');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(8),
          longitude: position.coords.longitude.toFixed(8),
        }));
        setLocationStatus('success');
        setFieldErrors(prev => ({ ...prev, latitude: '', longitude: '' }));
      },
      (err) => {
        console.warn('Geolocation fetch in background failed:', err);
        setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skill),
    }));
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 0) {
      if (!formData.title.trim()) errors.title = 'Job title is required';
      if (!formData.description.trim()) errors.description = 'Description is required';
    } else if (step === 1) {
      if (!formData.locationName.trim()) errors.locationName = 'Location name is required';
      if (!formData.latitude) errors.latitude = 'Latitude is required';
      if (!formData.longitude) errors.longitude = 'Longitude is required';
    } else if (step === 2) {
      if (!formData.wagesPerHour) errors.wagesPerHour = 'Wages per hour is required';
      if (!formData.workingHours) errors.workingHours = 'Working hours is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      setError('');
    }
  };

  const goBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setError('');
  };

  const goToStep = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    setError('');
    try {
      setLoading(true);
      await EmployerService.postJob({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        wagesPerHour: parseFloat(formData.wagesPerHour),
        workingHours: parseInt(formData.workingHours),
      });
      setSuccess(true);
      setTimeout(() => {
        onPosted?.();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
        <div style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: 'var(--green-50)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-5)',
          animation: 'bounceIn 0.6s ease-out',
        }}>
          <CheckCircle size={36} style={{ color: 'var(--green-500)' }} />
        </div>
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 'var(--space-2)' }}>
          Job Posted Successfully! 🎉
        </h3>
        <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
          Your job listing is now live and visible to workers nearby
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Step Indicator */}
      <div className="wizard-steps">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.label}>
            <div
              className={`wizard-step ${i === currentStep ? 'wizard-step--active' : ''} ${i < currentStep ? 'wizard-step--completed' : ''}`}
              onClick={() => goToStep(i)}
              style={{ cursor: i < currentStep ? 'pointer' : 'default' }}
            >
              <div className="wizard-step-circle">
                {i < currentStep ? <CheckCircle size={18} /> : i + 1}
              </div>
              <span className="wizard-step-label">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`wizard-connector ${i < currentStep ? 'wizard-connector--completed' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          background: 'var(--red-50)',
          border: '1px solid var(--red-100)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-6)',
          color: 'var(--red-600)',
          fontSize: 'var(--text-sm)',
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Step 0: Job Details */}
      {currentStep === 0 && (
        <div className="animate-fade-in">
          <div className="form-group">
            <label className="form-label">Job Title <span className="form-label-required">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Experienced Plumber Needed"
              className={`form-input ${fieldErrors.title ? 'form-input--error' : ''}`}
            />
            {fieldErrors.title && <div className="form-error"><AlertCircle size={12} /> {fieldErrors.title}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Job Description <span className="form-label-required">*</span></label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job, requirements, and any important details..."
              className={`form-textarea ${fieldErrors.description ? 'form-input--error' : ''}`}
              rows={5}
            />
            {fieldErrors.description && <div className="form-error"><AlertCircle size={12} /> {fieldErrors.description}</div>}
          </div>
        </div>
      )}

      {/* Step 1: Location */}
      {currentStep === 1 && (
        <div className="animate-fade-in">
          <div className="form-group">
            <label className="form-label">Location Name <span className="form-label-required">*</span></label>
            <input
              type="text"
              name="locationName"
              value={formData.locationName}
              onChange={handleChange}
              placeholder="e.g., Downtown Construction Site"
              className={`form-input ${fieldErrors.locationName ? 'form-input--error' : ''}`}
            />
            {fieldErrors.locationName && <div className="form-error"><AlertCircle size={12} /> {fieldErrors.locationName}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Coordinates <span className="form-label-required">*</span></label>
            
            {locationStatus === 'fetching' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--navy-50)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--navy-700)',
                fontSize: 'var(--text-sm)',
              }}>
                <div style={{
                  width: 16, height: 16,
                  border: '2px solid var(--navy-200)',
                  borderTop: '2px solid var(--navy-700)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <span>Auto-fetching coordinates in background...</span>
              </div>
            )}

            {locationStatus === 'success' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--green-50)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--green-700)',
                fontSize: 'var(--text-sm)',
                border: '1px solid var(--green-100)',
              }}>
                <CheckCircle size={16} style={{ color: 'var(--green-500)' }} />
                <div>
                  <strong>Location Fetched:</strong> {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                </div>
              </div>
            )}

            {locationStatus === 'error' && (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--red-50)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--red-700)',
                fontSize: 'var(--text-sm)',
                border: '1px solid var(--red-100)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <AlertCircle size={16} style={{ color: 'var(--red-500)' }} />
                  <span>Failed to auto-fetch location coordinates.</span>
                </div>
                <button
                  type="button"
                  onClick={fetchLocationBackground}
                  className="btn-dash btn-dash--danger btn-dash--sm"
                  style={{ width: 'fit-content', marginTop: '4px' }}
                >
                  <Navigation size={12} /> Retry Fetching Location
                </button>
              </div>
            )}

            {locationStatus === 'pending' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--gray-600)',
                fontSize: 'var(--text-sm)',
              }}>
                <span>Preparing location service...</span>
              </div>
            )}

            {(fieldErrors.latitude || fieldErrors.longitude) && (
              <div className="form-error" style={{ marginTop: 'var(--space-2)' }}>
                <AlertCircle size={12} /> Location coordinates must be fetched before proceeding.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Requirements */}
      {currentStep === 2 && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
            <div className="form-group">
              <label className="form-label">Wages per Hour (₹) <span className="form-label-required">*</span></label>
              <input
                type="number"
                name="wagesPerHour"
                value={formData.wagesPerHour}
                onChange={handleChange}
                placeholder="e.g., 500"
                className={`form-input ${fieldErrors.wagesPerHour ? 'form-input--error' : ''}`}
                min="0"
                step="10"
              />
              {fieldErrors.wagesPerHour && <div className="form-error"><AlertCircle size={12} /> {fieldErrors.wagesPerHour}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Working Hours <span className="form-label-required">*</span></label>
              <input
                type="number"
                name="workingHours"
                value={formData.workingHours}
                onChange={handleChange}
                placeholder="e.g., 8"
                className={`form-input ${fieldErrors.workingHours ? 'form-input--error' : ''}`}
                min="0"
              />
              {fieldErrors.workingHours && <div className="form-error"><AlertCircle size={12} /> {fieldErrors.workingHours}</div>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Experience</label>
            <select name="minExperience" value={formData.minExperience} onChange={handleChange} className="form-select">
              <option value="">Not Required</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Required Skills</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="e.g., Plumbing"
                className="form-input"
                style={{ flex: 1 }}
              />
              <button type="button" onClick={handleAddSkill} className="btn-dash btn-dash--primary">
                <Plus size={16} /> Add
              </button>
            </div>
            {formData.requiredSkills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {formData.requiredSkills.map((skill) => (
                  <span key={skill} className="skill-chip skill-chip--removable">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="skill-chip-remove">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <div className="animate-fade-in">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--blue-50)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
            fontSize: 'var(--text-sm)',
            color: 'var(--blue-600)',
            fontWeight: 500,
          }}>
            <Sparkles size={16} />
            Review your job details before posting
          </div>

          {[
            { label: 'Job Title', value: formData.title, step: 0 },
            { label: 'Description', value: formData.description, step: 0 },
            { label: 'Location', value: formData.locationName, step: 1 },
            { label: 'Coordinates', value: formData.latitude ? `${formData.latitude}, ${formData.longitude}` : '—', step: 1 },
            { label: 'Wages/Hour', value: formData.wagesPerHour ? `₹${formData.wagesPerHour}` : '—', step: 2 },
            { label: 'Working Hours', value: formData.workingHours ? `${formData.workingHours} hrs/day` : '—', step: 2 },
            { label: 'Min Experience', value: formData.minExperience || 'Not required', step: 2 },
            { label: 'Skills', value: formData.requiredSkills.length > 0 ? formData.requiredSkills.join(', ') : 'None specified', step: 2 },
          ].map((item) => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: 'var(--space-3) 0',
              borderBottom: '1px solid var(--gray-100)',
            }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-800)', fontWeight: 500, maxWidth: 400, wordBreak: 'break-word' }}>
                  {item.value}
                </div>
              </div>
              <button
                className="btn-dash btn-dash--ghost btn-dash--sm"
                onClick={() => goToStep(item.step)}
                style={{ flexShrink: 0 }}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 'var(--space-8)',
        paddingTop: 'var(--space-5)',
        borderTop: '1px solid var(--gray-100)',
      }}>
        {currentStep > 0 ? (
          <button className="btn-dash btn-dash--secondary" onClick={goBack}>
            <ChevronLeft size={16} /> Back
          </button>
        ) : (
          <div />
        )}
        {currentStep < STEPS.length - 1 ? (
          <button className="btn-dash btn-dash--primary" onClick={goNext}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            className="btn-dash btn-dash--success"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Posting...' : '📤 Post Job'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PostJob;
