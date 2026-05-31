import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Insert Blank Pages - Add Blank Pages to PDF | PDFagain',
  description: 'Experience the ultimate Insert Blank Pages tool with PDFagain. Add blank pages to your PDF for double-sided printing or note-taking. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['insert blank pages pdf', 'add blank page to pdf', 'pdf blank page', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/insert-blank-pages',
  },
  openGraph: {
    title: 'Insert Blank Pages - Add Blank Pages to PDF',
    description: 'Experience the ultimate Insert Blank Pages tool with PDFagain. Add blank pages to your PDF for double-sided printing or note-taking. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/insert-blank-pages',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const InsertBlankPagesClient = dynamic(() => import('@/components/tools/InsertBlankPagesClient'));

export default function InsertBlankPagesPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Insert Blank Pages",
    "description": "Experience the ultimate Insert Blank Pages tool with PDFagain. Add blank pages to your PDF for double-sided printing or note-taking. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/insert-blank-pages",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <InsertBlankPagesClient />
    </>
  );
}
