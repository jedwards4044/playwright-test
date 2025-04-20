import express, { Request, Response } from 'express'
import cors from 'cors'
import { setupBrowser } from './playwright-setup'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Server is running' })
})

// Endpoint to run the Playwright script
app.post('/run-test', async (req: Request, res: Response) => {
    try {
        const { browser, page } = await setupBrowser()

        console.log('Navigating to Google...')
        await page.goto('https://www.google.com', {
            timeout: 60000,
            waitUntil: 'domcontentloaded',
        })

        const pageTitle = await page.title()
        const pageUrl = await page.url()

        // Count all links on the page
        const linkCount = await page.evaluate(() => {
            const links = document.querySelectorAll('a')
            return links.length
        })

        // Check for search box
        const searchBoxExists = await page.evaluate(() => {
            const searchBox = document.querySelector('input[name="q"]')
            return !!searchBox
        })

        await browser.close()

        res.json({
            success: true,
            data: {
                title: pageTitle,
                url: pageUrl,
                linkCount,
                searchBoxExists,
            },
        })
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        })
    }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
