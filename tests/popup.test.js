const puppeteer = require('puppeteer');

describe('Popup Duration Save Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        page = await browser.newPage();

        // Mock chrome.storage.sync API
        await page.evaluateOnNewDocument(() => {
            window.chrome = {
                storage: {
                    sync: {
                        get: (keys, callback) => {
                            const data = { timestampDuration: 24 };
                            callback(data);
                        },
                        set: (items, callback) => {
                            callback();
                        }
                    }
                }
            };
        });

        await page.goto(`file://${__dirname}/../html/popup.html`);
    });

    afterAll(async () => {
        await browser.close();
    });

    test('should load the default duration value', async () => {
        const durationValue = await page.$eval('#duration', el => el.value);
        expect(durationValue).toBe('24');
    });

    test('should save a valid duration value', async () => {
        await page.evaluate(() => document.getElementById('duration').value = ''); // Clear input
        await page.type('#duration', '48');
        await page.click('#save');
        const saveMessage = await page.$eval('#saveMessage', el => el.innerText);
        expect(saveMessage).toBe('Duration saved successfully!');
    });

    test('should show error message for invalid duration value', async () => {
        await page.evaluate(() => document.getElementById('duration').value = ''); // Clear input
        await page.type('#duration', '200');
        await page.click('#save');
        const saveMessage = await page.$eval('#saveMessage', el => el.innerText);
        expect(saveMessage).toBe('Please enter a valid duration between 1 and 168 hours.');
    });
});
