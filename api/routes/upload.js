const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const parser = require('../utils/parser');
const { upload, handleUploadError } = require('../middleware/upload');

// Upload and parse file
router.post('/', upload.single('file'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const questions = await parser.parseFile(filePath);
    
    // Clean up uploaded file after parsing
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      questions,
      count: questions.filter(q => q.includes('?')).length
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to process file' 
    });
  }
});

module.exports = router;
