import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Remove Annotations - Strip PDF Comments & Highlights | PDFagain',
  description: 'Experience the ultimate Remove Annotations tool with PDFagain. Strip all comments, highlights, drawings, and interactive forms from a PDF. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['remove pdf annotations', 'strip pdf comments', 'delete highlights pdf', 'clean pdf annotations', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/remove-annotations',
  },
  openGraph: {
    title: 'Remove Annotations - Strip PDF Comments & Highlights',
    description: 'Experience the ultimate Remove Annotations tool with PDFagain. Strip all comments, highlights, drawings, and interactive forms from a PDF. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/remove-annotations',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const RemoveAnnotationsClient = dynamic(() => import('@/components/tools/RemoveAnnotationsClient'));

export default function RemoveAnnotationsPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Remove Annotations from PDF",
    "description": "Experience the ultimate Remove Annotations tool with PDFagain. Strip all comments, highlights, drawings, and interactive forms from a PDF. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/remove-annotations",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <RemoveAnnotationsClient />
    </>
  );
}
