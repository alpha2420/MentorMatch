/**
 * App.tsx
 * Main React component — glassmorphic premium UI for MentorMatch.
 * Wires together all hooks, services, and the repository.
 */

import React, { useEffect, useCallback } from 'react';
import type { Mentor, MatchResult, BookingFormState } from './types';
import { repository } from './repository';
import { matchingStrategy } from './matchingStrategy';
import { notificationService, createToastListener } from './notificationService';
import {
  useSearch,
  useToast,
  useModal,
  useAsync,
  useBookingForm,
} from './hooks';

// ─────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────

function Avatar({ initials, size = 52 }: { initials: string; size?: number }) {
  const hue = initials.charCodeAt(0) * 15 % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, hsl(${hue},70%,50%), hsl(${hue + 40},70%,40%))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.35, color: '#fff',
      flexShrink: 0, border: '2px solid rgba(255,255,255,0.15)',
    }}>
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────
// MATCH SCORE RING
// ─────────────────────────────────────────────

function MatchRing({ score }: { score: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#6366f1' : '#f59e0b';
  return (
    <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
      <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
        <circle
          cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1 }}>{score}%</span>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>match</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MENTOR CARD
// ─────────────────────────────────────────────

function MentorCard({
  result,
  onBook,
}: {
  result: MatchResult;
  onBook: (mentor: Mentor) => void;
}) {
  const { mentor, matchScore, matchReasons } = result;

  return (
    <div className="mentor-card" role="article" aria-label={`Mentor: ${mentor.name}`}>
      {mentor.isVerified && (
        <div className="verified-badge" title="Verified Mentor">✓ Verified</div>
      )}

      <div className="card-top">
        <Avatar initials={mentor.avatar} size={54} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="mentor-name">{mentor.name}</h3>
          <p className="mentor-title">{mentor.title}</p>
          {mentor.company && (
            <p className="mentor-company">@ {mentor.company}</p>
          )}
        </div>
        <MatchRing score={matchScore} />
      </div>

      {matchReasons.length > 0 && (
        <div className="reasons-list">
          {matchReasons.map((r, i) => (
            <p key={i} className="reason-item">{r}</p>
          ))}
        </div>
      )}

      <div className="skills-wrap">
        {mentor.expertise.slice(0, 4).map(skill => (
          <span key={skill} className="skill-pill">{skill}</span>
        ))}
        {mentor.expertise.length > 4 && (
          <span className="skill-pill skill-pill--more">+{mentor.expertise.length - 4}</span>
        )}
      </div>

      <div className="card-footer">
        <div className="card-stats">
          <span className="stat">⭐ {mentor.rating}</span>
          <span className="stat-divider">·</span>
          <span className="stat">{mentor.reviews} reviews</span>
          <span className="stat-divider">·</span>
          <span className="stat">{mentor.experience}yr exp</span>
        </div>
        <div className="card-rate">${mentor.hourlyRate}<span>/hr</span></div>
      </div>

      {mentor.responseTime && (
        <p className="response-time">⚡ Responds {mentor.responseTime}</p>
      )}

      <button
        className="book-btn"
        onClick={() => onBook(mentor)}
        aria-label={`Request session with ${mentor.name}`}
      >
        Request Session
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// BOOKING MODAL
// ─────────────────────────────────────────────

function BookingModal({
  mentor,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  mentor: Mentor | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormState) => void;
  isSubmitting: boolean;
}) {
  const { formData, updateField, reset, isValid } = useBookingForm();

  // Min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(formData);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !mentor) return null;

  return (
    <div className="modal-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose} aria-label="Close modal">✕</button>

        <div className="modal-header">
          <Avatar initials={mentor.avatar} size={46} />
          <div>
            <h2 className="modal-title">Book a Session</h2>
            <p className="modal-subtitle">with {mentor.name} · ${mentor.hourlyRate}/hr</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <label className="form-label">
            Session Topic *
            <input
              className="form-input"
              type="text"
              placeholder="e.g. React performance, code review…"
              value={formData.topic}
              onChange={e => updateField('topic', e.target.value)}
              required
              minLength={3}
            />
          </label>

          <label className="form-label">
            Date & Time *
            <input
              className="form-input"
              type="datetime-local"
              min={minDate}
              value={formData.date}
              onChange={e => updateField('date', e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            Duration
            <select
              className="form-input"
              value={formData.duration}
              onChange={e => updateField('duration', Number(e.target.value) as 30 | 60 | 90)}
            >
              <option value={30}>30 minutes — ${Math.round(mentor.hourlyRate * 0.5)}</option>
              <option value={60}>60 minutes — ${mentor.hourlyRate}</option>
              <option value={90}>90 minutes — ${Math.round(mentor.hourlyRate * 1.5)}</option>
            </select>
          </label>

          <label className="form-label">
            Notes (optional)
            <textarea
              className="form-input form-textarea"
              placeholder="Anything the mentor should know beforehand…"
              value={formData.notes}
              onChange={e => updateField('notes', e.target.value)}
              rows={3}
            />
          </label>

          <button
            type="submit"
            className="submit-btn"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Submitting…' : '🚀 Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TOAST CONTAINER
// ─────────────────────────────────────────────

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ReturnType<typeof useToast>['toasts'];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast--${toast.type}`}>
          <span>{toast.message}</span>
          <button onClick={() => onRemove(toast.id)} aria-label="Dismiss">✕</button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// STYLE TAG (CSS-in-JS via injected <style>)
// ─────────────────────────────────────────────

const CSS = `
  :root {
    --primary: #6366f1;
    --primary-glow: rgba(99,102,241,0.35);
    --success: #22c55e;
    --warning: #f59e0b;
    --danger: #ef4444;
    --bg: #0b1120;
    --bg-card: rgba(15,23,42,0.75);
    --bg-modal: rgba(10,18,36,0.97);
    --border: rgba(148,163,184,0.1);
    --border-hover: rgba(99,102,241,0.5);
    --text: #f1f5f9;
    --text-muted: #94a3b8;
    --text-dim: #64748b;
    --font: 'Inter', system-ui, sans-serif;
    --radius: 16px;
    --radius-sm: 8px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.15), transparent),
      radial-gradient(ellipse 50% 40% at 80% 90%, rgba(34,197,94,0.06), transparent);
  }

  /* ── LAYOUT ── */
  .app { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem 4rem; }

  /* ── HERO ── */
  .hero {
    text-align: center;
    padding: 4rem 1rem 3rem;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: rgba(99,102,241,0.12);
    border: 1px solid rgba(99,102,241,0.3);
    color: #a5b4fc; font-size: 0.78rem; font-weight: 600;
    padding: 0.3rem 0.9rem; border-radius: 999px;
    margin-bottom: 1.5rem; letter-spacing: 0.05em; text-transform: uppercase;
  }
  .hero h1 {
    font-size: clamp(2.2rem, 6vw, 3.8rem);
    font-weight: 800; line-height: 1.1;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #f1f5f9 30%, #a5b4fc 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1.1rem;
  }
  .hero-sub {
    font-size: 1.1rem; color: var(--text-muted);
    max-width: 560px; margin: 0 auto 2.5rem; line-height: 1.65;
  }
  .hero-stats {
    display: flex; justify-content: center; gap: 2.5rem; flex-wrap: wrap;
    margin-bottom: 3rem;
  }
  .hero-stat { display: flex; flex-direction: column; align-items: center; }
  .hero-stat-number { font-size: 1.6rem; font-weight: 800; color: var(--primary); }
  .hero-stat-label { font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

  /* ── SEARCH BAR ── */
  .search-wrap {
    display: flex; gap: 0.75rem;
    max-width: 680px; margin: 0 auto 1.5rem;
  }
  .search-input {
    flex: 1; padding: 0.85rem 1.2rem;
    background: rgba(15,23,42,0.8); border: 1px solid var(--border);
    border-radius: var(--radius); color: var(--text); font-size: 0.95rem;
    font-family: var(--font); outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-input::placeholder { color: var(--text-dim); }
  .search-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-glow);
  }
  .search-btn {
    padding: 0.85rem 1.6rem;
    background: var(--primary); color: #fff;
    border: none; border-radius: var(--radius);
    font-weight: 600; font-size: 0.9rem; cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
    white-space: nowrap;
  }
  .search-btn:hover { opacity: 0.88; transform: translateY(-1px); }

  /* ── FILTERS ── */
  .filters-bar {
    display: flex; gap: 0.6rem; flex-wrap: wrap;
    justify-content: center; margin-bottom: 2.5rem;
  }
  .filter-chip {
    padding: 0.4rem 1rem;
    background: rgba(15,23,42,0.8); border: 1px solid var(--border);
    border-radius: 999px; color: var(--text-muted);
    font-size: 0.82rem; font-weight: 500; cursor: pointer;
    transition: all 0.15s;
  }
  .filter-chip:hover { border-color: var(--primary); color: var(--text); }
  .filter-chip.active {
    background: rgba(99,102,241,0.2);
    border-color: var(--primary); color: #a5b4fc;
  }

  /* ── MENTOR COUNT ── */
  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.5rem;
  }
  .section-title {
    font-size: 1.05rem; font-weight: 600; color: var(--text-muted);
  }
  .section-count {
    font-size: 0.85rem; color: var(--text-dim);
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border); border-radius: 999px;
    padding: 0.2rem 0.85rem;
  }

  /* ── GRID ── */
  .mentors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
  }

  /* ── MENTOR CARD ── */
  .mentor-card {
    position: relative;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.5rem;
    backdrop-filter: blur(12px);
    transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
    animation: fadeUp 0.4s ease both;
    display: flex; flex-direction: column; gap: 1rem;
  }
  .mentor-card:hover {
    border-color: var(--border-hover);
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px var(--primary-glow);
  }
  .verified-badge {
    position: absolute; top: 1rem; right: 1rem;
    font-size: 0.72rem; font-weight: 600;
    color: var(--success); background: rgba(34,197,94,0.1);
    border: 1px solid rgba(34,197,94,0.25);
    border-radius: 999px; padding: 0.2rem 0.6rem;
  }
  .card-top { display: flex; align-items: flex-start; gap: 0.9rem; }
  .mentor-name { font-size: 1rem; font-weight: 700; color: var(--text); line-height: 1.2; }
  .mentor-title { font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem; line-height: 1.3; }
  .mentor-company { font-size: 0.78rem; color: var(--primary); margin-top: 0.1rem; }

  .reasons-list { display: flex; flex-direction: column; gap: 0.25rem; }
  .reason-item {
    font-size: 0.8rem; color: var(--text-muted);
    padding: 0.3rem 0.7rem;
    background: rgba(255,255,255,0.03);
    border-radius: var(--radius-sm);
    line-height: 1.4;
  }

  .skills-wrap { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .skill-pill {
    font-size: 0.74rem; font-weight: 500;
    padding: 0.25rem 0.7rem; border-radius: 999px;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.2);
    color: #a5b4fc;
  }
  .skill-pill--more {
    background: rgba(255,255,255,0.05);
    border-color: var(--border); color: var(--text-dim);
  }

  .card-footer {
    display: flex; align-items: center; justify-content: space-between;
  }
  .card-stats { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
  .stat { font-size: 0.8rem; color: var(--text-muted); }
  .stat-divider { color: var(--text-dim); }
  .card-rate { font-size: 1rem; font-weight: 700; color: var(--text); }
  .card-rate span { font-size: 0.75rem; color: var(--text-muted); font-weight: 400; }

  .response-time { font-size: 0.76rem; color: var(--text-dim); }

  .book-btn {
    width: 100%; padding: 0.75rem;
    background: linear-gradient(135deg, var(--primary), #818cf8);
    border: none; border-radius: var(--radius-sm);
    color: #fff; font-weight: 600; font-size: 0.9rem;
    cursor: pointer; transition: opacity 0.15s, transform 0.15s;
    font-family: var(--font); margin-top: auto;
    letter-spacing: 0.01em;
  }
  .book-btn:hover { opacity: 0.88; transform: translateY(-1px); }

  /* ── LOADING / EMPTY ── */
  .loading-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
  }
  .skeleton-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 1.5rem; height: 280px;
    animation: pulse 1.5s ease-in-out infinite;
  }
  .empty-state {
    text-align: center; padding: 4rem 1rem; color: var(--text-muted);
  }
  .empty-state-icon { font-size: 3rem; margin-bottom: 1rem; }
  .empty-state h3 { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; }
  .empty-state p { font-size: 0.9rem; color: var(--text-dim); }

  /* ── MODAL ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 1rem;
    animation: fadeIn 0.2s ease;
  }
  .modal-box {
    background: var(--bg-modal);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 2rem; width: 100%; max-width: 480px;
    max-height: 90vh; overflow-y: auto;
    position: relative;
    animation: slideUp 0.25s ease;
  }
  .modal-close {
    position: absolute; top: 1rem; right: 1rem;
    background: rgba(255,255,255,0.06); border: 1px solid var(--border);
    color: var(--text-muted); width: 32px; height: 32px;
    border-radius: 50%; cursor: pointer; font-size: 0.85rem;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .modal-close:hover { background: rgba(255,255,255,0.12); }
  .modal-header {
    display: flex; align-items: center; gap: 1rem;
    margin-bottom: 1.75rem;
  }
  .modal-title { font-size: 1.15rem; font-weight: 700; }
  .modal-subtitle { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem; }

  .booking-form { display: flex; flex-direction: column; gap: 1.1rem; }
  .form-label { display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.85rem; font-weight: 500; color: var(--text-muted); }
  .form-input {
    padding: 0.75rem 1rem;
    background: rgba(15,23,42,0.9); border: 1px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text); font-size: 0.9rem;
    font-family: var(--font); outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-glow);
  }
  option { background: #1e293b; }
  .form-textarea { resize: vertical; min-height: 80px; }
  .submit-btn {
    padding: 0.9rem;
    background: linear-gradient(135deg, var(--primary), #818cf8);
    border: none; border-radius: var(--radius-sm);
    color: #fff; font-size: 0.95rem; font-weight: 700;
    cursor: pointer; transition: opacity 0.15s;
    font-family: var(--font); margin-top: 0.5rem;
  }
  .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── TOASTS ── */
  .toast-container {
    position: fixed; bottom: 1.5rem; right: 1.5rem;
    display: flex; flex-direction: column; gap: 0.6rem;
    z-index: 2000; max-width: 340px;
  }
  .toast {
    display: flex; align-items: center; justify-content: space-between;
    gap: 0.75rem; padding: 0.85rem 1rem;
    border-radius: var(--radius-sm);
    font-size: 0.87rem; font-weight: 500;
    animation: slideLeft 0.3s ease;
    backdrop-filter: blur(10px);
    border: 1px solid transparent;
  }
  .toast--success { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); color: #86efac; }
  .toast--error   { background: rgba(239,68,68,0.15);  border-color: rgba(239,68,68,0.3);  color: #fca5a5; }
  .toast--info    { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); color: #a5b4fc; }
  .toast button {
    background: none; border: none; cursor: pointer;
    color: inherit; opacity: 0.6; font-size: 0.9rem; padding: 0;
  }
  .toast button:hover { opacity: 1; }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideLeft {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 0.8; }
  }

  @media (max-width: 600px) {
    .hero h1 { font-size: 2rem; }
    .hero-stats { gap: 1.5rem; }
    .mentors-grid, .loading-grid { grid-template-columns: 1fr; }
    .search-wrap { flex-direction: column; }
    .toast-container { left: 1rem; right: 1rem; max-width: unset; }
  }
`;

// ─────────────────────────────────────────────
// FILTER CHIPS CONFIG
// ─────────────────────────────────────────────

const FILTER_OPTIONS = [
  { label: 'All Mentors', value: 'all' },
  { label: '⭐ Top Rated',  value: 'top-rated' },
  { label: '✅ Verified',  value: 'verified' },
  { label: '💰 Budget ($0–$75)', value: 'budget' },
];

// ─────────────────────────────────────────────
// ROOT APP COMPONENT
// ─────────────────────────────────────────────

export default function MentorMatch() {
  const { toasts, addToast, removeToast } = useToast();
  const modal = useModal<Mentor>();

  // ── Load mentors + current user async ────
  const loadData = useCallback(async () => {
    const [mentors, user] = await Promise.all([
      repository.getAllMentors(),
      repository.getCurrentUser(),
    ]);
    return matchingStrategy.rankMentors(user, mentors);
  }, []);

  const {
    status,
    data: rankedMentors,
    execute: fetchData,
  } = useAsync<MatchResult[]>(loadData, true);

  // ── Search/filter ─────────────────────────
  const {
    searchTerm, setSearchTerm,
    minRating, setMinRating,
    verifiedOnly, setVerifiedOnly,
    filteredMentors,
  } = useSearch(rankedMentors ?? []);

  const [activeFilter, setActiveFilter] = React.useState('all');

  const applyFilter = (value: string) => {
    setActiveFilter(value);
    if (value === 'all') {
      setMinRating(0); setVerifiedOnly(false);
    } else if (value === 'top-rated') {
      setMinRating(4.8); setVerifiedOnly(false);
    } else if (value === 'verified') {
      setMinRating(0); setVerifiedOnly(true);
    } else if (value === 'budget') {
      setMinRating(0); setVerifiedOnly(false);
    }
  };

  const displayMentors = activeFilter === 'budget'
    ? filteredMentors.filter(r => r.mentor.hourlyRate <= 75)
    : filteredMentors;

  // ── Connect toast listener to notification service ──
  useEffect(() => {
    const listener = createToastListener(addToast);
    notificationService.on('session.requested', listener);
    return () => notificationService.off('session.requested', listener);
  }, [addToast]);

  // ── Booking submission ─────────────────────
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleBookingSubmit = async (formData: BookingFormState) => {
    if (!modal.data) return;
    setIsSubmitting(true);
    try {
      const user = await repository.getCurrentUser();
      await repository.saveBooking({
        studentId: user.id,
        mentorId: modal.data.id,
        date: formData.date,
        topic: formData.topic,
        duration: formData.duration,
        status: 'pending',
        notes: formData.notes,
      });
      notificationService.emit({
        type: 'session.requested',
        studentId: user.id,
        mentorId: modal.data.id,
        timestamp: new Date(),
      });
      modal.close();
    } catch (err) {
      addToast('Something went wrong. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="app">
        {/* HERO */}
        <header className="hero">
          <div className="hero-badge">✨ AI-Powered Matching</div>
          <h1>Find Your Perfect<br />Mentor, Faster</h1>
          <p className="hero-sub">
            Intelligent skill-based matching connects you with industry experts who
            align exactly with your learning goals and career level.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">6+</span>
              <span className="hero-stat-label">Expert Mentors</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">98%</span>
              <span className="hero-stat-label">Match Accuracy</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">500+</span>
              <span className="hero-stat-label">Sessions Done</span>
            </div>
          </div>

          {/* Search */}
          <div className="search-wrap">
            <input
              id="search-input"
              className="search-input"
              type="text"
              placeholder="Search by skill, name, or company…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              aria-label="Search mentors"
            />
            <button
              className="search-btn"
              onClick={() => fetchData()}
              aria-label="Search"
            >
              🔍 Search
            </button>
          </div>

          {/* Filters */}
          <div className="filters-bar" role="group" aria-label="Filter mentors">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`filter-chip${activeFilter === opt.value ? ' active' : ''}`}
                onClick={() => applyFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </header>

        {/* MENTOR LIST */}
        <main>
          <div className="section-header">
            <span className="section-title">
              {status === 'pending' ? 'Finding your matches…' : 'Ranked by match score'}
            </span>
            <span className="section-count">
              {status === 'success' ? `${displayMentors.length} mentors` : '—'}
            </span>
          </div>

          {status === 'pending' && (
            <div className="loading-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          )}

          {status === 'error' && (
            <div className="empty-state">
              <div className="empty-state-icon">⚠️</div>
              <h3>Failed to load mentors</h3>
              <p>Please refresh the page or try again.</p>
            </div>
          )}

          {status === 'success' && displayMentors.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No mentors found</h3>
              <p>Try adjusting your search or clearing filters.</p>
            </div>
          )}

          {status === 'success' && displayMentors.length > 0 && (
            <div className="mentors-grid">
              {displayMentors.map((result, i) => (
                <div
                  key={result.mentor.id}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <MentorCard result={result} onBook={modal.open} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* BOOKING MODAL */}
      <BookingModal
        mentor={modal.data}
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSubmit={handleBookingSubmit}
        isSubmitting={isSubmitting}
      />

      {/* TOASTS */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
