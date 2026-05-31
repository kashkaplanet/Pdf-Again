"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { FileImage, ArrowRight, Download, AlertTriangle } from "lucide-react";
import { RetroVariant } from "@/config/design";

export default function PdfToGifClient({
    title = "PDF to GIF",
    description = "Convert your PDF document into an animated GIF.",
    variant = "blue" as RetroVariant,
}) {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [convertedUrl, setConvertedUrl] = useState<string | null>(null);

    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setConvertedUrl(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFilesSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleRemoveFile = () => {
        setFile(null);
        setConvertedUrl(null);
        setError(null);
    };

    const handleConvert = async () => {
        if (!file) return;

        setIsConverting(true);
        setError(null);

        try {
            const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
            const arrayBuffer = await file.arrayBuffer();
            
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";

            const pdfDocument = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            
            // Get dimensions of first page for the GIF
            const firstPage = await pdfDocument.getPage(1);
            const viewport = firstPage.getViewport({ scale: 1.0 });
            const width = Math.round(viewport.width);
            const height = Math.round(viewport.height);
            
            const gif = GIFEncoder();
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');
            if (!context) throw new Error("Could not create canvas context");

            for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const pageViewport = page.getViewport({ scale: 1.0 });
                
                // Clear canvas and draw white background
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, width, height);

                // Calculate scale to fit page into canvas
                const scale = Math.min(width / pageViewport.width, height / pageViewport.height);
                const scaledViewport = page.getViewport({ scale });

                const xOffset = (width - scaledViewport.width) / 2;
                const yOffset = (height - scaledViewport.height) / 2;

                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = scaledViewport.width;
                tempCanvas.height = scaledViewport.height;
                const tempContext = tempCanvas.getContext('2d');
                if (!tempContext) continue;

                await page.render({
                    canvasContext: tempContext as any,
                    viewport: scaledViewport,
                } as any).promise;
                
                context.drawImage(tempCanvas, xOffset, yOffset);
                
                const imageData = context.getImageData(0, 0, width, height);
                const palette = quantize(imageData.data, 256);
                const index = applyPalette(imageData.data, palette);
                
                gif.writeFrame(index, width, height, { palette, delay: 1000 });
                
                page.cleanup();
            }

            gif.finish();
            const gifBytes = gif.bytes();
            const blob = new Blob([gifBytes], { type: "image/gif" });
            const url = window.URL.createObjectURL(blob);
            setConvertedUrl(url);
        } catch (err: any) {
            setError(err.message || "An error occurred during conversion.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (convertedUrl && file) {
            const a = document.createElement("a");
            a.href = convertedUrl;
            a.download = file.name.replace(/\.[^/.]+$/, "") + ".gif";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <ToolPageWrapper
            title={title}
            description={description}
            icon={FileImage}
            color={variant}
        >
            {!file ? (
                <RetroCard variant="default">
                    <RetroFileUploader
                        onFilesSelected={handleFilesSelected}
                        accept={{ "application/pdf": [".pdf"] }}
                        multiple={false}
                        title="Upload PDF"
                        description="Select a .pdf file to convert to GIF"
                        variant={variant}
                    />
                </RetroCard>
            ) : (
                <RetroCard variant="default">
                    <div className="mb-8">
                        <RetroFileItem
                            name={file.name}
                            size={(file.size / 1024).toFixed(1) + " KB"}
                            index={0}
                            onRemove={handleRemoveFile}
                            color={variant}
                        />
                    </div>

                    {error && (
                        <div className="mb-6 p-4 border-2 border-black bg-red-100 text-red-800 font-display flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {file && (
                        <div className="mt-8 flex gap-4">
                            {convertedUrl ? (
                                <>
                                    <RetroActionButton
                                        label="Download GIF"
                                        isProcessing={false}
                                        processingText=""
                                        onClick={handleDownload}
                                        color={variant}
                                        icon={<Download className="w-5 h-5" />}
                                    />
                                    <RetroActionButton
                                        label="Convert Another"
                                        isProcessing={false}
                                        processingText=""
                                        onClick={handleRemoveFile}
                                        color="default"
                                        icon={<ArrowRight className="w-5 h-5" />}
                                    />
                                </>
                            ) : (
                                <RetroActionButton
                                    label="Convert to GIF"
                                    isProcessing={isConverting}
                                    processingText="Converting..."
                                    onClick={handleConvert}
                                    disabled={!file}
                                    color={variant}
                                    icon={<ArrowRight className="w-5 h-5" />}
                                />
                            )}
                        </div>
                    )}
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
