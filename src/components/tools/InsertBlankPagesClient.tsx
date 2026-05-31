"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PDFDocument } from "pdf-lib";
import { Download, FilePlus2, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function InsertBlankPagesClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [mode, setMode] = useState<"after_every" | "at_end" | "custom">("after_every");
    const [customIndexes, setCustomIndexes] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setIsLoading(true);
            try {
                const arrayBuffer = await files[0].arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                setTotalPages(pdfDoc.getPageCount());
            } catch (err) {
                console.error("Failed to read PDF:", err);
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

    const handleInsert = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const originalCount = pdfDoc.getPageCount();

            // Track how many pages we've added so the indexes shift correctly
            let addedCount = 0;

            if (mode === "after_every") {
                // Insert a blank page after every original page
                for (let i = 0; i < originalCount; i++) {
                    const originalPage = pdfDoc.getPage(i + addedCount);
                    const { width, height } = originalPage.getSize();
                    pdfDoc.insertPage(i + addedCount + 1, [width, height]);
                    addedCount++;
                }
            } else if (mode === "at_end") {
                // Just add one blank page at the end matching the last page's size
                const lastPage = pdfDoc.getPage(originalCount - 1);
                const { width, height } = lastPage.getSize();
                pdfDoc.addPage([width, height]);
            } else if (mode === "custom") {
                // customIndexes like "1, 3, 5" means insert AFTER page 1, 3, 5
                const indexes = customIndexes
                    .split(",")
                    .map(s => parseInt(s.trim()))
                    .filter(n => !isNaN(n) && n >= 1 && n <= originalCount)
                    .sort((a, b) => a - b);
                
                // Remove duplicates
                const uniqueIndexes = Array.from(new Set(indexes));

                for (const idx of uniqueIndexes) {
                    const originalPage = pdfDoc.getPage(idx - 1 + addedCount);
                    const { width, height } = originalPage.getSize();
                    // Insert AFTER the specified page number
                    pdfDoc.insertPage(idx + addedCount, [width, height]);
                    addedCount++;
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `blank-pages_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Failed to insert blank pages:", err);
            setError(err.message || "Failed to insert blank pages.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolPageWrapper
            title="Insert Blank Pages"
            description="Add blank pages to your PDF for double-sided printing or note-taking."
            icon={FilePlus2}
            color="pink"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        title="Select PDF"
                        description="Drag & drop or click to browse"
                        variant="pink"
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
                    <div className="flex items-center justify-between mb-8 p-4 bg-[#F472B6]/10 border-2 border-black">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#F472B6] border-2 border-black">
                                <FilePlus2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-display truncate max-w-[200px] sm:max-w-md">
                                    {file.name}
                                </h2>
                                <p className="text-sm text-gray-600 font-sans">
                                    {totalPages} pages • {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F87171] font-display text-sm transition-colors"
                        >
                            Change
                        </button>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-display mb-3">Where to insert blank pages?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-2 border-black p-1 bg-gray-100">
                            <button
                                onClick={() => setMode("after_every")}
                                className={clsx(
                                    "py-3 px-4 font-display transition-all border-2 border-transparent",
                                    mode === "after_every" ? "bg-[#F472B6] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "hover:bg-white"
                                )}
                            >
                                After Every Page
                            </button>
                            <button
                                onClick={() => setMode("at_end")}
                                className={clsx(
                                    "py-3 px-4 font-display transition-all border-2 border-transparent",
                                    mode === "at_end" ? "bg-[#F472B6] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "hover:bg-white"
                                )}
                            >
                                Only at the End
                            </button>
                            <button
                                onClick={() => setMode("custom")}
                                className={clsx(
                                    "py-3 px-4 font-display transition-all border-2 border-transparent",
                                    mode === "custom" ? "bg-[#F472B6] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "hover:bg-white"
                                )}
                            >
                                Custom Positions
                            </button>
                        </div>
                    </div>

                    {mode === "custom" && (
                        <div className="mb-8">
                            <label className="block text-sm font-display mb-2">Insert AFTER these page numbers:</label>
                            <input
                                type="text"
                                value={customIndexes}
                                onChange={(e) => setCustomIndexes(e.target.value)}
                                placeholder="e.g. 1, 4, 7"
                                className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-[#F472B6] outline-none font-sans"
                            />
                            <p className="text-xs text-gray-500 mt-2 font-sans">
                                Enter page numbers separated by commas. Maximum page number is {totalPages}.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                            {error}
                        </div>
                    )}

                    <RetroActionButton
                        label="Insert Blank Pages"
                        isProcessing={isProcessing}
                        processingText="Processing..."
                        onClick={handleInsert}
                        color="pink"
                        icon={<Download className="w-5 h-5" />}
                    />
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
