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
        return "Minuteur"; // Default name on decode error
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
    if (timerType === 'd') {
        // Uranium disintegration mode
        const disintegrations = Math.floor(timeDifference * 12434);
        timeRemainingText = `${disintegrations.toLocaleString()} particules d'uranium se désintégreront`;
    } else if (timerType === 's') {
        const sleeps = calculateSleeps(targetDate);
        timeRemainingText = `${sleeps} nuits restantes`;
    } else if (timerType === 'b') {
        // Birth mode - 0.00466 births per millisecond
        const births = Math.floor(timeDifference * 0.00466);
        timeRemainingText = `${births.toLocaleString()} naissances restantes`;
    } else if (timerType === 'r') {
        // Sun reduction mode - 0.75m/h = 0.01cm every 0.5s = 0.00002cm per millisecond
        const cmReduction = (timeDifference * 0.00002).toFixed(2);
        timeRemainingText = `${cmReduction} cm de réduction du soleil restants`;
    } else {
        timeRemainingText = `${formatTimeUnit(days)}j ${formatTimeUnit(hours)}h ${formatTimeUnit(minutes)}m restantes`;
    }
      // Create description text
    const description = `${timerName} se termine le ${dateString} à ${timeString}. ${timeRemainingText}`;
    
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
    
    if (timerType === 'd') {
        // Uranium disintegration mode
        // 12,434 particles per millisecond
        // Add some randomness to make the counter appear more natural
        const baseDisintegrations = Math.floor(timeDifference * 12434);
        const randomVariance = Math.floor(Math.random() * 1000 - 500); // Random variance between -500 and +500
        const disintegrations = Math.max(0, baseDisintegrations + randomVariance);
        
        // Format with commas for readability
        const formattedCount = disintegrations.toLocaleString();
        
        // Only show disintegration count
        document.getElementById('timer-d').textContent = formattedCount;
        
        // Add disintegration mode class
        if (!document.getElementById('timer-div').classList.contains('disintegration-mode')) {
            // Remove sleep mode class if present
            if (document.getElementById('timer-div').classList.contains('sleep-mode')) {
                document.getElementById('timer-div').classList.remove('sleep-mode');
            }
            document.getElementById('timer-div').classList.add('disintegration-mode');
            document.querySelector('.time-unit:nth-child(1) span').textContent = 'particules';
        }
    } else if (timerType === 'b') {
        // Birth mode - 0.00466 births per millisecond
        const births = Math.floor(timeDifference * 0.00466);
        
        // Format with commas for readability
        const formattedCount = births.toLocaleString();
        
        // Only show birth count
        document.getElementById('timer-d').textContent = formattedCount;
        
        // Add birth mode class
        if (!document.getElementById('timer-div').classList.contains('birth-mode')) {
            // Remove other mode classes if present
            if (document.getElementById('timer-div').classList.contains('sleep-mode')) {
                document.getElementById('timer-div').classList.remove('sleep-mode');
            }
            if (document.getElementById('timer-div').classList.contains('disintegration-mode')) {
                document.getElementById('timer-div').classList.remove('disintegration-mode');
            }
            document.getElementById('timer-div').classList.add('birth-mode');
            document.querySelector('.time-unit:nth-child(1) span').textContent = 'bébés';
        }
    } else if (timerType === 'r') {
        // Sun reduction mode - 0.75m/h = 0.01cm every 0.5s = 0.00002cm per millisecond
        const cmReduction = (timeDifference * 0.00002).toFixed(2);
        
        // Only show cm reduction count
        document.getElementById('timer-d').textContent = cmReduction;
        
        // Hide hours, minutes, seconds
        document.getElementById('timer-h').textContent = '';
        document.getElementById('timer-m').textContent = '';
        document.getElementById('timer-s').textContent = '';
        
        // Add sun reduction mode class
        if (!document.getElementById('timer-div').classList.contains('sun-reduction-mode')) {
            // Remove other mode classes if present
            if (document.getElementById('timer-div').classList.contains('sleep-mode')) {
                document.getElementById('timer-div').classList.remove('sleep-mode');
            }
            if (document.getElementById('timer-div').classList.contains('disintegration-mode')) {
                document.getElementById('timer-div').classList.remove('disintegration-mode');
            }
            if (document.getElementById('timer-div').classList.contains('birth-mode')) {
                document.getElementById('timer-div').classList.remove('birth-mode');
            }
            document.getElementById('timer-div').classList.add('sun-reduction-mode');
            document.querySelector('.time-unit:nth-child(1) span').textContent = 'centimètres';
        }
    } else if (timerType === 's') {
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
            // Remove disintegration mode class if present
            if (document.getElementById('timer-div').classList.contains('disintegration-mode')) {
                document.getElementById('timer-div').classList.remove('disintegration-mode');
            }
            document.getElementById('timer-div').classList.add('sleep-mode');
            document.querySelector('.time-unit:nth-child(1) span').textContent = 'nuits restantes';
        }
    } else {
        // Normal countdown mode - show all units
        document.getElementById('timer-d').textContent = formatTimeUnit(days);
        document.getElementById('timer-h').textContent = formatTimeUnit(hours);
        document.getElementById('timer-m').textContent = formatTimeUnit(minutes);
        document.getElementById('timer-s').textContent = formatTimeUnit(seconds);
        
        // Remove special mode classes if set
        if (document.getElementById('timer-div').classList.contains('sleep-mode')) {
            document.getElementById('timer-div').classList.remove('sleep-mode');
        }
        if (document.getElementById('timer-div').classList.contains('disintegration-mode')) {
            document.getElementById('timer-div').classList.remove('disintegration-mode');
        }
        if (document.getElementById('timer-div').classList.contains('birth-mode')) {
            document.getElementById('timer-div').classList.remove('birth-mode');
        }
        if (document.getElementById('timer-div').classList.contains('sun-reduction-mode')) {
            document.getElementById('timer-div').classList.remove('sun-reduction-mode');
        }
        document.querySelector('.time-unit:nth-child(1) span').textContent = 'Jours';
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
        targetInfo.textContent = `Cible : ${dateString} à ${timeString}`;
        
        document.querySelector('#timer-div .timer-display').after(targetInfo);
    }    // Update title based on timer type and name
    if (timerType === 's') {
        document.querySelector('#timer-div h1').textContent = timerName + ' - Compteur de Nuits';
    } else if (timerType === 'd') {
        document.querySelector('#timer-div h1').textContent = timerName + ' - Désintégration d\'Uranium';
    } else if (timerType === 'b') {
        document.querySelector('#timer-div h1').textContent = timerName + ' - Compteur de Naissances';
    } else if (timerType === 'r') {
        document.querySelector('#timer-div h1').textContent = timerName + ' - Réduction du Soleil';
    } else {
        document.querySelector('#timer-div h1').textContent = timerName;
    }
    
    // Update meta tags for social media sharing (do this on every countdown tick)
    updateMetaTags(timerName, targetTimestamp, timeDifference, timerType);
    
    if (!isFinished) {
        // Set update interval based on timer type
        // For birth mode, update every 1ms for real-time counting
        // For uranium disintegration, update every 50ms for smoother counting
        // For sun reduction, update every 500ms (half second) to show the 0.01cm increments
        // For other modes, update every 1000ms (1 second)
        let updateInterval = 1000;
        if (timerType === 'b') {
            updateInterval = 1;
        } else if (timerType === 'd') {
            updateInterval = 50;
        } else if (timerType === 'r') {
            updateInterval = 500;
        }
        
        setTimeout(() => {
            startCountdown(targetTimestamp, timerType, params);
        }, updateInterval);
    } else {        // Timer finished
        const timerName = params.n ? decodeTimerName(params.n) : 'Minuteur';
        document.getElementById('timer-div').innerHTML = `<h1>${timerName} - Temps écoulé !</h1>`;
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
        <h2>Créer un compte à rebours</h2>
        <div class="input-group">
            <label for="timer-name">Nom du minuteur :</label>
            <input type="text" id="timer-name" placeholder="Minuteur" value="Minuteur">
        </div>
        <div class="input-group">
            <label for="target-date">Date cible :</label>
            <input type="date" id="target-date" value="${defaultDate}" min="${now.toISOString().split('T')[0]}">
        </div>
        <div class="input-group">
            <label for="target-time">Heure cible :</label>
            <input type="time" id="target-time" value="${defaultTime}">
        </div>
        <div class="radio-group">
            <p>Mode d'affichage :</p>
            <div class="radio-option">
                <input type="radio" id="timer-type-normal" name="timer-type" value="n" checked>
                <label for="timer-type-normal">Compte à rebours normal</label>
            </div>
            <div class="radio-option">
                <input type="radio" id="timer-type-sleep" name="timer-type" value="s">
                <label for="timer-type-sleep">Compteur de nuits</label>
            </div>
            <div class="radio-option">
                <input type="radio" id="timer-type-uranium" name="timer-type" value="d">
                <label for="timer-type-uranium">Désintégration d'uranium</label>
            </div>
            <div class="radio-option">
                <input type="radio" id="timer-type-birth" name="timer-type" value="b">
                <label for="timer-type-birth">Compteur de naissances</label>
            </div>
            <div class="radio-option">
                <input type="radio" id="timer-type-sun" name="timer-type" value="r">
                <label for="timer-type-sun">Réduction du soleil</label>
            </div>
        </div>
        <button id="generate-btn">Créer le minuteur</button>
    `;
    
    // Add event listener to the generate button
    document.getElementById('generate-btn').addEventListener('click', () => {
        const timerName = document.getElementById('timer-name').value.trim() || 'Timer';
        const targetDate = document.getElementById('target-date').value;
        const targetTime = document.getElementById('target-time').value;
        const timerType = document.querySelector('input[name="timer-type"]:checked').value;
        
    if (!targetDate || !targetTime) {
            alert('Veuillez définir la date et l\'heure.');
            return;
        }
        
        const dateTimeString = `${targetDate}T${targetTime}`;
        const selectedDateTime = new Date(dateTimeString);
        const currentTime = new Date();
        
        if (selectedDateTime <= currentTime) {
            alert('Veuillez sélectionner une date et une heure futures.');
            return;
        }
        
        const timestamp = generateTimestampFromDateTime(dateTimeString);        // Only encode and add name parameter if it's not the default "Minuteur"
        const nameParam = timerName !== 'Minuteur' ? `&n=${encodeTimerName(timerName)}` : '';
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
        let timerType = 'n';
        if (params.type === 's') {
            timerType = 's';
        } else if (params.type === 'd') {
            timerType = 'd';
        } else if (params.type === 'b') {
            timerType = 'b';
        } else if (params.type === 'r') {
            timerType = 'r';
        }
        
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
