"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { AlignVerticalSpaceAround, ArrowRight, Download, AlertTriangle } from "lucide-react";
import { RetroVariant } from "@/config/design";

export default function HeaderFooterClient({
    title = "Header & Footer",
    description = "Add custom text to the top and bottom of your PDF pages.",
    variant = "purple" as RetroVariant,
}) {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
    
    const [headerText, setHeaderText] = useState("");
    const [footerText, setFooterText] = useState("");

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
        if (!headerText && !footerText) {
            setError("Please enter either header or footer text.");
            return;
        }

        setIsConverting(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("header", headerText);
        formData.append("footer", footerText);

        try {
            const response = await fetch("/api/header-footer", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to process PDF");
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
            a.download = file.name.replace(/\.[^/.]+$/, "") + "_stamped.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <ToolPageWrapper
            title={title}
            description={description}
            icon={AlignVerticalSpaceAround}
            color={variant}
        >
            {!file ? (
                <RetroCard variant="default">
                    <RetroFileUploader
                        onFilesSelected={handleFilesSelected}
                        accept={{ "application/pdf": [".pdf"] }}
                        multiple={false}
                        title="Upload PDF"
                        description="Select a .pdf file to add header/footer"
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
                    
                    {!convertedUrl && (
                        <div className="mb-8 p-4 border-2 border-black bg-white space-y-4">
                            <h3 className="font-display font-bold">Text Content</h3>
                            
                            <div>
                                <label className="block font-display text-sm mb-1">Header Text (Top)</label>
                                <input 
                                    type="text" 
                                    value={headerText} 
                                    onChange={(e) => setHeaderText(e.target.value)}
                                    className="w-full border-2 border-black p-2 font-display text-sm"
                                    placeholder="Confidential Document"
                                />
                            </div>

                            <div>
                                <label className="block font-display text-sm mb-1">Footer Text (Bottom)</label>
                                <input 
                                    type="text" 
                                    value={footerText} 
                                    onChange={(e) => setFooterText(e.target.value)}
                                    className="w-full border-2 border-black p-2 font-display text-sm"
                                    placeholder="Property of PDFagain"
                                />
                            </div>
                        </div>
                    )}

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
                                    label="Apply Text"
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
