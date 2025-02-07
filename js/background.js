chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "update") {
        // Query for all YouTube tabs
        chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
            if (tabs.length > 0) {
                // If YouTube tabs are open, clear storage in each tab
                tabs.forEach((tab) => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: clearYouTubeStorage,
                    });
                });
            } else {
                // If no YouTube tabs are open, open a temporary YouTube tab
                chrome.tabs.create({ url: "https://www.youtube.com", active: false }, (tab) => {
                    // Wait for the tab to load
                    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                        if (tabId === tab.id && info.status === "complete") {
                            // Clear storage and close the tab
                            chrome.scripting.executeScript({
                                target: { tabId: tab.id },
                                func: clearYouTubeStorage,
                            }, () => {
                                chrome.tabs.remove(tab.id); // Close the tab
                                chrome.tabs.onUpdated.removeListener(listener); // Clean up listener
                            });
                        }
                    });
                });
            }
            chrome.tabs.create({
                url: 'https://github.com/apknusel/YouTube-Spot-Saver#changelog'
            });
        });
    }
});

// Function to clear YouTube localStorage keys starting with "yt-ss-"
function clearYouTubeStorage() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('yt-ss-')) {
            localStorage.removeItem(key);
        }
    });
    console.log("Cleared all yt-ss data from localStorage due to extension update.");
}