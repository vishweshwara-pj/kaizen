const express = require('express');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS for all origins (or configure as needed)
app.use(cors());

// Define the directory containing your PDFs
const PDF_DIRECTORY = path.join(__dirname, 'pdfs');

// Helper function to summarize text (simple example for illustration)
function summarizeText(text) {
  // Split the text into sentences and return the first few sentences as a summary
  const sentences = text.split('. ');
  return sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '...' : '');
}

// API endpoint to search for a PDF by name and return summary + download link
app.get('/search', async (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Please provide a search term.' });
  }

  // Find the PDF file that matches the search term
  const files = fs.readdirSync(PDF_DIRECTORY);
  const matchedFile = files.find(file => file.toLowerCase().includes(searchTerm.toLowerCase()) && file.endsWith('.pdf'));

  if (!matchedFile) {
    return res.status(404).json({ error: 'No PDF file found matching the search term.' });
  }

  // Read and parse the PDF file
  const pdfPath = path.join(PDF_DIRECTORY, matchedFile);
  const pdfData = await pdfParse(fs.readFileSync(pdfPath));
  
  // Summarize the text extracted from the PDF
  const summary = summarizeText(pdfData.text);

  // Send the response with summary and download link
  res.json({
    summary,
    downloadLink: `http://localhost:${PORT}/pdfs/${matchedFile}`
  });
});

// Serve PDF files as downloadable resources
app.use('/pdfs', express.static(PDF_DIRECTORY));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
