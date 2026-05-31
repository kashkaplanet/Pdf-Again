import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'PDF to GIF - Convert PDF to Animated GIF | PDFagain',
  description: 'Convert your PDF document into an animated GIF. Fast, free, and secure tool running in your browser.',
  keywords: ['pdf to gif', 'animate pdf', 'pdf to animation', 'convert pdf to gif', 'free pdf tools'],
  alternates: {
    canonical: '/pdf-to-gif',
  },
  openGraph: {
    title: 'PDF to GIF - Convert PDF to Animated GIF',
    description: 'Convert your PDF document into an animated GIF. Fast, free, and secure tool running in your browser.',
    url: 'https://pdfagain.com/pdf-to-gif',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const PdfToGifClient = dynamic(() => import('@/components/tools/PdfToGifClient'));

export default function PdfToGifPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "PDF to GIF",
    "description": "Convert your PDF document into an animated GIF. Fast, free, and secure tool running in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/pdf-to-gif",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PdfToGifClient />
    </>
  );
}
