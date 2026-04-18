import { mockMentors, currentUser, calculateMatchScore } from './mockData.js';

// DOM Elements
const mentorsGrid = document.getElementById('mentorsGrid');
const searchInput = document.getElementById('searchInput');
const mentorCount = document.getElementById('mentorCount');
const filterBtns = document.querySelectorAll('.filter-btn');

// Modal Elements
const bookingModal = document.getElementById('bookingModal');
const closeModal = document.getElementById('closeModal');
const bookingForm = document.getElementById('bookingForm');
const modalMentorSummary = document.getElementById('modalMentorSummary');

// State
let selectedMentor = null;

/**
 * Initialize App
 */
function init() {
    // Calculate match scores for all mentors based on current user
    const processedMentors = mockMentors.map(mentor => {
        const matchInfo = calculateMatchScore(currentUser, mentor);
        return {
            ...mentor,
            matchScore: matchInfo.score,
            matchReasons: matchInfo.reasons
        };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Initial render
    setTimeout(() => {
        renderMentors(processedMentors);
    }, 600); // Fake loading delay

    // Setup basic search listener
    document.getElementById('searchBtn').addEventListener('click', () => {
        handleSearch(processedMentors);
    });
    
    searchInput.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') handleSearch(processedMentors);
    });

    // Filtering
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            handleFilter(processedMentors, e.target.dataset.level);
        });
    });

    // Modal listeners
    closeModal.addEventListener('click', closeBookingModal);
    bookingModal.addEventListener('click', (e) => {
        if(e.target === bookingModal) closeBookingModal();
    });

    // Form submission
    bookingForm.addEventListener('submit', handleBookingSubmit);
}

/**
 * Render Mentors to DOM
 */
function renderMentors(mentors) {
    if (mentors.length === 0) {
        mentorsGrid.innerHTML = `<div class="loader">No mentors found matching your criteria. Try a different search.</div>`;
        mentorCount.textContent = `0 matches`;
        return;
    }

    mentorCount.textContent = `${mentors.length} match${mentors.length !== 1 ? 'es' : ''} found`;
    mentorsGrid.innerHTML = '';

    mentors.forEach((mentor, index) => {
        const delay = index * 0.1;
        
        const card = document.createElement('div');
        card.className = `mentor-card glass animate-up`;
        card.style.animationDelay = `${delay}s`;

        // Verification badge html
        const verifyHTML = mentor.isVerified 
            ? `<span title="Verified Mentor" style="color:var(--primary); font-size:1.1rem">✓</span>` 
            : ``;

        // Skills tags limit to 3
        const skillsHTML = mentor.expertise.slice(0, 3).map(skill => 
            `<span class="skill-tag">${skill}</span>`
        ).join('');
        const extraSkills = mentor.expertise.length > 3 ? `<span class="skill-tag">+${mentor.expertise.length - 3}</span>` : '';

        // Match reason text
        const reasonText = mentor.matchReasons.length ? mentor.matchReasons[0] : 'Solid choice';

        card.innerHTML = `
            <div class="card-header">
                <div class="mentor-info">
                    <h4>${mentor.name} ${verifyHTML}</h4>
                    <div class="mentor-title">${mentor.title}</div>
                </div>
                <div class="match-score" title="Match Score calculated by IMatchingStrategy">
                    ✨ ${mentor.matchScore}% 
                </div>
            </div>
            
            <p style="font-size: 0.85rem; color: #a0a0a0;">💡 ${reasonText}</p>
            
            <div class="skills-list">
                ${skillsHTML} ${extraSkills}
            </div>
            
            <div class="card-footer">
                <div class="rating">⭐ ${mentor.rating} <span style="color:var(--text-muted); font-size: 0.8rem">(${mentor.reviews})</span></div>
                <div class="price">$${mentor.hourlyRate}<span>/hr</span></div>
            </div>
            <button class="btn-outline mt-3 book-btn" data-id="${mentor.id}">Request Session</button>
        `;

        mentorsGrid.appendChild(card);
    });

    // Attach event listeners to new book buttons
    document.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const mentor = mentors.find(m => m.id === id);
            openBookingModal(mentor);
        });
    });
}

/**
 * Handlers
 */
function handleSearch(mentors) {
    const query = searchInput.value.toLowerCase();
    
    if(!query) {
        renderMentors(mentors);
        return;
    }

    const filtered = mentors.filter(m => 
        m.expertise.some(skill => skill.toLowerCase().includes(query)) ||
        m.name.toLowerCase().includes(query) ||
        m.title.toLowerCase().includes(query)
    );
    
    renderMentors(filtered);
}

function handleFilter(mentors, filterType) {
    let filtered = [...mentors];
    
    if (filterType === 'HIGH_RATED') {
        filtered = filtered.filter(m => m.rating >= 4.8);
    } else if (filterType === 'VERIFIED') {
        filtered = filtered.filter(m => m.isVerified);
    }
    
    // Also respect current search if any
    const query = searchInput.value.toLowerCase();
    if (query) {
        filtered = filtered.filter(m => 
            m.expertise.some(skill => skill.toLowerCase().includes(query)) ||
            m.name.toLowerCase().includes(query)
        );
    }

    renderMentors(filtered);
}

function openBookingModal(mentor) {
    selectedMentor = mentor;
    
    // Set minimal min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(tomorrow.getHours() - tomorrow.getTimezoneOffset() / 60);
    document.getElementById('sessionDate').min = tomorrow.toISOString().slice(0, 16);

    modalMentorSummary.innerHTML = `
        <h4 style="color: var(--primary); margin-bottom: 0.5rem">Session with ${mentor.name}</h4>
        <p style="font-size: 0.9rem; color: var(--text-muted)">${mentor.title}</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem"><strong>Rate:</strong> $${mentor.hourlyRate}/hr</p>
    `;

    bookingModal.classList.add('active');
}

function closeBookingModal() {
    bookingModal.classList.remove('active');
    bookingForm.reset();
    selectedMentor = null;
}

function handleBookingSubmit(e) {
    e.preventDefault();
    
    // Simulate SessionService.requestSession()
    const topic = document.getElementById('topic').value;
    const date = new Date(document.getElementById('sessionDate').value).toLocaleString();
    
    closeBookingModal();
    
    showToast(`✅ Session requested with ${selectedMentor.name} for ${date}!`);
    
    // Emitting simulated event to console
    console.log(`[Event: session.requested] - Student ${currentUser.id} requested mentor ${selectedMentor.id}`);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerHTML = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Start application
document.addEventListener('DOMContentLoaded', init);
