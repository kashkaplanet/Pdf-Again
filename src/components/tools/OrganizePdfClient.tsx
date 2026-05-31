"use client";

import React, { useState } from "react";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { organizePDF, PageOrder } from "@/core/pdf";
import { usePDF } from "@/hooks/usePDF";
import { PDFThumbnail } from "@/components/PDFThumbnail";
import { Download, RotateCw, RotateCcw, Trash2, MoveUp, MoveDown, RefreshCw, Loader2 } from "lucide-react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";

interface PageState {
    originalIndex: number;
    rotation: number;
}

export default function OrganizePdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const { pdfProxy, pageCount, loading } = usePDF(file);
    const [pages, setPages] = useState<PageState[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);



    useGlobalFileDrop({
        onFilesSelected: (files) => {
            if (files.length > 0) {
                setFile(files[0]);
                setError(null);
            }
        },
        accept: { "application/pdf": [".pdf"] },
    });

    const handleFileSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
        }
    };

    React.useEffect(() => {
        if (pageCount > 0) {
            setPages(Array.from({ length: pageCount }, (_, i) => ({
                originalIndex: i,
                rotation: 0,
            })));
        }
    }, [pageCount]);

    const rotatePage = (index: number, direction: 'cw' | 'ccw') => {
        setPages(prev => prev.map((p, i) => {
            if (i === index) {
                const delta = direction === 'cw' ? 90 : -90;
                return { ...p, rotation: (p.rotation + delta + 360) % 360 };
            }
            return p;
        }));
    };

    const rotateAll = (direction: 'cw' | 'ccw') => {
        const delta = direction === 'cw' ? 90 : -90;
        setPages(prev => prev.map(p => ({
            ...p,
            rotation: (p.rotation + delta + 360) % 360,
        })));
    };

    const removePage = (index: number) => {
        setPages(prev => prev.filter((_, i) => i !== index));
    };

    const movePage = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === pages.length - 1)) return;

        setPages(prev => {
            const newPages = [...prev];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            [newPages[index], newPages[targetIndex]] = [newPages[targetIndex], newPages[index]];
            return newPages;
        });
    };

    const handleSave = async () => {
        if (!file || pages.length === 0) return;

        setIsProcessing(true);
        setError(null);
        try {
            const pageOrders: PageOrder[] = pages.map(p => ({
                index: p.originalIndex,
                rotation: p.rotation,
            }));

            const blob = await organizePDF(file, pageOrders);

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `organized_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error("Failed to organize PDF:", err);
            setError("Failed to organize PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolPageWrapper
            title="Organize PDF"
            description="Rotate, reorder, or remove pages from your PDF."
            icon={RefreshCw}
            color="pink"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        accept={{ "application/pdf": [".pdf"] }}
                        title="Select PDF to Organize"
                        description="Drag & drop or click to browse"
                        variant="pink"
                    />
                </RetroCard>
            ) : (
                <RetroCard>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-[#F472B6] border-2 border-black">
                                <RefreshCw className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-display truncate max-w-[300px]">
                                    {file.name}
                                </h2>
                                <p className="text-sm text-gray-600 font-sans">
                                    {pages.length} pages remaining
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => rotateAll('ccw')}
                                className="p-2 border-2 border-black bg-white hover:bg-gray-100"
                                title="Rotate All Left"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => rotateAll('cw')}
                                className="p-2 border-2 border-black bg-white hover:bg-gray-100"
                                title="Rotate All Right"
                            >
                                <RotateCw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setFile(null)}
                                className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F87171] font-display text-sm"
                            >
                                Change File
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p className="text-gray-600 font-sans">Loading PDF pages...</p>
                        </div>
                    ) : (
                        <>
                            {pdfProxy && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
                                    {pages.map((pageState, idx) => (
                                        <div key={`${pageState.originalIndex}-${idx}`} className="relative group">
                                            <div
                                                style={{ transform: `rotate(${pageState.rotation}deg)` }}
                                                className="transition-transform duration-300 border-2 border-black"
                                            >
                                                <PDFThumbnail
                                                    pdfProxy={pdfProxy}
                                                    pageIndex={pageState.originalIndex}
                                                    width={150}
                                                    hidePageLabel={true}
                                                />
                                            </div>

                                            {/* Controls overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => movePage(idx, 'up')}
                                                    disabled={idx === 0}
                                                    className="p-1.5 bg-white rounded text-black hover:bg-gray-200 disabled:opacity-30"
                                                >
                                                    <MoveUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => movePage(idx, 'down')}
                                                    disabled={idx === pages.length - 1}
                                                    className="p-1.5 bg-white rounded text-black hover:bg-gray-200 disabled:opacity-30"
                                                >
                                                    <MoveDown className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => rotatePage(idx, 'ccw')}
                                                    className="p-1.5 bg-white rounded text-black hover:bg-gray-200"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => rotatePage(idx, 'cw')}
                                                    className="p-1.5 bg-white rounded text-black hover:bg-gray-200"
                                                >
                                                    <RotateCw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => removePage(idx)}
                                                    className="p-1.5 bg-[#F87171] rounded text-white hover:bg-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="text-center py-2 bg-white border-t-2 border-black text-sm font-display">
                                                Page {pageState.originalIndex + 1}
                                                {pageState.rotation !== 0 && (
                                                    <span className="text-[#F472B6] ml-1">({pageState.rotation}°)</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}



                            {error && (
                                <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-center">
                                <RetroActionButton
                                    label="Save Organized PDF"
                                    isProcessing={isProcessing}
                                    processingText="Processing..."
                                    onClick={handleSave}
                                    disabled={pages.length === 0}
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
