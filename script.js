// Flight tracker JavaScript functionality

// Demo mode variables
let demoMode = false;
let demoTime = null;

// Function to get current time (real or demo)
function getCurrentTime() {
    return demoMode ? new Date(demoTime) : new Date();
}

// Flight data with timestamps (all times converted to Swedish time for viewers)
const flightData = {
    flight1: {
        departure: new Date('2025-09-19T11:00:00+02:00'), // 11:00 Sweden time (CEST UTC+2)
        arrival: new Date('2025-09-19T22:30:00+02:00'), // 22:30 Sweden time same day (05:30 local Seoul time = 22:30 Sweden time)
        destination: 'Seoul',
        code: 'ICN',
        from: 'Stockholm',
        fromCode: 'ARN'
    },
    flight2: {
        departure: new Date('2025-09-26T07:30:00+02:00'), // 07:30 Sweden time (14:30 Seoul time = 07:30 Sweden time)
        arrival: new Date('2025-09-26T09:45:00+02:00'), // 09:45 Sweden time (16:45 Tokyo time = 09:45 Sweden time)
        destination: 'Tokyo',
        code: 'NRT',
        from: 'Seoul',
        fromCode: 'ICN'
    },
    flight3: {
        departure: new Date('2025-10-04T09:15:00+02:00'), // 09:15 Sweden time (16:15 Tokyo time = 09:15 Sweden time)
        arrival: new Date('2025-10-05T07:45:00+02:00'), // 07:45 Sweden time next day
        destination: 'Stockholm',
        code: 'ARN',
        from: 'Tokyo',
        fromCode: 'NRT'
    }
};

// Update current date and time
function updateDateTime() {
    const now = getCurrentTime();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    };
    
    document.getElementById('currentDateTime').textContent = now.toLocaleDateString('en-US', options);
    document.getElementById('lastUpdated').textContent = now.toLocaleDateString('en-US', options);
}

// Calculate countdown timer
function getTimeRemaining(endDate) {
    const now = getCurrentTime().getTime();
    const distance = endDate.getTime() - now;
    
    if (distance < 0) {
        return {
            total: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }
    
    return {
        total: distance,
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
    };
}

// Format countdown display
function formatCountdown(timeObj) {
    if (timeObj.total <= 0) {
        return "DEPARTED";
    }
    
    if (timeObj.days > 0) {
        return `${timeObj.days}d ${timeObj.hours}h ${timeObj.minutes}m`;
    } else {
        return `${timeObj.hours.toString().padStart(2, '0')}:${timeObj.minutes.toString().padStart(2, '0')}:${timeObj.seconds.toString().padStart(2, '0')}`;
    }
}

// Update flight status based on current time
function updateFlightStatus(flightId, flight) {
    const now = getCurrentTime();
    const departureTime = flight.departure;
    const arrivalTime = flight.arrival;
    const timeToDeparture = departureTime.getTime() - now.getTime();
    const timeToArrival = arrivalTime.getTime() - now.getTime();
    const hoursToDeparture = timeToDeparture / (1000 * 60 * 60);
    
    const statusElement = document.getElementById(`status${flightId.slice(-1)}`);
    
    if (now >= departureTime && now < arrivalTime) {
        // Currently in flight
        statusElement.textContent = "IN FLIGHT";
        statusElement.className = "status-badge in-flight";
        return "in-flight";
    } else if (timeToArrival < 0) {
        // Flight has arrived
        statusElement.textContent = "ARRIVED";
        statusElement.className = "status-badge arrived";
        return "arrived";
    } else if (hoursToDeparture <= 2 && hoursToDeparture > 0) {
        // Boarding (within 2 hours)
        statusElement.textContent = "BOARDING";
        statusElement.className = "status-badge boarding";
        return "boarding";
    } else if (timeToDeparture > 0) {
        // Scheduled
        statusElement.textContent = "SCHEDULED";
        statusElement.className = "status-badge scheduled";
        return "scheduled";
    } else {
        // Flight has departed but not yet arrived (shouldn't happen with proper arrival times)
        statusElement.textContent = "DEPARTED";
        statusElement.className = "status-badge departed";
        return "departed";
    }
}

// Update trip status
function updateTripStatus() {
    const now = getCurrentTime();
    const flight1 = flightData.flight1;
    const flight2 = flightData.flight2;
    const flight3 = flightData.flight3;
    
    const statusElement = document.getElementById('tripStatus');
    
    if (now < flight1.departure) {
        // Before first flight
        statusElement.textContent = "PREPARING FOR DEPARTURE";
    } else if (now >= flight1.departure && now < flight1.arrival) {
        // During first flight
        statusElement.textContent = "IN FLIGHT TO SEOUL";
    } else if (now >= flight1.arrival && now < flight2.departure) {
        // In South Korea
        statusElement.textContent = "EXPLORING SOUTH KOREA";
    } else if (now >= flight2.departure && now < flight2.arrival) {
        // During second flight
        statusElement.textContent = "IN FLIGHT TO TOKYO";
    } else if (now >= flight2.arrival && now < flight3.departure) {
        // In Japan
        statusElement.textContent = "DISCOVERING JAPAN";
    } else if (now >= flight3.departure && now < flight3.arrival) {
        // During return flight
        statusElement.textContent = "IN FLIGHT TO STOCKHOLM";
    } else {
        // Back home
        statusElement.textContent = "BACK IN SWEDEN";
    }
}

// Update route progress
function updateRouteProgress() {
    const now = getCurrentTime();
    const points = document.querySelectorAll('.route-point');
    const lines = document.querySelectorAll('.route-line');
    
    // Reset all points and lines
    points.forEach(point => {
        point.classList.remove('active', 'completed');
    });
    lines.forEach(line => {
        line.classList.remove('active');
    });
    
    // Activate current position
    if (now < flightData.flight1.departure) {
        // At Stockholm
        document.getElementById('point-arn').classList.add('active');
    } else if (now >= flightData.flight1.departure && now < flightData.flight2.departure) {
        // In Seoul
        document.getElementById('point-arn').classList.add('completed');
        document.getElementById('line1').classList.add('active');
        document.getElementById('point-icn').classList.add('active');
    } else if (now >= flightData.flight2.departure && now < flightData.flight3.departure) {
        // In Tokyo
        document.getElementById('point-arn').classList.add('completed');
        document.getElementById('line1').classList.add('active');
        document.getElementById('point-icn').classList.add('completed');
        document.getElementById('line2').classList.add('active');
        document.getElementById('point-nrt').classList.add('active');
    } else {
        // Returning/Returned
        document.getElementById('point-arn').classList.add('completed');
        document.getElementById('line1').classList.add('active');
        document.getElementById('point-icn').classList.add('completed');
        document.getElementById('line2').classList.add('active');
        document.getElementById('point-nrt').classList.add('completed');
        document.getElementById('line3').classList.add('active');
        document.getElementById('point-return').classList.add('active');
    }
}

// Update all countdowns
function updateCountdowns() {
    Object.keys(flightData).forEach(flightId => {
        const flight = flightData[flightId];
        const timeRemaining = getTimeRemaining(flight.departure);
        const countdownElement = document.getElementById(`countdown${flightId.slice(-1)}`);
        
        // Check if flight is currently in progress
        const now = getCurrentTime();
        if (now >= flight.departure && now < flight.arrival) {
            // Show time until arrival instead of departure
            const timeToArrival = getTimeRemaining(flight.arrival);
            countdownElement.textContent = "ARRIVING: " + formatCountdown(timeToArrival);
        } else if (now >= flight.arrival) {
            countdownElement.textContent = "ARRIVED";
        } else {
            countdownElement.textContent = formatCountdown(timeRemaining);
            
            // Add urgent class if less than 6 hours remaining
            if (timeRemaining.total > 0 && timeRemaining.total < 6 * 60 * 60 * 1000) {
                countdownElement.classList.add('urgent');
            } else {
                countdownElement.classList.remove('urgent');
            }
        }
        
        updateFlightStatus(flightId, flight);
    });
}

// Add boarding announcement animation
function addBoardingAnnouncement() {
    const now = getCurrentTime();
    
    Object.keys(flightData).forEach(flightId => {
        const flight = flightData[flightId];
        const timeDiff = flight.departure.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // Simple background change for flights within 2 hours
        if (hoursDiff > 0 && hoursDiff <= 2) {
            const flightRow = document.getElementById(flightId.replace('flight', 'flight'));
            if (flightRow) {
                flightRow.style.background = '#333';
            }
        }
    });
}

// Terminal-style typing effect for messages
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Add random flight board updates (for realism)
function addRandomUpdates() {
    const updates = [
        "Weather conditions: Clear skies",
        "All systems operational",
        "Safe travels ahead",
        "Journey tracking active"
    ];
    
    // This could be expanded to show random "system messages"
    console.log(updates[Math.floor(Math.random() * updates.length)]);
}

// Initialize everything when page loads
function initialize() {
    updateDateTime();
    updateTripStatus();
    updateRouteProgress();
    updateCountdowns();
    addBoardingAnnouncement();
    
    // Update every second
    setInterval(() => {
        updateDateTime();
        updateCountdowns();
        updateTripStatus();
        updateRouteProgress();
        addBoardingAnnouncement();
    }, 1000);
    
    // Add random updates every 30 seconds
    setInterval(addRandomUpdates, 30000);
}

// Demo control functions
function applyDemoTime() {
    const demoDate = document.getElementById('demoDate').value;
    const demoTimeValue = document.getElementById('demoTime').value;
    
    if (demoDate && demoTimeValue) {
        demoTime = new Date(`${demoDate}T${demoTimeValue}:00`);
        demoMode = true;
        
        // Update everything immediately
        updateDateTime();
        updateCountdowns();
        updateTripStatus();
        updateRouteProgress();
        addBoardingAnnouncement();
        
        console.log('Demo time set to:', demoTime);
    }
}

function resetToRealTime() {
    demoMode = false;
    demoTime = null;
    
    // Update everything immediately
    updateDateTime();
    updateCountdowns();
    updateTripStatus();
    updateRouteProgress();
    addBoardingAnnouncement();
    
    console.log('Reset to real time');
}

// Loading animation for flight board
function showLoadingAnimation() {
    const flightBoard = document.querySelector('.flight-board');
    flightBoard.style.opacity = '0.7';
    flightBoard.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        flightBoard.style.opacity = '1';
        flightBoard.style.transform = 'scale(1)';
    }, 200);
}

// Enhanced hover effects for route points
function enhanceRoutePoints() {
    document.querySelectorAll('.route-point').forEach((point, index) => {
        point.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
            this.style.boxShadow = '0 8px 20px rgba(255, 221, 0, 0.4)';
        });
        
        point.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.boxShadow = '';
        });
    });
}

// Typewriter effect for status updates
function typewriterEffect(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;
    
    const type = () => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    };
    
    type();
}

// Demo mode toggle functionality
let demoVisible = false;

function toggleDemoControls() {
    const demoControls = document.getElementById('demoControls');
    demoVisible = !demoVisible;
    
    if (demoVisible) {
        demoControls.style.display = 'block';
        setTimeout(() => {
            demoControls.classList.add('visible');
        }, 10);
    } else {
        demoControls.classList.remove('visible');
        setTimeout(() => {
            demoControls.style.display = 'none';
        }, 300);
    }
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Show initial loading
    showLoadingAnimation();
    
    // Initialize after a brief delay for smooth loading
    setTimeout(() => {
        initialize();
    }, 100);
    
    // Demo controls event listeners
    document.getElementById('applyDemo').addEventListener('click', applyDemoTime);
    document.getElementById('resetDemo').addEventListener('click', resetToRealTime);
    
    // Enhanced flight row interactions
    document.querySelectorAll('.flight-row').forEach((row, index) => {
        row.addEventListener('click', function() {
            // Add click ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 221, 0, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                left: 50%;
                top: 50%;
                width: 20px;
                height: 20px;
                margin-left: -10px;
                margin-top: -10px;
            `;
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Subtle stagger animation on load
        row.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Enhance route points
    enhanceRoutePoints();
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Toggle demo controls with Ctrl+Alt+D
        if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            toggleDemoControls();
            return;
        }
        
        if (e.key === 'r' || e.key === 'R') {
            // Refresh with animation
            showLoadingAnimation();
            setTimeout(() => {
                updateCountdowns();
                updateTripStatus();
                updateRouteProgress();
            }, 100);
        }
    });
    
    // Add scroll reveal effect
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe main sections
    document.querySelectorAll('.status-bar, .flight-board, .progress-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

// Add visibility change handler to update when tab becomes active
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updateDateTime();
        updateCountdowns();
        updateTripStatus();
        updateRouteProgress();
    }
});

// Easter egg: Konami code for special message
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.code);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        alert('🎌 Arigatou gozaimasu! Thanks for checking out my Asia adventure tracker! 🇰🇷');
        konamiCode = [];
    }
});
