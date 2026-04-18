/**
 * hooks.tsx
 * Custom React hooks for state management across MentorMatch.
 */

import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { MatchResult, Toast, ToastType, BookingFormState } from './types';

// ─────────────────────────────────────────────
// useDebounce
// ─────────────────────────────────────────────

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// ─────────────────────────────────────────────
// useSearch
// Filter MatchResult[] by text, skills, rating
// ─────────────────────────────────────────────

export interface UseSearchReturn {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedSkills: string[];
  toggleSkill: (skill: string) => void;
  minRating: number;
  setMinRating: (val: number) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (val: boolean) => void;
  filteredMentors: MatchResult[];
}

export function useSearch(mentors: MatchResult[]): UseSearchReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const debouncedTerm = useDebounce(searchTerm, 250);

  const toggleSkill = useCallback((skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  }, []);

  const filteredMentors = mentors.filter(({ mentor }) => {
    const term = debouncedTerm.toLowerCase();
    const matchesTerm =
      !term ||
      mentor.name.toLowerCase().includes(term) ||
      mentor.title.toLowerCase().includes(term) ||
      mentor.expertise.some(e => e.toLowerCase().includes(term));

    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every(skill =>
        mentor.expertise.some(e => e.toLowerCase().includes(skill.toLowerCase()))
      );

    const matchesRating = mentor.rating >= minRating;
    const matchesVerified = !verifiedOnly || mentor.isVerified;

    return matchesTerm && matchesSkills && matchesRating && matchesVerified;
  });

  return {
    searchTerm,
    setSearchTerm,
    selectedSkills,
    toggleSkill,
    minRating,
    setMinRating,
    verifiedOnly,
    setVerifiedOnly,
    filteredMentors,
  };
}

// ─────────────────────────────────────────────
// useToast
// Queue and auto-dismiss toast notifications
// ─────────────────────────────────────────────

export interface UseToastReturn {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 4000) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const toast: Toast = { id, message, type, duration };

      setToasts(prev => [...prev, toast]);

      const timer = setTimeout(() => removeToast(id), duration);
      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  // Cleanup all timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return { toasts, addToast, removeToast };
}

// ─────────────────────────────────────────────
// useModal
// Generic modal open/close state with typed data
// ─────────────────────────────────────────────

export interface UseModalReturn<T> {
  isOpen: boolean;
  data: T | null;
  open: (data: T) => void;
  close: () => void;
}

export function useModal<T>(): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((payload: T) => {
    setData(payload);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing data so exit animation can play
    setTimeout(() => setData(null), 300);
  }, []);

  return { isOpen, data, open, close };
}

// ─────────────────────────────────────────────
// useAsync
// Handle async operations with status tracking
// ─────────────────────────────────────────────

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

export interface UseAsyncReturn<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  execute: (...args: unknown[]) => Promise<void>;
  isLoading: boolean;
}

export function useAsync<T>(
  asyncFn: (...args: unknown[]) => Promise<T>,
  immediate = false
): UseAsyncReturn<T> {
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: unknown[]) => {
      setStatus('pending');
      setError(null);
      try {
        const result = await asyncFn(...args);
        setData(result);
        setStatus('success');
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus('error');
      }
    },
    [asyncFn]
  );

  useEffect(() => {
    if (immediate) execute();
  }, [immediate, execute]);

  return { status, data, error, execute, isLoading: status === 'pending' };
}

// ─────────────────────────────────────────────
// useBookingForm
// Manage booking form state, validation, and reset
// ─────────────────────────────────────────────

const DEFAULT_FORM: BookingFormState = {
  topic: '',
  date: '',
  duration: 60,
  notes: '',
};

export interface UseBookingFormReturn {
  formData: BookingFormState;
  updateField: <K extends keyof BookingFormState>(key: K, value: BookingFormState[K]) => void;
  reset: () => void;
  isValid: boolean;
}

export function useBookingForm(): UseBookingFormReturn {
  const [formData, setFormData] = useState<BookingFormState>({ ...DEFAULT_FORM });

  const updateField = useCallback(
    <K extends keyof BookingFormState>(key: K, value: BookingFormState[K]) => {
      setFormData(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setFormData({ ...DEFAULT_FORM });
  }, []);

  const isValid =
    formData.topic.trim().length >= 3 &&
    formData.date.length > 0 &&
    new Date(formData.date) > new Date();

  return { formData, updateField, reset, isValid };
}
