"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { extractPages, splitPdfToZip } from "@/core/pdf";
import { usePDF } from "@/hooks/usePDF";
import { PDFThumbnail } from "@/components/PDFThumbnail";
import { Download, Scissors, Loader2 } from "lucide-react";
import clsx from "clsx";
import { VirtuosoGrid } from "react-virtuoso";

export default function SplitPdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const { pdfProxy, pageCount, loading } = usePDF(file);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'extract' | 'burst'>('extract');
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    const handleFileSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setSelectedPages([]);
            setError(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const togglePageSelection = (pageIndex: number, e?: React.MouseEvent) => {
        if (e?.shiftKey && lastSelectedIndex !== null) {
            const start = Math.min(lastSelectedIndex, pageIndex);
            const end = Math.max(lastSelectedIndex, pageIndex);
            
            const isSelecting = !selectedPages.includes(pageIndex);
            
            setSelectedPages(prev => {
                let newArr = [...prev];
                for (let i = start; i <= end; i++) {
                    if (isSelecting && !newArr.includes(i)) {
                        newArr.push(i);
                    } else if (!isSelecting && newArr.includes(i)) {
                        newArr = newArr.filter(p => p !== i);
                    }
                }
                return newArr.sort((a, b) => a - b);
            });
        } else {
            setSelectedPages((prev) =>
                prev.includes(pageIndex)
                    ? prev.filter((p) => p !== pageIndex)
                    : [...prev, pageIndex].sort((a, b) => a - b)
            );
        }
        setLastSelectedIndex(pageIndex);
    };

    const selectAll = () => {
        if (selectedPages.length === pageCount) {
            setSelectedPages([]);
        } else {
            setSelectedPages(Array.from({ length: pageCount }, (_, i) => i));
        }
    };

    const handleAction = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        try {
            if (mode === 'extract') {
                if (selectedPages.length === 0) {
                    setError("Please select at least one page to extract.");
                    return;
                }
                const blob = await extractPages(file, selectedPages);
                downloadBlob(blob, `extracted_${file.name}`);
            } else {
                const blob = await splitPdfToZip(file);
                downloadBlob(blob, `split_${file.name.replace('.pdf', '')}.zip`);
            }
        } catch (error) {
            console.error("Failed to process PDF", error);
            setError("Failed to process PDF. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <ToolPageWrapper
            title="Split PDF"
            description="Extract pages or split your PDF into multiple files."
            icon={Scissors}
            color="pink"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        accept={{ "application/pdf": [".pdf"] }}
                        title="Select PDF to Split"
                        description="Drag & drop or click to browse"
                        variant="pink"
                    />
                </RetroCard>
            ) : (
                <RetroCard>
                    {/* File Info */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-[#F472B6] border-2 border-black">
                                <Scissors className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-display truncate max-w-[300px]">
                                    {file.name}
                                </h2>
                                <p className="text-sm text-gray-600 font-sans">
                                    {pageCount} pages • {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F87171] font-display text-sm transition-colors"
                        >
                            Change File
                        </button>
                    </div>

                    {/* Mode Selection */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex border-2 border-black">
                            <button
                                onClick={() => setMode('extract')}
                                className={clsx(
                                    "px-6 py-3 font-display text-sm transition-all border-r-2 border-black",
                                    mode === 'extract' ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                )}
                            >
                                Extract Pages
                            </button>
                            <button
                                onClick={() => setMode('burst')}
                                className={clsx(
                                    "px-6 py-3 font-display text-sm transition-all",
                                    mode === 'burst' ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                )}
                            >
                                Burst (Split All)
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-[#F472B6] animate-spin mb-4" />
                            <p className="text-gray-600 font-sans">Loading PDF pages...</p>
                        </div>
                    ) : (
                        <>
                            {mode === 'extract' && (
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-gray-600 font-sans">
                                        Select pages to extract into a new PDF.
                                    </p>
                                    <button
                                        onClick={selectAll}
                                        className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F472B6] font-display text-sm transition-colors"
                                    >
                                        {selectedPages.length === pageCount ? "Deselect All" : "Select All"}
                                    </button>
                                </div>
                            )}

                            {pdfProxy && (
                                <div className={clsx(
                                    mode === 'burst' && "opacity-50 pointer-events-none grayscale"
                                )}>
                                    <VirtuosoGrid
                                        useWindowScroll
                                        totalCount={pageCount}
                                        overscan={200}
                                        components={{
                                            List: GridList,
                                            Item: GridItem
                                        }}
                                        itemContent={(i) => (
                                            <div
                                                key={i}
                                                className={clsx(
                                                    "relative cursor-pointer border-2 transition-all w-full",
                                                    selectedPages.includes(i)
                                                        ? "border-[#F472B6]"
                                                        : "border-black hover:border-[#F472B6]"
                                                )}
                                                onClick={(e) => togglePageSelection(i, e)}
                                            >
                                                <PDFThumbnail
                                                    pdfProxy={pdfProxy}
                                                    pageIndex={i}
                                                    selected={selectedPages.includes(i)}
                                                    hidePageLabel={true}
                                                />
                                                <div className="text-center py-1 bg-white border-t-2 border-black text-xs font-display">
                                                    Page {i + 1}
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            )}



                            {error && (
                                <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-center">
                                <RetroActionButton
                                    label={mode === 'extract' ? `Extract Selected Pages` : `Split All Pages (Zip)`}
                                    isProcessing={isProcessing}
                                    processingText="Processing..."
                                    onClick={handleAction}
                                    disabled={mode === 'extract' && selectedPages.length === 0}
                                    color="pink"
                                    icon={<Download className="w-5 h-5" />}
                                />
                            </div>
                        </>
                    )}
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}

const GridList = React.forwardRef(({ style, children, ...props }: any, ref: any) => (
    <div
        ref={ref}
        {...props}
        style={{ ...style, display: "flex", flexWrap: "wrap", gap: "1rem" }}
        className="mb-8"
    >
        {children}
    </div>
));
GridList.displayName = "GridList";

const GridItem = ({ children, ...props }: any) => (
    <div
        {...props}
        className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.66rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)]"
    >
        {children}
    </div>
);
GridItem.displayName = "GridItem";
