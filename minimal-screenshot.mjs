import puppeteer from 'puppeteer';

(async () => {
  try {
    console.log('Starting minimal screenshot task...');
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      timeout: 30000
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating...');
    await page.goto('https://osortega.github.io/bloberto-office/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('Waiting for React render...');
    await new Promise(r => setTimeout(r, 4000));
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: '/workspace/screenshot-sofia-desktop-67.png' });
    console.log('Desktop done');
    
    // Switch to mobile
    await page.setViewport({ width: 375, height: 812 });
    console.log('Taking mobile screenshot...');
    await page.screenshot({ path: '/workspace/screenshot-sofia-mobile-67.png' });
    console.log('Mobile done');
    
    await browser.close();
    console.log('✓ SUCCESS');
    process.exit(0);
  } catch (e) {
    console.error('✗ FAILED:', e.message);
    process.exit(1);
  }
})();
