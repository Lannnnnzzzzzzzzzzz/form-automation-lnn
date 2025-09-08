
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

async function parseFile(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  
  switch (ext) {
    case 'pdf':
      return parsePdf(filePath);
    case 'docx':
      return parseDocx(filePath);
    case 'doc':
      return parseDocx(filePath); // Note: .doc might not work well with mammoth
    case 'txt':
      return parseTxt(filePath);
    default:
      throw new Error('Unsupported file format');
  }
}

async function parsePdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return parseTextContent(data.text);
}

async function parseDocx(filePath) {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return parseTextContent(result.value);
}

function parseTxt(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return parseTextContent(content);
}

function parseTextContent(text) {
  // Split by lines and filter out empty lines
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // Group questions and answers
  const questions = [];
  let currentQuestion = null;
  
  for (const line of lines) {
    // Check if it's a question (contains ?)
    if (line.includes('?')) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = [line];
    } 
    // Check if it's an answer option (A., B., C., etc.)
    else if (currentQuestion && /^[A-E]\./.test(line.trim())) {
      currentQuestion.push(line);
    }
    // If it's a new question without ? (might be numbered)
    else if (currentQuestion && /^\d+\./.test(line.trim())) {
      questions.push(currentQuestion);
      currentQuestion = [line];
    }
    // Otherwise, append to current question
    else if (currentQuestion) {
      currentQuestion[currentQuestion.length - 1] += ' ' + line;
    }
  }
  
  // Add the last question
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  // Flatten the array
  return questions.flat();
}

module.exports = { parseFile };
