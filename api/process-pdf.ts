import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock response for demonstration
    const mockResponse = [
      { type: 'Title', text: 'Sample Document Title' },
      { type: 'Header', text: 'Introduction' },
      { type: 'Paragraph', text: 'This is a sample paragraph from the PDF document. In a real implementation on Vercel, this would be the actual extracted content from your uploaded PDF.' },
      { type: 'Header', text: 'Data Section' },
      { type: 'Paragraph', text: 'Here is some more content that would be extracted from the PDF document.' },
      { 
        type: 'Table', 
        data: [
          ['Name', 'Age', 'City'],
          ['John Doe', '30', 'New York'],
          ['Jane Smith', '25', 'Los Angeles'],
          ['Bob Johnson', '35', 'Chicago']
        ] 
      },
      { type: 'Paragraph', text: 'After processing, you can download the extracted content in your preferred format.' },
    ];
    
    res.status(200).json(mockResponse);
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
}