// Get URL parameters
function getUrlParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    for (const [key, value] of urlParams) {
        params[key] = value;
    }
    
    return params;
}

// Format time to always have 2 digits
function formatTimeUnit(unit) {
    return unit.toString().padStart(2, '0');
}

// Encode timer name to make URL shorter
function encodeTimerName(name) {
    // Use base64 encoding and remove padding = signs to make it shorter
    return btoa(encodeURIComponent(name)).replace(/=/g, '');
}

// Decode timer name from URL
function decodeTimerName(encodedName) {
    try {
        // Add padding if needed and decode
        const paddedName = encodedName + '==='.slice(0, (4 - encodedName.length % 4) % 4);
        return decodeURIComponent(atob(paddedName));
    } catch (e) {
        console.error("Failed to decode timer name:", e);
        return "Timer"; // Default name on decode error
    }
}

// Update meta tags for social media sharing
function updateMetaTags(timerName, targetTimestamp, timeDifference, timerType) {
    // Format the remaining time for display
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    
    // Format the target date
    const targetDate = new Date(parseInt(targetTimestamp) * 1000);
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const dateString = targetDate.toLocaleDateString(undefined, dateOptions);
    const timeString = targetDate.toLocaleTimeString(undefined, timeOptions);
    
    // Create time remaining text based on timer type
    let timeRemainingText;
    if (timerType === 's') {
        const sleeps = calculateSleeps(targetDate);
        timeRemainingText = `${sleeps} sleeps remaining`;
    } else {
        timeRemainingText = `${formatTimeUnit(days)}d ${formatTimeUnit(hours)}h ${formatTimeUnit(minutes)}m remaining`;
    }
    
    // Create description text
    const description = `${timerName} ends on ${dateString} at ${timeString}. ${timeRemainingText}`;
    
    // Create or update meta tags
    updateOrCreateMetaTag('og:title', timerName);
    updateOrCreateMetaTag('og:description', description);
    updateOrCreateMetaTag('twitter:title', timerName);
    updateOrCreateMetaTag('twitter:description', description);
    updateOrCreateMetaTag('description', description);
    
    // Update page title
    document.title = `${timerName} - ${timeRemainingText}`;
}

// Calculate number of sleeps between now and the target date
function calculateSleeps(targetDate) {
    const today = new Date();
    
    if (targetDate.getDate() === today.getDate() && 
        targetDate.getMonth() === today.getMonth() && 
        targetDate.getFullYear() === today.getFullYear()) {
        return 0; // Same day, no sleeps
    } else {
        // Get today's end date (23:59:59.999)
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        
        // Calculate days excluding today
        return Math.ceil((targetDate - todayEnd) / (1000 * 60 * 60 * 24));
    }
}

// Helper function to update or create meta tags
function updateOrCreateMetaTag(name, content) {
    let metaTag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    
    if (!metaTag) {
        metaTag = document.createElement('meta');
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
            metaTag.setAttribute('property', name);
        } else {
            metaTag.setAttribute('name', name);
        }
        document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', content);
}

// Calculate the time difference between now and the target timestamp
function calculateTimeDifference(targetTimestamp) {
    const now = new Date().getTime();
    const targetTime = parseInt(targetTimestamp) * 1000; // Convert to milliseconds
    const difference = targetTime - now;
    
    return difference > 0 ? difference : 0;
}

// Update the timer display
function updateTimer(timeDifference, timerType = 'n') {
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    
    if (timerType === 's') {
        // Sleep needed mode - calculate number of sleeps (nights)
        const targetDate = new Date(Date.now() + timeDifference);
        const today = new Date();
        
        // Calculate sleeps by determining how many nights pass between now and the target
        let sleeps;
        
        if (targetDate.getDate() === today.getDate() && 
            targetDate.getMonth() === today.getMonth() && 
            targetDate.getFullYear() === today.getFullYear()) {
            sleeps = 0; // Same day, no sleeps
        } else {
            // Get today's end date (23:59:59.999)
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);
            
            // Calculate days excluding today
            sleeps = Math.ceil((targetDate - todayEnd) / (1000 * 60 * 60 * 24));
        }
        
        // Only show sleep count, hide hours, minutes, seconds
        document.getElementById('timer-d').textContent = formatTimeUnit(sleeps);
          // Add sleep count class if not already set
        if (!document.getElementById('timer-div').classList.contains('sleep-mode')) {
            document.getElementById('timer-div').classList.add('sleep-mode');
            document.querySelector('.time-unit:nth-child(1) span').textContent = 'sleeps left';
        }
    } else {
        // Normal countdown mode - show all units
        document.getElementById('timer-d').textContent = formatTimeUnit(days);
        document.getElementById('timer-h').textContent = formatTimeUnit(hours);
        document.getElementById('timer-m').textContent = formatTimeUnit(minutes);
        document.getElementById('timer-s').textContent = formatTimeUnit(seconds);
        
        // Remove sleep count class if set
        if (document.getElementById('timer-div').classList.contains('sleep-mode')) {
            document.getElementById('timer-div').classList.remove('sleep-mode');
            document.querySelector('.time-unit:nth-child(1) span').textContent = 'Days';
        }
    }
      // No need to update other fields in sleep mode
    // They're handled in the conditional blocks above
    
    return timeDifference <= 0;
}

// Start the countdown
function startCountdown(targetTimestamp, timerType = 'n', params = {}) {
    const timeDifference = calculateTimeDifference(targetTimestamp);
    const isFinished = updateTimer(timeDifference, timerType);
    
    // Get timer name from params
    const timerName = params.n ? decodeTimerName(params.n) : 'Timer';
    
    // Display the target date and time (only once)
    if (!document.getElementById('target-datetime')) {
        const targetDate = new Date(parseInt(targetTimestamp) * 1000);
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        
        const dateString = targetDate.toLocaleDateString(undefined, dateOptions);
        const timeString = targetDate.toLocaleTimeString(undefined, timeOptions);
        
        const targetInfo = document.createElement('p');
        targetInfo.id = 'target-datetime';
        targetInfo.textContent = `Target: ${dateString} at ${timeString}`;
        
        document.querySelector('#timer-div .timer-display').after(targetInfo);
    }
      // Update title based on timer type and name
    if (timerType === 's') {
        document.querySelector('#timer-div h1').textContent = timerName + ' - Sleep Counter';
    } else {
        document.querySelector('#timer-div h1').textContent = timerName;
    }
    
    // Update meta tags for social media sharing (do this on every countdown tick)
    updateMetaTags(timerName, targetTimestamp, timeDifference, timerType);
    
    if (!isFinished) {
        setTimeout(() => {
            startCountdown(targetTimestamp, timerType, params);
        }, 1000);
    } else {
        // Timer finished
        const timerName = params.n ? decodeTimerName(params.n) : 'Timer';
        document.getElementById('timer-div').innerHTML = `<h1>${timerName} - Time's up!</h1>`;
    }
}

// Generate a timestamp from precise date and time
function generateTimestampFromDateTime(dateTimeString) {
    const dateTime = new Date(dateTimeString);
    return Math.floor(dateTime.getTime() / 1000); // Return unix timestamp in seconds
}

// Initialize the timestamp generator
function initTimestampGenerator() {
    const timestampGen = document.getElementById('timestamp-gen');
    
    // Get current date and time for default values
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format date and time for input defaults
    const defaultDate = tomorrow.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const defaultTime = `${hours}:${minutes}`;
    
    // Create the generator UI
    timestampGen.innerHTML = `
        <h2>Generate a Countdown Timer</h2>
        <div class="input-group">
            <label for="timer-name">Timer Name:</label>
            <input type="text" id="timer-name" placeholder="Timer" value="Timer">
        </div>
        <div class="input-group">
            <label for="target-date">Target Date:</label>
            <input type="date" id="target-date" value="${defaultDate}" min="${now.toISOString().split('T')[0]}">
        </div>
        <div class="input-group">
            <label for="target-time">Target Time:</label>
            <input type="time" id="target-time" value="${defaultTime}">
        </div>
        <div class="radio-group">
            <p>Timer Display Mode:</p>
            <div class="radio-option">
                <input type="radio" id="timer-type-normal" name="timer-type" value="n" checked>
                <label for="timer-type-normal">Normal Countdown</label>
            </div>
            <div class="radio-option">
                <input type="radio" id="timer-type-sleep" name="timer-type" value="s">
                <label for="timer-type-sleep">Sleep Count</label>
            </div>
        </div>
        <button id="generate-btn">Generate Timer</button>
    `;
    
    // Add event listener to the generate button
    document.getElementById('generate-btn').addEventListener('click', () => {
        const timerName = document.getElementById('timer-name').value.trim() || 'Timer';
        const targetDate = document.getElementById('target-date').value;
        const targetTime = document.getElementById('target-time').value;
        const timerType = document.querySelector('input[name="timer-type"]:checked').value;
        
        if (!targetDate || !targetTime) {
            alert('Please set both date and time.');
            return;
        }
        
        const dateTimeString = `${targetDate}T${targetTime}`;
        const selectedDateTime = new Date(dateTimeString);
        const currentTime = new Date();
        
        if (selectedDateTime <= currentTime) {
            alert('Please select a future date and time.');
            return;
        }
        
        const timestamp = generateTimestampFromDateTime(dateTimeString);
        // Only encode and add name parameter if it's not the default "Timer"
        const nameParam = timerName !== 'Timer' ? `&n=${encodeTimerName(timerName)}` : '';
        window.location.href = window.location.pathname + `?ts=${timestamp}&type=${timerType}${nameParam}`;
    });
}

// Main initialization function
function init() {
    // Get the timestamp from the URL if available
    const params = getUrlParams();
    const timerDiv = document.getElementById('timer-div');
    const timestampGen = document.getElementById('timestamp-gen');
    
    // Set up the "new timer" button
    document.getElementById('new').addEventListener('click', () => {
        window.location.href = window.location.pathname;
    });
    
    // Check if a timestamp is provided in the URL
    if (params.ts) {
        // Show the timer and hide the generator
        timerDiv.style.display = 'block';
        timestampGen.style.display = 'none';
        
        // Get the timer type (default to normal if not specified or invalid)
        const timerType = params.type === 's' ? 's' : 'n';
        
        // Start the countdown with the provided timestamp, type, and params
        startCountdown(params.ts, timerType, params);
    } else {
        // Hide the timer and show the generator
        timerDiv.style.display = 'none';
        timestampGen.style.display = 'block';
        
        // Initialize the timestamp generator
        initTimestampGenerator();
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
