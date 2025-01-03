self.addEventListener('activate', event => {
    // Run cleanup of local storage every hour
    setInterval(() => {
        // Send a message to content script to clean up localStorage
        chrome.tabs.query({ url: "https://www.youtube.com/*" }, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, { action: 'cleanUpExpiredStorage' });
            });
        });
    }, 3600000);
});