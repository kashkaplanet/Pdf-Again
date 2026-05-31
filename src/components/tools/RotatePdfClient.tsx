"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { usePDF } from "@/hooks/usePDF";
import { PDFThumbnail } from "@/components/PDFThumbnail";
import { PDFDocument, degrees } from "pdf-lib";
import { Download, RotateCcw, RotateCw, Loader2 } from "lucide-react";
import clsx from "clsx";
import { VirtuosoGrid } from "react-virtuoso";

export default function RotatePdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const { pdfProxy, pageCount, loading } = usePDF(file);
    const [rotations, setRotations] = useState<Record<number, number>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setRotations({});
            setError(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const rotatePageCW = (pageIndex: number) => {
        setRotations(prev => ({
            ...prev,
            [pageIndex]: ((prev[pageIndex] || 0) + 90) % 360
        }));
    };

    const rotatePageCCW = (pageIndex: number) => {
        setRotations(prev => ({
            ...prev,
            [pageIndex]: ((prev[pageIndex] || 0) - 90 + 360) % 360
        }));
    };

    const rotateAllCW = () => {
        const newRotations: Record<number, number> = {};
        for (let i = 0; i < pageCount; i++) {
            newRotations[i] = ((rotations[i] || 0) + 90) % 360;
        }
        setRotations(newRotations);
    };

    const rotateAllCCW = () => {
        const newRotations: Record<number, number> = {};
        for (let i = 0; i < pageCount; i++) {
            newRotations[i] = ((rotations[i] || 0) - 90 + 360) % 360;
        }
        setRotations(newRotations);
    };

    const handleSave = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();

            for (let i = 0; i < pages.length; i++) {
                const rotation = rotations[i] || 0;
                if (rotation !== 0) {
                    const page = pages[i];
                    const currentRotation = page.getRotation().angle;
                    page.setRotation(degrees(currentRotation + rotation));
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `rotated_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error("Failed to rotate PDF:", err);
            setError("Failed to rotate PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const hasRotations = Object.values(rotations).some(r => r !== 0);

    return (
        <ToolPageWrapper
            title="Rotate PDF"
            description="Rotate individual or all pages in your PDF."
            icon={RotateCcw}
            color="purple"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        title="Select PDF to Rotate"
                        description="Drag & drop or click to browse"
                        variant="purple"
                    />
                </RetroCard>
            ) : (
                <RetroCard>
                    {/* File Info & Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-display">{file.name}</h2>
                            <p className="text-sm text-gray-600 font-sans">{pageCount} pages</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={rotateAllCCW}
                                className="flex items-center px-4 py-2 bg-white border-2 border-black font-display text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Rotate All Left
                            </button>
                            <button
                                onClick={rotateAllCW}
                                className="flex items-center px-4 py-2 bg-white border-2 border-black font-display text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            >
                                <RotateCw className="w-4 h-4 mr-2" />
                                Rotate All Right
                            </button>
                            <button
                                onClick={() => setFile(null)}
                                className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F87171] font-display text-sm transition-colors"
                            >
                                Change File
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-[#A78BFA] animate-spin mb-4" />
                            <p className="text-gray-600 font-sans">Loading PDF pages...</p>
                        </div>
                    ) : (
                        <>
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
                                            <div key={i} className="flex flex-col items-center w-full">
                                                <div
                                                    style={{
                                                        transform: `rotate(${rotations[i] || 0}deg)`,
                                                        transition: 'transform 0.3s ease',
                                                    }}
                                                    className="border-2 border-black overflow-hidden"
                                                >
                                                    <PDFThumbnail
                                                        pdfProxy={pdfProxy}
                                                        pageIndex={i}
                                                        width={130}
                                                        hidePageLabel={true}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1 mt-2">
                                                    <button
                                                        onClick={() => rotatePageCCW(i)}
                                                        className="p-2 bg-white border-2 border-black hover:bg-[#A78BFA] transition-colors"
                                                        title="Rotate Left"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm font-display w-8 text-center">
                                                        {i + 1}
                                                    </span>
                                                    <button
                                                        onClick={() => rotatePageCW(i)}
                                                        className="p-2 bg-white border-2 border-black hover:bg-[#A78BFA] transition-colors"
                                                        title="Rotate Right"
                                                    >
                                                        <RotateCw className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            )}

                            <div className="flex justify-center flex-col items-center">
                                {error && (
                                    <div className="w-full max-w-md p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                                        {error}
                                    </div>
                                )}
                                <RetroActionButton
                                    label="Save & Download"
                                    isProcessing={isProcessing}
                                    processingText="Saving..."
                                    onClick={handleSave}
                                    disabled={!hasRotations}
                                    color="purple"
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
