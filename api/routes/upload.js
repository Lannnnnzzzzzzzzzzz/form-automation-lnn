const express = require('express');
const router = express.Router();
const parser = require('../utils/parser');
const { upload, handleUploadError } = require('../middleware/upload');

// Upload and parse file
router.post('/', upload.single('file'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse file from memory buffer
    const questions = await parser.parseFile(req.file.buffer, req.file.originalname);
    
    res.json({
      success: true,
      questions,
      count: questions.filter(q => q.includes('?')).length
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    res.status(500).json({ 
      error: error.message || 'Failed to process file' 
    });
  }
});

module.exports = router;
