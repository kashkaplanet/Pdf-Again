export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { handleApiError, handleBadRequest } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const header = formData.get('header') as string | null;
        const footer = formData.get('footer') as string | null;

        if (!file) {
            return handleBadRequest("PDF file is required");
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        const pages = pdfDoc.getPages();
        
        for (const page of pages) {
            const { width, height } = page.getSize();
            
            if (header) {
                const textWidth = font.widthOfTextAtSize(header, 12);
                page.drawText(header, {
                    x: (width / 2) - (textWidth / 2),
                    y: height - 30,
                    size: 12,
                    font: font,
                    color: rgb(0, 0, 0),
                });
            }
            
            if (footer) {
                const textWidth = font.widthOfTextAtSize(footer, 12);
                page.drawText(footer, {
                    x: (width / 2) - (textWidth / 2),
                    y: 30,
                    size: 12,
                    font: font,
                    color: rgb(0, 0, 0),
                });
            }
        }

        const pdfBytes = await pdfDoc.save();

        return new NextResponse(pdfBytes as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="stamped_document.pdf"',
            },
        });

    } catch (error) {
        return handleApiError(error, "Internal server error processing PDF");
    }
}
