"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { FileText, ArrowRight, Download, AlertTriangle } from "lucide-react";

export default function PdfToTxtClient() {
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

        const formData = new FormData();
        formData.append("file", file);

        try {
            const arrayBuffer = await file.arrayBuffer();
            
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";

            const pdfDocument = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            const numPages = pdfDocument.numPages;
            const textParts: string[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const textContent = await page.getTextContent();

                let lastY = -1;
                let currentLineText = "";
                const lines: string[] = [];

                for (const item of textContent.items) {
                    const itemText = (item as any).str;
                    const itemY = (item as any).transform[5];

                    if (lastY !== -1 && Math.abs(itemY - lastY) > 5) {
                        if (currentLineText.trim()) {
                            lines.push(currentLineText.trimEnd());
                        }
                        currentLineText = "";
                    }

                    currentLineText += itemText;
                    lastY = itemY;
                }

                if (currentLineText.trim()) {
                    lines.push(currentLineText.trimEnd());
                }

                if (lines.length > 0) {
                    textParts.push(`--- Page ${i} ---\n${lines.join("\n")}`);
                }
            }

            const fullText = textParts.join("\n\n");
            
            const blob = new Blob([fullText], { type: "text/plain; charset=utf-8" });
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
            a.download = file.name.replace(/\.[^/.]+$/, "") + ".txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <ToolPageWrapper
            title="PDF to TXT"
            description="Extract text content from PDF documents into plain text files."
            icon={FileText}
            color="blue"
        >
            {!file ? (
                <RetroCard variant="default">
                    <RetroFileUploader
                        onFilesSelected={handleFilesSelected}
                        accept={{ "application/pdf": [".pdf"] }}
                        multiple={false}
                        title="Upload PDF"
                        description="Select a .pdf file to extract text from"
                        variant="blue"
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
                            color="blue"
                        />
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
                                    label="Download .txt"
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
                                label="Extract Text"
                                isProcessing={isConverting}
                                processingText="Extracting..."
                                onClick={handleConvert}
                                disabled={!file}
                                color="blue"
                                icon={<ArrowRight className="w-5 h-5" />}
                            />
                        )}
                    </div>
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
