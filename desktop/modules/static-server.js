const { app } = require('electron')
const fs = require('fs')
const http = require('http')
const path = require('path')
const { APP_BASE_PATH } = require('./constants')

function createStaticServer() {
    const frontendDir = app.isPackaged
        ? path.join(process.resourcesPath, 'frontend')
        : path.resolve(__dirname, '../../dist')

    if (!fs.existsSync(frontendDir)) {
        throw new Error(`Frontend build not found: ${frontendDir}`)
    }

    const server = http.createServer((req, res) => {
        const incomingUrl = new URL(req.url || APP_BASE_PATH, 'http://127.0.0.1')
        const pathname = decodeURIComponent(incomingUrl.pathname)
        let filePath = pathname.startsWith(APP_BASE_PATH)
            ? pathname.slice(APP_BASE_PATH.length)
            : pathname.replace(/^\/+/, '')

        if (!filePath || pathname.endsWith('/')) {
            filePath = 'index.html'
        }

        let resolvedPath = path.resolve(frontendDir, filePath)
        const relativePath = path.relative(frontendDir, resolvedPath)
        if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
            res.writeHead(403)
            res.end('Forbidden')
            return
        }

        if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
            resolvedPath = path.join(frontendDir, 'index.html')
        }

        const ext = path.extname(resolvedPath).toLowerCase()
        const contentTypeMap = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2'
        }

        fs.readFile(resolvedPath, (error, buffer) => {
            if (error) {
                res.writeHead(500)
                res.end('Internal Server Error')
                return
            }

            res.writeHead(200, {
                'Content-Type': contentTypeMap[ext] || 'application/octet-stream',
                'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
            })
            res.end(buffer)
        })
    })

    return new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen(0, '127.0.0.1', () => {
            const address = server.address()
            const origin = `http://127.0.0.1:${address.port}`
            resolve({ server, origin })
        })
    })
}

module.exports = { createStaticServer }
