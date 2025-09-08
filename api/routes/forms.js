const express = require('express');
const router = express.Router();
const googleForms = require('../utils/googleForms');

// Push questions to Google Form
router.post('/', async (req, res) => {
  try {
    const { formId, questions, answerFormat } = req.body;
    
    if (!formId || !questions || !answerFormat) {
      return res.status(400).json({ 
        error: 'Missing required fields: formId, questions, answerFormat' 
      });
    }

    const result = await googleForms.pushToForm(formId, questions, answerFormat);
    
    res.json({
      success: true,
      message: 'Questions successfully pushed to Google Form',
      result
    });
  } catch (error) {
    console.error('Forms error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to push questions to Google Form' 
    });
  }
});

module.exports = router;
