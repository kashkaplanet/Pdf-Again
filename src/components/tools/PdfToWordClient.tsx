"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { FileText, ArrowRight, Download, AlertTriangle } from "lucide-react";

export default function PdfToWordClient() {
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
            const arrayBuffer = await file.arrayBuffer();
            
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";

            const pdfDocument = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            
            const { Document, Packer, Paragraph, TextRun } = await import('docx');
            let fullText = "";

            for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + "\n";
                page.cleanup();
            }

            const lines = fullText.split(/\r?\n/);
            const children = lines.map((line: string) =>
                new Paragraph({
                    children: [new TextRun(line)]
                })
            );

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: children,
                }],
            });

            const blob = await Packer.toBlob(doc);
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
            a.download = file.name.replace(/\.[^/.]+$/, "") + ".docx";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Clean up the URL object
            window.URL.revokeObjectURL(convertedUrl);
        }
    };

    return (
        <ToolPageWrapper
            title="PDF to Word"
            description="Convert PDF documents to editable Word files."
            icon={FileText}
            color="blue"
        >
            <RetroCard className="max-w-2xl mx-auto py-12" variant="default">
                <div className="mb-8">
                    {!file ? (
                        <RetroFileUploader
                            onFilesSelected={handleFilesSelected}
                            accept={{ "application/pdf": [".pdf"] }}
                            multiple={false}
                            title="Upload PDF"
                            description="Select a .pdf file to convert"
                            variant="blue"
                        />
                    ) : (
                        <RetroFileItem
                            name={file.name}
                            size={(file.size / 1024).toFixed(1) + " KB"}
                            index={0}
                            onRemove={handleRemoveFile}
                            color="blue"
                        />
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 border-2 border-black bg-red-100 text-red-800 font-display flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="mt-8 flex gap-4">
                    {convertedUrl ? (
                        <>
                            <RetroActionButton
                                label="Download .docx"
                                isProcessing={false}
                                processingText=""
                                onClick={handleDownload}
                                color="blue"
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
                            label="Convert to Word"
                            isProcessing={isConverting}
                            processingText="Converting..."
                            onClick={handleConvert}
                            disabled={!file}
                            color="blue"
                            icon={<ArrowRight className="w-5 h-5" />}
                        />
                    )}
                </div>
            </RetroCard>
        </ToolPageWrapper>
    );
}
