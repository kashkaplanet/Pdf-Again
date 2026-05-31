import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'PDF to JSON - Extract Structured Data from PDF | PDFagain',
  description: 'Experience the ultimate PDF to JSON tool with PDFagain. Extract text content, positions, and metadata from PDF documents into structured JSON format. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['pdf to json', 'extract pdf data', 'pdf text extraction', 'pdf parser', 'structured data', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/pdf-to-json',
  },
  openGraph: {
    title: 'PDF to JSON - Extract Structured Data from PDF',
    description: 'Experience the ultimate PDF to JSON tool with PDFagain. Extract text content, positions, and metadata from PDF documents into structured JSON format. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/pdf-to-json',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const PdfToJsonClient = dynamic(() => import('@/components/tools/PdfToJsonClient'));

export default function PdfToJsonPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "PDF to JSON",
    "description": "Experience the ultimate PDF to JSON tool with PDFagain. Extract text content, positions, and metadata from PDF documents into structured JSON format. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/pdf-to-json",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PdfToJsonClient />
    </>
  );
}
