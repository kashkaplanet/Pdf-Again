import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Scale Pages - Enlarge or Shrink PDF Content | PDFagain',
  description: 'Experience the ultimate Scale Pages tool with PDFagain. Enlarge or shrink the content of your PDF pages while keeping the page size the same. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['scale pdf pages', 'resize pdf content', 'enlarge pdf', 'shrink pdf', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/scale-pages',
  },
  openGraph: {
    title: 'Scale Pages - Enlarge or Shrink PDF Content',
    description: 'Experience the ultimate Scale Pages tool with PDFagain. Enlarge or shrink the content of your PDF pages while keeping the page size the same. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/scale-pages',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const ScalePagesClient = dynamic(() => import('@/components/tools/ScalePagesClient'));

export default function ScalePagesPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Scale PDF Pages",
    "description": "Experience the ultimate Scale Pages tool with PDFagain. Enlarge or shrink the content of your PDF pages while keeping the page size the same. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/scale-pages",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <ScalePagesClient />
    </>
  );
}
