"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PDFDocument } from "pdf-lib";
import { Download, SplitSquareHorizontal, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function SplitInHalfClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [direction, setDirection] = useState<"vertical" | "horizontal">("vertical");
    const [order, setOrder] = useState<"left-right" | "right-left" | "top-bottom" | "bottom-top">("left-right");
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            // reset order based on default direction
            setOrder("left-right");
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleDirectionChange = (dir: "vertical" | "horizontal") => {
        setDirection(dir);
        if (dir === "vertical") setOrder("left-right");
        if (dir === "horizontal") setOrder("top-bottom");
    };

    const handleSplit = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const srcDoc = await PDFDocument.load(arrayBuffer);
            const newDoc = await PDFDocument.create();

            const srcPages = srcDoc.getPages();

            for (let i = 0; i < srcPages.length; i++) {
                // To split a page, we create a blank page of half the size
                // and embed the original page shifted accordingly.
                const originalPage = srcPages[i];
                const { width, height } = originalPage.getSize();
                
                // We embed the page
                const [embeddedPage] = await newDoc.embedPages([originalPage]);

                if (direction === "vertical") {
                    const halfWidth = width / 2;
                    
                    const leftPage = newDoc.addPage([halfWidth, height]);
                    leftPage.drawPage(embeddedPage, { x: 0, y: 0 });

                    const rightPage = newDoc.addPage([halfWidth, height]);
                    rightPage.drawPage(embeddedPage, { x: -halfWidth, y: 0 });

                    if (order === "right-left") {
                        // Swap the two pages we just added
                        const p1 = newDoc.getPage(newDoc.getPageCount() - 2);
                        const p2 = newDoc.getPage(newDoc.getPageCount() - 1);
                        newDoc.removePage(newDoc.getPageCount() - 1);
                        newDoc.removePage(newDoc.getPageCount() - 1);
                        newDoc.addPage(p2);
                        newDoc.addPage(p1);
                    }
                } else {
                    const halfHeight = height / 2;

                    const bottomPage = newDoc.addPage([width, halfHeight]);
                    // PDF coordinates: origin is bottom-left
                    bottomPage.drawPage(embeddedPage, { x: 0, y: 0 });

                    const topPage = newDoc.addPage([width, halfHeight]);
                    topPage.drawPage(embeddedPage, { x: 0, y: -halfHeight });

                    // Top visually comes first in reading order
                    if (order === "top-bottom") {
                        const p1 = newDoc.getPage(newDoc.getPageCount() - 2); // bottom
                        const p2 = newDoc.getPage(newDoc.getPageCount() - 1); // top
                        newDoc.removePage(newDoc.getPageCount() - 1);
                        newDoc.removePage(newDoc.getPageCount() - 1);
                        newDoc.addPage(p2); // add top first
                        newDoc.addPage(p1); // add bottom second
                    } else if (order === "bottom-top") {
                        // already in correct order in the document array above
                    }
                }
            }

            const pdfBytes = await newDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `split_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Failed to split PDF in half:", err);
            setError(err.message || "Failed to split PDF in half.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolPageWrapper
            title="Split in Half (Unbooklet)"
            description="Cut each page down the middle to create two separate pages. Perfect for scanned books."
            icon={SplitSquareHorizontal}
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
                                <SplitSquareHorizontal className="w-6 h-6" />
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
                            onClick={() => setFile(null)}
                            className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F87171] font-display text-sm transition-colors"
                        >
                            Change
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <label className="block text-sm font-display mb-3">Cut Direction</label>
                            <div className="flex border-2 border-black">
                                <button
                                    onClick={() => handleDirectionChange("vertical")}
                                    className={clsx(
                                        "flex-1 py-3 font-display transition-all",
                                        direction === "vertical" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                    )}
                                >
                                    Vertical (Left/Right)
                                </button>
                                <button
                                    onClick={() => handleDirectionChange("horizontal")}
                                    className={clsx(
                                        "flex-1 py-3 font-display border-l-2 border-black transition-all",
                                        direction === "horizontal" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                    )}
                                >
                                    Horizontal (Top/Bottom)
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-display mb-3">Page Order</label>
                            <div className="flex border-2 border-black">
                                {direction === "vertical" ? (
                                    <>
                                        <button
                                            onClick={() => setOrder("left-right")}
                                            className={clsx(
                                                "flex-1 py-3 font-display transition-all",
                                                order === "left-right" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                            )}
                                        >
                                            Left then Right
                                        </button>
                                        <button
                                            onClick={() => setOrder("right-left")}
                                            className={clsx(
                                                "flex-1 py-3 font-display border-l-2 border-black transition-all",
                                                order === "right-left" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                            )}
                                        >
                                            Right then Left (Arabic/Hebrew)
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setOrder("top-bottom")}
                                            className={clsx(
                                                "flex-1 py-3 font-display transition-all",
                                                order === "top-bottom" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                            )}
                                        >
                                            Top then Bottom
                                        </button>
                                        <button
                                            onClick={() => setOrder("bottom-top")}
                                            className={clsx(
                                                "flex-1 py-3 font-display border-l-2 border-black transition-all",
                                                order === "bottom-top" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                            )}
                                        >
                                            Bottom then Top
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 flex justify-center">
                        <div className="relative w-48 h-64 border-2 border-black bg-white shadow-lg overflow-hidden flex items-center justify-center">
                            {/* Preview Grid */}
                            <div className="absolute inset-0 flex flex-col pointer-events-none">
                                {direction === "vertical" ? (
                                    <div className="flex w-full h-full">
                                        <div className="w-1/2 h-full border-r-2 border-dashed border-[#F472B6] flex items-center justify-center bg-gray-50/50">
                                            <span className="font-display text-xs text-[#F472B6]">
                                                {order === "left-right" ? "1" : "2"}
                                            </span>
                                        </div>
                                        <div className="w-1/2 h-full flex items-center justify-center bg-gray-50/50">
                                            <span className="font-display text-xs text-[#F472B6]">
                                                {order === "left-right" ? "2" : "1"}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col w-full h-full">
                                        <div className="w-full h-1/2 border-b-2 border-dashed border-[#F472B6] flex items-center justify-center bg-gray-50/50">
                                            <span className="font-display text-xs text-[#F472B6]">
                                                {order === "top-bottom" ? "1" : "2"}
                                            </span>
                                        </div>
                                        <div className="w-full h-1/2 flex items-center justify-center bg-gray-50/50">
                                            <span className="font-display text-xs text-[#F472B6]">
                                                {order === "top-bottom" ? "2" : "1"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                            {error}
                        </div>
                    )}

                    <RetroActionButton
                        label="Split Pages & Download"
                        isProcessing={isProcessing}
                        processingText="Splitting..."
                        onClick={handleSplit}
                        color="pink"
                        icon={<Download className="w-5 h-5" />}
                    />
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
