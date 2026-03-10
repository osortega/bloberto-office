#!/usr/bin/env python3
import asyncio
from playwright.async_api import async_playwright
import sys

async def take_screenshots():
    async with async_playwright() as p:
        browser = None
        try:
            print("Launching browser...")
            browser = await p.chromium.launch(headless=True)
            
            url = 'https://osortega.github.io/bloberto-office/'
            
            # Desktop screenshot
            print("Taking desktop screenshot...")
            desktop_page = await browser.new_page(viewport={"width": 1280, "height": 800})
            print("Navigating to URL...")
            await desktop_page.goto(url, wait_until="networkidle")
            print("Waiting 4 seconds for React to render...")
            await asyncio.sleep(4)
            
            desktop_title = await desktop_page.title()
            desktop_url = desktop_page.url
            print(f'Desktop page title: "{desktop_title}"')
            print(f'Desktop page URL: {desktop_url}')
            
            desktop_path = '/workspace/screenshot-sofia-desktop-67.png'
            await desktop_page.screenshot(path=desktop_path, full_page=False)
            print(f"✓ Desktop screenshot saved to {desktop_path}")
            await desktop_page.close()
            
            # Mobile screenshot
            print("\nTaking mobile screenshot...")
            mobile_page = await browser.new_page(viewport={"width": 375, "height": 812})
            print("Navigating to URL...")
            await mobile_page.goto(url, wait_until="networkidle")
            print("Waiting 4 seconds for React to render...")
            await asyncio.sleep(4)
            
            mobile_title = await mobile_page.title()
            mobile_url = mobile_page.url
            print(f'Mobile page title: "{mobile_title}"')
            print(f'Mobile page URL: {mobile_url}')
            
            mobile_path = '/workspace/screenshot-sofia-mobile-67.png'
            await mobile_page.screenshot(path=mobile_path, full_page=False)
            print(f"✓ Mobile screenshot saved to {mobile_path}")
            await mobile_page.close()
            
            print("\n✓ Both screenshots completed successfully!")
            return 0
            
        except Exception as e:
            print(f"✗ Error taking screenshots: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc()
            return 1
        finally:
            if browser:
                await browser.close()

if __name__ == "__main__":
    exit_code = asyncio.run(take_screenshots())
    sys.exit(exit_code)
