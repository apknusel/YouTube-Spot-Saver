const DEFAULT_MAX_STORAGE_AGE = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

let MAX_STORAGE_AGE = DEFAULT_MAX_STORAGE_AGE;

// Load the configured duration from storage
chrome.storage.sync.get(['timestampDuration'], (result) => {
    if (result.timestampDuration) {
        MAX_STORAGE_AGE = 1000 * 60 * 60 * result.timestampDuration;
    }
});

// Function to store video timestamp in localStorage with prefix and timestamp
function storeVideoData(videoId, timestamp, duration) {
    const videoKey = `yt-ss-${videoId}`;
    const data = {
        timestamp: timestamp,
        duration: duration,
        savedAt: Date.now()  // Time when timestamp was saved
    };
    localStorage.setItem(videoKey, JSON.stringify(data));
    console.log(`Saved Video ID: ${videoId}, Timestamp: ${data.timestamp}, Duration: ${data.duration}`);
}

// Function to get video timestamp from localStorage, checking for expiration
function getVideoData(videoId) {
    const videoKey = `yt-ss-${videoId}`;
    const storedData = localStorage.getItem(videoKey);

    if (storedData) {
        const data = JSON.parse(storedData);

        // Check if the stored data is expired
        if (Date.now() - data.savedAt > MAX_STORAGE_AGE) {
            console.log(`Video ID ${videoId} timestamp has expired, removing...`);
            localStorage.removeItem(videoKey);
            return null;  // Data expired, return null
        }

        console.log(`Found saved timestamp for Video ID: ${videoId}, Timestamp: ${data.timestamp}, Duration: ${data.duration}`);
        return data;  // Return valid timestamp
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

                // Check if the stored data is expired
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
    const duration = document.getElementsByTagName('video')[0].duration ?? null;
    if (timestamp) {
        const queryParams = new URLSearchParams(window.location.search);
        const videoId = queryParams.get('v');

        if (videoId) {
            storeVideoData(videoId, timestamp, duration);
        }
    } else {
        console.log("Could not get the current time");
    }
});

async function waitForVideoDuration(targetDuration) {
    const videoElement = document.getElementsByTagName('video')[0];
    while (videoElement.duration !== targetDuration) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// Helper function to wait for document ready state
async function waitForDocumentReady() {
    while (document.readyState !== "complete") {
        console.log("Waiting for document ready, current state:", document.readyState);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// On page load, check if there's a saved timestamp for the video ID
window.addEventListener("load", async () => {
    console.log("Load event triggered, checking readyState");
    
    await waitForDocumentReady();
    console.log("Document is ready, proceeding with timestamp check");

    // Run cleanup of expired storage
    cleanUpExpiredStorage();

    const queryParams = new URLSearchParams(window.location.search);
    const videoId = queryParams.get('v');
    const urlTimestamp = queryParams.get('t');

    if (videoId && !urlTimestamp) {
        const videoData = getVideoData(videoId);

        if (videoData) {
            await waitForVideoDuration(videoData.duration);

            // If the URL timestamp is different from the saved timestamp, redirect to the saved timestamp
            if (!urlTimestamp || parseInt(urlTimestamp) !== videoData.timestamp) {
                console.log(`Redirecting to saved timestamp ${videoData.timestamp}`);
                document.getElementsByTagName('video')[0].currentTime = videoData.timestamp;
            }
        }
    } else {
        console.log("No video ID found");
    }
});