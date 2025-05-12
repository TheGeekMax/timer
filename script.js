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

// Calculate the time difference between now and the target timestamp
function calculateTimeDifference(targetTimestamp) {
    const now = new Date().getTime();
    const targetTime = parseInt(targetTimestamp) * 1000; // Convert to milliseconds
    const difference = targetTime - now;
    
    return difference > 0 ? difference : 0;
}

// Update the timer display
function updateTimer(timeDifference) {
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    
    document.getElementById('timer-d').textContent = formatTimeUnit(days);
    document.getElementById('timer-h').textContent = formatTimeUnit(hours);
    document.getElementById('timer-m').textContent = formatTimeUnit(minutes);
    
    // Add seconds display if needed
    if (document.getElementById('timer-s')) {
        document.getElementById('timer-s').textContent = formatTimeUnit(seconds);
    }
    
    return timeDifference <= 0;
}

// Start the countdown
function startCountdown(targetTimestamp) {
    const timeDifference = calculateTimeDifference(targetTimestamp);
    const isFinished = updateTimer(timeDifference);
    
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
        targetInfo.style.fontSize = '1.2rem';
        targetInfo.style.marginTop = '15px';
        targetInfo.style.color = '#666';
        
        document.querySelector('#timer-div .timer-display').after(targetInfo);
    }
    
    if (!isFinished) {
        setTimeout(() => {
            startCountdown(targetTimestamp);
        }, 1000);
    } else {
        // Timer finished
        document.getElementById('timer-div').innerHTML = '<h1>Time\'s up!</h1>';
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
            <label for="target-date">Target Date:</label>
            <input type="date" id="target-date" value="${defaultDate}" min="${now.toISOString().split('T')[0]}">
        </div>
        <div class="input-group">
            <label for="target-time">Target Time:</label>
            <input type="time" id="target-time" value="${defaultTime}">
        </div>
        <button id="generate-btn">Generate Timer</button>
    `;
    
    // Add event listener to the generate button
    document.getElementById('generate-btn').addEventListener('click', () => {
        const targetDate = document.getElementById('target-date').value;
        const targetTime = document.getElementById('target-time').value;
        
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
        window.location.href = window.location.pathname + '?ts=' + timestamp;
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
        
        // Start the countdown with the provided timestamp
        startCountdown(params.ts);
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
