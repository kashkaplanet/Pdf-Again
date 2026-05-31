"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { extractPages } from "@/core/pdf";
import { usePDF } from "@/hooks/usePDF";
import { PDFThumbnail } from "@/components/PDFThumbnail";
import { Download, Trash2, Loader2 } from "lucide-react";
import clsx from "clsx";
import { VirtuosoGrid } from "react-virtuoso";

export default function RemovePagesPdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const { pdfProxy, pageCount, loading } = usePDF(file);
    const [pagesToRemove, setPagesToRemove] = useState<Set<number>>(new Set());
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setPagesToRemove(new Set());
            setLastSelectedIndex(null);
            setError(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const togglePage = (index: number, e?: React.MouseEvent) => {
        if (e?.shiftKey && lastSelectedIndex !== null) {
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            
            const isSelecting = !pagesToRemove.has(index);

            setPagesToRemove(prev => {
                const newSet = new Set(prev);
                for (let i = start; i <= end; i++) {
                    if (isSelecting) newSet.add(i);
                    else newSet.delete(i);
                }
                return newSet;
            });
        } else {
            setPagesToRemove(prev => {
                const newSet = new Set(prev);
                if (newSet.has(index)) {
                    newSet.delete(index);
                } else {
                    newSet.add(index);
                }
                return newSet;
            });
        }
        setLastSelectedIndex(index);
    };

    const handleRemovePages = async () => {
        if (!file || pagesToRemove.size === 0) return;

        setIsProcessing(true);
        setError(null);
        try {
            const pagesToKeep: number[] = [];
            for (let i = 0; i < pageCount; i++) {
                if (!pagesToRemove.has(i)) {
                    pagesToKeep.push(i);
                }
            }

            if (pagesToKeep.length === 0) {
                setError("Cannot remove all pages. At least one page must remain.");
                setIsProcessing(false);
                return;
            }

            const blob = await extractPages(file, pagesToKeep);

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `removed_pages_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error("Failed to remove pages:", err);
            setError("Failed to remove pages from PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolPageWrapper
            title="Remove Pages"
            description="Select and remove unwanted pages from your PDF."
            icon={Trash2}
            color="pink"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        title="Select PDF to Edit"
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
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-display truncate max-w-[300px]">
                                    {file.name}
                                </h2>
                                <p className="text-sm text-gray-600 font-sans">
                                    {pageCount} pages total • {pagesToRemove.size} selected for removal
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

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-[#F472B6] animate-spin mb-4" />
                            <p className="text-gray-600 font-sans">Loading PDF pages...</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600 font-sans mb-4 text-center">
                                Click on pages to mark them for removal
                            </p>

                            {error && (
                                <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                                    {error}
                                </div>
                            )}

                            {pdfProxy && (
                                <div>
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
                                                onClick={(e) => togglePage(i, e)}
                                                className={clsx(
                                                    "relative cursor-pointer border-2 transition-all w-full",
                                                    pagesToRemove.has(i)
                                                        ? "border-[#F87171] opacity-50"
                                                        : "border-black hover:border-[#F472B6]"
                                                )}
                                            >
                                                <PDFThumbnail
                                                    pdfProxy={pdfProxy}
                                                    pageIndex={i}
                                                    width={150}
                                                    hidePageLabel={true}
                                                />
                                                {pagesToRemove.has(i) && (
                                                    <div className="absolute inset-0 bg-[#F87171]/20 flex items-center justify-center">
                                                        <Trash2 className="w-8 h-8 text-[#F87171]" />
                                                    </div>
                                                )}
                                                <div className="text-center py-2 bg-white border-t-2 border-black text-sm font-display">
                                                    Page {i + 1}
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            )}

                            <div className="flex justify-center">
                                <RetroActionButton
                                    label={`Remove ${pagesToRemove.size} Page${pagesToRemove.size !== 1 ? 's' : ''} & Download`}
                                    isProcessing={isProcessing}
                                    processingText="Removing..."
                                    onClick={handleRemovePages}
                                    disabled={pagesToRemove.size === 0}
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
