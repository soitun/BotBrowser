/**
 * ACADEMIC RESEARCH USE ONLY
 *
 * This test demonstrates GeeTest Adaptive Captcha compatibility in AUTHORIZED TEST ENVIRONMENTS ONLY.
 * - Uses the official GeeTest public demo page (geetest.com/en/adaptive-captcha-demo)
 * - Performs ONLY synthetic/invalid interactions for benchmarking
 * - For fingerprint consistency and automated detection research purposes
 *
 * See https://github.com/botswin/BotBrowser/blob/main/tests/README.md
 * and https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md
 */

import { test } from '../global-setup';
import { sleep } from '../utils';

test('adaptivecaptchademo', async ({ page }) => {
    await page.goto('https://www.geetest.com/en/adaptive-captcha-demo');
    await page.mouse.wheel(0, 200);
    await sleep(3_000);
    await page.locator('div[aria-label="Click to verify"]').click();
    await page
        .locator('div.geetest_captcha.geetest_float.geetest_customTheme.geetest_lock_success')
        .waitFor({ state: 'visible', timeout: 60_000 });
});
