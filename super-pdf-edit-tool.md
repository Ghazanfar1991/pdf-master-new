Create a comprehensive, full-stack web application that extracts and formats content from user-uploaded PDF files.
The tool must handle both digital PDFs (original text-based) and scanned PDFs (image-based), accurately extracting text, tables, and images, and then presenting the output in a well-formatted, structured manner.

Frontend: React (Vite)

Backend: Python (FastAPI)

⚙️ Backend — Python (FastAPI)
✅ Libraries

Install and use the following Python libraries:

fastapi — backend framework

uvicorn — server runner

PyMuPDF (fitz) — PDF parsing (text/images)

pytesseract — OCR for scanned PDFs

pdf2image — convert PDF pages to images

Camelot — extract tables from PDFs

Unstructured — structure and format extracted content

Pillow — image handling

python-multipart — file upload handling

📡 API Endpoint

Endpoint: POST /process-pdf/

Input: A .pdf file (uploaded via multipart/form-data)

Output: JSON containing structured document elements

🔑 Core Logic (/process-pdf/ endpoint)
1. File Handling

Accept the uploaded PDF file

Save to a temporary directory

2. PDF Type Detection

Use PyMuPDF to extract text from the first page

If extracted text < 10 chars → Scanned PDF

Else → Digital PDF

3. Conditional Processing

If Digital PDF:

Extract all text (PyMuPDF)

Extract tables (Camelot, both lattice & stream modes)

Extract images (PyMuPDF)

If Scanned PDF:

Convert each page to image (pdf2image)

Run OCR (pytesseract.image_to_data)

Extract text with word-level positional info

⚠️ Table handling: basic OCR text only (advanced solution: OpenCV + OCR for structured tables in future versions)

4. Post-Processing & Formatting

Pass extracted content into Unstructured

Use unstructured.partition.pdf for element classification

Output structured elements: Title, Header, Paragraph, Table, Image, etc.

5. API Response

Return structured content as JSON:

[
  { "type": "Title", "text": "My Document Title" },
  { "type": "Header", "text": "Introduction" },
  { "type": "Paragraph", "text": "This is some paragraph text..." },
  { "type": "Table", "data": [[ "Col1", "Col2" ], [ "Val1", "Val2" ]] },
  { "type": "Image", "src": "base64encodedimage" }
]

🎨 Frontend — React (Vite)
🖼️ UI Components

File Upload Component

Select a .pdf file

Trigger backend upload

Loading Indicator

Show progress while backend is processing

Results Display Component

Render structured JSON results returned by API

🔗 API Integration

Use axios to send POST /process-pdf/ request with file upload

Handle success and error states

Pass JSON response into Results Display

📑 Results Display

Render elements dynamically:

Title → <h1>

Header → <h2> / <h3>

Paragraph → <p>

Table → <table> (parse backend data)

Image → <img> (render from base64 or serve via backend URL)

Fallback → default <div>

🎨 Styling

Clean and minimal CSS for readability

Distinguish text hierarchy (title vs headers vs body)

Tables styled with borders, alternating row colors

Images scaled to fit container