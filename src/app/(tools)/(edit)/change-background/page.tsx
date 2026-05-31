import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Change PDF Background Color | PDFagain',
  description: 'Experience the ultimate Change Background Color tool with PDFagain. Add a solid color behind your PDF content. Great for reading transparent PDFs in dark mode. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['change pdf background', 'pdf background color', 'dark mode pdf', 'sepia pdf', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/change-background',
  },
  openGraph: {
    title: 'Change PDF Background Color',
    description: 'Experience the ultimate Change Background Color tool with PDFagain. Add a solid color behind your PDF content. Great for reading transparent PDFs in dark mode. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/change-background',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const ChangeBackgroundClient = dynamic(() => import('@/components/tools/ChangeBackgroundClient'));

export default function ChangeBackgroundPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Change PDF Background Color",
    "description": "Experience the ultimate Change Background Color tool with PDFagain. Add a solid color behind your PDF content. Great for reading transparent PDFs in dark mode. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/change-background",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <ChangeBackgroundClient />
    </>
  );
}
