import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Extract Links from PDF - Find URLs | PDFagain',
  description: 'Easily extract all hyperlinks and URLs from a PDF document. View and copy them instantly. Free tool.',
  keywords: ['extract links pdf', 'find urls in pdf', 'get links from pdf', 'pdf hyperlink extractor'],
  alternates: {
    canonical: '/extract-links',
  },
  openGraph: {
    title: 'Extract Links from PDF - Find URLs',
    description: 'Easily extract all hyperlinks and URLs from a PDF document. View and copy them instantly. Free tool.',
    url: 'https://pdfagain.com/extract-links',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const ExtractLinksClient = dynamic(() => import('@/components/tools/ExtractLinksClient'));

export default function ExtractLinksPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Extract Links from PDF",
    "description": "Easily extract all hyperlinks and URLs from a PDF document. View and copy them instantly. Free tool.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/extract-links",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <ExtractLinksClient />
    </>
  );
}
