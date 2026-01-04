"""
⚠️ PRIVACY RESEARCH USE ONLY
Run exclusively in authorized privacy research labs that comply with all applicable laws.
See: https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md

BotBrowser Per-Context Proxy Example (Python)

This example demonstrates how to use different proxies for each browser context
while maintaining automatic geo-detection for timezone, locale, and languages.

Key Features:
- Multiple contexts with different proxies in a single browser instance
- Automatic timezone/locale detection per proxy
- Cost-effective alternative to launching multiple browser processes
"""

import asyncio
import os
import tempfile
import time
from playwright.async_api import async_playwright


async def test_context(context, label: str, test_url: str):
    """Test a browser context with its configured proxy."""
    print(f"\n🧪 Testing {label}:")

    page = await context.new_page()

    # Remove Playwright bindings to maintain consistent fingerprint
    await page.add_init_script("""
        delete window.__playwright_binding__;
        delete window.__pwInitScripts;
    """)

    try:
        await page.goto(test_url, wait_until='networkidle')

        # Get IP information
        ip_info = await page.text_content('pre')
        print(f"   📡 IP Response: {ip_info.strip()}")

        # Get browser timezone (automatically set by BotBrowser based on proxy IP)
        timezone = await page.evaluate("() => Intl.DateTimeFormat().resolvedOptions().timeZone")
        print(f"   🕐 Detected Timezone: {timezone}")

        # Get browser language (automatically set by BotBrowser based on proxy IP)
        language = await page.evaluate("() => navigator.language")
        print(f"   🌐 Detected Language: {language}")

    except Exception as error:
        print(f"   ❌ Error testing {label}: {error}")
    finally:
        await page.close()


async def test_timezone(context, label: str):
    """Test timezone detection for a specific context."""
    page = await context.new_page()

    try:
        # Test timezone consistency
        timezone_info = await page.evaluate("""() => {
            const now = new Date();
            return {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                offset: now.getTimezoneOffset(),
                localTime: now.toLocaleString(),
                utcTime: now.toUTCString()
            };
        }""")

        print(f"   🕐 {label} Timezone Details:")
        print(f"      Timezone: {timezone_info['timezone']}")
        print(f"      UTC Offset: {timezone_info['offset']} minutes")
        print(f"      Local Time: {timezone_info['localTime']}")

    except Exception as error:
        print(f"   ❌ Error getting timezone for {label}: {error}")
    finally:
        await page.close()


async def main():
    """Main function to demonstrate per-context proxy usage."""
    async with async_playwright() as p:
        # Launch BotBrowser with profile but no global proxy
        browser = await p.chromium.launch(
            headless=False,  # Set to True for headless mode
            executable_path=os.getenv('BOTBROWSER_EXEC_PATH', '/path/to/chrome'),  # Update this path
            args=[
                f"--bot-profile={os.getenv('BOT_PROFILE_PATH', '/absolute/path/to/profile.enc')}",  # Update this path
                f'--user-data-dir={tempfile.gettempdir()}/botbrowser-{int(time.time())}',
            ]
        )

        print('🚀 Browser launched successfully')

        try:
            # Context 1: US Proxy
            print('\n📍 Creating Context 1 with US proxy...')
            context1 = await browser.new_context(
                proxy={'server': 'http://username:password@us-proxy.example.com:8080'}  # Replace with your US proxy
            )

            # Context 2: EU Proxy
            print('📍 Creating Context 2 with EU proxy...')
            context2 = await browser.new_context(
                proxy={'server': 'socks5://username:password@eu-proxy.example.com:1080'}  # Replace with your EU proxy
            )

            # Context 3: APAC Proxy
            print('📍 Creating Context 3 with APAC proxy...')
            context3 = await browser.new_context(
                proxy={'server': 'http://username:password@apac-proxy.example.com:8080'}  # Replace with your APAC proxy
            )

            # Test each context
            await test_context(context1, 'US Context', 'https://httpbin.org/ip')
            await test_context(context2, 'EU Context', 'https://httpbin.org/ip')
            await test_context(context3, 'APAC Context', 'https://httpbin.org/ip')

            # Demonstrate timezone detection
            print('\n🌍 Testing automatic timezone detection...')
            await test_timezone(context1, 'US Context')
            await test_timezone(context2, 'EU Context')
            await test_timezone(context3, 'APAC Context')

        except Exception as error:
            print(f'❌ Error: {error}')
        finally:
            print('\n🔄 Closing browser...')
            await browser.close()
            print('✅ Done!')


if __name__ == '__main__':
    asyncio.run(main())
