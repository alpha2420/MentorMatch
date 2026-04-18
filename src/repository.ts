/**
 * repository.ts
 * Repository Pattern – Abstract data access from the UI layer.
 * Swap MockDataRepository for SupabaseRepository without touching the UI.
 */

import type { Mentor, User, Booking } from './types';

// ─────────────────────────────────────────────
// INTERFACE (Contract)
// ─────────────────────────────────────────────

export interface IRepository {
  getAllMentors(): Promise<Mentor[]>;
  getMentorById(id: string): Promise<Mentor | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  getCurrentUser(): Promise<User>;
  getAllBookings(): Promise<Booking[]>;
  saveBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking>;
}

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

const MOCK_MENTORS: Mentor[] = [
  {
    id: 'mentor_1',
    name: 'Sarah Chen',
    title: 'Senior Frontend Engineer',
    company: 'Netflix',
    expertise: ['React', 'Next.js', 'TypeScript', 'UI/UX', 'Performance'],
    experience: 8,
    hourlyRate: 85,
    rating: 4.9,
    reviews: 120,
    isVerified: true,
    avatar: 'SC',
    availability: ['Mon', 'Wed', 'Fri'],
    responseTime: '< 1 hour',
    bio: 'I help engineers level up from mid to senior. Specialising in React architecture, performance optimisation, and making code that scales.',
  },
  {
    id: 'mentor_2',
    name: 'Alex Rodriguez',
    title: 'ML Engineer',
    company: 'Google',
    expertise: ['Python', 'TensorFlow', 'PyTorch', 'Data Science', 'System Design'],
    experience: 5,
    hourlyRate: 60,
    rating: 4.7,
    reviews: 45,
    isVerified: true,
    avatar: 'AR',
    availability: ['Tue', 'Thu'],
    responseTime: '< 3 hours',
    bio: 'From data pipelines to model deployment. I help students break into ML with a practical, project-focused approach.',
  },
  {
    id: 'mentor_3',
    name: 'Priya Sharma',
    title: 'Lead Product Manager',
    company: 'Atlassian',
    expertise: ['Agile', 'Product Strategy', 'Leadership', 'Career Transition', 'Roadmapping'],
    experience: 12,
    hourlyRate: 110,
    rating: 5.0,
    reviews: 88,
    isVerified: true,
    avatar: 'PS',
    availability: ['Mon', 'Tue', 'Thu', 'Fri'],
    responseTime: '< 2 hours',
    bio: 'Helped 200+ engineers transition into PM roles at FAANG companies. No buzzwords, just honest career advice.',
  },
  {
    id: 'mentor_4',
    name: 'James Wilson',
    title: 'Full Stack Engineer',
    company: 'Stripe',
    expertise: ['TypeScript', 'Node.js', 'PostgreSQL', 'API Design', 'React'],
    experience: 6,
    hourlyRate: 75,
    rating: 4.5,
    reviews: 32,
    isVerified: false,
    avatar: 'JW',
    availability: ['Wed', 'Sat', 'Sun'],
    responseTime: '< 5 hours',
    bio: 'Payments infrastructure by day, open-source enthusiast by night. I teach clean API design and TypeScript best practices.',
  },
  {
    id: 'mentor_5',
    name: 'Elena Rostova',
    title: 'DevOps Architect',
    company: 'Cloudflare',
    expertise: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'System Design'],
    experience: 10,
    hourlyRate: 95,
    rating: 4.8,
    reviews: 56,
    isVerified: true,
    avatar: 'ER',
    availability: ['Mon', 'Wed', 'Fri', 'Sat'],
    responseTime: '< 2 hours',
    bio: 'Infrastructure that never sleeps. I help teams go from zero to production-grade cloud deployments.',
  },
  {
    id: 'mentor_6',
    name: 'Marcus Thompson',
    title: 'iOS / Android Engineer',
    company: 'Spotify',
    expertise: ['Swift', 'Kotlin', 'React Native', 'Mobile Architecture', 'App Store'],
    experience: 7,
    hourlyRate: 90,
    rating: 4.8,
    reviews: 41,
    isVerified: true,
    avatar: 'MT',
    availability: ['Tue', 'Thu', 'Sat'],
    responseTime: '< 4 hours',
    bio: 'I\'ve shipped apps to millions. Whether you\'re building your first iOS app or optimising a React Native codebase, I can help.',
  },
];

const MOCK_USERS: User[] = [
  {
    id: 'student_777',
    name: 'Shikhar Singh',
    role: 'student',
    goals: ['React', 'TypeScript', 'System Design'],
    level: 'intermediate',
    email: 'shikhar@example.com',
    avatar: 'SS',
  },
  {
    id: 'student_001',
    name: 'Ananya Patel',
    role: 'student',
    goals: ['Python', 'Data Science', 'Machine Learning'],
    level: 'beginner',
    email: 'ananya@example.com',
    avatar: 'AP',
  },
  {
    id: 'student_002',
    name: 'Rahul Kumar',
    role: 'student',
    goals: ['AWS', 'Kubernetes', 'CI/CD'],
    level: 'advanced',
    email: 'rahul@example.com',
    avatar: 'RK',
  },
];

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking_1',
    studentId: 'student_777',
    mentorId: 'mentor_1',
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    topic: 'React performance optimisation',
    duration: 60,
    status: 'confirmed',
    notes: 'Bring the GitHub repo link',
    createdAt: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────────
// IMPLEMENTATION
// ─────────────────────────────────────────────

class MockDataRepository implements IRepository {
  private mentors: Mentor[] = structuredClone(MOCK_MENTORS);
  private users: User[] = structuredClone(MOCK_USERS);
  private bookings: Booking[] = structuredClone(MOCK_BOOKINGS);

  private delay(ms = 300): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
  }

  async getAllMentors(): Promise<Mentor[]> {
    await this.delay();
    return [...this.mentors];
  }

  async getMentorById(id: string): Promise<Mentor | undefined> {
    await this.delay(100);
    return this.mentors.find(m => m.id === id);
  }

  async getAllUsers(): Promise<User[]> {
    await this.delay();
    return [...this.users];
  }

  async getUserById(id: string): Promise<User | undefined> {
    await this.delay(100);
    return this.users.find(u => u.id === id);
  }

  async getCurrentUser(): Promise<User> {
    await this.delay(100);
    // Default logged-in user
    return this.users[0];
  }

  async getAllBookings(): Promise<Booking[]> {
    await this.delay();
    return [...this.bookings];
  }

  async saveBooking(
    data: Omit<Booking, 'id' | 'createdAt'>
  ): Promise<Booking> {
    await this.delay(400);
    const booking: Booking = {
      ...data,
      id: `booking_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.bookings.push(booking);
    return booking;
  }
}

// Export singleton — swap this class for SupabaseRepository in Phase 2
export const repository: IRepository = new MockDataRepository();
