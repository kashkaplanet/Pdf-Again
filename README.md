# PDF Tools

A comprehensive PDF manipulation tool suite built with Next.js 15 and React 19. Deployed as a serverless application on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fpdf-tools&env=OPENROUTER_API_KEY&root-directory=.)

## ✨ Features

- **PDF Conversion**: Word, Excel, PPT, HTML, Images ↔ PDF
- **PDF Manipulation**: Merge, Split, Compress, Rotate, Organize, Resize
- **PDF Security**: Protect, Unlock, Redact, Flatten, Watermark
- **AI Chat**: Ask questions about your PDF documents
- **OCR**: Extract text from scanned PDFs using Tesseract.js

## 🚀 Getting Started

### Prerequisites

- Node.js 20+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Set **Root Directory** to `.`
4. Add environment variable: `OPENROUTER_API_KEY`
5. Deploy

## 📂 Project Structure

```
frontend/
├── src/
│   ├── app/          # Pages and API routes
│   ├── components/   # React components
│   ├── lib/          # Utilities (browser, rate-limit, validation)
│   ├── hooks/        # Custom React hooks
│   └── config/       # App configuration
├── public/           # Static assets
├── vercel.json       # Serverless function config
└── next.config.ts    # Next.js configuration
```

# Pdfagain-cloudflare
