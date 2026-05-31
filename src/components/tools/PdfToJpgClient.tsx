"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { FileImage, ArrowRight, Download, AlertTriangle } from "lucide-react";
import { RetroVariant } from "@/config/design";

interface PdfToJpgClientProps {
    title?: string;
    description?: string;
    outputFormat?: string;
    variant?: RetroVariant;
}

export default function PdfToJpgClient({
    title = "PDF to JPG",
    description = "Convert PDF pages to high-quality JPEG images.",
    outputFormat = "jpg",
    variant = "blue",
}: PdfToJpgClientProps) {
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
            const JSZip = (await import('jszip')).default;
            const arrayBuffer = await file.arrayBuffer();
            
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";

            const pdfDocument = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            const zip = new JSZip();

            for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext("2d");
                if (!ctx) continue;

                await page.render({
                    canvasContext: ctx as any,
                    viewport: viewport,
                } as any).promise;

                const mimeType = outputFormat === "webp" ? "image/webp" : "image/jpeg";
                const extension = outputFormat === "webp" ? "webp" : "jpg";

                const blob = await new Promise<Blob | null>(resolve => {
                    canvas.toBlob(b => resolve(b), mimeType, 0.9);
                });

                if (blob) {
                    zip.file(`page_${i}.${extension}`, blob);
                }
                page.cleanup();
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(zipBlob);
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
            a.download = file.name.replace(/\.[^/.]+$/, "") + `_${outputFormat}.zip`;
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
                        description="Select a .pdf file to convert"
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
                                        label={`Download ${outputFormat.toUpperCase()} (.zip)`}
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
                                    label={`Convert to ${outputFormat.toUpperCase()}`}
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
