const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: './demo-videos', size: { width: 1920, height: 1080 } },
  });
  const page = await context.newPage();

  const url = 'https://urban-air-quality-assistant-xi.vercel.app';
  await page.goto(url);
  await page.waitForTimeout(2000);

  // Show dashboard
  await page.waitForTimeout(3000);

  // Switch to AI Assistant tab
  await page.click('text=AI Assistant');
  await page.waitForTimeout(1000);
  await page.fill('input[aria-label="Chat input"]', 'What should I do during high pollution?');
  await page.click('button[aria-label="Send message"]');
  await page.waitForTimeout(3000);

  // Switch to Indoor Hacks
  await page.click('text=Indoor Hacks');
  await page.waitForTimeout(2000);
  await page.click('text=DIY Air Purifier');
  await page.waitForTimeout(2000);

  // Switch to Sustainable
  await page.click('text=Sustainable');
  await page.waitForTimeout(2000);

  // Switch to Impact
  await page.click('text=Impact');
  await page.waitForTimeout(2000);

  // Switch back to Dashboard
  await page.click('text=Dashboard');
  await page.waitForTimeout(2000);

  // Change location
  await page.selectOption('select[aria-label="Select city"]', 'beijing');
  await page.waitForTimeout(2000);

  await context.close();
  await browser.close();
  console.log('Video recorded successfully');
})();