const Document = require('../models/Document');
const Y = require('yjs');

/**
 * Persistence layer for Yjs documents in MongoDB.
 * Saves binary document updates to a single document record.
 */
const persistence = {
  /**
   * Load a document from MongoDB.
   * If it doesn't exist, it should be created via the API first.
   */
  bindState: async (docName, ydoc) => {
    try {
      const storedDoc = await Document.findById(docName);
      if (storedDoc && storedDoc.content && storedDoc.content.length > 0) {
        Y.applyUpdate(ydoc, storedDoc.content);
      }
    } catch (err) {
      console.error(`Error loading doc ${docName}:`, err);
    }

    // Subscribe to updates and save to DB
    ydoc.on('update', async (update) => {
      try {
        const storedDoc = await Document.findById(docName);
        if (storedDoc) {
          const currentState = Y.encodeStateAsUpdate(ydoc);
          storedDoc.content = Buffer.from(currentState);
          storedDoc.updatedAt = new Date();
          await storedDoc.save();
        }
      } catch (err) {
        console.error(`Error saving doc ${docName}:`, err);
      }
    });

    return ydoc;
  }
};

module.exports = persistence;
