const pdf = require('pdf-parse');
const mammoth = require('mammoth');

async function parseFile(fileBuffer, originalName) {
  console.log(`Parsing file: ${originalName}, size: ${fileBuffer.length} bytes`);
  
  const ext = originalName.split('.').pop().toLowerCase();
  console.log(`File extension: ${ext}`);
  
  let text = '';
  
  try {
    switch (ext) {
      case 'pdf':
        console.log('Parsing as PDF');
        const data = await pdf(fileBuffer);
        text = data.text;
        break;
      case 'docx':
        console.log('Parsing as DOCX');
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        text = result.value;
        break;
      case 'doc':
        console.log('Parsing as DOC');
        try {
          const docResult = await mammoth.extractRawText({ buffer: fileBuffer });
          text = docResult.value;
        } catch (docError) {
          console.error('Error parsing DOC file:', docError);
          throw new Error('DOC format parsing failed. Please convert to DOCX or PDF.');
        }
        break;
      case 'txt':
        console.log('Parsing as TXT');
        text = fileBuffer.toString('utf8');
        break;
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
    
    console.log(`Extracted text length: ${text.length} characters`);
    console.log(`Sample text: "${text.substring(0, 100)}..."`);
    
    const parsedQuestions = parseTextContent(text);
    console.log(`Parsed ${parsedQuestions.length} lines`);
    console.log(`Found ${parsedQuestions.filter(q => q.includes('?')).length} questions`);
    
    return parsedQuestions;
  } catch (error) {
    console.error('Error in parseFile:', error);
    throw error;
  }
}

function parseTextContent(text) {
  console.log('Starting text content parsing');
  
  // Split by lines and filter out empty lines
  const lines = text.split('\n').filter(line => line.trim() !== '');
  console.log(`Found ${lines.length} non-empty lines`);
  
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
      console.log(`Found question: "${line}"`);
    } 
    // Check if it's an answer option (A., B., C., etc.)
    else if (currentQuestion && /^[A-E]\./.test(line.trim())) {
      currentQuestion.push(line);
      console.log(`Found answer option: "${line}"`);
    }
    // If it's a new question without ? (might be numbered)
    else if (currentQuestion && /^\d+\./.test(line.trim())) {
      questions.push(currentQuestion);
      currentQuestion = [line];
      console.log(`Found numbered question: "${line}"`);
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
  const flattenedQuestions = questions.flat();
  console.log(`Final result: ${flattenedQuestions.length} lines`);
  console.log(`Questions with ?: ${flattenedQuestions.filter(q => q.includes('?')).length}`);
  
  return flattenedQuestions;
}

module.exports = { parseFile };
