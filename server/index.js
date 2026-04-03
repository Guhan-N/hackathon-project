require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const bcrypt = require('bcrypt');
const Y = require('yjs');
const { setupWSConnection } = require('y-websocket/bin/utils');

const app = express();
const server = http.createServer(app);


app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collaborative-editor';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Basic Document model for metadata
const Document = require('./models/Document');

// Auth routes & middleware
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

app.use('/api/auth', authRoutes);

// API routes
app.get('/api/documents', authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({}, { content: 0 }); // Fetch metadata only
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents', authMiddleware, async (req, res) => {
  try {
    const { title, isPrivate, password } = req.body;
    console.log(`Creating document with title: ${title}, private: ${isPrivate}`);
    
    let hashedPassword = null;
    if (isPrivate && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const document = new Document({ 
      title, 
      content: Buffer.alloc(0),
      owner: req.user.userId,
      isPrivate: !!isPrivate,
      password: hashedPassword
    });
    
    await document.save();
    console.log(`Document created: ${document._id}`);
    
    // Don't return the hashed password in the response
    const docResponse = document.toObject();
    delete docResponse.password;
    
    res.status(201).json(docResponse);
  } catch (err) {
    console.error('Error creating document:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators', 'name email');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if document is private and user is NOT the owner
    // If private, we only return metadata first, requiring a separate verify call
    const isOwner = document.owner._id.toString() === req.user.userId;
    
    if (document.isPrivate && !isOwner) {
      // Check if they provided an unlock token or verified previously (via simplistic header check for now)
      const unlocked = req.headers['x-doc-password-verified'] === 'true';
      if (!unlocked) {
        return res.status(403).json({ 
          needsPassword: true, 
          title: document.title,
          owner: document.owner.name 
        });
      }
    }

    // Add user to collaborators if not already there
    await Document.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { collaborators: req.user.userId } }
    );

    res.json(document);
  } catch (err) {
    console.error(`Error fetching document ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// New route to verify document password
app.post('/api/documents/:id/verify', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const document = await Document.findById(req.params.id).select('+password');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!document.isPrivate) {
      return res.json({ success: true, message: 'Document is public' });
    }

    const isMatch = await bcrypt.compare(password, document.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/documents/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if the user is the owner
    if (document.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only the admin (creator) can delete this document' });
    }
    
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(`Error deleting document ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

const persistence = require('./websocket/persistence');

// Yjs WebSocket handling
const ws = require('ws');
const wss = new ws.Server({ noServer: true });

wss.on('connection', async (conn, req) => {
  // Extract room name from URL (docId)
  const docId = req.url.slice(1).split('?')[0] || 'default-doc';
  
  // Custom setup to allow persistence
  setupWSConnection(conn, req, { docName: docId, gc: true });
  
  // getYDoc returns the doc (it's cached, so we get the same instance)
  const { getYDoc } = require('y-websocket/bin/utils');
  const doc = getYDoc(docId);
  
  // Bind to MongoDB
  if (docId !== 'default-doc') {
    await persistence.bindState(docId, doc);
  }
});

// Upgrade HTTP to WS
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
