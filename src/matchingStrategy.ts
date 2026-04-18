/**
 * matchingStrategy.ts
 * Strategy Pattern – Encapsulate the mentor ranking algorithm.
 * Swap SkillBasedMatchingStrategy for any new algorithm without touching the UI.
 */

import type { User, Mentor, MatchResult } from './types';

// ─────────────────────────────────────────────
// INTERFACE (Contract)
// ─────────────────────────────────────────────

export interface IMatchingStrategy {
  calculateMatchScore(student: User, mentor: Mentor): MatchResult;
  rankMentors(student: User, mentors: Mentor[]): MatchResult[];
}

// ─────────────────────────────────────────────
// SKILL-BASED STRATEGY (Default)
// Scoring breakdown:
//   50% skill alignment
//   25% experience alignment
//   15% rating weight
//   10% verification bonus
// ─────────────────────────────────────────────

class SkillBasedMatchingStrategy implements IMatchingStrategy {
  calculateMatchScore(student: User, mentor: Mentor): MatchResult {
    const reasons: string[] = [];

    // ── 1. Skill Alignment (50 pts) ─────────
    const matchedSkills = student.goals.filter(goal =>
      mentor.expertise.some(exp =>
        exp.toLowerCase().includes(goal.toLowerCase()) ||
        goal.toLowerCase().includes(exp.toLowerCase())
      )
    );

    const totalGoals = student.goals.length || 1;
    const rawSkillScore = (matchedSkills.length / totalGoals) * 50;
    const skillAlignment = Math.round(rawSkillScore);

    if (matchedSkills.length > 0) {
      reasons.push(`✨ Matches ${matchedSkills.length} of your ${totalGoals} goals (${matchedSkills.join(', ')})`);
    }

    // ── 2. Experience Alignment (25 pts) ────
    let experienceAlignment = 0;
    const expMap: Record<string, number> = {
      beginner: 1,
      intermediate: 5,
      advanced: 9,
    };
    const neededExp = expMap[student.level] ?? 5;

    if (mentor.experience >= neededExp + 4) {
      experienceAlignment = 25;
      reasons.push('🏆 Highly experienced for your level');
    } else if (mentor.experience >= neededExp) {
      experienceAlignment = 18;
      reasons.push('💪 Good experience match for your level');
    } else {
      experienceAlignment = 8;
    }

    // ── 3. Rating Weight (15 pts) ───────────
    let ratingWeight = 0;
    if (mentor.rating >= 4.9) {
      ratingWeight = 15;
      reasons.push('⭐ Exceptional rating from students');
    } else if (mentor.rating >= 4.7) {
      ratingWeight = 12;
      reasons.push('⭐ Highly rated by students');
    } else if (mentor.rating >= 4.5) {
      ratingWeight = 8;
    } else {
      ratingWeight = 4;
    }

    // ── 4. Verification Bonus (10 pts) ──────
    const verificationBonus = mentor.isVerified ? 10 : 0;
    if (mentor.isVerified) {
      reasons.push('✅ Identity verified');
    }

    // ── Total ────────────────────────────────
    const rawScore = skillAlignment + experienceAlignment + ratingWeight + verificationBonus;
    const matchScore = Math.min(100, Math.max(30, rawScore));

    return {
      mentor,
      matchScore,
      matchReasons: reasons.slice(0, 3),
      skillAlignment,
      experienceAlignment,
      ratingWeight,
    };
  }

  rankMentors(student: User, mentors: Mentor[]): MatchResult[] {
    return mentors
      .map(mentor => this.calculateMatchScore(student, mentor))
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}

// ─────────────────────────────────────────────
// FACTORY FUNCTION
// Usage: const strategy = createMatchingStrategy('skill-based')
// ─────────────────────────────────────────────

export type StrategyType = 'skill-based'; // extend as needed

export function createMatchingStrategy(type: StrategyType = 'skill-based'): IMatchingStrategy {
  switch (type) {
    case 'skill-based':
    default:
      return new SkillBasedMatchingStrategy();
  }
}

// Export singleton
export const matchingStrategy: IMatchingStrategy = createMatchingStrategy('skill-based');
