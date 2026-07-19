import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/api';
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Sparkles,
  Clock,
  DollarSign,
  Award,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const WorkerRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    address: '',
    skills: '',
    experience: '',
    availabilityTime: '',
    wagesPerHour: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (formData.mobileNumber.trim().length !== 10 || !/^\d+$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be a 10-digit number';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.address.trim()) newErrors.address = 'Residential address is required';
    if (!formData.skills.trim()) newErrors.skills = 'Please enter at least one skill';
    if (!formData.experience) newErrors.experience = 'Experience level is required';
    if (!formData.availabilityTime) newErrors.availabilityTime = 'Availability selection is required';
    if (!formData.wagesPerHour || isNaN(formData.wagesPerHour) || parseFloat(formData.wagesPerHour) <= 0) {
      newErrors.wagesPerHour = 'Enter a valid positive hourly wage';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const getSkillsList = () => {
    if (!formData.skills.trim()) return [];
    return formData.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await AuthService.registerWorker({
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        address: formData.address,
        skills: getSkillsList(),
        experience: formData.experience,
        availabilityTime: formData.availabilityTime,
        wagesPerHour: parseFloat(formData.wagesPerHour),
        role: 'worker',
      });

      setSuccessMessage('Registration successful! Redirecting to login page...');
      setErrors({});
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please review fields and try again.';
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3 items-center animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-emerald-300 text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-center animate-shake">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm font-semibold">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 text-white">
        
        {/* Row 1: Name & Mobile Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-slate-300 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`block w-full pl-10 pr-4 py-3 bg-slate-900 border ${
                  errors.name ? 'border-red-500' : 'border-slate-800'
                } rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm`}
              />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-bold text-slate-300 mb-1.5">
              Mobile Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="10-digit number"
                maxLength="10"
                className={`block w-full pl-10 pr-4 py-3 bg-slate-900 border ${
                  errors.mobileNumber ? 'border-red-500' : 'border-slate-800'
                } rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm`}
              />
            </div>
            {errors.mobileNumber && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.mobileNumber}</p>}
          </div>
        </div>

        {/* Row 2: Passwords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-slate-300 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 chars"
                className={`block w-full pl-10 pr-10 py-3 bg-slate-900 border ${
                  errors.password ? 'border-red-500' : 'border-slate-800'
                } rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-300 mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={`block w-full pl-10 pr-10 py-3 bg-slate-900 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-slate-800'
                } rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Row 3: Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-bold text-slate-300 mb-1.5">
            Residential Address *
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3.5 pointer-events-none">
              <MapPin className="h-4 w-4 text-slate-500" />
            </div>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full address details"
              rows="2"
              className={`block w-full pl-10 pr-4 py-3 bg-slate-900 border ${
                errors.address ? 'border-red-500' : 'border-slate-800'
              } rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm`}
            />
          </div>
          {errors.address && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
        </div>

        {/* Row 4: Skills Input & Dynamic Helper Chips */}
        <div>
          <label htmlFor="skills" className="block text-sm font-bold text-slate-300 mb-1.5">
            Skills * <span className="text-slate-500 text-xs font-semibold">(Comma-separated list)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Sparkles className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. Electrical, Plumbing, Carpentry"
              className={`block w-full pl-10 pr-4 py-3 bg-slate-900 border ${
                errors.skills ? 'border-red-500' : 'border-slate-800'
              } rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm`}
            />
          </div>
          
          {/* Dynamic Chip Visualizer */}
          {getSkillsList().length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
              {getSkillsList().map((skill, idx) => (
                <span key={idx} className="inline-flex items-center text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md">
                  {skill}
                </span>
              ))}
            </div>
          )}
          {errors.skills && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.skills}</p>}
        </div>

        {/* Row 5: Experience, Availability & Wages per Hour */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Experience */}
          <div>
            <label htmlFor="experience" className="block text-sm font-bold text-slate-300 mb-1.5">
              Experience *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Award className="h-4 w-4 text-slate-500" />
              </div>
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className={`block w-full pl-10 pr-4 py-3 bg-slate-900 border ${
                  errors.experience ? 'border-red-500' : 'border-slate-800'
                } rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm`}
              >
                <option value="" className="bg-slate-900 text-slate-500">Select level</option>
                <option value="0-1" className="bg-slate-900 text-white">0-1 year</option>
                <option value="1-3" className="bg-slate-900 text-white">1-3 years</option>
                <option value="3-5" className="bg-slate-900 text-white">3-5 years</option>
                <option value="5-10" className="bg-slate-900 text-white">5-10 years</option>
                <option value="10+" className="bg-slate-900 text-white">10+ years</option>
              </select>
            </div>
            {errors.experience && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.experience}</p>}
          </div>

          {/* Availability */}
          <div>
            <label htmlFor="availabilityTime" className="block text-sm font-bold text-slate-300 mb-1.5">
              Availability *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-slate-500" />
              </div>
              <select
                id="availabilityTime"
                name="availabilityTime"
                value={formData.availabilityTime}
                onChange={handleChange}
                className={`block w-full pl-10 pr-4 py-3 bg-slate-900 border ${
                  errors.availabilityTime ? 'border-red-500' : 'border-slate-800'
                } rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm`}
              >
                <option value="" className="bg-slate-900 text-slate-500">Select availability</option>
                <option value="part-time" className="bg-slate-900 text-white">Part-time</option>
                <option value="full-time" className="bg-slate-900 text-white">Full-time</option>
                <option value="flexible" className="bg-slate-900 text-white">Flexible</option>
                <option value="weekends" className="bg-slate-900 text-white">Weekends only</option>
              </select>
            </div>
            {errors.availabilityTime && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.availabilityTime}</p>}
          </div>

          {/* Wages Per Hour */}
          <div>
            <label htmlFor="wagesPerHour" className="block text-sm font-bold text-slate-300 mb-1.5">
              Wages/Hr * <span className="text-slate-500 text-[10px] font-semibold">(INR)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="number"
                id="wagesPerHour"
                name="wagesPerHour"
                value={formData.wagesPerHour}
                onChange={handleChange}
                placeholder="300"
                step="any"
                min="0"
                className={`block w-full pl-10 pr-4 py-3 bg-slate-900 border ${
                  errors.wagesPerHour ? 'border-red-500' : 'border-slate-800'
                } rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm`}
              />
            </div>
            {errors.wagesPerHour && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.wagesPerHour}</p>}
          </div>

        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
        >
          {loading ? 'Creating Worker Account...' : 'Create Worker Account'}
        </button>

      </form>
    </div>
  );
};

export default WorkerRegistration;
