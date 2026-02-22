const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const filePath = path.join(process.cwd(), 'index.html');

    // Log console messages
    page.on('console', msg => {
        if (msg.type() === 'error') console.error(`PAGE ERROR: ${msg.text()}`);
        else console.log(`PAGE LOG: ${msg.text()}`);
    });

    console.log('Loading page...');
    await page.goto(`file://${filePath}`);

    // Fill name
    console.log('Filling name...');
    await page.fill('#child-name', 'Tester');

    // Click Start
    console.log('Clicking Start...');
    await page.click('#btn-start');

    // Wait for screen-download or screen-buddy
    // The app shows screen-download then screen-buddy
    // Wait for screen-buddy to be visible
    console.log('Waiting for buddy screen...');
    await page.waitForSelector('#screen-buddy.active', { timeout: 10000 });

    // Click Confirm Buddy
    console.log('Confirming buddy...');
    await page.click('#btn-buddy-confirm');

    // Wait for intro screen
    console.log('Waiting for intro screen...');
    await page.waitForSelector('#screen-intro.active', { timeout: 5000 });

    // Click Skip Intro
    console.log('Skipping intro...');
    await page.click('#btn-intro-skip');

    // Wait for timer screen
    console.log('Waiting for timer screen...');
    await page.waitForSelector('#screen-timer.active', { timeout: 5000 });

    // Wait for brushing element
    console.log('Waiting for alpaka-brushing...');
    await page.waitForSelector('#alpaka-brushing', { timeout: 5000 });

    // Initial class check
    const initialClasses = await page.getAttribute('#alpaka-brushing', 'class');
    console.log(`Initial classes: ${initialClasses}`);

    // Trigger reaction by clicking on the buddy container (which has the listener)
    console.log('Clicking buddy to trigger giggle...');
    // The listener is on #buddy-container-brushing > svg or just on #buddy-container-brushing child?
    // renderBuddy adds listener to newBrushEl (which is #buddy-container-brushing clone)
    await page.click('#buddy-container-brushing');

    // Wait for class addition
    console.log('Waiting for giggle class...');
    try {
        await page.waitForFunction(() => {
            const el = document.getElementById('alpaka-brushing');
            return el && el.classList.contains('alpaka-giggle');
        }, null, { timeout: 2000 });
        console.log('SUCCESS: Giggle class added!');
    } catch (e) {
        console.error('FAILED: Giggle class not added within timeout');
        const currentClasses = await page.getAttribute('#alpaka-brushing', 'class');
        console.log(`Current classes: ${currentClasses}`);
        process.exit(1);
    }

    await browser.close();
})();
