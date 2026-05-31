"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PDFDocument } from "pdf-lib";
import { Download, Scaling, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function ScalePagesClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [scalePercentage, setScalePercentage] = useState(100);
    const [position, setPosition] = useState<"center" | "top-left" | "top-right" | "bottom-left" | "bottom-right">("center");
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setScalePercentage(100);
            setPosition("center");
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleScale = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();

            const scaleRatio = scalePercentage / 100;

            for (const page of pages) {
                const { width, height } = page.getSize();
                
                page.scaleContent(scaleRatio, scaleRatio);

                let offsetX = 0;
                let offsetY = 0;

                const contentWidth = width * scaleRatio;
                const contentHeight = height * scaleRatio;

                if (position === "center") {
                    offsetX = (width - contentWidth) / 2;
                    offsetY = (height - contentHeight) / 2;
                } else if (position === "top-left") {
                    offsetX = 0;
                    offsetY = height - contentHeight;
                } else if (position === "top-right") {
                    offsetX = width - contentWidth;
                    offsetY = height - contentHeight;
                } else if (position === "bottom-left") {
                    offsetX = 0;
                    offsetY = 0;
                } else if (position === "bottom-right") {
                    offsetX = width - contentWidth;
                    offsetY = 0;
                }

                // Adjust for scale because translateContent translates before scale
                page.translateContent(offsetX / scaleRatio, offsetY / scaleRatio);
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `scaled_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Failed to scale PDF:", err);
            setError(err.message || "Failed to scale PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolPageWrapper
            title="Scale Pages"
            description="Enlarge or shrink the content of your PDF pages while keeping the page size the same."
            icon={Scaling}
            color="purple"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        title="Select PDF"
                        description="Drag & drop or click to browse"
                        variant="purple"
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
                    <div className="flex items-center justify-between mb-8 p-4 bg-[#A78BFA]/10 border-2 border-black">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#A78BFA] border-2 border-black">
                                <Scaling className="w-6 h-6" />
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
                            <label className="block text-sm font-display mb-3">Scale Percentage</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="10"
                                    max="200"
                                    value={scalePercentage}
                                    onChange={(e) => setScalePercentage(parseInt(e.target.value))}
                                    className="flex-1 accent-[#A78BFA]"
                                />
                                <div className="w-16 text-center font-display border-2 border-black py-1">
                                    {scalePercentage}%
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-sans">
                                Values below 100% will shrink the content. Values above 100% will enlarge it.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-display mb-3">Alignment</label>
                            <div className="grid grid-cols-2 gap-2">
                                {["top-left", "top-right", "center", "bottom-left", "bottom-right"].map((pos) => (
                                    <button
                                        key={pos}
                                        onClick={() => setPosition(pos as any)}
                                        className={clsx(
                                            "py-2 px-3 text-xs font-display border-2 transition-all capitalize",
                                            position === pos ? "bg-[#A78BFA] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "border-gray-300 hover:border-black"
                                        )}
                                        style={{ gridColumn: pos === "center" ? "span 2" : "span 1" }}
                                    >
                                        {pos.replace("-", " ")}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview box */}
                    <div className="mb-8 flex justify-center">
                        <div className="w-48 h-64 border-2 border-black relative bg-gray-100 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-10 flex items-center justify-center p-4 text-center text-xs pointer-events-none">
                                Original Page Bounds
                            </div>
                            
                            <div 
                                className="bg-[#A78BFA]/30 border border-[#A78BFA] flex items-center justify-center text-xs font-display absolute transition-all"
                                style={{
                                    width: `${scalePercentage}%`,
                                    height: `${scalePercentage}%`,
                                    top: position.includes('top') ? '0' : position.includes('bottom') ? 'auto' : '50%',
                                    bottom: position.includes('bottom') ? '0' : 'auto',
                                    left: position.includes('left') ? '0' : position.includes('right') ? 'auto' : '50%',
                                    right: position.includes('right') ? '0' : 'auto',
                                    transform: position === 'center' ? 'translate(-50%, -50%)' : 
                                               position === 'top-left' ? 'none' :
                                               position === 'top-right' ? 'none' :
                                               position === 'bottom-left' ? 'none' : 'none'
                                }}
                            >
                                Scaled Content
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                            {error}
                        </div>
                    )}

                    <RetroActionButton
                        label="Scale & Download"
                        isProcessing={isProcessing}
                        processingText="Scaling..."
                        onClick={handleScale}
                        color="purple"
                        icon={<Download className="w-5 h-5" />}
                    />
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
