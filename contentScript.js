const MAX_STORAGE_AGE = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

// Function to store video timestamp in localStorage with prefix and timestamp
function storeVideoTimestamp(videoId, timestamp) {
    const videoKey = `yt-ss-${videoId}`;
    const data = {
        timestamp: timestamp,
        savedAt: Date.now()  // Time when timestamp was saved
    };
    localStorage.setItem(videoKey, JSON.stringify(data));
    console.log(`Saved Video ID: ${videoId}, Timestamp: ${data.timestamp}`);
}

// Function to get video timestamp from localStorage, checking for expiration
function getVideoTimestamp(videoId) {
    const videoKey = `yt-ss-${videoId}`;
    const storedData = localStorage.getItem(videoKey);

    if (storedData) {
        const data = JSON.parse(storedData);

        // Check if the stored data is expired (older than 24 hours)
        if (Date.now() - data.savedAt > MAX_STORAGE_AGE) {
            console.log(`Video ID ${videoId} timestamp has expired, removing...`);
            localStorage.removeItem(videoKey);
            return null;  // Data expired, return null
        }

        console.log(`Found saved timestamp for Video ID: ${videoId}, Timestamp: ${data.timestamp}`);
        return data.timestamp;  // Return valid timestamp
    }

    console.log(`No saved timestamp for Video ID: ${videoId}`);
    return null;
}

// Cleanup function for the content script
function cleanUpExpiredStorage() {
    const keys = Object.keys(localStorage);  // Get all keys in localStorage
    let removedCount = 0;

    keys.forEach(key => {
        if (key.startsWith('yt-ss-')) {  // Check if the key matches video timestamp storage
            const storedData = localStorage.getItem(key);
            if (storedData) {
                const data = JSON.parse(storedData);

                // Check if the stored data is expired (older than MAX_STORAGE_AGE)
                if (Date.now() - data.savedAt > MAX_STORAGE_AGE) {
                    console.log(`Expired timestamp found for ${key}, removing...`);
                    localStorage.removeItem(key);  // Remove expired item from localStorage
                    removedCount++;
                }
            }
        }
    });

    if (removedCount > 0) {
        console.log(`Removed ${removedCount} expired items from localStorage.`);
    } else {
        console.log("No expired items found in localStorage.");
    }
}

// Triggers right before the page is unloaded
window.addEventListener("beforeunload", (event) => {
    console.log("Page is about to be closed or refreshed!");

    const timestamp = document.getElementsByTagName('video')[0].currentTime ?? null;
    if (timestamp) {
        const queryParams = new URLSearchParams(window.location.search);
        const videoId = queryParams.get('v');

        if (videoId) {
            storeVideoTimestamp(videoId, timestamp);
        }
    } else {
        console.log("Could not get the current time");
    }
});

// On page load, check if there's a saved timestamp for the video ID
window.addEventListener("load", () => {
    console.log("Loading");

    const queryParams = new URLSearchParams(window.location.search);
    const videoId = queryParams.get('v');
    const urlTimestamp = queryParams.get('t');

    if (videoId && !urlTimestamp) {
        const savedTimestamp = getVideoTimestamp(videoId);

        if (savedTimestamp) {
            console.log(`Found saved timestamp for video ID: ${videoId}, Timestamp: ${savedTimestamp}`);

            // If the URL timestamp is different from the saved timestamp, redirect to the saved timestamp
            if (!urlTimestamp || parseInt(urlTimestamp) !== savedTimestamp) {
                console.log(`Redirecting to saved timestamp ${savedTimestamp}`);

                document.getElementsByTagName('video')[0].currentTime = savedTimestamp;
            }
        }
    } else {
        console.log("No video ID found");
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'cleanUpExpiredStorage') {
        cleanUpExpiredStorage();
    }
});