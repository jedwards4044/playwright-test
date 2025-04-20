import { setupBrowser } from './playwright-setup'

async function run() {
    console.log('Starting browser...')
    const { browser, page } = await setupBrowser()

    console.log('Navigating to Google...')
    await page.goto('https://www.google.com', {
        timeout: 60000,
        waitUntil: 'domcontentloaded',
    })

    console.log('Connected to:', await page.url())
    console.log('Page title:', await page.title())

    // Count all links on the page
    const linkCount = await page.evaluate(() => {
        const links = document.querySelectorAll('a')
        return links.length
    })
    console.log('Number of links found on page:', linkCount)

    await page.waitForTimeout(10000)
    console.log('Closing browser...')
    await browser.close()
}

run().catch(console.error) // Add error handling to catch and log any errors
