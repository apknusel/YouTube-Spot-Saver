const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

describe('YouTube Spot Saver Function Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();

        // Inject mock chrome object
        await page.evaluateOnNewDocument(() => {
            window.chrome = {
                runtime: {
                    onMessage: {
                        addListener: function () { }
                    }
                }
            };
        });

        await page.goto('https://www.youtube.com');

        const contentScript = fs.readFileSync(path.resolve(__dirname, '../contentScript.js'), 'utf8');
        await page.evaluate(contentScript);
    });

    afterAll(async () => {
        await browser.close();
    });

    test('should store video timestamp in localStorage', async () => {
        await page.evaluate(() => {
            const timestamp = 3.22;
            const videoId = 'i7vEpeljeZA';
            storeVideoTimestamp(videoId, timestamp);
        });
        const storedData = await page.evaluate(() => localStorage.getItem('yt-ss-i7vEpeljeZA'));
        const data = JSON.parse(storedData);
        expect(data.timestamp).toBe(3.22);
    });

    test('should get video timestamp from localStorage', async () => {
        await page.evaluate(() => {
            const videoId = 'i7vEpeljeZA';
            const timestamp = 3.22;
            storeVideoTimestamp(videoId, timestamp);
        });
        const timestamp = await page.evaluate(() => getVideoTimestamp('i7vEpeljeZA'));
        expect(timestamp).toBe(3.22);
    });

    test('should return null for expired video timestamp', async () => {
        await page.evaluate(() => {
            const videoId = 'i7vEpeljeZA';
            const data = {
                timestamp: 3,
                savedAt: Date.now() - (1000 * 60 * 60 * 25) // 25 hours ago
            };
            localStorage.setItem(`yt-ss-${videoId}`, JSON.stringify(data));
        });
        const timestamp = await page.evaluate(() => getVideoTimestamp('i7vEpeljeZA'));
        expect(timestamp).toBeNull();
    });

    test('should return null for non-existent video timestamp', async () => {
        const timestamp = await page.evaluate(() => getVideoTimestamp('nonexistent'));
        expect(timestamp).toBeNull();
    });

    test('should clean up expired storage', async () => {
        await page.evaluate(() => {
            const videoId = 'i7vEpeljeZA';
            const data = {
                timestamp: 3,
                savedAt: Date.now() - (1000 * 60 * 60 * 25) // 25 hours ago
            };
            localStorage.setItem(`yt-ss-${videoId}`, JSON.stringify(data));
            cleanUpExpiredStorage();
        });
        const storedData = await page.evaluate(() => localStorage.getItem('yt-ss-i7vEpeljeZA'));
        expect(storedData).toBeNull();
    });
});

describe('YouTube Spot Saver Integration Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();

        // Inject mock chrome object
        await page.evaluateOnNewDocument(() => {
            window.chrome = {
                runtime: {
                    onMessage: {
                        addListener: function () { }
                    }
                }
            };
        });

        // Inject the content script
        const contentScript = fs.readFileSync(path.resolve(__dirname, '../contentScript.js'), 'utf8');
        await page.evaluateOnNewDocument(contentScript);
    });

    afterAll(async () => {
        await browser.close();
    });

    test('should save and restore video timestamp after reload', async () => {
        await page.goto('https://www.youtube.com/watch?v=i7vEpeljeZA');

        // Set the video timestamp
        await page.evaluate(() => {
            const video = document.getElementsByTagName('video')[0];
            video.currentTime = 10; // Set to 2 minutes
        });

        // Reload the page
        await page.reload();

        // Check the video timestamp after reload
        const timestamp = await page.evaluate(() => {
            const video = document.getElementsByTagName('video')[0];
            return video.currentTime;
        });

        expect(timestamp).toBe(10);
    });

    test('should clean up expired storage after reload', async () => {
        await page.goto('https://www.youtube.com/watch?v=i7vEpeljeZA');

        // Manually add an expired item to localStorage
        await page.evaluate(() => {
            const videoId = 'expiredVideoId';
            const data = {
                timestamp: 3,
                savedAt: Date.now() - (1000 * 60 * 60 * 25) // 25 hours ago
            };
            localStorage.setItem(`yt-ss-${videoId}`, JSON.stringify(data));
        });

        // Reload the page
        await page.reload();

        // Check if the expired item has been removed
        const storedData = await page.evaluate(() => localStorage.getItem('yt-ss-expiredVideoId'));
        expect(storedData).toBeNull();
    });
});