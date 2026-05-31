import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Extract Images from PDF - Download PDF Pictures | PDFagain',
  description: 'Extract all embedded images and pictures from a PDF document. Downloads as a ZIP file. Free and secure tool.',
  keywords: ['extract images pdf', 'get pictures from pdf', 'pdf image extractor', 'save images from pdf'],
  alternates: {
    canonical: '/extract-images',
  },
  openGraph: {
    title: 'Extract Images from PDF - Download PDF Pictures',
    description: 'Extract all embedded images and pictures from a PDF document. Downloads as a ZIP file. Free and secure tool.',
    url: 'https://pdfagain.com/extract-images',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const ExtractImagesClient = dynamic(() => import('@/components/tools/ExtractImagesClient'));

export default function ExtractImagesPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Extract Images from PDF",
    "description": "Extract all embedded images and pictures from a PDF document. Downloads as a ZIP file. Free and secure tool.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/extract-images",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <ExtractImagesClient />
    </>
  );
}
