"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PDFDocument } from "pdf-lib";
import { Download, ShieldCheck, Loader2, CheckCircle } from "lucide-react";

interface SanitizeResult {
    title: string;
    author: string;
    subject: string;
    keywords: string;
    creator: string;
    producer: string;
    creationDate: string;
    modificationDate: string;
}

export default function SanitizePdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [originalMetadata, setOriginalMetadata] = useState<SanitizeResult | null>(null);
    const [sanitized, setSanitized] = useState(false);
    const [sanitizedUrl, setSanitizedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = async (files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            setError(null);
            setSanitized(false);
            setSanitizedUrl(null);
            setIsAnalyzing(true);

            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);

                setOriginalMetadata({
                    title: pdfDoc.getTitle() || "",
                    author: pdfDoc.getAuthor() || "",
                    subject: pdfDoc.getSubject() || "",
                    keywords: pdfDoc.getKeywords() || "",
                    creator: pdfDoc.getCreator() || "",
                    producer: pdfDoc.getProducer() || "",
                    creationDate: pdfDoc.getCreationDate()?.toISOString() || "",
                    modificationDate: pdfDoc.getModificationDate()?.toISOString() || "",
                });
            } catch (err) {
                console.error("Failed to analyze PDF:", err);
                setError("Failed to read PDF metadata.");
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const hasMetadata = originalMetadata && (
        originalMetadata.title ||
        originalMetadata.author ||
        originalMetadata.subject ||
        originalMetadata.keywords ||
        originalMetadata.creator ||
        originalMetadata.producer ||
        originalMetadata.creationDate ||
        originalMetadata.modificationDate
    );

    const handleSanitize = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Strip all metadata fields
            pdfDoc.setTitle("");
            pdfDoc.setAuthor("");
            pdfDoc.setSubject("");
            pdfDoc.setKeywords([]);
            pdfDoc.setCreator("");
            pdfDoc.setProducer("");

            // Remove creation and modification dates by setting them to the epoch
            pdfDoc.setCreationDate(new Date(0));
            pdfDoc.setModificationDate(new Date(0));

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

            const url = URL.createObjectURL(blob);
            setSanitizedUrl(url);
            setSanitized(true);
        } catch (err: any) {
            console.error("Failed to sanitize PDF:", err);
            setError(err.message || "Failed to sanitize PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (sanitizedUrl && file) {
            const link = document.createElement("a");
            link.href = sanitizedUrl;
            link.download = `sanitized_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleReset = () => {
        if (sanitizedUrl) URL.revokeObjectURL(sanitizedUrl);
        setFile(null);
        setOriginalMetadata(null);
        setSanitized(false);
        setSanitizedUrl(null);
        setError(null);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "—";
        try {
            const d = new Date(dateStr);
            if (d.getTime() === 0) return "—";
            return d.toLocaleString();
        } catch {
            return dateStr;
        }
    };

    const metadataFields = originalMetadata ? [
        { label: "Title", value: originalMetadata.title },
        { label: "Author", value: originalMetadata.author },
        { label: "Subject", value: originalMetadata.subject },
        { label: "Keywords", value: originalMetadata.keywords },
        { label: "Creator", value: originalMetadata.creator },
        { label: "Producer", value: originalMetadata.producer },
        { label: "Created", value: formatDate(originalMetadata.creationDate) },
        { label: "Modified", value: formatDate(originalMetadata.modificationDate) },
    ] : [];

    return (
        <ToolPageWrapper
            title="Sanitize PDF"
            description="Remove all hidden metadata, author info, and timestamps from your PDF for privacy."
            icon={ShieldCheck}
            color="green"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        title="Select PDF to Sanitize"
                        description="Drag & drop or click to browse"
                        variant="green"
                    />
                </RetroCard>
            ) : isAnalyzing ? (
                <RetroCard>
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                </RetroCard>
            ) : (
                <RetroCard className="max-w-3xl mx-auto">
                    {/* File Info */}
                    <div className="flex items-center justify-between mb-8 p-4 bg-[#4ADE80]/10 border-2 border-black">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#4ADE80] border-2 border-black">
                                <ShieldCheck className="w-6 h-6" />
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
                            onClick={handleReset}
                            className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F87171] font-display text-sm transition-colors"
                        >
                            Change
                        </button>
                    </div>

                    {/* Metadata found */}
                    <div className="mb-8">
                        <h3 className="text-sm font-display mb-4">
                            {sanitized ? "✅ Metadata Removed" : "Metadata Found in Document"}
                        </h3>
                        <div className="space-y-2 p-4 border-2 border-black bg-white">
                            {metadataFields.map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                    <span className="text-xs font-display uppercase w-24 shrink-0">{label}</span>
                                    <span className={`text-sm font-sans text-right truncate ml-4 ${sanitized ? "line-through text-gray-400" : value && value !== "—" ? "text-black" : "text-gray-400"
                                        }`}>
                                        {value || "—"}
                                    </span>
                                    {sanitized && value && value !== "—" && (
                                        <CheckCircle className="w-4 h-4 text-green-500 ml-2 shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {!hasMetadata && !sanitized && (
                            <div className="mt-4 p-3 bg-[#4ADE80]/10 border-2 border-[#4ADE80] text-sm font-sans">
                                ✨ This PDF already has minimal metadata. You can still sanitize it to ensure all traces are removed.
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                            {error}
                        </div>
                    )}

                    {sanitized ? (
                        <div className="flex gap-4">
                            <RetroActionButton
                                label="Download Sanitized PDF"
                                isProcessing={false}
                                processingText=""
                                onClick={handleDownload}
                                color="green"
                                icon={<Download className="w-5 h-5" />}
                            />
                            <RetroActionButton
                                label="Sanitize Another"
                                isProcessing={false}
                                processingText=""
                                onClick={handleReset}
                                color="default"
                                icon={<ShieldCheck className="w-5 h-5" />}
                            />
                        </div>
                    ) : (
                        <RetroActionButton
                            label="Sanitize PDF"
                            isProcessing={isProcessing}
                            processingText="Sanitizing..."
                            onClick={handleSanitize}
                            color="green"
                            icon={<ShieldCheck className="w-5 h-5" />}
                        />
                    )}
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
