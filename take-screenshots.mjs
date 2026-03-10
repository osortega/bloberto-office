import puppeteer from 'puppeteer';

(async () => {
  let browser;
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-web-resources'
      ]
    });

    const url = 'https://osortega.github.io/bloberto-office/';

    // Desktop screenshot
    console.log('Taking desktop screenshot...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1280, height: 800 });
    console.log('Navigating to URL...');
    await desktopPage.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Waiting 4 seconds for React to render...');
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const desktopTitle = await desktopPage.title();
    const desktopUrl = desktopPage.url();
    console.log(`Desktop page title: "${desktopTitle}"`);
    console.log(`Desktop page URL: ${desktopUrl}`);
    
    const desktopPath = '/workspace/screenshot-sofia-desktop-67.png';
    await desktopPage.screenshot({ path: desktopPath, fullPage: false });
    console.log(`✓ Desktop screenshot saved to ${desktopPath}`);
    await desktopPage.close();

    // Mobile screenshot
    console.log('\nTaking mobile screenshot...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 375, height: 812 });
    console.log('Navigating to URL...');
    await mobilePage.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Waiting 4 seconds for React to render...');
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const mobileTitle = await mobilePage.title();
    const mobileUrl = mobilePage.url();
    console.log(`Mobile page title: "${mobileTitle}"`);
    console.log(`Mobile page URL: ${mobileUrl}`);
    
    const mobilePath = '/workspace/screenshot-sofia-mobile-67.png';
    await mobilePage.screenshot({ path: mobilePath, fullPage: false });
    console.log(`✓ Mobile screenshot saved to ${mobilePath}`);
    await mobilePage.close();

    console.log('\n✓ Both screenshots completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('✗ Error taking screenshots:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
