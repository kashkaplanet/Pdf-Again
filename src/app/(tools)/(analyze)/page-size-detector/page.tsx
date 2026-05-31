import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'PDF Page Size Detector - Check Dimensions | PDFagain',
  description: 'Analyze your PDF to find the exact dimensions (A4, Letter, etc.) and orientation of every page. Free tool.',
  keywords: ['pdf page size', 'pdf dimensions', 'check pdf size', 'pdf orientation'],
  alternates: {
    canonical: '/page-size-detector',
  },
  openGraph: {
    title: 'PDF Page Size Detector - Check Dimensions',
    description: 'Analyze your PDF to find the exact dimensions (A4, Letter, etc.) and orientation of every page. Free tool.',
    url: 'https://pdfagain.com/page-size-detector',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const PageSizeDetectorClient = dynamic(() => import('@/components/tools/PageSizeDetectorClient'));

export default function PageSizeDetectorPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "PDF Page Size Detector",
    "description": "Analyze your PDF to find the exact dimensions (A4, Letter, etc.) and orientation of every page. Free tool.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/page-size-detector",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PageSizeDetectorClient />
    </>
  );
}
