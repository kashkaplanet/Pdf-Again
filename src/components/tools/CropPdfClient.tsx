"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PDFDocument } from "pdf-lib";
import { Download, Crop } from "lucide-react";

interface CropValues {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export default function CropPdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cropValues, setCropValues] = useState<CropValues>({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    });
    const [unit, setUnit] = useState<"pt" | "mm" | "in">("mm");
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
        return value; // pt
    };

    const handleCrop = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();

            const topPt = toPoints(cropValues.top);
            const bottomPt = toPoints(cropValues.bottom);
            const leftPt = toPoints(cropValues.left);
            const rightPt = toPoints(cropValues.right);

            for (const page of pages) {
                const { width, height } = page.getSize();
                const mediaBox = page.getMediaBox();

                const newX = mediaBox.x + leftPt;
                const newY = mediaBox.y + bottomPt;
                const newWidth = width - leftPt - rightPt;
                const newHeight = height - topPt - bottomPt;

                if (newWidth <= 0 || newHeight <= 0) {
                    throw new Error("Crop values are too large for the page size. Please reduce the values.");
                }

                page.setCropBox(newX, newY, newWidth, newHeight);
                page.setTrimBox(newX, newY, newWidth, newHeight);
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `cropped_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Failed to crop PDF:", err);
            setError(err.message || "Failed to crop PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const updateCrop = (field: keyof CropValues, value: string) => {
        const num = parseFloat(value);
        setCropValues((prev) => ({
            ...prev,
            [field]: isNaN(num) ? 0 : Math.max(0, num),
        }));
    };

    return (
        <ToolPageWrapper
            title="Crop PDF"
            description="Trim the edges of your PDF pages by setting custom crop margins."
            icon={Crop}
            color="purple"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        title="Select PDF to Crop"
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
                                <Crop className="w-6 h-6" />
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

                    {/* Crop Values */}
                    <div className="mb-8">
                        <label className="block text-sm font-display mb-4">
                            Crop Amount (how much to trim from each edge)
                        </label>

                        {/* Visual crop preview */}
                        <div className="relative w-full max-w-sm mx-auto mb-6">
                            <div className="aspect-[3/4] border-2 border-dashed border-gray-400 bg-gray-50 relative">
                                {/* Crop overlay indicators */}
                                <div
                                    className="absolute top-0 left-0 right-0 bg-[#A78BFA]/20 border-b-2 border-[#A78BFA] flex items-center justify-center text-xs font-display"
                                    style={{ height: `${Math.min(40, Math.max(8, cropValues.top * 2))}%` }}
                                >
                                    {cropValues.top > 0 && `${cropValues.top}${unit}`}
                                </div>
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-[#A78BFA]/20 border-t-2 border-[#A78BFA] flex items-center justify-center text-xs font-display"
                                    style={{ height: `${Math.min(40, Math.max(8, cropValues.bottom * 2))}%` }}
                                >
                                    {cropValues.bottom > 0 && `${cropValues.bottom}${unit}`}
                                </div>
                                <div
                                    className="absolute top-0 bottom-0 left-0 bg-[#A78BFA]/20 border-r-2 border-[#A78BFA] flex items-center justify-center text-xs font-display writing-mode-vertical"
                                    style={{ width: `${Math.min(40, Math.max(8, cropValues.left * 2))}%` }}
                                >
                                    {cropValues.left > 0 && `${cropValues.left}${unit}`}
                                </div>
                                <div
                                    className="absolute top-0 bottom-0 right-0 bg-[#A78BFA]/20 border-l-2 border-[#A78BFA] flex items-center justify-center text-xs font-display writing-mode-vertical"
                                    style={{ width: `${Math.min(40, Math.max(8, cropValues.right * 2))}%` }}
                                >
                                    {cropValues.right > 0 && `${cropValues.right}${unit}`}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 font-sans">
                                    Page Content
                                </div>
                            </div>
                        </div>

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
                                            value={cropValues[side]}
                                            onChange={(e) => updateCrop(side, e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-[#A78BFA] outline-none font-sans pr-12"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-sans">
                                            {unit}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                            {error}
                        </div>
                    )}

                    <RetroActionButton
                        label="Crop & Download"
                        isProcessing={isProcessing}
                        processingText="Cropping PDF..."
                        onClick={handleCrop}
                        color="purple"
                        icon={<Download className="w-5 h-5" />}
                    />
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
