/**
 * Matching Strategy Pattern
 * Core business logic for calculating mentor-student match scores
 */
 
import { Mentor, User, MatchResult, SearchQuery } from './types';
 
/**
 * Scoring configuration for tuning match algorithm
 */
interface ScoringWeights {
  skillAlignment: number; // 0-1
  experienceAlignment: number; // 0-1
  availabilityAlignment: number; // 0-1
  ratingWeight: number; // 0-1
}
 
/**
 * Matching Strategy Interface
 * Allows swapping different matching algorithms
 */
export interface IMatchingStrategy {
  calculateMatchScore(student: User, mentor: Mentor): MatchResult;
  rankMentors(student: User, mentors: Mentor[]): MatchResult[];
}
 
/**
 * Skill-Based Matching Strategy
 * Default implementation using skill overlap and relevance
 */
export class SkillBasedMatchingStrategy implements IMatchingStrategy {
  private weights: ScoringWeights = {
    skillAlignment: 0.5,
    experienceAlignment: 0.25,
    availabilityAlignment: 0.15,
    ratingWeight: 0.1,
  };
 
  /**
   * Calculate match score for a single mentor
   */
  calculateMatchScore(student: User, mentor: Mentor): MatchResult {
    const skillScore = this.calculateSkillAlignment(student.goals, mentor.expertise);
    const experienceScore = this.calculateExperienceAlignment(
      student.level,
      mentor.rating
    );
    const availabilityScore = this.calculateAvailabilityAlignment(mentor);
 
    // Weighted score calculation
    const weightedScore =
      skillScore * this.weights.skillAlignment +
      experienceScore * this.weights.experienceAlignment +
      availabilityScore * this.weights.availabilityAlignment +
      (mentor.rating / 5) * this.weights.ratingWeight;
 
    // Generate human-readable match reasons
    const reasons = this.generateMatchReasons(
      student,
      mentor,
      skillScore,
      experienceScore
    );
 
    return {
      mentor,
      matchScore: Math.round(weightedScore * 100),
      matchReasons: reasons,
      skillAlignment: Math.round(skillScore * 100),
      experienceAlignment: Math.round(experienceScore * 100),
      availabilityAlignment: Math.round(availabilityScore * 100),
    };
  }
 
  /**
   * Rank multiple mentors for a student
   */
  rankMentors(student: User, mentors: Mentor[]): MatchResult[] {
    return mentors
      .map((mentor) => this.calculateMatchScore(student, mentor))
      .sort((a, b) => b.matchScore - a.matchScore);
  }
 
  /**
   * Calculate skill overlap between student goals and mentor expertise
   * Returns 0-1 score
   */
  private calculateSkillAlignment(studentGoals: string[], mentorExpertise: string[]): number {
    if (studentGoals.length === 0 || mentorExpertise.length === 0) {
      return 0;
    }
 
    // Normalize inputs to lowercase for comparison
    const normalizedGoals = studentGoals.map((g) => g.toLowerCase());
    const normalizedExpertise = mentorExpertise.map((e) => e.toLowerCase());
 
    // Count exact matches
    let exactMatches = 0;
    let partialMatches = 0;
 
    for (const goal of normalizedGoals) {
      if (normalizedExpertise.includes(goal)) {
        exactMatches++;
      } else {
        // Check for partial matches (e.g., "React" matches "React.js")
        for (const expertise of normalizedExpertise) {
          if (this.isPartialMatch(goal, expertise)) {
            partialMatches++;
            break;
          }
        }
      }
    }
 
    // Score: weighted combination of exact and partial matches
    const maxMatches = Math.max(normalizedGoals.length, normalizedExpertise.length);
    const score = (exactMatches * 1.0 + partialMatches * 0.6) / maxMatches;
 
    return Math.min(score, 1);
  }
 
  /**
   * Determine if mentor's experience level matches student's level
   */
  private calculateExperienceAlignment(studentLevel: string, mentorRating: number): number {
    // Higher rating indicates more experienced mentor
    const ratingNormalized = mentorRating / 5;
 
    // Boost score if mentor has high ratings across all levels
    return Math.min(ratingNormalized, 1);
  }
 
  /**
   * Assess availability compatibility (simplified)
   */
  private calculateAvailabilityAlignment(mentor: Mentor): number {
    // If mentor shows availability, score is high
    if (!mentor.availability) return 0.5;
    if (mentor.availability.includes('Daily')) return 1;
    return Math.min(mentor.availability.length / 7, 1); // Days per week ratio
  }
 
  /**
   * Partial string matching for related skills
   */
  private isPartialMatch(skill1: string, skill2: string): boolean {
    const keywords1 = skill1.split(/[\s\-\.]/);
    const keywords2 = skill2.split(/[\s\-\.]/);
 
    return keywords1.some((k1) => keywords2.some((k2) => k1.includes(k2) || k2.includes(k1)));
  }
 
  /**
   * Generate human-readable explanations for the match
   */
  private generateMatchReasons(
    student: User,
    mentor: Mentor,
    skillScore: number,
    experienceScore: number
  ): string[] {
    const reasons: string[] = [];
 
    // Skill alignment reasons
    if (skillScore >= 0.8) {
      reasons.push('✨ Strong skill match with your goals');
    } else if (skillScore >= 0.5) {
      reasons.push('Good overlap with your learning objectives');
    }
 
    // Experience alignment reasons
    if (experienceScore >= 0.8) {
      reasons.push('🏆 Highly experienced in the field');
    } else if (experienceScore >= 0.6) {
      reasons.push('Solid track record and positive reviews');
    }
 
    // Verification
    if (mentor.isVerified) {
      reasons.push('✓ Verified mentor');
    }
 
    // Availability
    if (mentor.availability) {
      if (mentor.availability.includes('Daily')) {
        reasons.push('Available whenever you need');
      } else {
        reasons.push(`Available ${mentor.availability.length} days/week`);
      }
    }
 
    // Rating
    if (mentor.rating >= 4.8) {
      reasons.push('⭐ Exceptional reviews');
    } else if (mentor.rating >= 4.5) {
      reasons.push('Great feedback from students');
    }
 
    return reasons;
  }
}
 
/**
 * Factory function to create matching strategies
 */
export function createMatchingStrategy(
  type: 'skill-based' = 'skill-based'
): IMatchingStrategy {
  switch (type) {
    case 'skill-based':
    default:
      return new SkillBasedMatchingStrategy();
  }
}
 
/**
 * Singleton instance
 */
export const matchingStrategy = new SkillBasedMatchingStrategy();
