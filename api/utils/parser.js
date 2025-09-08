const pdf = require('pdf-parse');
const mammoth = require('mammoth');

async function parseFile(fileBuffer, originalName) {
  console.log(`Parsing file: ${originalName}`);
  
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
      case 'txt':
        console.log('Parsing as TXT');
        text = fileBuffer.toString('utf8');
        break;
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
    
    console.log(`Extracted text (${text.length} chars):`, text.substring(0, 200));
    
    const parsedQuestions = parseTextContent(text);
    console.log(`Parsed ${parsedQuestions.length} items`);
    
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
  
  // Simple parsing: just return all non-empty lines
  // This will work for basic text files
  const result = lines.map(line => line.trim());
  
  console.log(`Final result: ${result.length} lines`);
  console.log('Sample lines:', result.slice(0, 5));
  
  return result;
}

module.exports = { parseFile };
