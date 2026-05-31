import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Add TOC to PDF - Add Table of Contents | PDFagain',
  description: 'Easily add a visual Table of Contents to your PDF document. Free and secure tool.',
  keywords: ['pdf toc', 'add table of contents pdf', 'pdf bookmarks', 'edit pdf'],
  alternates: {
    canonical: '/add-bookmarks',
  },
  openGraph: {
    title: 'Add TOC to PDF - Add Table of Contents',
    description: 'Easily add a visual Table of Contents to your PDF document. Free and secure tool.',
    url: 'https://pdfagain.com/add-bookmarks',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const AddBookmarksClient = dynamic(() => import('@/components/tools/AddBookmarksClient'));

export default function AddBookmarksPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Add TOC to PDF",
    "description": "Easily add a visual Table of Contents to your PDF document. Free and secure tool.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/add-bookmarks",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <AddBookmarksClient />
    </>
  );
}
