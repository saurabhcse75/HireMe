import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/api';
import {
  Briefcase,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  AlertCircle,
  CheckCircle,
  Navigation,
  Loader2
} from 'lucide-react';

const EmployerRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    latitude: '',
    longitude: '',
    locationName: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [geoError, setGeoError] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Business name is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (formData.mobileNumber.trim().length !== 10 || !/^\d+$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be a 10-digit number';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Geolocation coordinates are required. Please trigger "Get Current Location"';
    }
    if (!formData.locationName.trim()) newErrors.locationName = 'Location name / branch is required';

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

  const getLocation = () => {
    setFetchingLocation(true);
    setGeoError('');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));
          setFetchingLocation(false);
          setErrors((prev) => ({
            ...prev,
            location: '',
          }));
        },
        (error) => {
          setFetchingLocation(false);
          setGeoError('Unable to fetch location. Please check browser permissions.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setFetchingLocation(false);
      setGeoError('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await AuthService.registerEmployer({
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        locationName: formData.locationName,
        role: 'employer',
      });

      setSuccessMessage('Registration successful! Redirecting to login page...');
      setErrors({});
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please check fields and try again.';
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
        
        {/* Row 1: Business Name & Mobile Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-slate-300 mb-1.5">
              Business Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Briefcase className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Apex Services Ltd."
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

        {/* Row 3: Location Coordinates Widget Card */}
        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4" /> Business Location Coordinates
            </h3>
            {formData.latitude && formData.longitude && (
              <span className="text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                Captured ✓
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                To connect you with nearby workers, we need your business location coordinates. Select the option below to fetch current location.
              </p>
            </div>
            
            <button
              type="button"
              onClick={getLocation}
              disabled={fetchingLocation}
              className="flex-shrink-0 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[170px]"
            >
              {fetchingLocation ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Fetching coordinates...
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  Get Current Location
                </>
              )}
            </button>
          </div>

          {geoError && (
            <p className="text-orange-400 text-xs mt-1.5 flex items-center gap-1 bg-orange-500/5 p-2 rounded-lg border border-orange-500/10">
              <AlertCircle className="w-3.5 h-3.5" /> {geoError}
            </p>
          )}

          {/* Coordinates captured badge overlay instead of standard input fields */}
          {formData.latitude && formData.longitude ? (
            <div className="bg-indigo-500/5 border border-indigo-500/10 p-3.5 rounded-xl flex items-center justify-between gap-3 text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Geo Coordinates captured</div>
                  <div className="text-xs font-semibold text-slate-300">
                    Latitude: <span className="text-white">{parseFloat(formData.latitude).toFixed(5)}</span>, 
                    Longitude: <span className="text-white"> {parseFloat(formData.longitude).toFixed(5)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            errors.location && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.location}
              </p>
            )
          )}
        </div>

        {/* Row 4: Location Name/Branch Info */}
        <div>
          <label htmlFor="locationName" className="block text-sm font-bold text-slate-300 mb-1.5">
            Location Name / Address *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              id="locationName"
              name="locationName"
              value={formData.locationName}
              onChange={handleChange}
              placeholder="e.g. Downtown Office, Main Branch"
              className={`block w-full pl-10 pr-4 py-3 bg-slate-900 border ${
                errors.locationName ? 'border-red-500' : 'border-slate-800'
              } rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm`}
            />
          </div>
          {errors.locationName && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.locationName}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
        >
          {loading ? 'Creating Employer Account...' : 'Create Employer Account'}
        </button>

      </form>
    </div>
  );
};

export default EmployerRegistration;
