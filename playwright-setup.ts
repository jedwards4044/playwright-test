import chromium from '@sparticuz/chromium'
import { addExtra } from 'playwright-extra'
import { chromium as pw, Browser, Page } from 'playwright'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
//import { chromium as playwrightChromium } from 'playwright'
//import { chromium as playwrightChromium } from 'playwright-extra'
import 'puppeteer-extra-plugin-stealth/evasions/chrome.app/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/chrome.csi/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/chrome.runtime/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/media.codecs/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/navigator.languages/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/navigator.permissions/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/navigator.plugins/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/navigator.vendor/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/navigator.webdriver/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/sourceurl/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/user-agent-override/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/webgl.vendor/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/window.outerdimensions/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/defaultArgs/index.js'
import 'puppeteer-extra-plugin-user-preferences/index.js'
import 'puppeteer-extra-plugin-user-data-dir/index.js'

export const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
}

/* if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    process.env.AWS_EXECUTION_ENV = 'AWS_Lambda_nodejs20.x'
    process.env.AWS_LAMBDA_JS_RUNTIME = 'nodejs22.x'
}
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    const runtime = process.env.AWS_LAMBDA_JS_RUNTIME
    console.log('runtime', runtime)
    process.env.AWS_EXECUTION_ENV = 'AWS_Lambda_nodejs20.x'
    process.env.AWS_LAMBDA_JS_RUNTIME = 'nodejs22.x'
    console.log('new runtime', process.env.AWS_LAMBDA_JS_RUNTIME)
} */

export async function setupBrowser(): Promise<{ browser: Browser; page: Page }> {
    const playwrightChromium = addExtra(pw)
    playwrightChromium.use(
        StealthPlugin({
            enabledEvasions: new Set([
                'chrome.runtime',
                'defaultArgs',
                'iframe.contentWindow',
                'media.codecs',
                'navigator.languages',
                'navigator.permissions',
                'navigator.plugins',
                'navigator.vendor',
                'navigator.webdriver',
                'sourceurl',
                'user-agent-override',
                'webgl.vendor',
                'window.outerdimensions',
            ]),
        })
    )

    const browser = await playwrightChromium.launch({
        headless: true,
        executablePath: process.env.VERCEL ? await chromium.executablePath() : undefined,
        args: [
            ...chromium.args,
            '--no-sandbox',
            '--disable-gpu',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials',
        ],
    })

    const page = await browser.newPage()
    await page.setExtraHTTPHeaders(defaultHeaders)

    return { browser, page }
}
