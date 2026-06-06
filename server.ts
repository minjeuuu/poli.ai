import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(uploadDir));

// --- IN-MEMORY DATA STORE (For Real-Time Demo) ---
let messages: any[] = [];
let posts: any[] = [];

// --- API ROUTES ---

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.originalname, type: req.file.mimetype });
});

import RSSParser from 'rss-parser';

app.get('/api/news', async (req, res) => {
    try {
        const parser = new RSSParser({
            customFields: {
                item: ['media:content', 'media:group']
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const urls = [
            'http://feeds.bbci.co.uk/news/world/rss.xml',
            'http://feeds.bbci.co.uk/news/politics/rss.xml',
            'https://www.aljazeera.com/xml/rss/all.xml',
            'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
            'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
            'https://www.theguardian.com/world/rss',
            'https://www.theguardian.com/politics/rss',
            'https://feeds.npr.org/1004/rss.xml',
            'https://feeds.npr.org/1012/rss.xml',
            'https://moxie.foxnews.com/google-publisher/politics.xml',
            'https://moxie.foxnews.com/google-publisher/world.xml',
            'https://www.scmp.com/rss/91/feed',
            'https://www.france24.com/en/rss',
            'https://thehill.com/homenews/feed/',
            'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf',
            'https://www.euractiv.com/feed/',
            'https://www.politico.eu/feed/',
            'https://www.thehindu.com/news/international/feeder/default.rss',
            'https://www.smh.com.au/rss/world.xml',
            'https://rss.dw.com/rdf/rss-en-world',
            'https://www.rt.com/rss/',
            'https://foreignpolicy.com/feed/',
            'https://www.cfr.org/rss/publication/1',
            'https://www.chathamhouse.org/rss/articles',
            'https://www.amnesty.org/en/rss/',
            'https://www.spiegel.de/international/index.rss',
            'https://www.japantimes.co.jp/feed/'
        ];
        
        let allItems: any[] = [];
        const results = await Promise.allSettled(urls.map(async (url) => {
            const feed = await parser.parseURL(url);
            return feed.items.map(item => ({
                headline: item.title,
                summary: item.contentSnippet || item.content || '',
                source: feed.title || 'Global News',
                date: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                url: item.link
            }));
        }));
        
        for (const result of results) {
            if (result.status === 'fulfilled') {
                allItems = [...allItems, ...result.value];
            }
        }
        
        // Shuffle and take top 12
        const shuffled = allItems.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 12);
        
        res.json(selected);
    } catch(err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/messages/:chatId', (req, res) => {
    const chatId = req.params.chatId;
    const chatMessages = messages.filter(m => m.chatId === chatId);
    res.json(chatMessages);
});

app.post('/api/messages', (req, res) => {
    const msg = req.body;
    messages.push(msg);
    io.to(msg.chatId).emit('receive_message', msg);
    res.json(msg);
});

app.get('/api/posts', (req, res) => {
    res.json(posts);
});

app.post('/api/posts', (req, res) => {
    const post = req.body;
    posts.unshift(post);
    io.emit('new_post', post);
    res.json(post);
});

app.post('/api/posts/:id/like', (req, res) => {
    const postId = req.params.id;
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
        posts[postIndex].likes += 1;
        io.emit('update_post', posts[postIndex]);
        res.json(posts[postIndex]);
    } else {
        res.status(404).send('Post not found');
    }
});

app.post('/api/posts/:id/comment', (req, res) => {
    const postId = req.params.id;
    const comment = req.body;
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
        posts[postIndex].comments.push(comment);
        io.emit('update_post', posts[postIndex]);
        res.json(posts[postIndex]);
    } else {
        res.status(404).send('Post not found');
    }
});

// --- SOCKET.IO HANDLERS ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_chat', (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    socket.on('send_message', (msg) => {
        messages.push(msg);
        io.to(msg.chatId).emit('receive_message', msg);
    });

    socket.on('typing', (data) => {
        socket.to(data.chatId).emit('user_typing', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// --- VITE MIDDLEWARE ---
async function startServer() {
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*all', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    httpServer.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
