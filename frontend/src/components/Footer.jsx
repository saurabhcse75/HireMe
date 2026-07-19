import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ExternalLink,
  Shield,
  X
} from 'lucide-react';

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <footer className="bg-slate-950 text-white py-16 px-6 md:px-12 relative border-t border-slate-900">
      
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Social Media links */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-2 rounded-xl font-black text-xl shadow-md">
                HM
              </div>
              <span className="font-extrabold text-xl tracking-tight">
                Hire<span className="text-indigo-400">Me</span>
              </span>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time local matching. Building local networks, securing gig work opportunities, and validating reputation.
            </p>

            {/* Social Media Link Buttons */}
            <div className="flex gap-3 pt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300 shadow-sm"
                aria-label="Github"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300 shadow-sm"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300 shadow-sm"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="https://yourportfolio.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300 shadow-sm"
                aria-label="Portfolio"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links for Workers */}
          <div>
            <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wider">For Workers</h4>
            <ul className="space-y-2.5 text-slate-400 text-sm font-medium">
              <li>
                <Link to="/register?role=worker" className="hover:text-indigo-400 transition-colors">
                  Find Jobs Nearby
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">
                  Worker Dashboard
                </Link>
              </li>
              <li>
                <Link to="/register?role=worker" className="hover:text-indigo-400 transition-colors">
                  Registration Gate
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wider">For Employers</h4>
            <ul className="space-y-2.5 text-slate-400 text-sm font-medium">
              <li>
                <Link to="/register?role=employer" className="hover:text-indigo-400 transition-colors">
                  Post a Gig Opportunity
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">
                  Employer Console
                </Link>
              </li>
              <li>
                <Link to="/register?role=employer" className="hover:text-indigo-400 transition-colors">
                  Hire Local Talent
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div>
            <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wider">Support Hub</h4>
            <ul className="space-y-2.5 text-slate-400 text-sm font-medium">
              <li>
                <a href="mailto:support@hireme.com" className="hover:text-indigo-400 transition-colors">
                  support@hireme.com
                </a>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  System Status: Online
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="border-t border-slate-900 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright & Portfolio Attribution */}
            <div className="text-slate-400 text-sm flex flex-wrap items-center justify-center md:justify-start gap-1.5 text-center md:text-left">
              <span>© {new Date().getFullYear()} HireMe. All rights reserved.</span>
              <span className="hidden md:inline text-slate-800">|</span>
              <span className="flex items-center gap-1">
                Created with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> by 
                <a 
                  href="https://yourportfolio.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors inline-flex items-center gap-0.5 group"
                >
                  Your Portfolio Name
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </span>
            </div>

            {/* Links Panel */}
            <div className="flex gap-6 text-slate-400 text-sm font-semibold">
              <button 
                onClick={() => setShowPrivacy(true)} 
                className="hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
              >
                Privacy Policy
              </button>
              <span className="text-slate-500">Terms of Service</span>
            </div>

          </div>
        </div>
      </div>

      {/* PRIVACY POLICY MODAL CONTAINER */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative text-slate-300 animate-scale-in">
            
            {/* Close Button */}
            <button
              onClick={() => setShowPrivacy(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Privacy Policy</h3>
                  <p className="text-xs text-slate-500">Last updated: June 2026</p>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 text-sm leading-relaxed font-medium">
                <p>
                  At HireMe, your privacy is our highest priority. This Privacy Policy details how we collect, store, and utilize coordinates and contact metrics.
                </p>
                <h4 className="font-bold text-white text-base mt-2">1. Geolocation Consent</h4>
                <p>
                  To successfully match local jobs with available nearby workers, the platform requests geolocation coordinates. These coordinates are captured solely during registration or job posting to compute relative distances.
                </p>
                <h4 className="font-bold text-white text-base mt-2">2. Information Security</h4>
                <p>
                  Your information (including mobile numbers and passwords) is safely encrypted and stored. We do not sell, lease, or share personal profile details with third-party advertising companies.
                </p>
                <h4 className="font-bold text-white text-base mt-2">3. User Controls</h4>
                <p>
                  Users maintain full authority over their account statistics. You can close postings or delete your profiles directly from your respective consoles at any time.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all"
                >
                  I Understand
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </footer>
  );
};

export default Footer;
