"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PDFDocument } from "pdf-lib";
import { Download, LayoutGrid, Loader2 } from "lucide-react";
import clsx from "clsx";

const PAGE_SIZES = {
    "A4": [595.28, 841.89],
    "Letter": [612, 792]
};

export default function NUpPdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [layout, setLayout] = useState<number>(2); // 2, 4, 6, 9
    const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
    const [paperSize, setPaperSize] = useState<keyof typeof PAGE_SIZES>("A4");
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const getGridDimensions = (n: number, isLandscape: boolean) => {
        if (n === 2) return isLandscape ? { cols: 2, rows: 1 } : { cols: 1, rows: 2 };
        if (n === 4) return { cols: 2, rows: 2 };
        if (n === 6) return isLandscape ? { cols: 3, rows: 2 } : { cols: 2, rows: 3 };
        if (n === 9) return { cols: 3, rows: 3 };
        return { cols: 1, rows: 1 };
    };

    const handleNUp = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const srcDoc = await PDFDocument.load(arrayBuffer);
            const newDoc = await PDFDocument.create();

            const srcPages = srcDoc.getPages();
            const embeddedPages = await newDoc.embedPages(srcPages);

            let [pageWidth, pageHeight] = PAGE_SIZES[paperSize];
            if (orientation === "landscape") {
                [pageWidth, pageHeight] = [pageHeight, pageWidth];
            }

            const { cols, rows } = getGridDimensions(layout, orientation === "landscape");
            const cellWidth = pageWidth / cols;
            const cellHeight = pageHeight / rows;

            let currentPageIndex = 0;

            while (currentPageIndex < embeddedPages.length) {
                const newPage = newDoc.addPage([pageWidth, pageHeight]);

                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        if (currentPageIndex >= embeddedPages.length) break;

                        const embeddedPage = embeddedPages[currentPageIndex];
                        const { width: srcW, height: srcH } = embeddedPage;

                        // Calculate scale to fit cell
                        const scaleX = cellWidth / srcW;
                        const scaleY = cellHeight / srcH;
                        // Use 0.95 scale factor to add a tiny margin between pages
                        const scale = Math.min(scaleX, scaleY) * 0.95; 

                        const scaledW = srcW * scale;
                        const scaledH = srcH * scale;

                        // Center in cell
                        const xOffset = (cellWidth - scaledW) / 2;
                        const yOffset = (cellHeight - scaledH) / 2;

                        const x = col * cellWidth + xOffset;
                        // y is from bottom up in pdf-lib
                        const y = pageHeight - ((row + 1) * cellHeight) + yOffset;

                        newPage.drawPage(embeddedPage, {
                            x, y,
                            width: scaledW,
                            height: scaledH,
                        });

                        currentPageIndex++;
                    }
                }
            }

            const pdfBytes = await newDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${layout}up_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Failed to process N-Up:", err);
            setError(err.message || "Failed to create N-Up PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolPageWrapper
            title="N-Up PDF (Grid Print)"
            description="Combine multiple PDF pages onto a single sheet of paper."
            icon={LayoutGrid}
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
                                <LayoutGrid className="w-6 h-6" />
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
                            <label className="block text-sm font-display mb-3">Pages per Sheet</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[2, 4, 6, 9].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setLayout(n)}
                                        className={clsx(
                                            "py-3 font-display border-2 transition-all",
                                            layout === n ? "bg-[#F472B6] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "border-gray-300 hover:border-black"
                                        )}
                                    >
                                        {n}-Up
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-display mb-3">Paper Size</label>
                            <div className="flex border-2 border-black">
                                <button
                                    onClick={() => setPaperSize("A4")}
                                    className={clsx(
                                        "flex-1 py-3 font-display transition-all",
                                        paperSize === "A4" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                    )}
                                >
                                    A4
                                </button>
                                <button
                                    onClick={() => setPaperSize("Letter")}
                                    className={clsx(
                                        "flex-1 py-3 font-display border-l-2 border-black transition-all",
                                        paperSize === "Letter" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                    )}
                                >
                                    Letter
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-display mb-3">Paper Orientation</label>
                            <div className="flex border-2 border-black w-full max-w-sm">
                                <button
                                    onClick={() => setOrientation("portrait")}
                                    className={clsx(
                                        "flex-1 py-3 font-display transition-all",
                                        orientation === "portrait" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                    )}
                                >
                                    Portrait
                                </button>
                                <button
                                    onClick={() => setOrientation("landscape")}
                                    className={clsx(
                                        "flex-1 py-3 font-display border-l-2 border-black transition-all",
                                        orientation === "landscape" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                    )}
                                >
                                    Landscape
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview Visualization */}
                    <div className="mb-8 flex justify-center">
                        <div 
                            className="border-2 border-black bg-white flex flex-wrap content-start p-1"
                            style={{ 
                                width: orientation === "portrait" ? '160px' : '226px',
                                height: orientation === "portrait" ? '226px' : '160px'
                            }}
                        >
                            {Array.from({ length: layout }).map((_, i) => {
                                const { cols, rows } = getGridDimensions(layout, orientation === "landscape");
                                return (
                                    <div 
                                        key={i} 
                                        className="border border-gray-300 bg-gray-100 m-[2px] flex items-center justify-center text-xs text-gray-400 font-display"
                                        style={{
                                            width: `calc(${100 / cols}% - 4px)`,
                                            height: `calc(${100 / rows}% - 4px)`
                                        }}
                                    >
                                        Pg {i+1}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                            {error}
                        </div>
                    )}

                    <RetroActionButton
                        label="Create N-Up PDF"
                        isProcessing={isProcessing}
                        processingText="Processing..."
                        onClick={handleNUp}
                        color="pink"
                        icon={<Download className="w-5 h-5" />}
                    />
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
