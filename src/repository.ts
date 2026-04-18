/**
 * Repository Layer & Mock Data
 * Decouples UI from data source - easily switchable to real database
 */
 
import { Mentor, User, Booking } from './types';
import { supabase } from './supabaseClient';
 
/**
 * Repository Interface - Define contract for data sources
 */
export interface IRepository {
  getAllMentors(): Promise<Mentor[]>;
  getMentorById(id: string): Promise<Mentor | null>;
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getAllBookings(): Promise<Booking[]>;
  saveBooking(booking: Booking): Promise<Booking>;
}
 
/**
 * Mock Data Repository
 * Implements the Repository pattern with in-memory data
 */
export class MockDataRepository implements IRepository {
  private mentors: Mentor[] = [
    {
      id: 'mentor-1',
      name: 'Sarah Chen',
      title: 'Senior React Engineer at Tech Corp',
      expertise: ['React', 'TypeScript', 'Web Performance', 'CSS'],
      rating: 4.9,
      isVerified: true,
      bio: 'Passionate about helping developers master modern web development.',
      hourlyRate: 75,
      responseTime: '< 1 hour',
      reviews: 127,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      availability: ['Monday', 'Wednesday', 'Friday'],
    },
    {
      id: 'mentor-2',
      name: 'James Wilson',
      title: 'Full Stack Developer & AI Enthusiast',
      expertise: ['Python', 'Machine Learning', 'Node.js', 'Django'],
      rating: 4.8,
      isVerified: true,
      bio: 'Expert in building scalable backend systems and ML pipelines.',
      hourlyRate: 85,
      responseTime: '< 2 hours',
      reviews: 94,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      availability: ['Tuesday', 'Thursday', 'Saturday'],
    },
    {
      id: 'mentor-3',
      name: 'Priya Patel',
      title: 'Product Designer & UX Strategist',
      expertise: ['UI/UX Design', 'Figma', 'Design Systems', 'User Research'],
      rating: 4.7,
      isVerified: true,
      bio: 'Helping designers build thoughtful, user-centered products.',
      hourlyRate: 65,
      responseTime: '< 1 hour',
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      availability: ['Monday', 'Tuesday', 'Thursday'],
    },
    {
      id: 'mentor-4',
      name: 'Alex Rodriguez',
      title: 'DevOps Engineer & Cloud Architect',
      expertise: ['Kubernetes', 'AWS', 'Docker', 'CI/CD', 'Infrastructure'],
      rating: 4.6,
      isVerified: true,
      bio: 'Specializing in scalable cloud infrastructure and deployment.',
      hourlyRate: 95,
      responseTime: '< 3 hours',
      reviews: 78,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      availability: ['Wednesday', 'Friday', 'Sunday'],
    },
    {
      id: 'mentor-5',
      name: 'Emma Thompson',
      title: 'JavaScript Specialist & Educator',
      expertise: ['JavaScript', 'Vue.js', 'Next.js', 'Testing'],
      rating: 4.9,
      isVerified: true,
      bio: 'Dedicated to making web development concepts crystal clear.',
      hourlyRate: 70,
      responseTime: '< 30 min',
      reviews: 203,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      availability: ['Daily'],
    },
    {
      id: 'mentor-6',
      name: 'Marcus Johnson',
      title: 'Mobile App Developer (iOS/Android)',
      expertise: ['Swift', 'Kotlin', 'React Native', 'Mobile UI'],
      rating: 4.5,
      isVerified: true,
      bio: 'Building beautiful and performant mobile applications.',
      hourlyRate: 80,
      responseTime: '< 2 hours',
      reviews: 112,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      availability: ['Tuesday', 'Thursday', 'Saturday'],
    },
  ];
 
  private users: User[] = [
    {
      id: 'user-1',
      name: 'Shikhar',
      role: 'student',
      goals: ['Learn React', 'Master TypeScript', 'Build Production Apps'],
      level: 'intermediate',
      email: 'shikhar@example.com',
    },
    {
      id: 'user-2',
      name: 'Anjali',
      role: 'student',
      goals: ['Python Fundamentals', 'Web Scraping', 'Data Analysis'],
      level: 'beginner',
      email: 'anjali@example.com',
    },
    {
      id: 'user-3',
      name: 'Rohan',
      role: 'student',
      goals: ['Advanced React Patterns', 'System Design', 'DevOps'],
      level: 'advanced',
      email: 'rohan@example.com',
    },
  ];
 
  private bookings: Booking[] = [
    {
      id: 'booking-1',
      studentId: 'user-1',
      mentorId: 'mentor-1',
      date: '2024-01-15',
      topic: 'React Performance Optimization',
      status: 'confirmed',
      duration: 60,
    },
  ];
 
  /**
   * Simulates async database call
   */
  private async delay(ms: number = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
 
  async getAllMentors(): Promise<Mentor[]> {
    await this.delay();
    return this.mentors;
  }
 
  async getMentorById(id: string): Promise<Mentor | null> {
    await this.delay();
    return this.mentors.find((m) => m.id === id) || null;
  }
 
  async getAllUsers(): Promise<User[]> {
    await this.delay();
    return this.users;
  }
 
  async getUserById(id: string): Promise<User | null> {
    await this.delay();
    return this.users.find((u) => u.id === id) || null;
  }
 
  async getAllBookings(): Promise<Booking[]> {
    await this.delay();
    return this.bookings;
  }
 
  async saveBooking(booking: Booking): Promise<Booking> {
    await this.delay(150);
    // Simulate ID generation
    if (!booking.id) {
      booking.id = `booking-${Date.now()}`;
    }
    this.bookings.push(booking);
    return booking;
  }
}

/**
 * Supabase Production Repository
 * Connects to live database
 */
export class SupabaseRepository implements IRepository {
  async getAllMentors(): Promise<Mentor[]> {
    const { data, error } = await supabase
      .from('mentors')
      .select('*')
      .order('rating', { ascending: false });
    
    if (error) throw error;
    return data as Mentor[];
  }

  async getMentorById(id: string): Promise<Mentor | null> {
    const { data, error } = await supabase
      .from('mentors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data as Mentor;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    return data as User[];
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data as User;
  }

  async getAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data as Booking[];
  }

  async saveBooking(booking: Booking): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert([booking])
      .select()
      .single();
    
    if (error) throw error;
    return data as Booking;
  }
}

/**
 * Singleton instance
 * In production, we swap MockData for Supabase
 */
const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
export const repository: IRepository = isSupabaseConfigured ? new SupabaseRepository() : new MockDataRepository();
