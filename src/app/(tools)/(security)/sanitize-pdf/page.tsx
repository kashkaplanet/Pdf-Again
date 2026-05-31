import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Sanitize PDF - Remove Metadata & Author Info | PDFagain',
  description: 'Experience the ultimate Sanitize PDF tool with PDFagain. Strip all hidden metadata, author information, timestamps, and producer details from your PDF for complete privacy. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['sanitize pdf', 'remove pdf metadata', 'clean pdf', 'pdf privacy', 'strip metadata', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/sanitize-pdf',
  },
  openGraph: {
    title: 'Sanitize PDF - Remove Metadata & Author Info',
    description: 'Experience the ultimate Sanitize PDF tool with PDFagain. Strip all hidden metadata, author information, timestamps, and producer details from your PDF for complete privacy. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/sanitize-pdf',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const SanitizePdfClient = dynamic(() => import('@/components/tools/SanitizePdfClient'));

export default function SanitizePdfPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Sanitize PDF",
    "description": "Experience the ultimate Sanitize PDF tool with PDFagain. Strip all hidden metadata, author information, timestamps, and producer details from your PDF for complete privacy. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/sanitize-pdf",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <SanitizePdfClient />
    </>
  );
}
