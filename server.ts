import express, { Request, Response } from 'express'
import cors from 'cors'
import { setupBrowser } from './playwright-setup'

const app = express()
const port = process.env.PORT || 3000

// Configure CORS to allow all origins
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    })
)
app.use(express.json())

// Simple in-memory rate limiting
const WINDOW_SIZE = 60 * 1000 // 1 minute
const MAX_REQUESTS = 10 // 10 requests per minute
const requestLog: { [ip: string]: number[] } = {}

function rateLimiter(req: Request, res: Response, next: Function) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const now = Date.now()

    // Initialize or clean old requests
    if (!requestLog[ip]) {
        requestLog[ip] = []
    }
    requestLog[ip] = requestLog[ip].filter((time) => now - time < WINDOW_SIZE)

    // Check rate limit
    if (requestLog[ip].length >= MAX_REQUESTS) {
        return res.status(429).json({
            error: 'Too many requests, please try again later',
            timestamp: new Date().toISOString(),
        })
    }

    // Log new request
    requestLog[ip].push(now)
    next()
}

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    })
})

// Endpoint to run the Playwright script
app.get('/run-test', rateLimiter, async (req: Request, res: Response) => {
    try {
        console.log('Starting browser check...')
        const { browser, page } = await setupBrowser()
        const browserVersion = await browser.version()

        await page.goto(process.env.TEST_URL || 'https://www.kennedyfloral.com/', {
            timeout: 60000,
            waitUntil: 'domcontentloaded',
        })

        const pageTitle = await page.title()

        // Count all links on the page
        const linkCount = await page.evaluate(() => {
            const links = document.querySelectorAll('a')
            return links.length
        })

        await browser.close()

        // Send a clean, focused response
        res.json({
            pageInfo: {
                title: pageTitle,
                totalLinks: linkCount,
            },
            browserInfo: {
                version: browserVersion,
            },
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString(),
        })
    }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
