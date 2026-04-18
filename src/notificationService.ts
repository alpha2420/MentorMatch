/**
 * Notification Service - Observer Pattern
 * Decoupled event system for handling booking notifications
 */
 
import { NotificationEvent, NotificationEventType, NotificationListener } from './types';
 
/**
 * Event emitter interface
 */
export interface IEventEmitter {
  on(eventType: NotificationEventType, listener: NotificationListener): void;
  off(eventType: NotificationEventType, listener: NotificationListener): void;
  emit(event: NotificationEvent): void;
}
 
/**
 * Notification Service
 * Manages subscriptions and broadcasts events to listeners
 * Implements Observer Pattern
 */
export class NotificationService implements IEventEmitter {
  private listeners: Map<NotificationEventType, Set<NotificationListener>> = new Map();
  private eventHistory: NotificationEvent[] = [];
 
  /**
   * Subscribe to a notification event
   */
  on(eventType: NotificationEventType, listener: NotificationListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }
 
  /**
   * Unsubscribe from a notification event
   */
  off(eventType: NotificationEventType, listener: NotificationListener): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }
 
  /**
   * Emit an event to all subscribed listeners
   */
  emit(event: NotificationEvent): void {
    // Add timestamp if not present
    if (!event.timestamp) {
      event.timestamp = new Date();
    }
 
    // Store in history
    this.eventHistory.push(event);
 
    // Notify all listeners
    const eventListeners = this.listeners.get(event.type);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in notification listener for ${event.type}:`, error);
        }
      });
    }
 
    // Log for debugging
    this.logEvent(event);
  }
 
  /**
   * Get event history
   */
  getEventHistory(): NotificationEvent[] {
    return [...this.eventHistory];
  }
 
  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }
 
  /**
   * Get listeners count for a specific event
   */
  getListenerCount(eventType: NotificationEventType): number {
    return this.listeners.get(eventType)?.size ?? 0;
  }
 
  /**
   * Log events (in production, could send to logging service)
   */
  private logEvent(event: NotificationEvent): void {
    console.log(
      `[NotificationService] Event: ${event.type}`,
      `StudentID: ${event.studentId}, MentorID: ${event.mentorId}`
    );
  }
}
 
/**
 * Singleton instance
 */
export const notificationService = new NotificationService();
 
/**
 * Example listeners for different use cases
 */
 
/**
 * Toast notification listener
 */
export function createToastListener(
  onNotification: (message: string, type: string) => void
): NotificationListener {
  return (event: NotificationEvent) => {
    let message = '';
    let type = 'info';
 
    switch (event.type) {
      case 'session.requested':
        message = '✨ Booking request sent successfully!';
        type = 'success';
        break;
      case 'session.confirmed':
        message = '🎉 Your session has been confirmed!';
        type = 'success';
        break;
      case 'booking.cancelled':
        message = '❌ Booking has been cancelled.';
        type = 'error';
        break;
    }
 
    onNotification(message, type);
  };
}
 
/**
 * Email notification listener (stub for future implementation)
 */
export function createEmailListener(): NotificationListener {
  return async (event: NotificationEvent) => {
    // TODO: Integrate with SendGrid/Resend
    const emailData = {
      studentId: event.studentId,
      mentorId: event.mentorId,
      eventType: event.type,
      timestamp: event.timestamp,
    };
 
    console.log('[EmailListener] Would send email:', emailData);
 
    // Example: await sendEmail(emailData);
  };
}
 
/**
 * Analytics listener (stub for future implementation)
 */
export function createAnalyticsListener(): NotificationListener {
  return (event: NotificationEvent) => {
    // TODO: Integrate with analytics service (e.g., Mixpanel, Segment)
    const analyticsData = {
      event: event.type,
      studentId: event.studentId,
      mentorId: event.mentorId,
      timestamp: event.timestamp,
      context: event.data,
    };
 
    console.log('[AnalyticsListener] Tracking:', analyticsData);
 
    // Example: analytics.track(analyticsData);
  };
}
