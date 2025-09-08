const multer = require('multer');

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not supported. Please upload PDF, Word, or TXT files.`), false);
  }
};

// Configure multer upload middleware
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 1 // Only allow one file at a time
  }
});

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File size too large. Maximum size is 10MB.' 
      });
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Too many files uploaded. Please upload only one file at a time.' 
      });
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Unexpected file field. Please make sure you are uploading a file.' 
      });
    }
    
    return res.status(400).json({ error: err.message });
  } else if (err) {
    // An unknown error occurred.
    return res.status(500).json({ error: err.message });
  }
  
  // Everything went fine.
  next();
};

// Export the configured upload middleware and error handler
module.exports = {
  upload,
  handleUploadError
};
