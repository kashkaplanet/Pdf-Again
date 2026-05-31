"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { FileArchive, ArrowRight, Download, AlertTriangle } from "lucide-react";
import { RetroVariant } from "@/config/design";

export default function BatchConvertClient({
    title = "Batch Convert (ZIP to PDF)",
    description = "Upload a ZIP file containing images and we'll merge them into a single PDF.",
    variant = "cyan" as RetroVariant,
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
        accept: { "application/zip": [".zip"] },
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
            const response = await fetch("/api/batch-convert", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to process ZIP file");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setConvertedUrl(url);
        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (convertedUrl && file) {
            const a = document.createElement("a");
            a.href = convertedUrl;
            a.download = file.name.replace(/\.[^/.]+$/, "") + "_merged.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <ToolPageWrapper
            title={title}
            description={description}
            icon={FileArchive}
            color={variant}
        >
            {!file ? (
                <RetroCard variant="default">
                    <RetroFileUploader
                        onFilesSelected={handleFilesSelected}
                        accept={{ "application/zip": [".zip"] }}
                        multiple={false}
                        title="Upload ZIP File"
                        description="Select a .zip file containing your images"
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
                                        label="Download PDF"
                                        isProcessing={false}
                                        processingText=""
                                        onClick={handleDownload}
                                        color={variant}
                                        icon={<Download className="w-5 h-5" />}
                                    />
                                    <RetroActionButton
                                        label="Process Another"
                                        isProcessing={false}
                                        processingText=""
                                        onClick={handleRemoveFile}
                                        color="default"
                                        icon={<ArrowRight className="w-5 h-5" />}
                                    />
                                </>
                            ) : (
                                <RetroActionButton
                                    label="Convert to PDF"
                                    isProcessing={isConverting}
                                    processingText="Processing..."
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
