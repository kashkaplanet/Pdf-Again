import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Create Booklet - Arrange PDF for Booklet Printing | PDFagain',
  description: 'Experience the ultimate Create Booklet tool with PDFagain. Arrange pages side-by-side into printer spreads (saddle-stitch layout) for booklet printing. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['create booklet pdf', 'pdf to booklet', 'saddle stitch pdf', 'printer spreads pdf', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/create-booklet',
  },
  openGraph: {
    title: 'Create Booklet - Arrange PDF for Booklet Printing',
    description: 'Experience the ultimate Create Booklet tool with PDFagain. Arrange pages side-by-side into printer spreads (saddle-stitch layout) for booklet printing. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/create-booklet',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const CreateBookletClient = dynamic(() => import('@/components/tools/CreateBookletClient'));

export default function CreateBookletPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Create Booklet (Printer Spreads)",
    "description": "Experience the ultimate Create Booklet tool with PDFagain. Arrange pages side-by-side into printer spreads (saddle-stitch layout) for booklet printing. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/create-booklet",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <CreateBookletClient />
    </>
  );
}
