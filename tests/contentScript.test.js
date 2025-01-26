const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

describe('YouTube Spot Saver Function Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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
            storeVideoData(videoId, timestamp);
        });
        const storedData = await page.evaluate(() => localStorage.getItem('yt-ss-i7vEpeljeZA'));
        const data = JSON.parse(storedData);
        expect(data.timestamp).toBe(3.22);
    });

    test('should get video timestamp from localStorage', async () => {
        await page.evaluate(() => {
            const videoId = 'i7vEpeljeZA';
            const timestamp = 3.22;
            const duration = 12.021
            storeVideoData(videoId, timestamp, duration);
        });
        const videoData = await page.evaluate(() => getVideoData('i7vEpeljeZA'));
        expect(videoData.timestamp).toBe(3.22);
        expect(videoData.duration).toBe(12.021);
    });

    test('should return null for expired video timestamp', async () => {
        await page.evaluate(() => {
            const videoId = 'i7vEpeljeZA';
            const data = {
                timestamp: 3,
                duration: 12.021,
                savedAt: Date.now() - (1000 * 60 * 60 * 25) // 25 hours ago
            };
            localStorage.setItem(`yt-ss-${videoId}`, JSON.stringify(data));
        });
        const data = await page.evaluate(() => getVideoData('i7vEpeljeZA'));
        expect(data).toBeNull();
    });

    test('should return null for non-existent video timestamp', async () => {
        const data = await page.evaluate(() => getVideoData('nonexistent'));
        expect(data).toBeNull();
    });

    test('should clean up expired storage', async () => {
        await page.evaluate(() => {
            const videoId = 'i7vEpeljeZA';
            const data = {
                timestamp: 3,
                duration: 12.021,
                savedAt: Date.now() - (1000 * 60 * 60 * 25) // 25 hours ago
            };
            localStorage.setItem(`yt-ss-${videoId}`, JSON.stringify(data));
            cleanUpExpiredStorage();
        });
        const storedData = await page.evaluate(() => localStorage.getItem('yt-ss-i7vEpeljeZA'));
        expect(storedData).toBeNull();
    });
});