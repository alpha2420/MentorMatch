/**
 * Mock Data to simulate the SOLID Repositories
 */

export const mockMentors = [
  {
      id: 'mentor_1',
      name: 'Sarah Chen',
      title: 'Senior Frontend Engineer @ Netflix',
      expertise: ['React', 'Next.js', 'UI/UX', 'Performance'],
      experience: 8,
      hourlyRate: 85,
      isVerified: true,
      rating: 4.9,
      reviews: 120,
      avatar: 'SC'
  },
  {
      id: 'mentor_2',
      name: 'Alex Rodriguez',
      title: 'ML Engineer @ Google',
      expertise: ['Python', 'TensorFlow', 'Data Science', 'System Design'],
      experience: 5,
      hourlyRate: 60,
      isVerified: true,
      rating: 4.7,
      reviews: 45,
      avatar: 'AR'
  },
  {
      id: 'mentor_3',
      name: 'Priya Sharma',
      title: 'Lead Product Manager',
      expertise: ['Agile', 'Product Strategy', 'Leadership', 'Career Transition'],
      experience: 12,
      hourlyRate: 110,
      isVerified: true,
      rating: 5.0,
      reviews: 88,
      avatar: 'PS'
  },
  {
      id: 'mentor_4',
      name: 'James Wilson',
      title: 'Full Stack Dev @ Stripe',
      expertise: ['TypeScript', 'Node.js', 'PostgreSQL', 'API Design'],
      experience: 6,
      hourlyRate: 75,
      isVerified: false,
      rating: 4.5,
      reviews: 12,
      avatar: 'JW'
  },
  {
      id: 'mentor_5',
      name: 'Elena Rostova',
      title: 'DevOps Architect',
      expertise: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
      experience: 10,
      hourlyRate: 95,
      isVerified: true,
      rating: 4.8,
      reviews: 56,
      avatar: 'ER'
  }
];

// Current logged in user (mock)
export const currentUser = {
  id: 'student_777',
  name: 'Shikhar Singh',
  role: 'STUDENT',
  learningGoals: ['React', 'Python', 'System Design'],
  skillLevel: 'INTERMEDIATE'
};

/**
* Simple implementation of the SkillBasedMatchingStrategy from SOLID docs
*/
export function calculateMatchScore(student, mentor) {
  let score = 0;
  const reasons = [];

  // 1. Skill Match (highest weight)
  const matchedSkills = student.learningGoals.filter(goal => 
      mentor.expertise.some(exp => exp.toLowerCase().includes(goal.toLowerCase()))
  );
  
  if (matchedSkills.length > 0) {
      score += matchedSkills.length * 20;
      reasons.push(`Matches ${matchedSkills.length} of your goals`);
  }

  // 2. Rating Bonus
  if (mentor.rating >= 4.8) {
      score += 20;
      reasons.push('Top rated mentor');
  } else if (mentor.rating >= 4.5) {
      score += 10;
  }

  // 3. Verification Bonus
  if (mentor.isVerified) {
      score += 10;
  }

  // 4. Experience vs Level
  if (student.skillLevel === 'INTERMEDIATE' && mentor.experience >= 5) {
      score += 15;
      reasons.push('Right experience level for you');
  }

  return {
      mentorId: mentor.id,
      score: Math.min(score, 100) || 45, // Cap at 100, min 45
      reasons: reasons.slice(0, 2) // keep top 2 reasons
  };
}
