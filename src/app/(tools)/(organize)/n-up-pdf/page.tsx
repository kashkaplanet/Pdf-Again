import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'N-Up PDF - Combine Pages into a Grid | PDFagain',
  description: 'Experience the ultimate N-Up PDF tool with PDFagain. Combine multiple PDF pages onto a single sheet of paper for grid printing. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['n-up pdf', 'grid print pdf', 'multiple pages per sheet', 'print 2 pages per sheet', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/n-up-pdf',
  },
  openGraph: {
    title: 'N-Up PDF - Combine Pages into a Grid',
    description: 'Experience the ultimate N-Up PDF tool with PDFagain. Combine multiple PDF pages onto a single sheet of paper for grid printing. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/n-up-pdf',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const NUpPdfClient = dynamic(() => import('@/components/tools/NUpPdfClient'));

export default function NUpPdfPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "N-Up PDF (Grid Print)",
    "description": "Experience the ultimate N-Up PDF tool with PDFagain. Combine multiple PDF pages onto a single sheet of paper for grid printing. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/n-up-pdf",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <NUpPdfClient />
    </>
  );
}
