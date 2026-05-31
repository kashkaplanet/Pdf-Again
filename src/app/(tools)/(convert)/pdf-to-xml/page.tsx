import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'PDF to XML - Convert PDF Text to XML | PDFagain',
  description: 'Experience the ultimate PDF to XML tool with PDFagain. Extract text content and layout from a PDF into structured XML format. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['pdf to xml', 'convert pdf to xml', 'extract pdf to xml', 'pdf xml parser', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/pdf-to-xml',
  },
  openGraph: {
    title: 'PDF to XML - Convert PDF Text to XML',
    description: 'Experience the ultimate PDF to XML tool with PDFagain. Extract text content and layout from a PDF into structured XML format. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/pdf-to-xml',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const PdfToXmlClient = dynamic(() => import('@/components/tools/PdfToXmlClient'));

export default function PdfToXmlPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "PDF to XML",
    "description": "Experience the ultimate PDF to XML tool with PDFagain. Extract text content and layout from a PDF into structured XML format. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/pdf-to-xml",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PdfToXmlClient />
    </>
  );
}
