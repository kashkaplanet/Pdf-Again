import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Crop PDF - Trim PDF Page Edges Online | PDFagain',
  description: 'Experience the ultimate Crop PDF tool with PDFagain. Trim and crop the edges of your PDF pages by setting custom margins. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['crop pdf', 'trim pdf', 'cut pdf edges', 'pdf cropper', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/crop-pdf',
  },
  openGraph: {
    title: 'Crop PDF - Trim PDF Page Edges Online',
    description: 'Experience the ultimate Crop PDF tool with PDFagain. Trim and crop the edges of your PDF pages by setting custom margins. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/crop-pdf',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const CropPdfClient = dynamic(() => import('@/components/tools/CropPdfClient'));

export default function CropPdfPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Crop PDF",
    "description": "Experience the ultimate Crop PDF tool with PDFagain. Trim and crop the edges of your PDF pages by setting custom margins. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/crop-pdf",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <CropPdfClient />
    </>
  );
}
