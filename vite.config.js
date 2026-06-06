import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  base: '/hunterblog/', // GitHub Pages base
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // 支持 music 目录的 Range 请求，防止音频卡顿
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const base = '/hunterblog'
        if (!req.url?.startsWith(base + '/music/')) return next()

        const relative = req.url.slice(base.length) // /music/xxx.mp3
        const filePath = path.join(process.cwd(), 'public', relative)
        if (!fs.existsSync(filePath)) return next()

        const stat = fs.statSync(filePath)
        const size = stat.size
        const range = req.headers['range']
        const ext = path.extname(filePath).toLowerCase()
        const mimeMap = { '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.flac': 'audio/flac' }
        const type = mimeMap[ext] || 'audio/mpeg'

        if (range) {
          const parts = range.replace(/bytes=/, '').split('-')
          const start = parseInt(parts[0], 10)
          const end = parts[1] ? parseInt(parts[1], 10) : size - 1
          const chunkSize = end - start + 1
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': type
          })
          fs.createReadStream(filePath, { start, end }).pipe(res)
        } else {
          res.writeHead(200, {
            'Content-Length': size,
            'Content-Type': type,
            'Accept-Ranges': 'bytes'
          })
          fs.createReadStream(filePath).pipe(res)
        }
      })
    }
  }
})
