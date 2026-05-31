"use client";

import React, { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface PDFThumbnailProps {
    pdfProxy: PDFDocumentProxy;
    pageIndex: number; // 0-based
    selected?: boolean;
    onToggle?: () => void;
    width?: number;
    hidePageLabel?: boolean;
}

export function PDFThumbnail({
    pdfProxy,
    pageIndex,
    selected,
    onToggle,
    width = 200,
    hidePageLabel = false,
}: PDFThumbnailProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rendering, setRendering] = useState(true);

    const renderTaskRef = useRef<any>(null);

    useEffect(() => {
        let isActive = true;

        const renderPage = async () => {
            if (!pdfProxy || !canvasRef.current) return;

            // Cancel any pending render task from previous runs
            if (renderTaskRef.current) {
                try {
                    renderTaskRef.current.cancel();
                } catch {
                    // Ignore cancel error
                }
            }

            try {
                const page = await pdfProxy.getPage(pageIndex + 1); // PDF.js uses 1-based index

                if (!isActive) return;

                const viewport = page.getViewport({ scale: 1 });
                const baseScale = width / viewport.width;
                const pixelRatio = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
                const scaledViewport = page.getViewport({ scale: baseScale * pixelRatio });

                const canvas = canvasRef.current;
                if (!canvas) return; // double check ref
                const context = canvas.getContext("2d");

                if (!context) return;

                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport,
                };

                // If a new task managed to start on this canvas while we were awaiting, cancel it? 
                // Actually, due to the single-threaded nature and the check above, we should be mostly fine,
                // but PDF.js might throw if we don't ensure the previous ONE is really gone.
                // The cleanup function handles the cancellation, so we just need to ensure *we* don't start
                // if we are cancelled.

                const renderTask = page.render(renderContext as any);
                renderTaskRef.current = renderTask;

                await renderTask.promise;
                if (isActive) {
                    renderTaskRef.current = null;
                }
            } catch (error: any) {
                if (error.name !== 'RenderingCancelledException') {
                    console.error("Error rendering page:", error);
                }
            } finally {
                if (isActive) {
                    setRendering(false);
                }
            }
        };

        renderPage();

        return () => {
            isActive = false;
            if (renderTaskRef.current) {
                try {
                    renderTaskRef.current.cancel();
                } catch {
                    // Ignore
                }
            }
        };
    }, [pdfProxy, pageIndex, width]);

    return (
        <div
            onClick={onToggle}
            className="relative group cursor-pointer transition-all duration-200 w-full"
        >
            <div
                className="overflow-hidden transition-colors w-full border-transparent"
            >
                <canvas ref={canvasRef} className="block bg-white/5 w-full h-auto" />
                {rendering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                    </div>
                )}
            </div>

            {selected !== undefined && (
                <div className={clsx(
                    "absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm",
                    selected ? "bg-[#F472B6] border-[#F472B6]" : "bg-white border-gray-300 group-hover:border-[#F472B6]"
                )}>
                    {selected && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
            )}

            {!hidePageLabel && (
                <div className="text-center mt-2 text-sm font-medium text-zinc-300">
                    Page {pageIndex + 1}
                </div>
            )}
        </div>
    );
}
