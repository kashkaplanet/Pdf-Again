import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Duplicate Pages - Repeat PDF Pages Online | PDFagain',
  description: 'Experience the ultimate Duplicate Pages tool with PDFagain. Repeat pages in your PDF file multiple times. Great for labels, tickets, and printing. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['duplicate pdf pages', 'repeat pdf pages', 'copy pdf pages', 'pdf label printing', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/duplicate-pages',
  },
  openGraph: {
    title: 'Duplicate Pages - Repeat PDF Pages Online',
    description: 'Experience the ultimate Duplicate Pages tool with PDFagain. Repeat pages in your PDF file multiple times. Great for labels, tickets, and printing. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/duplicate-pages',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const DuplicatePagesClient = dynamic(() => import('@/components/tools/DuplicatePagesClient'));

export default function DuplicatePagesPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Duplicate PDF Pages",
    "description": "Experience the ultimate Duplicate Pages tool with PDFagain. Repeat pages in your PDF file multiple times. Great for labels, tickets, and printing. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/duplicate-pages",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <DuplicatePagesClient />
    </>
  );
}
