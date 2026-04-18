/**
 * React Hooks & Component Utilities
 * Reusable logic for components
 */
 
import { useState, useCallback, useEffect, useRef } from 'react';
import { MatchResult, Mentor, Booking } from './types';
 
/**
 * Hook for managing search state and filtering
 */
export function useSearch(results: MatchResult[]) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
 
  const filteredMentors = useCallback(() => {
    return results.filter((result) => {
      const mentor = result.mentor;
      const matchesSearch =
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.expertise.some((e) =>
          e.toLowerCase().includes(searchTerm.toLowerCase())
        );
 
      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.some((skill) =>
          mentor.expertise.some((e) =>
            e.toLowerCase().includes(skill.toLowerCase())
          )
        );
 
      const matchesRating = mentor.rating >= minRating;
      const matchesVerified = verifiedOnly ? mentor.isVerified : true;
 
      return matchesSearch && matchesSkills && matchesRating && matchesVerified;
    });
  }, [results, searchTerm, selectedSkills, minRating, verifiedOnly]);
 
  const toggleSkill = useCallback((skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }, []);
 
  return {
    searchTerm,
    setSearchTerm,
    selectedSkills,
    toggleSkill,
    minRating,
    setMinRating,
    verifiedOnly,
    setVerifiedOnly,
    filteredMentors: filteredMentors(),
  };
}
 
/**
 * Hook for managing toast notifications
 */
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
 
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
 
  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
      const id = `toast-${idRef.current++}`;
      const toast: Toast = { id, message, type, duration };
 
      setToasts((prev) => [...prev, toast]);
 
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
 
      return id;
    },
    []
  );
 
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
 
  return { toasts, addToast, removeToast };
}
 
/**
 * Hook for managing modal state
 */
export function useModal<T = unknown>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);
 
  const open = useCallback((modalData?: T) => {
    if (modalData) {
      setData(modalData);
    }
    setIsOpen(true);
  }, []);
 
  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);
 
  return { isOpen, data, open, close };
}
 
/**
 * Hook for managing async loading state
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>(
    'idle'
  );
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
 
  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);
 
    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);
 
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
 
  return { status, data, error, execute };
}
 
/**
 * Hook for managing booking form state
 */
export interface BookingFormState {
  date: string;
  topic: string;
  notes: string;
  duration: number;
}
 
export function useBookingForm() {
  const [formData, setFormData] = useState<BookingFormState>({
    date: '',
    topic: '',
    notes: '',
    duration: 60,
  });
 
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  // Custom interface extension to accept value: any for generic updater
  const updateField = useCallback(
    (field: keyof BookingFormState, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );
 
  const reset = useCallback(() => {
    setFormData({
      date: '',
      topic: '',
      notes: '',
      duration: 60,
    });
  }, []);
 
  const isValid = useCallback(() => {
    return formData.date && formData.topic && formData.topic.length > 0;
  }, [formData]);
 
  return {
    formData,
    updateField,
    reset,
    isValid: isValid(),
    isSubmitting,
    setIsSubmitting,
  };
}
 
/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
 
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
 
    return () => clearTimeout(handler);
  }, [value, delay]);
 
  return debouncedValue;
}
