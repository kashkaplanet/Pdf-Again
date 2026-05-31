"use client";

import React, { useState, useRef, useEffect } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";

import { usePDF } from "@/hooks/usePDF";
// import * as pdfjsLib from "pdfjs-dist";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Eye, Plus, X, FileText } from "lucide-react";

// if (typeof window !== "undefined") {
//    pdfjsLib.GlobalWorkerOptions.workerSrc = `/workers/pdf.worker.min.mjs`;
// }

export default function ViewPdfClient() {
    const [files, setFiles] = useState<File[]>([]);
    const [activeFileIndex, setActiveFileIndex] = useState<number>(0);


    const activeFile = files[activeFileIndex] || null;
    const { pdfProxy, pageCount, loading, error } = usePDF(activeFile);

    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState<number | null>(null);
    const [autoFitDone, setAutoFitDone] = useState(false);


    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const renderTaskRef = useRef<any>(null);

    const handleFilesSelected = async (newFiles: File[]) => {
        if (newFiles.length > 0) {
            setFiles(prev => {
                const updated = [...prev, ...newFiles];
                if (prev.length === 0) {
                    setActiveFileIndex(0);
                    setCurrentPage(1);
                    setScale(null);
                    setAutoFitDone(false);
                }
                return updated;
            });
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFilesSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const removeFile = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);

        if (index === activeFileIndex) {
            setActiveFileIndex(0);
        } else if (index < activeFileIndex) {
            setActiveFileIndex(activeFileIndex - 1);
        }
    };

    // Auto-fit: calculate scale to fit container width on first load
    useEffect(() => {
        if (!pdfProxy || autoFitDone || scale !== null) return;

        const fitToContainer = async () => {
            try {
                const page = await pdfProxy.getPage(1);
                const defaultViewport = page.getViewport({ scale: 1 });
                const container = containerRef.current;
                const containerWidth = container ? container.clientWidth - 48 : 800; // 48px = padding
                const fitScale = Math.min(containerWidth / defaultViewport.width, 2);
                setScale(Math.round(fitScale * 100) / 100); // round to 2 decimals
                setAutoFitDone(true);
            } catch (err) {
                setScale(1.0);
                setAutoFitDone(true);
            }
        };

        fitToContainer();
    }, [pdfProxy, autoFitDone, scale]);

    useEffect(() => {
        let isActive = true;

        if (!pdfProxy || !canvasRef.current || scale === null) return;

        const renderPage = async () => {
            if (renderTaskRef.current) {
                try {
                    renderTaskRef.current.cancel();
                } catch { }
            }

            try {
                const page = await pdfProxy.getPage(currentPage);

                if (!isActive) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext("2d");
                if (!context) return;

                const viewport = page.getViewport({ scale });

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const renderContext = {
                    canvasContext: context,
                    viewport,
                };

                if (renderTaskRef.current) {
                    try {
                        renderTaskRef.current.cancel();
                    } catch { }
                }

                const renderTask = page.render(renderContext);
                renderTaskRef.current = renderTask;

                await renderTask.promise;
                if (isActive) {
                    renderTaskRef.current = null;
                }
            } catch (error: unknown) {
                const isCancelled = error instanceof Object && (error as any).name === 'RenderingCancelledException';
                if (!isCancelled) {
                    console.error("Render error:", error);
                }
            }
        };

        renderPage();

        return () => {
            isActive = false;
            if (renderTaskRef.current) {
                try {
                    renderTaskRef.current.cancel();
                } catch { }
            }
        };
    }, [pdfProxy, currentPage, scale]);



    return (
        <ToolPageWrapper
            title="PDF Viewer"
            description="View and preview PDF documents directly in your browser."
            icon={Eye}
            color="lime"
        >
            {/* File Tabs */}
            {files.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {files.map((file, idx) => (
                        <div
                            key={idx}
                            onClick={() => { setActiveFileIndex(idx); setCurrentPage(1); }}
                            className={`group flex items-center gap-2 px-3 py-1.5 cursor-pointer border-2 border-black text-sm font-display transition-all duration-150 ${idx === activeFileIndex
                                ? "bg-[#A3E635] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                                : "bg-white hover:bg-gray-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                }`}
                        >
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[180px]">{file.name}</span>
                            <button
                                onClick={(e) => removeFile(idx, e)}
                                className="p-0.5 hover:bg-black/10 rounded opacity-50 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}

                    {/* Add File Button */}
                    <label className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer border-2 border-dashed border-black/40 hover:border-black bg-white hover:bg-[#A3E635]/20 text-sm font-display transition-all duration-150">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add PDF</span>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                                if (e.target.files?.length) {
                                    handleFilesSelected(Array.from(e.target.files));
                                }
                            }}
                            className="hidden"
                            multiple
                        />
                    </label>
                </div>
            )}

            {!activeFile ? (
                <RetroCard variant="default">
                    <RetroFileUploader
                        onFilesSelected={handleFilesSelected}
                        multiple={true}
                        accept={{ "application/pdf": [".pdf"] }}
                        title="Select PDF Files"
                        description="Drag & drop or click to browse"
                        variant="lime"
                    />
                </RetroCard>
            ) : (
                <>
                    {/* Toolbar */}
                    <div className="sticky top-20 z-10 mb-4">
                        <div className="bg-white border-2 border-black p-2 flex items-center justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] gap-3">
                            {/* Page Navigation */}
                            <div className="flex items-center gap-0.5 border-2 border-black bg-gray-50">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 hover:bg-[#A3E635]/40 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center px-1 border-x-2 border-black bg-white">
                                    <input
                                        type="number"
                                        min={1}
                                        max={pageCount}
                                        value={currentPage}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (val >= 1 && val <= pageCount) {
                                                setCurrentPage(val);
                                            }
                                        }}
                                        className="w-10 py-1 text-center bg-transparent font-display text-sm focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none m-0"
                                    />
                                    <span className="text-gray-400 text-xs font-display">/ {pageCount}</span>
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                                    disabled={currentPage >= pageCount}
                                    className="p-1.5 hover:bg-[#A3E635]/40 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* File Name (center) */}
                            <span className="hidden sm:block text-xs font-display text-gray-500 truncate max-w-[200px]">
                                {activeFile.name}
                            </span>

                            {/* Zoom Controls */}
                            <div className="flex items-center gap-0.5 border-2 border-black bg-gray-50">
                                <button
                                    onClick={() => setScale(s => Math.max(0.5, (s ?? 1) - 0.25))}
                                    disabled={(scale ?? 1) <= 0.5}
                                    className="p-1.5 hover:bg-[#A3E635]/40 disabled:opacity-30 transition-colors"
                                >
                                    <ZoomOut className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-display w-12 text-center select-none border-x-2 border-black bg-white py-1.5">
                                    {Math.round((scale ?? 1) * 100)}%
                                </span>
                                <button
                                    onClick={() => setScale(s => Math.min(3, (s ?? 1) + 0.25))}
                                    disabled={(scale ?? 1) >= 3}
                                    className="p-1.5 hover:bg-[#A3E635]/40 disabled:opacity-30 transition-colors"
                                >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Canvas Container */}
                    <div
                        ref={containerRef}
                        className="relative flex justify-center overflow-auto bg-gray-50 border-2 border-black p-6 min-h-[500px] mb-6"
                    >
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#A3E635]" />
                                    <span className="text-sm font-display text-gray-500">Loading PDF...</span>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
                                <div className="bg-white border-2 border-red-500 p-4 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] flex flex-col items-center gap-2">
                                    <span className="text-red-500 font-display font-bold">Failed to load PDF</span>
                                    <span className="text-xs text-gray-600 font-sans">{error}</span>
                                </div>
                            </div>
                        )}
                        <canvas
                            ref={canvasRef}
                            className={`shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] border border-gray-200 bg-white ${loading || error ? 'invisible' : ''}`}
                        />
                    </div>
                </>
            )}

        </ToolPageWrapper>
    );
}
