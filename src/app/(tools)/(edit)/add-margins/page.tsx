import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Add Margins to PDF - Expand PDF Page Borders Online | PDFagain',
  description: 'Experience the ultimate Add Margins tool with PDFagain. Add white space margins around your PDF pages for printing or binding. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['add margins pdf', 'pdf margins', 'expand pdf page', 'pdf border', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/add-margins',
  },
  openGraph: {
    title: 'Add Margins to PDF - Expand PDF Page Borders Online',
    description: 'Experience the ultimate Add Margins tool with PDFagain. Add white space margins around your PDF pages for printing or binding. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/add-margins',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const AddMarginsClient = dynamic(() => import('@/components/tools/AddMarginsClient'));

export default function AddMarginsPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Add Margins to PDF",
    "description": "Experience the ultimate Add Margins tool with PDFagain. Add white space margins around your PDF pages for printing or binding. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/add-margins",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <AddMarginsClient />
    </>
  );
}
