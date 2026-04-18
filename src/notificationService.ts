/**
 * notificationService.ts
 * Observer Pattern – Decoupled event bus for application notifications.
 * Add new listeners (email, analytics, logging) without changing existing code.
 */

import type { NotificationEvent, NotificationEventType, NotificationListener } from './types';

// ─────────────────────────────────────────────
// INTERFACE (Contract)
// ─────────────────────────────────────────────

export interface IEventEmitter {
  on(eventType: NotificationEventType, listener: NotificationListener): void;
  off(eventType: NotificationEventType, listener: NotificationListener): void;
  emit(event: NotificationEvent): void;
  getEventHistory(): NotificationEvent[];
  clearHistory(): void;
}

// ─────────────────────────────────────────────
// IMPLEMENTATION
// ─────────────────────────────────────────────

class NotificationService implements IEventEmitter {
  private listeners = new Map<NotificationEventType, Set<NotificationListener>>();
  private history: NotificationEvent[] = [];

  on(eventType: NotificationEventType, listener: NotificationListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  off(eventType: NotificationEventType, listener: NotificationListener): void {
    this.listeners.get(eventType)?.delete(listener);
  }

  emit(event: NotificationEvent): void {
    // Store in history
    this.history.push(event);

    // Broadcast to all listeners for this event type
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (err) {
          console.error(`[NotificationService] Listener error for "${event.type}":`, err);
        }
      });
    }

    // Console log for development visibility
    console.log(`[Event: ${event.type}] Student ${event.studentId} → Mentor ${event.mentorId}`, event);
  }

  getEventHistory(): NotificationEvent[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}

// ─────────────────────────────────────────────
// LISTENER FACTORIES
// Create pre-built listeners to attach to the service
// ─────────────────────────────────────────────

/**
 * Toast Listener – triggers a callback with a user-facing message.
 * Connect this to the useToast hook in the UI layer.
 */
export function createToastListener(
  onMessage: (message: string, type: 'success' | 'error' | 'info') => void
): NotificationListener {
  return (event: NotificationEvent) => {
    switch (event.type) {
      case 'session.requested':
        onMessage('🎉 Session requested! Check your bookings.', 'success');
        break;
      case 'session.confirmed':
        onMessage('✅ Your session has been confirmed!', 'success');
        break;
      case 'booking.cancelled':
        onMessage('❌ Booking was cancelled.', 'error');
        break;
      default:
        onMessage('📬 You have a new notification.', 'info');
    }
  };
}

/**
 * Email Listener (stub) – in Phase 2, call SendGrid/Resend API here.
 */
export function createEmailListener(): NotificationListener {
  return (event: NotificationEvent) => {
    // TODO Phase 2: call SendGrid API
    console.log(`[EmailService] Would send email for event: ${event.type}`);
  };
}

/**
 * Analytics Listener (stub) – in Phase 2, send to Mixpanel/PostHog.
 */
export function createAnalyticsListener(): NotificationListener {
  return (event: NotificationEvent) => {
    // TODO Phase 2: track(event.type, { studentId, mentorId })
    console.log(`[Analytics] Tracking event: ${event.type}`);
  };
}

// Export singleton
export const notificationService: IEventEmitter = new NotificationService();
