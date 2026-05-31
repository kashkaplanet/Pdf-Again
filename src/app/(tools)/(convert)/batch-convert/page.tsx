import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Batch Convert to PDF - ZIP to PDF | PDFagain',
  description: 'Upload a ZIP file of images and quickly merge them into a single PDF document. Free and secure tool.',
  keywords: ['zip to pdf', 'batch convert pdf', 'images to pdf', 'merge images pdf', 'batch process pdf'],
  alternates: {
    canonical: '/batch-convert',
  },
  openGraph: {
    title: 'Batch Convert to PDF - ZIP to PDF',
    description: 'Upload a ZIP file of images and quickly merge them into a single PDF document. Free and secure tool.',
    url: 'https://pdfagain.com/batch-convert',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const BatchConvertClient = dynamic(() => import('@/components/tools/BatchConvertClient'));

export default function BatchConvertPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Batch Convert to PDF",
    "description": "Upload a ZIP file of images and quickly merge them into a single PDF document. Free and secure tool.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/batch-convert",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <BatchConvertClient />
    </>
  );
}
