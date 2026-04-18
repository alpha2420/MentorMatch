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
    --primary: #6366f1;
    --primary-light: #818cf8;
    --primary-dark: #4f46e5;
    --success: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;
    --bg-primary: #0f172a;
    --bg-secondary: rgba(30, 41, 59, 0.8);
    --bg-glass: rgba(15, 23, 42, 0.7);
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --border: rgba(148, 163, 184, 0.1);
    --shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    --shadow-sm: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
 
  html, body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, var(--bg-primary) 0%, #1a1f35 100%);
    color: var(--text-primary);
    min-height: 100vh;
  }
 
  /* Glassmorphic card */
  .glass {
    background: var(--bg-glass);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border);
    border-radius: 16px;
  }
 
  .glass-hover:hover {
    background: rgba(30, 41, 59, 0.9);
    border-color: rgba(148, 163, 184, 0.2);
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }
 
  /* Buttons */
  .btn {
    padding: 10px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
 
  .btn-primary {
    background: var(--primary);
    color: white;
  }
 
  .btn-primary:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  }
 
  .btn-secondary {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-primary);
  }
 
  .btn-secondary:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: var(--primary);
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
  input, textarea {
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px;
    color: var(--text-primary);
    font-size: 14px;
    transition: all 0.3s ease;
  }
 
  input:focus, textarea:focus {
    outline: none;
    border-color: var(--primary);
    background: rgba(30, 41, 59, 0.8);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
 
  /* Badges */
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
  }
 
  .badge-primary {
    background: rgba(99, 102, 241, 0.2);
    color: var(--primary-light);
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
    background: radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 50%);
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
    background: linear-gradient(to bottom right, #fff 30%, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-subtitle {
    font-size: clamp(1.1rem, 3vw, 1.4rem);
    color: var(--text-secondary);
    max-width: 600px;
    margin-bottom: 40px;
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
    background: rgba(99, 102, 241, 0.1);
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
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
    border: 1px solid rgba(99, 102, 241, 0.2);
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
 * Landing Page Component
 */
const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <div className="view-transition">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <h1 className="hero-title">
          Unlock Your Potential <br /> With the Right Mentor
        </h1>
        <p className="hero-subtitle">
          Connect with industry experts, master new skills, and accelerate your
          career with intelligent matchmaking designed for top-tier engineers.
        </p>
        <button className="btn btn-primary" onClick={onGetStarted} style={{ padding: '16px 40px', fontSize: '18px' }}>
          Find Your Mentor ✨
        </button>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="glass stat-card">
            <div className="stat-value">50+</div>
            <div className="stat-label">Verified Mentors</div>
          </div>
          <div className="glass stat-card">
            <div className="stat-value">98%</div>
            <div className="stat-label">Match Accuracy</div>
          </div>
          <div className="glass stat-card">
            <div className="stat-value">1.2k</div>
            <div className="stat-label">Sessions Completed</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why MentorMatch?</h2>
          <div className="grid grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className="glass feature-card">
              <div className="feature-icon">🎯</div>
              <h3 style={{ marginBottom: '12px' }}>Intelligent Matching</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Our propriety Strategy Pattern algorithm pairs you with mentors based on deep skill alignment and experience level.
              </p>
            </div>
            <div className="glass feature-card">
              <div className="feature-icon">🛡️</div>
              <h3 style={{ marginBottom: '12px' }}>Expert Verification</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Every mentor is manually vetted from top tech companies like Google, Meta, and Netflix to ensure premium guidance.
              </p>
            </div>
            <div className="glass feature-card">
              <div className="feature-icon">📅</div>
              <h3 style={{ marginBottom: '12px' }}>Seamless Booking</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Book sessions, manage dates, and receive real-time notifications through our decoupled Observer-based event system.
              </p>
            </div>
          </div>

          {/* Join as Mentor CTA */}
          <div className="glass cta-card">
            <h2 style={{ marginBottom: '16px' }}>Ready to share your wisdom?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
              Join our elite circle of mentors and help shape the next generation of engineering leaders.
            </p>
            <button className="btn btn-secondary">Apply to Mentor →</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 0', borderTop: '1px solid var(--border)', textAlign: 'center', opacity: 0.5 }}>
        <p className="text-sm">© 2026 MentorMatch Premium • Built with SOLID Principles</p>
      </footer>
    </div>
  );
};

/**
 * Main App Component
 */
const MentorMatch: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'marketplace'>('landing');
  const { toasts, addToast, removeToast } = useToast();
  const bookingModal = useModal<Mentor>();
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [student, setStudent] = useState<User | null>(null);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
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
 
  // Load current student
  useEffect(() => {
    repository.getUserById('user-1').then(setStudent);
  }, []);
 
  // Calculate matches when student or mentors change
  useEffect(() => {
    if (student && filteredMentors.length > 0) {
      setIsLoadingMatches(true);
      const matches = matchingStrategy.rankMentors(student, filteredMentors);
      setMatchResults(matches);
      setIsLoadingMatches(false);
    }
  }, [student, filteredMentors]);
 
  const handleBooking = async (formData: any) => {
    if (!student || !bookingModal.data) return;
 
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
 
      {currentView === 'landing' ? (
        <LandingPage onGetStarted={() => setCurrentView('marketplace')} />
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
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentView('landing')}>
              ← Back
            </button>
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
