import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5180/sign-in?next=/admin');
  await page.waitForLoadState('networkidle');
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  const html = await page.evaluate(() => document.body.innerHTML.substring(0, 1000));
  console.log("TEXT===\n" + text);
  console.log("HTML===\n" + html);
  
  await browser.close();
})();
