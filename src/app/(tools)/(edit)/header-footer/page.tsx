import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'PDF Header & Footer - Add Custom Headers and Footers | PDFagain',
  description: 'Add custom text headers and footers to every page of your PDF document. Free and secure tool.',
  keywords: ['pdf header', 'pdf footer', 'add text to pdf', 'edit pdf'],
  alternates: {
    canonical: '/header-footer',
  },
  openGraph: {
    title: 'PDF Header & Footer - Add Custom Headers and Footers',
    description: 'Add custom text headers and footers to every page of your PDF document. Free and secure tool.',
    url: 'https://pdfagain.com/header-footer',
    type: 'website',
  },
};

import dynamic from 'next/dynamic';
import React from 'react';
const HeaderFooterClient = dynamic(() => import('@/components/tools/HeaderFooterClient'));

export default function HeaderFooterPage() {
  const jsonLdData = {
    "@type": "SoftwareApplication",
    "image": "https://pdfagain.com/icons/icon-512.svg",
    "name": "PDF Header & Footer",
    "description": "Add custom text headers and footers to every page of your PDF document. Free and secure tool.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://pdfagain.com/header-footer",
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <HeaderFooterClient />
    </>
  );
}
