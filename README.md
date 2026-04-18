# MentorMatch - Premium Mentorship Marketplace
 
A glassmorphic, high-performance web application that connects students with industry experts through intelligent matching. Built with TypeScript, React, and clean architecture principles.
 
## 🎯 Vision
 
Move beyond simple directory listings. MentorMatch uses **Intelligent Matching Strategies** to ensure students find the right mentor for their specific skill level and learning goals.
 
### The Problem
Traditional mentorship platforms are cluttered, lack verification, and don't provide context-aware matching.
 
### The Solution
A premium web application that prioritizes **Match Quality** over quantity, with:
- ✨ Glassmorphic UI with smooth animations
- 🧠 Intelligent skill-based matching
- 📊 Match transparency (see why mentors are ranked)
- 🔔 Real-time notifications
- 🏗️ Production-ready architecture
---
 
## 🏗️ Architecture Overview
 
### Design Patterns Used
 
| Pattern | Purpose | File |
|---------|---------|------|
| **Strategy** | Encapsulate matching algorithms for easy swapping | `matchingStrategy.ts` |
| **Repository** | Abstract data source from UI layer | `repository.ts` |
| **Observer** | Decouple event broadcasting from listeners | `notificationService.ts` |
| **Factory** | Centralized object creation | `matchingStrategy.ts` |
 
### SOLID Principles
 
- **S**ingle Responsibility: Each module has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **I**nterface Segregation: Components get only what they need
- **D**ependency Inversion: Depend on abstractions, not implementations
### File Structure
 
```
mentormatch/
├── src/
│   ├── types.ts                 # 📝 Type definitions & interfaces
│   ├── repository.ts            # 💾 Data layer (Repository Pattern)
│   ├── matchingStrategy.ts      # 🧠 Matching logic (Strategy Pattern)
│   ├── notificationService.ts   # 🔔 Events (Observer Pattern)
│   ├── hooks.tsx                # 🪝 Custom React hooks
│   ├── App.tsx                  # 🎨 Main UI component
│   ├── index.tsx                # ⚙️ React entry point
│   └── index.html               # 📄 HTML template
│
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite build config
├── package.json                 # Dependencies
└── README.md                    # This file
```
 
---
 
## 🚀 Quick Start
 
### Prerequisites
- Node.js 16+ 
- npm 7+
### Installation
 
1. **Clone/Setup the project**
   ```bash
   mkdir mentormatch
   cd mentormatch
   ```
 
2. **Initialize with Vite**
   ```bash
   npm create vite@latest . -- --template react-ts
   npm install
   ```
 
3. **Copy all TypeScript files**
   ```bash
   cp types.ts repository.ts matchingStrategy.ts \
      notificationService.ts hooks.tsx App.tsx \
      index.tsx src/
   cp index.html .
   ```
 
4. **Update `src/main.tsx`** (rename from provided index.tsx)
   ```typescript
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import MentorMatch from './App';
 
   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <MentorMatch />
     </React.StrictMode>,
   );
   ```
 
5. **Start development server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173`
---
 
## 📚 Core Concepts
 
### 1. Matching Algorithm
 
The matching strategy scores mentors based on:
 
- **Skill Alignment** (50%): How well mentor's expertise matches student's goals
- **Experience Alignment** (25%): Mentor's rating and verified status
- **Availability Alignment** (15%): How available the mentor is
- **Quality Rating** (10%): Overall mentor rating score
```typescript
// Example: Get ranked mentors for a student
const student: User = {
  id: 'user-1',
  name: 'Shikhar',
  goals: ['React', 'TypeScript'],
  level: 'intermediate',
};
 
const mentors = await repository.getAllMentors();
const matches = matchingStrategy.rankMentors(student, mentors);
// Returns sorted by match score with reasons
 
console.log(matches[0]); 
// {
//   mentor: {...},
//   matchScore: 95,
//   matchReasons: [
//     "✨ Strong skill match with your goals",
//     "🏆 Highly experienced in the field",
//     "⭐ Exceptional reviews"
//   ]
// }
```
 
### 2. Data Layer (Repository Pattern)
 
**Why?** To decouple the UI from the database. Switching from mock data to Supabase requires only changing the repository implementation, not the UI.
 
```typescript
// MockDataRepository (current - for development)
const mentors = await repository.getAllMentors();
const booking = await repository.saveBooking(bookingData);
 
// Future: SupabaseRepository (just implement IRepository)
export class SupabaseRepository implements IRepository {
  async getAllMentors() {
    const { data } = await this.supabase
      .from('mentors')
      .select('*');
    return data;
  }
}
```
 
### 3. Notification System (Observer Pattern)
 
**Why?** Multiple systems need to react to events (toast notifications, emails, analytics, logging). Keep them decoupled.
 
```typescript
// Subscribe to events
const toastListener = createToastListener((msg, type) => {
  addToast(msg, type);
});
notificationService.on('session.requested', toastListener);
 
// Emit events
notificationService.emit({
  type: 'session.requested',
  studentId: 'user-1',
  mentorId: 'mentor-1',
  timestamp: new Date(),
});
 
// Future: Add email listener without touching existing code
const emailListener = createEmailListener();
notificationService.on('session.requested', emailListener);
```
 
---
 
## 🎨 UI Components
 
### MentorCard
Displays a mentor with:
- Profile image and name
- Match score percentage
- Skill badges (3 most relevant)
- Match reasons
- "Book Session" button
### BookingModal
Form to:
- Select date/time
- Enter session topic
- Choose duration (30, 60, 90 min)
- Add optional notes
### ToastNotification
Temporary success/error messages
- Auto-dismisses after 3 seconds
- Customizable type (success, error, info)
---
 
## 📊 Data Models
 
### User (Student)
```typescript
interface User {
  id: string;
  name: string;
  role: 'student' | 'mentor';
  goals: string[];           // e.g., ['React', 'TypeScript']
  level: 'beginner' | 'intermediate' | 'advanced';
  email?: string;
  avatar?: string;
}
```
 
### Mentor
```typescript
interface Mentor {
  id: string;
  name: string;
  title: string;             // e.g., 'Senior React Engineer'
  expertise: string[];       // Skills they teach
  rating: number;            // 0-5 scale
  isVerified: boolean;
  hourlyRate?: number;
  responseTime?: string;
  availability?: string[];   // Days/times available
  image?: string;
  reviews?: number;
}
```
 
### Booking
```typescript
interface Booking {
  id: string;
  studentId: string;
  mentorId: string;
  date: string;              // ISO 8601 format
  topic: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  duration?: number;         // minutes
}
```
 
### MatchResult
```typescript
interface MatchResult {
  mentor: Mentor;
  matchScore: number;        // 0-100
  matchReasons: string[];
  skillAlignment: number;
  experienceAlignment: number;
  availabilityAlignment: number;
}
```
 
---
 
## 🔧 Custom Hooks
 
### `useSearch(mentors)`
Filter mentors by search term, skills, and rating
```typescript
const {
  searchTerm,
  setSearchTerm,
  selectedSkills,
  toggleSkill,
  minRating,
  setMinRating,
  filteredMentors
} = useSearch(mentors);
```
 
### `useToast()`
Manage toast notifications
```typescript
const { toasts, addToast, removeToast } = useToast();
addToast('Booking successful!', 'success', 3000);
```
 
### `useModal<T>()`
Control modal visibility and data
```typescript
const modal = useModal<Mentor>();
modal.open(mentorData);
modal.close();
```
 
### `useAsync<T>(asyncFn, immediate)`
Handle async operations with loading state
```typescript
const { status, data, error, execute } = useAsync(
  () => repository.getAllMentors(),
  true // execute immediately
);
```
 
### `useBookingForm()`
Manage booking form state
```typescript
const { formData, updateField, reset, isValid } = useBookingForm();
```
 
---
 
## 🌅 Glassmorphic Design
 
Uses CSS custom properties for a cohesive premium aesthetic:
 
```css
--primary: #6366f1 (Indigo)
--bg-primary: #0f172a (Dark slate)
--bg-glass: rgba(15, 23, 42, 0.7)
--border: rgba(148, 163, 184, 0.1) (Subtle)
 
/* Glass effect */
.glass {
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border);
  border-radius: 16px;
}
```
 
---
 
## 🚀 Roadmap
 
### Phase 1: ✅ Complete
- [x] Glassmorphic UI
- [x] Intelligent matching
- [x] Dynamic search/filter
- [x] Booking system
- [x] Clean architecture
### Phase 2: 🚧 Next
- [ ] **Supabase Integration**: Real database + auth
- [ ] **Email Notifications**: SendGrid/Resend
- [ ] **Payments**: Stripe integration
- [ ] **Mentor Dashboard**: Manage requests
### Phase 3: Future
- [ ] **AI Recommendations**: ML-based matching
- [ ] **Video Calls**: Integrated Zoom/Whereby
- [ ] **Reviews & Ratings**: Student feedback
- [ ] **Analytics**: Track match quality
---
 
## 📚 Example: Adding Supabase
 
Want to switch from mock data to a real database?
 
1. Install Supabase client:
   ```bash
   npm install @supabase/supabase-js
   ```
 
2. Create `SupabaseRepository.ts`:
   ```typescript
   import { SupabaseClient } from '@supabase/supabase-js';
   import { IRepository } from './types';
 
   export class SupabaseRepository implements IRepository {
     constructor(private client: SupabaseClient) {}
 
     async getAllMentors() {
       const { data } = await this.client
         .from('mentors')
         .select('*');
       return data || [];
     }
 
     async saveBooking(booking: Booking) {
       const { data } = await this.client
         .from('bookings')
         .insert([booking]);
       return data[0];
     }
     // ... other methods
   }
   ```
 
3. In `App.tsx`, just swap the repository:
   ```typescript
   // const repository = new MockDataRepository();
   const supabase = createClient(URL, KEY);
   const repository = new SupabaseRepository(supabase);
   ```
 
**That's it!** No UI changes needed because we depend on the `IRepository` interface.
 
---
 
## 🧪 Testing
 
### Type Safety
```bash
npm run type-check
```
 
### Run Tests
```bash
npm test
```
 
### Test Example: Matching Algorithm
```typescript
describe('SkillBasedMatchingStrategy', () => {
  it('should score perfect match for exact skills', () => {
    const student = {
      goals: ['React', 'TypeScript'],
      level: 'intermediate'
    };
    const mentor = {
      expertise: ['React', 'TypeScript'],
      rating: 5.0,
      isVerified: true
    };
    
    const result = strategy.calculateMatchScore(student, mentor);
    expect(result.matchScore).toBe(100);
  });
});
```
 
---
 
## 📦 Build & Deploy
 
### Build for Production
```bash
npm run build
```
Creates optimized `dist/` folder.
 
### Deploy Options
 
**Vercel** (recommended for React)
```bash
npm i -g vercel
vercel deploy
```
 
**Netlify**
```bash
npm run build
# Drag dist/ to netlify.com
```
 
**Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```
 
---
 
## 🔐 Security Best Practices
 
- ✅ Input validation in forms
- ✅ Rate limiting (prepare for backend)
- ✅ CORS handling
- ✅ Environment variables for API keys
- ✅ Type safety prevents many bugs
---
 
## 📄 License
 
MIT License - Feel free to use for learning and personal projects.
 
---
 
## 💬 Questions?
 
Refer to `IMPLEMENTATION_GUIDE.ts` for:
- Detailed architecture walkthrough
- Data flow examples
- Advanced patterns
- Performance optimization tips
---
 
**Built with ❤️ using TypeScript, React, and clean architecture principles.**
