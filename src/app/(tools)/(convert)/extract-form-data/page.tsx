import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Extract Form Data - Read PDF AcroForms to JSON | PDFagain',
  description: 'Experience the ultimate Extract Form Data tool with PDFagain. Read interactive PDF forms (AcroForms) and export all filled data as a structured JSON file. 100% free, secure, and private - processing happens locally in your browser.',
  keywords: ['extract pdf form data', 'pdf to json form', 'read acroforms', 'export pdf form fields', 'free pdf tools', 'local pdf processing'],
  alternates: {
    canonical: '/extract-form-data',
  },
  openGraph: {
    title: 'Extract Form Data - Read PDF AcroForms to JSON',
    description: 'Experience the ultimate Extract Form Data tool with PDFagain. Read interactive PDF forms (AcroForms) and export all filled data as a structured JSON file. 100% free, secure, and private - processing happens locally in your browser.',
    url: 'https://pdfagain.com/extract-form-data',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const ExtractFormDataClient = dynamic(() => import('@/components/tools/ExtractFormDataClient'));

export default function ExtractFormDataPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "Extract Form Data from PDF",
    "description": "Experience the ultimate Extract Form Data tool with PDFagain. Read interactive PDF forms (AcroForms) and export all filled data as a structured JSON file. 100% free, secure, and private - processing happens locally in your browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/extract-form-data",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <ExtractFormDataClient />
    </>
  );
}
