"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PDFDocument, rgb } from "pdf-lib";
import { Download, Palette, Loader2 } from "lucide-react";

export default function ChangeBackgroundClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [color, setColor] = useState<string>("#FDE68A"); // Default soft yellow
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

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 1, g: 1, b: 1 };
    };

    const handleChangeBackground = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const srcDoc = await PDFDocument.load(arrayBuffer);
            const newDoc = await PDFDocument.create();

            const srcPages = srcDoc.getPages();
            const embeddedPages = await newDoc.embedPages(srcPages);

            const { r, g, b } = hexToRgb(color);
            const pdfColor = rgb(r, g, b);

            for (let i = 0; i < embeddedPages.length; i++) {
                const embeddedPage = embeddedPages[i];
                const { width, height } = embeddedPage;

                const newPage = newDoc.addPage([width, height]);
                
                // Draw background color first
                newPage.drawRectangle({
                    x: 0,
                    y: 0,
                    width,
                    height,
                    color: pdfColor,
                });

                // Draw original transparent page on top
                newPage.drawPage(embeddedPage, { x: 0, y: 0 });
            }

            const pdfBytes = await newDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `colored_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Failed to change background:", err);
            setError(err.message || "Failed to change background.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolPageWrapper
            title="Change Background Color"
            description="Add a solid color behind your PDF content. Great for reading transparent PDFs."
            icon={Palette}
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
                    <div className="flex items-center justify-between mb-8 p-4 bg-[#A78BFA]/20 border-2 border-black">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#A78BFA] border-2 border-black">
                                <Palette className="w-6 h-6" />
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

                    <div className="mb-8">
                        <label className="block text-sm font-display mb-3">Select Background Color</label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 border-2 border-black overflow-hidden">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer"
                                />
                            </div>
                            <input
                                type="text"
                                value={color.toUpperCase()}
                                onChange={(e) => setColor(e.target.value)}
                                className="px-4 py-3 border-2 border-black focus:ring-2 focus:ring-[#A78BFA] outline-none font-sans uppercase w-32"
                            />
                            
                            <div className="flex gap-2 ml-auto">
                                {["#FFFFFF", "#FDE68A", "#E2E8F0", "#1F2937"].map(preset => (
                                    <button
                                        key={preset}
                                        onClick={() => setColor(preset)}
                                        className="w-10 h-10 border-2 border-black transition-transform hover:scale-110"
                                        style={{ backgroundColor: preset }}
                                        title={`Use ${preset}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 p-6 border border-gray-300 font-sans text-sm" style={{ backgroundColor: color }}>
                        <div className={hexToRgb(color).r + hexToRgb(color).g + hexToRgb(color).b < 1.5 ? "text-white" : "text-black"}>
                            <h4 className="font-bold mb-2">Live Preview</h4>
                            <p>This is how your text might look against the selected background color.</p>
                            <p className="text-xs mt-2 opacity-80">
                                Note: If your original PDF already has a solid white background covering the page, this new color will be hidden behind it. This tool works best on PDFs with transparent backgrounds.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                            {error}
                        </div>
                    )}

                    <RetroActionButton
                        label="Apply Color & Download"
                        isProcessing={isProcessing}
                        processingText="Applying Background..."
                        onClick={handleChangeBackground}
                        color="purple"
                        icon={<Download className="w-5 h-5" />}
                    />
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
