/**
 * MentorMatch - Main Application Component
 * Premium mentorship marketplace with glassmorphic design
 */
 
import React, { useState, useEffect, useCallback } from 'react';
import { Mentor, MatchResult, Booking, User } from './types';
import { repository } from './repository';
import { matchingStrategy } from './matchingStrategy';
import { notificationService, createToastListener } from './notificationService';
import { useSearch, useToast, useModal, useAsync, useBookingForm } from './hooks';
 
/**
 * Styles - Glassmorphic Design System
 */
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
 
  :root {
    --primary: #5d4037;
    --primary-light: #8d6e63;
    --primary-dark: #3e2723;
    --success: #6d8b74;
    --danger: #9c6644;
    --warning: #b08968;
    --bg-primary: #fdfcfb;
    --bg-secondary: #ffffff;
    --bg-glass: rgba(253, 252, 251, 0.82);
    --text-primary: #2d241e;
    --text-secondary: #6d5d51;
    --border: rgba(93, 64, 55, 0.12);
    --shadow: 0 10px 15px -3px rgba(93, 64, 55, 0.1), 0 4px 6px -4px rgba(93, 64, 55, 0.1);
    --shadow-sm: 0 1px 3px 0 rgba(93, 64, 55, 0.05), 0 1px 2px -1px rgba(93, 64, 55, 0.05);
  }
 
  html, body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    min-height: 100vh;
    scroll-behavior: smooth;
  }
 
  /* Glassmorphic card - Light Mode Refined */
  .glass {
    background: var(--bg-glass);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: var(--shadow-sm);
  }
 
  .glass-hover:hover {
    background: #ffffff;
    border-color: var(--primary-light);
    transform: translateY(-4px);
    box-shadow: var(--shadow);
  }
 
  /* Buttons */
  .btn {
    padding: 12px 28px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
 
  .btn-primary {
    background: var(--primary);
    color: white;
    box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.3);
  }
 
  .btn-primary:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
  }
 
  .btn-secondary {
    background: white;
    border: 1px solid var(--border);
    color: var(--text-primary);
  }
 
  .btn-secondary:hover {
    background: var(--bg-primary);
    border-color: var(--primary-light);
  }
 
  .btn-success {
    background: var(--success);
    color: white;
  }
 
  .btn-success:hover {
    background: #059669;
  }
 
  .btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
 
  /* Input fields */
  input, textarea, select {
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px;
    color: var(--text-primary);
    font-size: 15px;
    transition: all 0.2s ease;
  }
 
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  }
 
  /* Badges */
  .badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
  }
 
 
  .badge-success {
    background: rgba(16, 185, 129, 0.2);
    color: var(--success);
  }
 
  /* Loading */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
 
  .loading {
    animation: spin 1s linear infinite;
  }
 
  /* Toast notifications */
  .toast {
    padding: 14px 16px;
    border-radius: 8px;
    margin-bottom: 10px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease;
  }
 
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
 
  .toast-success {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid var(--success);
    color: var(--success);
  }
 
  .toast-error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--danger);
    color: var(--danger);
  }
 
  .toast-info {
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid var(--primary);
    color: var(--primary-light);
  }
 
  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }
 
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
 
  .modal {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
  }
 
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
 
  /* Utility classes */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }
 
  .grid {
    display: grid;
    gap: 20px;
  }
 
  .grid-2 {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
 
  .flex {
    display: flex;
  }
 
  .flex-col {
    flex-direction: column;
  }
 
  .gap-4 {
    gap: 16px;
  }
 
  .gap-2 {
    gap: 8px;
  }
 
  .mt-4 {
    margin-top: 16px;
  }
 
  .mb-4 {
    margin-bottom: 16px;
  }
 
  .text-center {
    text-align: center;
  }
 
  .opacity-75 {
    opacity: 0.75;
  }
 
  .text-sm {
    font-size: 13px;
  }
 
  .font-semibold {
    font-weight: 600;
  }

  /* Landing Page specific styles */
  .hero-section {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 24px;
    position: relative;
    overflow: hidden;
  }

  .hero-bg {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(93, 64, 55, 0.12) 0%, transparent 50%);
    animation: rotate 20s linear infinite;
    z-index: -1;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .hero-title {
    font-size: clamp(2.5rem, 8vw, 4.5rem);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 24px;
    background: linear-gradient(135deg, #2d241e 0%, #5d4037 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-subtitle {
    font-size: clamp(1.1rem, 3vw, 1.4rem);
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto 40px;
    line-height: 1.6;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
    width: 100%;
    max-width: 1000px;
    margin-top: 60px;
  }

  .stat-card {
    padding: 24px;
    text-align: center;
  }

  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: var(--primary-light);
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 14px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .features-section {
    padding: 100px 24px;
    background: rgba(15, 23, 42, 0.5);
  }

  .section-title {
    font-size: 32px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 48px;
  }

  .feature-card {
    padding: 32px;
    height: 100%;
    transition: all 0.3s ease;
  }

  .feature-icon {
    width: 48px;
    height: 48px;
    background: rgba(93, 64, 55, 0.08);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 20px;
    color: var(--primary-light);
  }

  .view-transition {
    animation: fadeInScale 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.98);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .cta-card {
    padding: 48px;
    text-align: center;
    background: linear-gradient(135deg, rgba(93, 64, 55, 0.08) 0%, rgba(109, 139, 116, 0.05) 100%);
    border: 1px solid rgba(93, 64, 55, 0.15);
    margin-top: 80px;
  }
`;
 
/**
 * Toast Container Component
 */
const ToastContainer: React.FC<{ toasts: any[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove,
}) => (
  <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 2000 }}>
    {toasts.map((toast) => (
      <div key={toast.id} className={`toast toast-${toast.type}`}>
        <span>{toast.message}</span>
        <button
          onClick={() => onRemove(toast.id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          ✕
        </button>
      </div>
    ))}
  </div>
);
 
/**
 * Mentor Card Component
 */
const MentorCard: React.FC<{
  mentorResult: MatchResult;
  onBook: (mentor: Mentor) => void;
}> = ({ mentorResult, onBook }) => {
  const { mentor, matchScore, matchReasons } = mentorResult;
 
  return (
    <div className="glass glass-hover" style={{ padding: '20px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <img
          src={mentor.image || 'https://via.placeholder.com/80'}
          alt={mentor.name}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            objectFit: 'cover',
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600' }}>
                {mentor.name}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                {mentor.title}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'var(--primary-light)',
                  marginBottom: '4px',
                }}
              >
                {matchScore}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Match</div>
            </div>
          </div>
 
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {mentor.expertise.slice(0, 3).map((skill) => (
              <span key={skill} className="badge badge-primary">
                {skill}
              </span>
            ))}
          </div>
 
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {matchReasons.slice(0, 2).map((reason, i) => (
              <div key={i}>{reason}</div>
            ))}
          </div>
 
          <button
            className="btn btn-primary"
            onClick={() => onBook(mentor)}
            style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
          >
            Book Session
          </button>
        </div>
      </div>
    </div>
  );
};
 
/**
 * Booking Modal Component
 */
const BookingModal: React.FC<{
  mentor: Mentor | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}> = ({ mentor, isOpen, onClose, onSubmit, isSubmitting }) => {
  const { formData, updateField, isValid } = useBookingForm();
 
  if (!isOpen || !mentor) return null;
 
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Book Session with {mentor.name}</h2>
        </div>
 
        <div style={{ padding: '24px' }}>
          <div className="gap-4 flex flex-col">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
 
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Topic
              </label>
              <input
                type="text"
                placeholder="What do you want to discuss?"
                value={formData.topic}
                onChange={(e) => updateField('topic', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
 
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Duration (minutes)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => updateField('duration', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'var(--text-primary)',
                }}
              >
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
 
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Notes (Optional)
              </label>
              <textarea
                placeholder="Any additional context..."
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={3}
                style={{ width: '100%', resize: 'none' }}
              />
            </div>
 
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                onClick={onClose}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                className={`btn btn-success ${!isValid || isSubmitting ? 'btn-disabled' : ''}`}
                onClick={() => onSubmit(formData)}
                disabled={!isValid || isSubmitting}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {isSubmitting ? '⏳ Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * FAQ Item Component
 */
const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="glass" style={{ marginBottom: '16px', overflow: 'hidden' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}
      >
        {question}
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: '0 24px 20px', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
          {answer}
        </div>
      )}
    </div>
  );
};

/**
 * Auth Page Component (Login / Sign Up)
 */
const AuthPage: React.FC<{ 
  initialMode: 'login' | 'signup';
  onBack: () => void;
  onSuccess: (user: User) => void;
}> = ({ initialMode, onBack, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: mode === 'signup' ? name : email.split('@')[0],
        email: email,
        role: 'student',
        level: 'beginner',
        goals: []
      };
      setIsLoading(false);
      onSuccess(mockUser);
    }, 1500);
  };

  return (
    <div className="view-transition" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgba(93, 64, 55, 0.05) 0%, transparent 40%)'
    }}>
      <div className="glass" style={{ width: '400px', padding: '40px' }}>
        <button className="btn-secondary" onClick={onBack} style={{ border: 'none', background: 'none', padding: 0, marginBottom: '24px', cursor: 'pointer', fontSize: '14px' }}>
          ← Back to Site
        </button>
        
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
          {mode === 'login' ? 'Sign in to continue your journey.' : 'Join the elite engineering circle today.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                style={{ width: '100%' }} 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="john@example.com" 
              style={{ width: '100%' }} 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              style={{ width: '100%' }} 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={isLoading} style={{ marginTop: '12px', width: '100%', height: '50px' }}>
            {isLoading ? '⏳ Authenticating...' : mode === 'login' ? 'Sign In' : 'Join Now'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              fontWeight: '600', 
              cursor: 'pointer' 
            }}
          >
            {mode === 'login' ? 'Join for free' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Landing Page Component
 */
const LandingPage: React.FC<{ 
  onGetStarted: () => void;
  onLogin: () => void;
}> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="view-transition">
      {/* Navigation */}
      <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => window.location.reload()}>MentorMatch</h2>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="#how-it-works" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: '500' }}>Process</a>
          <a href="#features" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: '500' }}>Features</a>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={onLogin}>Log In</button>
            <button className="btn btn-primary" onClick={onGetStarted}>Join Free</button>
          </div>
        </div>
      </nav>

      <section className="hero-section" style={{ padding: '40px 0 100px' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap-reverse' }}>
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h1 className="hero-title">
              Master Engineering <br /> With 1-on-1 Mentoring
            </h1>
            <p className="hero-subtitle">
              Connect with top engineers from Google, Meta, and Netflix. 
              Get personalized guidance to accelerate your career and master modern tech stacks.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={onGetStarted} style={{ padding: '16px 40px', fontSize: '18px' }}>
                Find Your Match Now
              </button>
              <button className="btn btn-secondary" style={{ padding: '16px 30px' }}>
                Become a Mentor
              </button>
            </div>
          </div>
          <div style={{ flex: '1 1 400px', position: 'relative' }}>
            <div className="glass" style={{ padding: '8px', borderRadius: '28px', background: 'rgba(255,255,255,0.4)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}>
              <img 
                src="/assets/hero.png" 
                alt="Mentorship Visualization" 
                style={{ width: '100%', borderRadius: '20px', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="stats-grid" style={{ margin: '0 auto' }}>
            <div className="glass stat-card">
              <div className="stat-value">500+</div>
              <div className="stat-label">Expert Mentors</div>
            </div>
            <div className="glass stat-card">
              <div className="stat-value">12k+</div>
              <div className="stat-label">Sessions Held</div>
            </div>
            <div className="glass stat-card">
              <div className="stat-value">4.9/5</div>
              <div className="stat-label">Avg. Satisfaction</div>
            </div>
            <div className="glass stat-card">
              <div className="stat-value">100%</div>
              <div className="stat-label">Career Growth</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" style={{ padding: '100px 0' }}>
        <div className="container">
          <h2 className="section-title">The Path to Mastery</h2>
          <div className="grid grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div className="glass" style={{ padding: '40px' }}>
              <div className="step-number">1</div>
              <h3 style={{ marginBottom: '16px' }}>Define Your Goals</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Tell us what you want to achieve — from mastering React to scaling distributed systems.</p>
            </div>
            <div className="glass" style={{ padding: '40px' }}>
              <div className="step-number">2</div>
              <h3 style={{ marginBottom: '16px' }}>Get Matched</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Our Strategy algorithms pair you with a mentor who has been exactly where you are.</p>
            </div>
            <div className="glass" style={{ padding: '40px' }}>
              <div className="step-number">3</div>
              <h3 style={{ marginBottom: '16px' }}>Book & Accelerate</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Schedule sessions, set milestones, and start your journey with expert 1-on-1 guidance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section" style={{ background: '#f1f5f9' }}>
        <div className="container">
          <h2 className="section-title">Built for Serious Engineers</h2>
          <div className="grid grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {[
              { icon: '🎯', title: 'Intelligent Ranking', desc: 'Strategy-based matching that actually understands your level.' },
              { icon: '🛡️', title: 'Vetted Quality', desc: 'Every mentor is manually screened for technical and soft skills.' },
              { icon: '📅', title: 'Smart Scheduling', desc: 'Observer-driven notifications keep your sessions on track.' },
              { icon: '🚀', title: 'Project-First', desc: 'Learn by building real-world software with expert code reviews.' },
              { icon: '💎', title: 'Premium Interface', desc: 'Minimalist, distraction-free environment for deep learning.' },
              { icon: '🤝', title: 'Lifetime Network', desc: 'Join an elite circle of engineers across the globe.' },
            ].map((f, i) => (
              <div key={i} className="glass feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 style={{ marginBottom: '12px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <h2 className="section-title">Success Stories</h2>
          <div className="grid grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {[
              { name: 'Alex Rivera', role: 'Fullstack Dev at Stripe', text: 'MentorMatch found me a Principal Engineer who helped me navigate my promotion in just 3 months.' },
              { name: 'Sarah Chen', role: 'Frontend Engineer', text: 'The depth of knowledge in the mentor pool is staggering. Finally, a platform that understands engineering.' },
              { name: 'David Miller', role: 'DevOps Lead', text: 'Scaling our infrastructure was a nightmare until I matched with a mentor who had done it at Google scale.' },
            ].map((t, i) => (
              <div key={i} className="glass" style={{ padding: '32px' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '24px' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '100px 0', background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="section-title">Common Questions</h2>
          <FaqItem 
            question="How does mentor matching work?" 
            answer="We use a custom implementation of the Strategy Pattern to evaluate your goals against mentor expertise, experience level, and availability to find the highest probability of success."
          />
          <FaqItem 
            question="Are the mentors truly verified?" 
            answer="Yes. Every mentor undergoes a multi-stage vetting process including identity verification, technical screening, and an interview to ensure high-quality mentorship."
          />
          <FaqItem 
            question="What happens after I book a session?" 
            answer="Once you book, our Observer-based Notification Service triggers. You and your mentor get instant confirmation, and we handle calendar syncing and reminder updates automatically."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="container">
          <div className="glass cta-card" style={{ padding: '80px 40px' }}>
            <h1 style={{ fontSize: '40px', marginBottom: '20px' }}>Ready to Level Up?</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              Join thousands of engineers who are already accelerating their careers <br /> through expert human guidance.
            </p>
            <button className="btn btn-primary" onClick={onGetStarted} style={{ padding: '18px 50px', fontSize: '20px' }}>
              Enter Marketplace Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '80px 0 40px', borderTop: '1px solid var(--border)', background: '#fff' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
          <div style={{ maxWidth: '300px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px' }}>MentorMatch</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>The premium marketplace for elite engineering mentorship. Built with SOLID principles for high-performance learning.</p>
          </div>
          <div style={{ display: 'flex', gap: '60px' }}>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Platform</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <li>Marketplace</li>
                <li>Mentors</li>
                <li>Success Stories</li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container" style={{ marginTop: '60px', opacity: 0.5, textAlign: 'center' }}>
          <p className="text-sm">© 2026 MentorMatch Premium • Secure & Verified Mentorship</p>
        </div>
      </footer>
    </div>
  );
};

/**
 * Main App Component
 */
const MentorMatch: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'marketplace' | 'auth'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<User | null>(null);
  const { toasts, addToast, removeToast } = useToast();
  const bookingModal = useModal<Mentor>();
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [student, setStudent] = useState<User | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
 
  const fetchMentors = useCallback(() => repository.getAllMentors(), []);
  const { data: mentors, status: mentorsStatus } = useAsync(
    fetchMentors,
    true
  );
 
  const { filteredMentors, searchTerm, setSearchTerm, selectedSkills, toggleSkill } = useSearch(
    mentors || []
  );
 
  // Setup notification listener
  useEffect(() => {
    const toastListener = createToastListener((message, type) => {
      addToast(message, type as any);
    });
    notificationService.on('session.requested', toastListener);
 
    return () => {
      notificationService.off('session.requested', toastListener);
    };
  }, [addToast]);
 
  // Load current student (Mocked for initial load, will be replaced by Auth)
  useEffect(() => {
    if (user) {
      setStudent(user);
    }
  }, [user]);
 
  // Calculate matches when student or mentors change
  useEffect(() => {
    if (student && filteredMentors.length > 0) {
      const matches = matchingStrategy.rankMentors(student, filteredMentors);
      setMatchResults(matches);
    }
  }, [student, filteredMentors]);
 
  const handleBooking = async (formData: any) => {
    if (!user) {
      addToast('Please sign in to book a session', 'info');
      setAuthMode('login');
      setCurrentView('auth');
      return;
    }

    if (!bookingModal.data) return;
 
    setBookingSubmitting(true);
 
    try {
      const booking: Booking = {
        id: '',
        studentId: student.id,
        mentorId: bookingModal.data.id,
        date: formData.date,
        topic: formData.topic,
        status: 'pending',
        notes: formData.notes,
        duration: formData.duration,
      };
 
      const savedBooking = await repository.saveBooking(booking);
 
      // Emit notification event
      notificationService.emit({
        type: 'session.requested',
        studentId: student.id,
        mentorId: bookingModal.data.id,
        bookingId: savedBooking.id,
        timestamp: new Date(),
      });
 
      bookingModal.close();
    } catch (error) {
      addToast('Error creating booking', 'error');
    } finally {
      setBookingSubmitting(false);
    }
  };
 
  return (
    <>
      <style>{styles}</style>
 
      {currentView === 'auth' ? (
        <AuthPage 
          initialMode={authMode}
          onBack={() => setCurrentView('landing')}
          onSuccess={(u) => {
            setUser(u);
            setCurrentView('marketplace');
            addToast(`Welcome back, ${u.name}!`, 'success');
          }}
        />
      ) : currentView === 'landing' ? (
        <LandingPage 
          onGetStarted={() => setCurrentView('marketplace')} 
          onLogin={() => { setAuthMode('login'); setCurrentView('auth'); }}
        />
      ) : (
        <div className="container view-transition">
          {/* Header */}
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                MentorMatch
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                Find your perfect mentor match • Premium mentorship made simple
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {user ? (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{user.name}</div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', margin: '4px 0 0 auto' }}>
                    {user.name[0]}
                  </div>
                </div>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={() => { setAuthMode('login'); setCurrentView('auth'); }}>
                  Sign In
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrentView('landing')}>
                ← Back
              </button>
            </div>
          </div>

          {student && (
            <div className="mb-4" style={{ padding: '12px 20px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                👋 Welcome, <strong>{student.name}</strong> • Looking for: <strong>{student.goals.join(', ')}</strong>
              </p>
            </div>
          )}
 
          {/* Search Section */}
          <div className="glass" style={{ padding: '20px', marginBottom: '32px' }}>
            <div className="gap-4 flex flex-col">
              <input
                type="text"
                placeholder="Search mentors, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', fontSize: '16px' }}
              />
  
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['React', 'Python', 'TypeScript', 'DevOps', 'UI/UX', 'Mobile'].map((skill) => (
                  <button
                    key={skill}
                    className={`badge ${
                      selectedSkills.includes(skill) ? 'badge-primary' : ''
                    }`}
                    onClick={() => toggleSkill(skill)}
                    style={{
                      cursor: 'pointer',
                      background: selectedSkills.includes(skill)
                        ? 'rgba(99, 102, 241, 0.2)'
                        : 'rgba(148, 163, 184, 0.1)',
                      color: selectedSkills.includes(skill)
                        ? 'var(--primary-light)'
                        : 'var(--text-secondary)',
                    }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
  
          {/* Results Section */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Top Matches {matchResults.length > 0 && `(${matchResults.length})`}
            </h2>
  
            {mentorsStatus === 'pending' ? (
              <div className="text-center" style={{ padding: '40px', opacity: 0.6 }}>
                <div className="loading" style={{ display: 'inline-block', fontSize: '32px' }}>
                  ⏳
                </div>
                <p>Loading mentors...</p>
              </div>
            ) : matchResults.length > 0 ? (
              <div className="grid gap-4">
                {matchResults.map((result) => (
                  <MentorCard
                    key={result.mentor.id}
                    mentorResult={result}
                    onBook={bookingModal.open}
                  />
                ))}
              </div>
            ) : (
              <div className="glass text-center" style={{ padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  No mentors found. Try adjusting your search.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
 
      {/* Booking Modal */}
      <BookingModal
        mentor={bookingModal.data}
        isOpen={bookingModal.isOpen}
        onClose={bookingModal.close}
        onSubmit={handleBooking}
        isSubmitting={bookingSubmitting}
      />
 
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};
 
export default MentorMatch;
