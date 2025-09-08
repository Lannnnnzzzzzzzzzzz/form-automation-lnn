const { JWT } = require('google-auth-library');
const { google } = require('googleapis');

async function getAuthClient() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
  
  return new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/forms.body'],
  });
}

async function pushToForm(formId, questions, answerFormat) {
  const auth = await getAuthClient();
  const forms = google.forms({ version: 'v1', auth });
  
  // Get the form info first
  const form = await forms.forms.get({ formId });
  
  // Create batch update requests
  const requests = [];
  let questionIndex = 0;
  
  for (const question of questions) {
    if (question.includes('?')) {
      // This is a question
      const questionText = question;
      const options = [];
      
      // Find the answer options (next lines)
      const optionCount = answerFormat === 'a-e' ? 5 : 4;
      
      for (let i = 1; i <= optionCount; i++) {
        const optionLetter = String.fromCharCode(64 + i); // A, B, C, etc.
        const optionLine = questions.find(q => q.startsWith(`${optionLetter}.`));
        
        if (optionLine) {
          options.push({
            value: optionLine.substring(2).trim(),
          });
        }
      }
      
      // Create the question
      requests.push({
        createItem: {
          item: {
            title: questionText,
            questionItem: {
              question: {
                required: false,
                choiceQuestion: {
                  type: 'RADIO',
                  options: options,
                },
              },
            },
          },
          location: {
            index: questionIndex,
          },
        },
      });
      
      questionIndex++;
    }
  }
  
  // Execute the batch update
  const result = await forms.forms.batchUpdate({
    formId,
    requestBody: {
      requests,
    },
  });
  
  return result;
}

module.exports = { pushToForm };
