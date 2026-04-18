/**
 * types.ts
 * Central type definitions for the entire MentorMatch application.
 * All entities, interfaces, and enums live here.
 */

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export type UserRole = 'student' | 'mentor';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ToastType = 'success' | 'error' | 'info';
export type NotificationEventType =
  | 'session.requested'
  | 'session.confirmed'
  | 'booking.cancelled';

// ─────────────────────────────────────────────
// CORE ENTITIES
// ─────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  role: UserRole;
  goals: string[];         // e.g. ['React', 'TypeScript', 'System Design']
  level: SkillLevel;
  email?: string;
  avatar?: string;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;           // e.g. 'Senior React Engineer @ Netflix'
  company?: string;
  expertise: string[];     // Skills they can teach
  experience?: number;     // Years (optional)
  hourlyRate: number;      // USD
  rating: number;          // 0–5
  reviews: number;         // Review count
  isVerified: boolean;
  avatar?: string;         // Initials fallback
  image?: string;          // URL to image
  availability?: string[]; // e.g. ['Mon', 'Wed', 'Fri']
  responseTime?: string;   // e.g. '< 2 hours'
  bio?: string;
}

export interface Booking {
  id?: string;
  studentId: string;
  mentorId: string;
  date: string;            // ISO 8601
  topic: string;
  duration: number;        // minutes: 30 | 60 | 90
  status: BookingStatus;
  notes?: string;
  createdAt?: string;
}

// ─────────────────────────────────────────────
// MATCHING
// ─────────────────────────────────────────────

export interface MatchResult {
  mentor: Mentor;
  matchScore: number;          // 0–100
  matchReasons: string[];      // Human-readable explanations
  skillAlignment: number;      // 0–100
  experienceAlignment: number; // 0–100
  availabilityAlignment: number; // 0–100
}

export interface SearchQuery {
  term?: string;
  skills?: string[];
  minRating?: number;
  maxRate?: number;
  verifiedOnly?: boolean;
}

// ─────────────────────────────────────────────
// NOTIFICATIONS (Observer Pattern)
// ─────────────────────────────────────────────

export interface NotificationEvent {
  type: NotificationEventType;
  studentId: string;
  mentorId: string;
  bookingId?: string;
  timestamp: Date;
  meta?: Record<string, unknown>;
}

export type NotificationListener = (event: NotificationEvent) => void;

// ─────────────────────────────────────────────
// UI STATE
// ─────────────────────────────────────────────

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export interface BookingFormState {
  topic: string;
  date: string;
  duration: 30 | 60 | 90;
  notes: string;
}
