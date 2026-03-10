const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  
  // Desktop
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1280, height: 800 });
  await desktopPage.goto('https://osortega.github.io/bloberto-office/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  await desktopPage.screenshot({ path: '/workspace/screenshot-desktop.png', fullPage: true });
  
  // Mobile
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 375, height: 812, isMobile: true });
  await mobilePage.goto('https://osortega.github.io/bloberto-office/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  await mobilePage.screenshot({ path: '/workspace/screenshot-mobile.png', fullPage: true });
  
  await browser.close();
  console.log('Screenshots saved.');
})();
