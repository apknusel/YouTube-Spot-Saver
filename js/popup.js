const durationInput = document.getElementById('duration');
const saveButton = document.getElementById('save');
const saveMessage = document.getElementById('saveMessage');

// Load the saved duration from storage
chrome.storage.sync.get(['timestampDuration'], (result) => {
    if (result.timestampDuration) {
        durationInput.value = result.timestampDuration;
    }
});

// Save the duration to storage
saveButton.addEventListener('click', () => {
    const duration = parseInt(durationInput.value);
    if (duration >= 1 && duration <= 168) {
        chrome.storage.sync.set({ timestampDuration: duration }, () => {
            saveMessage.innerText = 'Duration saved successfully!';
        });
    } else {
        saveMessage.innerText = 'Please enter a valid duration between 1 and 168 hours.';
    }
});