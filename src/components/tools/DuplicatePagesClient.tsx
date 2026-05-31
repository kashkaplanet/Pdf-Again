"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PDFDocument } from "pdf-lib";
import { Download, CopyPlus, Loader2 } from "lucide-react";
import clsx from "clsx";

interface PageInfo {
    index: number;
    copies: number;
}

export default function DuplicatePagesClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pages, setPages] = useState<PageInfo[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [globalCopies, setGlobalCopies] = useState(2);
    const [mode, setMode] = useState<"all" | "custom">("all");
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setIsLoading(true);
            try {
                const arrayBuffer = await files[0].arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                const count = pdfDoc.getPageCount();
                setTotalPages(count);
                setPages(
                    Array.from({ length: count }, (_, i) => ({ index: i, copies: 2 }))
                );
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

    const handleDuplicate = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const srcDoc = await PDFDocument.load(arrayBuffer);
            const newDoc = await PDFDocument.create();

            const srcPages = srcDoc.getPages();

            for (let i = 0; i < srcPages.length; i++) {
                const copies = mode === "all" ? globalCopies : pages[i].copies;
                for (let c = 0; c < copies; c++) {
                    const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
                    newDoc.addPage(copiedPage);
                }
            }

            const pdfBytes = await newDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `duplicated_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Failed to duplicate pages:", err);
            setError(err.message || "Failed to duplicate pages.");
        } finally {
            setIsProcessing(false);
        }
    };

    const updatePageCopies = (index: number, copies: number) => {
        setPages((prev) =>
            prev.map((p) => (p.index === index ? { ...p, copies: Math.max(1, copies) } : p))
        );
    };

    const totalOutputPages = mode === "all"
        ? totalPages * globalCopies
        : pages.reduce((sum, p) => sum + p.copies, 0);

    return (
        <ToolPageWrapper
            title="Duplicate Pages"
            description="Repeat PDF pages multiple times — great for labels, tickets, and printing."
            icon={CopyPlus}
            color="pink"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        title="Select PDF to Duplicate Pages"
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
                                <CopyPlus className="w-6 h-6" />
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
                            onClick={() => { setFile(null); setPages([]); }}
                            className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F87171] font-display text-sm transition-colors"
                        >
                            Change
                        </button>
                    </div>

                    {/* Mode */}
                    <div className="mb-6">
                        <label className="block text-sm font-display mb-3">Duplication Mode</label>
                        <div className="flex border-2 border-black">
                            <button
                                onClick={() => setMode("all")}
                                className={clsx(
                                    "flex-1 py-3 px-4 font-display transition-all",
                                    mode === "all" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                )}
                            >
                                All Pages × N
                            </button>
                            <button
                                onClick={() => setMode("custom")}
                                className={clsx(
                                    "flex-1 py-3 px-4 font-display border-l-2 border-black transition-all",
                                    mode === "custom" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                )}
                            >
                                Custom Per Page
                            </button>
                        </div>
                    </div>

                    {mode === "all" ? (
                        <div className="mb-8">
                            <label className="block text-xs font-display mb-1.5 uppercase">
                                Copies of each page
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={globalCopies}
                                onChange={(e) => setGlobalCopies(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-[#F472B6] outline-none font-sans"
                            />
                        </div>
                    ) : (
                        <div className="mb-8 max-h-64 overflow-y-auto border-2 border-black">
                            {pages.map((p) => (
                                <div
                                    key={p.index}
                                    className="flex items-center justify-between px-4 py-3 border-b border-gray-200 last:border-b-0"
                                >
                                    <span className="font-display text-sm">Page {p.index + 1}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updatePageCopies(p.index, p.copies - 1)}
                                            className="w-8 h-8 border-2 border-black bg-white hover:bg-gray-100 font-display"
                                        >
                                            −
                                        </button>
                                        <span className="w-8 text-center font-display">{p.copies}</span>
                                        <button
                                            onClick={() => updatePageCopies(p.index, p.copies + 1)}
                                            className="w-8 h-8 border-2 border-black bg-white hover:bg-gray-100 font-display"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Output info */}
                    <div className="mb-6 p-3 bg-[#F472B6]/10 border-2 border-[#F472B6] text-sm font-sans">
                        Output will have <strong>{totalOutputPages}</strong> pages
                    </div>

                    {error && (
                        <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                            {error}
                        </div>
                    )}

                    <RetroActionButton
                        label="Duplicate & Download"
                        isProcessing={isProcessing}
                        processingText="Duplicating Pages..."
                        onClick={handleDuplicate}
                        color="pink"
                        icon={<Download className="w-5 h-5" />}
                    />
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
