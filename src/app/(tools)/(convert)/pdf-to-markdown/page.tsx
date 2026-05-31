import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'PDF to Markdown - Convert PDF to MD | PDFagain',
  description: 'Convert PDF documents to Markdown format for easy editing and web publishing. Free and secure tool.',
  keywords: ['pdf to markdown', 'pdf to md', 'convert pdf to markdown', 'pdf text extractor'],
  alternates: {
    canonical: '/pdf-to-markdown',
  },
  openGraph: {
    title: 'PDF to Markdown - Convert PDF to MD',
    description: 'Convert PDF documents to Markdown format for easy editing and web publishing. Free and secure tool.',
    url: 'https://pdfagain.com/pdf-to-markdown',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const PdfToMarkdownClient = dynamic(() => import('@/components/tools/PdfToMarkdownClient'));

export default function PdfToMarkdownPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "PDF to Markdown",
    "description": "Convert PDF documents to Markdown format for easy editing and web publishing. Free and secure tool.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/pdf-to-markdown",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PdfToMarkdownClient />
    </>
  );
}
