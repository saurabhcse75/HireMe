import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AuthService } from '../services/api';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  UserCheck,
  MapPin,
  ShieldCheck,
  Briefcase,
  ChevronRight
} from 'lucide-react';

const LoginPage = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const slides = [
    {
      icon: <MapPin className="w-8 h-8 text-indigo-400" />,
      title: "Real-Time Location Matching",
      desc: "Connect instantly with local jobs and qualified workers right in your neighborhood using our smart mapping coordinates system."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
      title: "Verified Feedback & Security",
      desc: "Every rating is backed by an active engagement. Say goodbye to spam ratings and hello to trusted talent circles."
    },
    {
      icon: <Briefcase className="w-8 h-8 text-amber-400" />,
      title: "Seamless Gig Management",
      desc: "Easily accept tasks, complete milestones, track active opportunities, and build a digital reputation that gets you hired."
    }
  ];

  // Auto-play features carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Form Validations
    if (!mobileNumber.trim()) {
      setError('Mobile number is required');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    if (mobileNumber.trim().length !== 10 || !/^\d+$/.test(mobileNumber)) {
      setError('Mobile number must be a valid 10-digit number');
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.login(mobileNumber, password);
      const { user, token } = response.data;

      login(user, token);

      // Redirect based on user role
      if (user.role === 'worker') {
        navigate('/worker/dashboard');
      } else if (user.role === 'employer') {
        navigate('/employer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row overflow-hidden">
      
      {/* LEFT PANEL: Branding & Testimonial Carousel */}
      <div className="md:w-1/2 bg-[#080b3a] relative p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        
        {/* Subtle mesh background grid */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(var(--indigo-500) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />
        {/* Floating gradient glow blurs */}
        <div className="absolute -top-10 -left-10 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Branding header */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-400 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/30">
              HM
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              Hire<span className="text-indigo-400">Me</span>
            </span>
          </Link>
        </div>

        {/* Slide-out Content & Carousel Indicators */}
        <div className="relative z-10 my-auto py-12 max-w-md">
          {/* Animated Card Carousel Wrapper */}
          <div className="min-h-[200px] flex flex-col justify-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              {slides[carouselIndex].icon}
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              {slides[carouselIndex].title}
            </h2>
            <p className="text-slate-300 font-medium leading-relaxed">
              {slides[carouselIndex].desc}
            </p>
          </div>

          {/* Indicators */}
          <div className="flex gap-2 mt-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  carouselIndex === idx ? 'w-8 bg-indigo-400' : 'w-2 bg-white/20'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footnote */}
        <div className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} HireMe Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL: Glassmorphic Auth Form Container */}
      <div className="md:w-1/2 bg-slate-950 flex items-center justify-center p-8 md:p-16 relative">
        <div className="absolute top-10 right-10 z-10">
          <span className="text-slate-400 text-sm font-medium">
            New here?{' '}
            <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1">
              Create an account
            </Link>
          </span>
        </div>

        <div className="w-full max-w-md relative">
          {/* Decorative glows behind form */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-slate-400 font-medium">Sign in to resume finding work or hiring talent</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start animate-shake">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* Mobile Input */}
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-bold text-slate-300 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="tel"
                  id="mobileNumber"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                  maxLength="10"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-bold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-11 pr-12 py-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Quick links footer */}
          <div className="mt-8 pt-8 border-t border-slate-900">
            <p className="text-xs text-slate-500 text-center mb-4 font-semibold uppercase tracking-wider">
              Quick Registration Gateways
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/register?role=worker" 
                className="flex items-center justify-between px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all duration-300 text-sm font-bold text-slate-300 hover:text-white group"
              >
                <span>Worker Form</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link 
                to="/register?role=employer" 
                className="flex items-center justify-between px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all duration-300 text-sm font-bold text-slate-300 hover:text-white group"
              >
                <span>Employer Form</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
