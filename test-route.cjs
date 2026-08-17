const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5180/sign-in', { waitUntil: 'networkidle0' });
  const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log(text);
  await browser.close();
})();
