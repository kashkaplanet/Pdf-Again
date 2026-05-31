import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Split PDF in Half - Unbooklet Scanned Pages | PDFagain',
  description: 'Experience the ultimate Split in Half tool with PDFagain. Cut each PDF page down the middle to create two separate pages. Perfect for scanned books. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['split pdf in half', 'unbooklet pdf', 'cut pdf pages', 'divide pdf pages', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/split-in-half',
  },
  openGraph: {
    title: 'Split PDF in Half - Unbooklet Scanned Pages',
    description: 'Experience the ultimate Split in Half tool with PDFagain. Cut each PDF page down the middle to create two separate pages. Perfect for scanned books. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/split-in-half',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const SplitInHalfClient = dynamic(() => import('@/components/tools/SplitInHalfClient'));

export default function SplitInHalfPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Split PDF in Half (Unbooklet)",
    "description": "Experience the ultimate Split in Half tool with PDFagain. Cut each PDF page down the middle to create two separate pages. Perfect for scanned books. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/split-in-half",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <SplitInHalfClient />
    </>
  );
}
