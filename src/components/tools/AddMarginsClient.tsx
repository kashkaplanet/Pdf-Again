"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PDFDocument } from "pdf-lib";
import { Download, Expand } from "lucide-react";

interface MarginValues {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export default function AddMarginsClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [margins, setMargins] = useState<MarginValues>({
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
    });
    const [unit, setUnit] = useState<"pt" | "mm" | "in">("mm");
    const [uniformMode, setUniformMode] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const toPoints = (value: number): number => {
        if (unit === "mm") return value * 2.83465;
        if (unit === "in") return value * 72;
        return value;
    };

    const handleAddMargins = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const srcDoc = await PDFDocument.load(arrayBuffer);
            const newDoc = await PDFDocument.create();

            const topPt = toPoints(margins.top);
            const bottomPt = toPoints(margins.bottom);
            const leftPt = toPoints(margins.left);
            const rightPt = toPoints(margins.right);

            const srcPages = srcDoc.getPages();

            for (let i = 0; i < srcPages.length; i++) {
                const srcPage = srcPages[i];
                const { width, height } = srcPage.getSize();

                const newWidth = width + leftPt + rightPt;
                const newHeight = height + topPt + bottomPt;

                // Embed the original page
                const [embeddedPage] = await newDoc.embedPages([srcPage]);

                // Create a new larger page
                const newPage = newDoc.addPage([newWidth, newHeight]);

                // Draw the original page content offset by the left and bottom margins
                newPage.drawPage(embeddedPage, {
                    x: leftPt,
                    y: bottomPt,
                    width: width,
                    height: height,
                });
            }

            const pdfBytes = await newDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `margins_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Failed to add margins:", err);
            setError(err.message || "Failed to add margins to PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const updateMargin = (field: keyof MarginValues, value: string) => {
        const num = parseFloat(value);
        const val = isNaN(num) ? 0 : Math.max(0, num);

        if (uniformMode) {
            setMargins({ top: val, bottom: val, left: val, right: val });
        } else {
            setMargins((prev) => ({ ...prev, [field]: val }));
        }
    };

    return (
        <ToolPageWrapper
            title="Add Margins"
            description="Add white space margins around your PDF pages for printing or binding."
            icon={Expand}
            color="purple"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        title="Select PDF to Add Margins"
                        description="Drag & drop or click to browse"
                        variant="purple"
                    />
                </RetroCard>
            ) : (
                <RetroCard className="max-w-3xl mx-auto">
                    {/* File Info */}
                    <div className="flex items-center justify-between mb-8 p-4 bg-[#A78BFA]/10 border-2 border-black">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#A78BFA] border-2 border-black">
                                <Expand className="w-6 h-6" />
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

                    {/* Mode Toggle */}
                    <div className="mb-6">
                        <label className="block text-sm font-display mb-3">
                            Margin Mode
                        </label>
                        <div className="flex border-2 border-black">
                            <button
                                onClick={() => {
                                    setUniformMode(true);
                                    const max = Math.max(margins.top, margins.bottom, margins.left, margins.right);
                                    setMargins({ top: max, bottom: max, left: max, right: max });
                                }}
                                className={`flex-1 py-3 px-4 font-display transition-all ${uniformMode ? "bg-[#A78BFA]" : "bg-white hover:bg-gray-100"
                                    }`}
                            >
                                Uniform
                            </button>
                            <button
                                onClick={() => setUniformMode(false)}
                                className={`flex-1 py-3 px-4 font-display border-l-2 border-black transition-all ${!uniformMode ? "bg-[#A78BFA]" : "bg-white hover:bg-gray-100"
                                    }`}
                            >
                                Custom Per Side
                            </button>
                        </div>
                    </div>

                    {/* Unit Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-display mb-3">
                            Measurement Unit
                        </label>
                        <div className="flex border-2 border-black">
                            {(["mm", "in", "pt"] as const).map((u) => (
                                <button
                                    key={u}
                                    onClick={() => setUnit(u)}
                                    className={`flex-1 py-3 px-4 font-display transition-all ${u !== "mm" ? "border-l-2 border-black" : ""
                                        } ${unit === u
                                            ? "bg-[#A78BFA]"
                                            : "bg-white hover:bg-gray-100"
                                        }`}
                                >
                                    {u === "mm" ? "Millimeters" : u === "in" ? "Inches" : "Points"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Margin Values */}
                    <div className="mb-8">
                        <label className="block text-sm font-display mb-4">
                            Margin Size
                        </label>

                        {/* Visual margin preview */}
                        <div className="relative w-full max-w-sm mx-auto mb-6">
                            <div className="aspect-[3/4] border-2 border-black bg-white relative">
                                <div
                                    className="absolute bg-[#A78BFA]/15 border-2 border-dashed border-[#A78BFA] flex items-center justify-center text-xs text-gray-500 font-sans"
                                    style={{
                                        top: `${Math.min(30, Math.max(5, margins.top))}%`,
                                        bottom: `${Math.min(30, Math.max(5, margins.bottom))}%`,
                                        left: `${Math.min(30, Math.max(5, margins.left))}%`,
                                        right: `${Math.min(30, Math.max(5, margins.right))}%`,
                                    }}
                                >
                                    Original Page
                                </div>
                                {/* Margin labels */}
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-display text-[#7C3AED]">
                                    {margins.top}{unit}
                                </div>
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-display text-[#7C3AED]">
                                    {margins.bottom}{unit}
                                </div>
                                <div className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-display text-[#7C3AED]">
                                    {margins.left}
                                </div>
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-display text-[#7C3AED]">
                                    {margins.right}
                                </div>
                            </div>
                        </div>

                        {uniformMode ? (
                            <div>
                                <label className="block text-xs font-display mb-1.5 uppercase">
                                    All sides
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step={unit === "in" ? "0.1" : "1"}
                                        value={margins.top}
                                        onChange={(e) => updateMargin("top", e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-[#A78BFA] outline-none font-sans pr-12"
                                        placeholder="20"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-sans">
                                        {unit}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {(["top", "bottom", "left", "right"] as const).map((side) => (
                                    <div key={side}>
                                        <label className="block text-xs font-display mb-1.5 uppercase">
                                            {side}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                step={unit === "in" ? "0.1" : "1"}
                                                value={margins[side]}
                                                onChange={(e) => updateMargin(side, e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-[#A78BFA] outline-none font-sans pr-12"
                                                placeholder="20"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-sans">
                                                {unit}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                            {error}
                        </div>
                    )}

                    <RetroActionButton
                        label="Add Margins & Download"
                        isProcessing={isProcessing}
                        processingText="Adding Margins..."
                        onClick={handleAddMargins}
                        color="purple"
                        icon={<Download className="w-5 h-5" />}
                    />
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
