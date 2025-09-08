const express = require('express');
const router = express.Router();
const parser = require('../utils/parser');
const { upload, handleUploadError } = require('../middleware/upload');

// Upload and parse file
router.post('/', upload.single('file'), handleUploadError, async (req, res) => {
  try {
    console.log('Upload request received');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Parse file from memory buffer
    const questions = await parser.parseFile(req.file.buffer, req.file.originalname);
    
    // Simple count: just count lines with questions marks
    const questionCount = questions.filter(q => q.includes('?')).length;
    console.log(`Successfully parsed ${questionCount} questions`);
    
    res.json({
      success: true,
      questions,
      count: questionCount
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    res.status(500).json({ 
      error: error.message || 'Failed to process file' 
    });
  }
});

module.exports = router;
