const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://urban-air-quality-assistant-xi.vercel.app');
  await page.waitForTimeout(10000);
  const text = await page.textContent('body');
  console.log('Body text (first 500):', text?.substring(0, 500));
  const divs = await page.locator('div').count();
  console.log('Div count:', divs);
  const h1 = await page.locator('h1').count();
  console.log('H1 count:', h1);
  await browser.close();
})();