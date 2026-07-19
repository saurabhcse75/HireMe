import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WorkerRegistration from '../components/WorkerRegistration';
import EmployerRegistration from '../components/EmployerRegistration';
import {
  MapPin,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  User,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const RegistrationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') || 'worker';
  const [selectedRole, setSelectedRole] = useState(roleFromUrl);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const navigate = useNavigate();

  // Keep search params in sync when selectedRole changes
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSearchParams({ role });
  };

  const slides = [
    {
      icon: <Zap className="w-8 h-8 text-indigo-400" />,
      title: "Unlock Instant Earnings",
      desc: "Gig workers receive instant match notifications based on proximity, helping you secure jobs without waiting."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
      title: "Earn Certified Reviews",
      desc: "Every completed job earns you verified ratings, building a premium profile that makes you highly sought after."
    },
    {
      icon: <Briefcase className="w-8 h-8 text-amber-400" />,
      title: "Grow Your Local Business",
      desc: "Employers can source top-tier local contractors, manage applications, and coordinate worker locations in real-time."
    }
  ];

  // Auto-play registration features carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row overflow-hidden">
      
      {/* LEFT PANEL: Branding & Registration Benefits Carousel */}
      <div className="md:w-5/12 bg-[#080b3a] relative p-8 md:p-12 flex flex-col justify-between overflow-hidden shrink-0">
        
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

        {/* Carousel Content */}
        <div className="relative z-10 my-auto py-12 max-w-sm">
          <div className="min-h-[180px] flex flex-col justify-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              {slides[carouselIndex].icon}
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-3 leading-tight tracking-tight">
              {slides[carouselIndex].title}
            </h2>
            <p className="text-slate-300 font-medium text-sm leading-relaxed">
              {slides[carouselIndex].desc}
            </p>
          </div>

          {/* Indicators */}
          <div className="flex gap-2 mt-6">
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

      {/* RIGHT PANEL: Scrollable Form Container */}
      <div className="md:w-7/12 bg-slate-950 flex flex-col items-center justify-start p-8 md:p-12 overflow-y-auto max-h-screen">
        <div className="w-full text-right mb-6 shrink-0">
          <span className="text-slate-400 text-sm font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1">
              Sign in
            </Link>
          </span>
        </div>

        <div className="w-full max-w-2xl relative my-auto">
          {/* Title Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Create Your Account</h1>
            <p className="text-slate-400 font-medium">Choose your role and register details to get started</p>
          </div>

          {/* Sliding Pill Role Toggle Switch */}
          <div className="flex justify-center mb-8">
            <div className="relative p-1 bg-slate-900 border border-slate-800 rounded-xl flex w-full max-w-sm">
              {/* Sliding background pill */}
              <div 
                className="absolute top-1 bottom-1 rounded-lg bg-indigo-600 transition-all duration-300 ease-out"
                style={{
                  width: 'calc(50% - 4px)',
                  left: selectedRole === 'worker' ? '4px' : 'calc(50%)'
                }}
              />
              
              <button
                type="button"
                onClick={() => handleRoleChange('worker')}
                className={`relative z-10 w-1/2 py-2.5 rounded-lg text-sm font-bold transition-colors duration-300 flex items-center justify-center gap-2 ${
                  selectedRole === 'worker' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-4 h-4" />
                I'm a Worker
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('employer')}
                className={`relative z-10 w-1/2 py-2.5 rounded-lg text-sm font-bold transition-colors duration-300 flex items-center justify-center gap-2 ${
                  selectedRole === 'employer' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                I'm an Employer
              </button>
            </div>
          </div>

          {/* Form wrapper */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
            {selectedRole === 'worker' ? (
              <WorkerRegistration />
            ) : (
              <EmployerRegistration />
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default RegistrationPage;
