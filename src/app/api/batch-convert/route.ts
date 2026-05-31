export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { handleApiError, handleBadRequest } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return handleBadRequest("ZIP file is required");
        }

        if (!file.name.toLowerCase().endsWith('.zip')) {
             return handleBadRequest("File must be a ZIP archive");
        }

        const arrayBuffer = await file.arrayBuffer();
        const zip = new JSZip();
        await zip.loadAsync(arrayBuffer);

        const pdfDoc = await PDFDocument.create();
        let imagesProcessed = 0;

        for (const [filename, zipEntry] of Object.entries(zip.files)) {
            if (zipEntry.dir) continue;
            
            const isJpg = filename.match(/\.(jpg|jpeg)$/i);
            const isPng = filename.match(/\.png$/i);
            
            if (!isJpg && !isPng) continue;
            
            const imageBuffer = await zipEntry.async('uint8array');
            
            let image;
            if (isJpg) {
                image = await pdfDoc.embedJpg(imageBuffer);
            } else {
                image = await pdfDoc.embedPng(imageBuffer);
            }
            
            const { width, height } = image.scale(1);
            const page = pdfDoc.addPage([width, height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width,
                height,
            });
            imagesProcessed++;
        }

        if (imagesProcessed === 0) {
            return handleBadRequest("No valid images (JPG/PNG) found in the ZIP file.");
        }

        const pdfBytes = await pdfDoc.save();

        return new NextResponse(pdfBytes as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="merged_images.pdf"',
            },
        });

    } catch (error) {
        return handleApiError(error, "Internal server error processing ZIP");
    }
}
