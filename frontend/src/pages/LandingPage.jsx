import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import {
  MapPin,
  Star,
  ClipboardList,
  Shield,
  Sliders,
  Headphones,
  ArrowRight,
  User,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Compass,
  Award,
  Zap,
  Activity,
  Layers
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);

  // Redirect authenticated users to their dashboards
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'worker') {
        navigate('/worker/dashboard', { replace: true });
      } else if (user.role === 'employer') {
        navigate('/employer/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const [activeTab, setActiveTab] = useState('worker');
  const [liveWorkersCount, setLiveWorkersCount] = useState(1248);

  // Simple animation simulation for live counter
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveWorkersCount(prev => prev + (Math.random() > 0.4 ? 1 : -1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const featureCards = [
    {
      icon: <MapPin className="w-8 h-8 text-indigo-400" />,
      title: 'Location-Based Matching',
      desc: 'Find jobs or workers nearby with real-time location tracking and distance filters.'
    },
    {
      icon: <Star className="w-8 h-8 text-amber-400" />,
      title: 'Verified Ratings',
      desc: 'Build your reputation with verified reviews and ratings from employers or workers.'
    },
    {
      icon: <ClipboardList className="w-8 h-8 text-emerald-400" />,
      title: 'Easy Job Management',
      desc: 'Post jobs, manage applications, and track hiring all in one place.'
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-400" />,
      title: 'Secure & Safe',
      desc: 'Your data is protected with industry-standard security and encryption.'
    },
    {
      icon: <Sliders className="w-8 h-8 text-purple-400" />,
      title: 'Smart Filtering',
      desc: 'Filter jobs by wages, hours, skills, experience, and more to find the perfect fit.'
    },
    {
      icon: <Headphones className="w-8 h-8 text-pink-400" />,
      title: '24/7 Support',
      desc: 'Get help anytime with our responsive customer support team.'
    }
  ];

  const workerSteps = [
    { num: '01', title: 'Create Profile', desc: 'Sign up and build your worker profile with skills and experience.', icon: <User className="w-5 h-5 text-indigo-500" /> },
    { num: '02', title: 'Find Jobs', desc: 'Browse nearby jobs filtered by your preferences and qualifications.', icon: <Compass className="w-5 h-5 text-indigo-500" /> },
    { num: '03', title: 'Apply', desc: 'Apply for jobs or accept direct requests from employers.', icon: <Layers className="w-5 h-5 text-indigo-500" /> },
    { num: '04', title: 'Get Hired', desc: 'Once hired, update your status, do the job, and start earning.', icon: <Zap className="w-5 h-5 text-indigo-500" /> },
  ];

  const employerSteps = [
    { num: '01', title: 'Create Business', desc: 'Register your business and set up your profile.', icon: <Briefcase className="w-5 h-5 text-indigo-500" /> },
    { num: '02', title: 'Post Jobs', desc: 'Post job listings with location coordinates, requirements, and wages.', icon: <MapPin className="w-5 h-5 text-indigo-500" /> },
    { num: '03', title: 'Review Applications', desc: 'Browse worker profiles, map coordinates, and manage job applications.', icon: <ClipboardList className="w-5 h-5 text-indigo-500" /> },
    { num: '04', title: 'Hire & Rate', desc: 'Hire workers, manage active jobs, and provide ratings per engagement.', icon: <CheckCircle2 className="w-5 h-5 text-indigo-500" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      <Navbar hideLinks={true} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 md:px-8 bg-[#080b3a] overflow-hidden">
        {/* Subtle mesh background grid */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(var(--indigo-500) 1px, transparent 1px), radial-gradient(var(--indigo-600) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }}
        />

        {/* Glowing gradient backdrops */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/4 right-1/10 w-[450px] h-[450px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '9s' }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline & CTA */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold mb-6">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {liveWorkersCount} Skilled Workers Online Now
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                Connect. Work. <br />
                <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  Succeed in Real-Time.
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                HireMe connects skilled local professionals with employers instantly. Utilizing geolocation and direct notifications to streamline matches.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/register?role=worker" 
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 text-center flex items-center justify-center gap-2 group"
                >
                  Work With Us
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/register?role=employer" 
                  className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl font-bold transition-all duration-300 hover:-translate-y-0.5 text-center backdrop-blur-sm"
                >
                  Find Talent
                </Link>
              </div>
            </div>

            {/* Right Column: Premium Interactive Widget Card */}
            <div className="lg:col-span-5 hidden md:block">
              <div className="relative">
                {/* Visual glow frame */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-xl opacity-35 -z-10" />

                {/* Glassmorphic Widget Container */}
                <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl text-white">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-indigo-300 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Live Match Status</div>
                        <div className="text-sm font-bold text-white">Hired Near You</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1 animate-pulse">
                      <Award className="w-3 h-3" /> Top Rated
                    </span>
                  </div>

                  {/* Simulated Worker Card */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 mb-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3">
                      <span className="text-xs text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        2.1 km away
                      </span>
                    </div>

                    <div className="flex gap-4">
                      {/* Avatar with status indicator */}
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                          AC
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f1260] rounded-full" />
                      </div>

                      {/* Bio & Details */}
                      <div>
                        <h3 className="font-bold text-lg text-white mb-0.5">Alex Carter</h3>
                        <p className="text-xs text-slate-400 mb-2.5">Licensed Electrician</p>
                        
                        {/* Rating stars & jobs completed */}
                        <div className="flex items-center gap-1 text-amber-400 text-xs mb-3">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="text-white font-bold ml-1">4.9</span>
                          <span className="text-slate-400 font-normal ml-0.5">(54 reviews)</span>
                        </div>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['Wiring', 'Troubleshooting', 'Commercial'].map((s, idx) => (
                        <span key={idx} className="text-[10px] font-semibold bg-white/5 border border-white/10 rounded-md px-2 py-0.5 text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Quick Metrics Footer */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                      <div className="text-xs text-slate-400 font-medium mb-1">Average Response</div>
                      <div className="text-base font-extrabold text-white flex items-center justify-center gap-1">
                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> 4 Mins
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                      <div className="text-xs text-slate-400 font-medium mb-1">Success Rate</div>
                      <div className="text-base font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                        <TrendingUp className="w-4 h-4 text-emerald-400" /> 98%
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 md:px-8 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Why Choose HireMe?
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              Discover how our modern toolkit makes hiring and finding gig work completely stress-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((card, index) => (
              <div 
                key={index} 
                className="group relative bg-slate-50 border border-slate-200/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 hover:border-indigo-500/30 overflow-hidden"
              >
                {/* Floating hover background glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full group-hover:scale-150 transition-transform duration-500" />

                {/* Icon wrapper */}
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {card.title}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive "How it Works" Tabs */}
      <section className="py-24 px-4 md:px-8 bg-slate-50 border-t border-b border-slate-200/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
              Our automated matching pipeline simplifies the connection process for both sides of the platform.
            </p>

            {/* Styled Toggle Bar */}
            <div className="inline-flex p-1 bg-slate-200/60 rounded-xl mt-8">
              <button
                onClick={() => setActiveTab('worker')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
                  activeTab === 'worker' 
                    ? 'bg-white text-indigo-600 shadow-md' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                For Workers
              </button>
              <button
                onClick={() => setActiveTab('employer')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
                  activeTab === 'employer' 
                    ? 'bg-white text-indigo-600 shadow-md' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                For Employers
              </button>
            </div>
          </div>

          {/* Timeline Layout */}
          <div className="relative pl-6 sm:pl-8 border-l border-indigo-100 space-y-12 max-w-2xl mx-auto mt-16">
            
            {(activeTab === 'worker' ? workerSteps : employerSteps).map((step, idx) => (
              <div key={idx} className="relative group">
                
                {/* Timeline Bullet Node */}
                <div className="absolute -left-[38px] sm:-left-[46px] top-0.5 w-8 h-8 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center shadow-sm z-10 group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-300">
                  {step.icon}
                </div>

                {/* Step Content */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                      Step {step.num}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-8 bg-slate-900 text-white relative overflow-hidden">
        {/* Subtle mesh background grid */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(var(--indigo-500) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            Ready to Find Your Fit?
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto font-medium">
            Join a growing network of skilled workers and local employers who use HireMe every day.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register?role=worker"
              className="px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto text-center"
            >
              Get Started as Worker
            </Link>
            <Link
              to="/register?role=employer"
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto text-center"
            >
              Get Started as Employer
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
