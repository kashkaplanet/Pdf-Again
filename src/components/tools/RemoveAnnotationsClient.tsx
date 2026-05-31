"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PDFDocument } from "pdf-lib";
import { Download, MessageSquareOff, Loader2 } from "lucide-react";

export default function RemoveAnnotationsClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [annotCount, setAnnotCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = async (files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            setError(null);
            setIsLoading(true);

            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                const pages = pdfDoc.getPages();

                let count = 0;
                for (const page of pages) {
                    const annots = page.node.Annots();
                    if (annots) {
                        count += annots.size();
                    }
                }
                setAnnotCount(count);
            } catch (err) {
                console.error("Failed to analyze PDF annotations:", err);
                setError("Failed to read PDF.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleRemove = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();

            for (const page of pages) {
                // Remove all annotations (comments, links, highlights, form fields)
                page.node.set(pdfDoc.context.obj('Annots'), pdfDoc.context.obj([]));
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `no-annotations_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            // Re-read to show 0
            setAnnotCount(0);
        } catch (err: any) {
            console.error("Failed to remove annotations:", err);
            setError(err.message || "Failed to remove annotations.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolPageWrapper
            title="Remove Annotations"
            description="Strip all comments, highlights, drawings, and interactive forms from a PDF."
            icon={MessageSquareOff}
            color="orange"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        title="Select PDF"
                        description="Drag & drop or click to browse"
                        variant="orange"
                    />
                </RetroCard>
            ) : isLoading ? (
                <RetroCard>
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                </RetroCard>
            ) : (
                <RetroCard className="max-w-3xl mx-auto">
                    {/* File Info */}
                    <div className="flex items-center justify-between mb-8 p-4 bg-[#FB923C]/10 border-2 border-black">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#FB923C] border-2 border-black">
                                <MessageSquareOff className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-display truncate max-w-[200px] sm:max-w-md">
                                    {file.name}
                                </h2>
                                <p className="text-sm text-gray-600 font-sans">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setFile(null); setAnnotCount(0); }}
                            className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F87171] font-display text-sm transition-colors"
                        >
                            Change
                        </button>
                    </div>

                    <div className="mb-8 p-6 border-2 border-black bg-white text-center">
                        <h3 className="text-xl font-display mb-2">
                            {annotCount === 0 ? "No Annotations Found" : `${annotCount} Annotations Detected`}
                        </h3>
                        <p className="text-sm text-gray-600 font-sans">
                            {annotCount === 0
                                ? "This document appears to be clean, but you can still process it to ensure hidden form fields or links are removed."
                                : "Click the button below to permanently remove all highlights, notes, and form fields from this document."}
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                            {error}
                        </div>
                    )}

                    <RetroActionButton
                        label={annotCount === 0 ? "Process Anyway" : "Remove Annotations"}
                        isProcessing={isProcessing}
                        processingText="Removing..."
                        onClick={handleRemove}
                        color="orange"
                        icon={<Download className="w-5 h-5" />}
                    />
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
