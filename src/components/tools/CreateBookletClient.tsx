"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PDFDocument } from "pdf-lib";
import { Download, BookOpen, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function CreateBookletClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [binding, setBinding] = useState<"left" | "right">("left");
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setIsLoading(true);
            try {
                const arrayBuffer = await files[0].arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                setTotalPages(pdfDoc.getPageCount());
            } catch (err) {
                console.error("Failed to read PDF:", err);
                setError("Failed to read PDF.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleCreateBooklet = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const srcDoc = await PDFDocument.load(arrayBuffer);
            const newDoc = await PDFDocument.create();

            let srcPages = srcDoc.getPages();
            
            // For a booklet, total pages must be a multiple of 4
            const originalCount = srcPages.length;
            const remainder = originalCount % 4;
            const pagesToAdd = remainder === 0 ? 0 : 4 - remainder;
            
            const p = originalCount + pagesToAdd;

            // We need to know the dimensions of the first page to create blanks
            let baseWidth = 595.28; // A4 default
            let baseHeight = 841.89;
            if (srcPages.length > 0) {
                const size = srcPages[0].getSize();
                baseWidth = size.width;
                baseHeight = size.height;
            }

            // Embed original pages
            const embeddedPages = await newDoc.embedPages(srcPages);
            
            // Array of all pages, including nulls for blanks
            const allPages = [];
            for (let i = 0; i < p; i++) {
                if (i < originalCount) {
                    allPages.push(embeddedPages[i]);
                } else {
                    allPages.push(null); // Represents a blank page
                }
            }

            // Create saddle-stitch spreads
            const numSpreads = p / 2;

            for (let i = 1; i <= numSpreads; i++) {
                let leftIdx, rightIdx;

                if (i % 2 !== 0) {
                    // Front of sheet
                    leftIdx = p - i + 1;
                    rightIdx = i;
                } else {
                    // Back of sheet
                    leftIdx = i;
                    rightIdx = p - i + 1;
                }

                // Adjust for Right-to-Left binding (Arabic/Hebrew/Japanese)
                if (binding === "right") {
                    const temp = leftIdx;
                    leftIdx = rightIdx;
                    rightIdx = temp;
                }

                // Create the spread page (2x width)
                const spreadPage = newDoc.addPage([baseWidth * 2, baseHeight]);

                // 1-indexed to 0-indexed
                const leftPage = allPages[leftIdx - 1];
                const rightPage = allPages[rightIdx - 1];

                if (leftPage) {
                    spreadPage.drawPage(leftPage, { x: 0, y: 0 });
                }
                if (rightPage) {
                    spreadPage.drawPage(rightPage, { x: baseWidth, y: 0 });
                }
            }

            const pdfBytes = await newDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `booklet_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Failed to create booklet:", err);
            setError(err.message || "Failed to create booklet.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolPageWrapper
            title="Create Booklet"
            description="Arrange pages side-by-side into printer spreads (saddle-stitch layout) for booklet printing."
            icon={BookOpen}
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
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-display truncate max-w-[200px] sm:max-w-md">
                                    {file.name}
                                </h2>
                                <p className="text-sm text-gray-600 font-sans">
                                    {totalPages} pages • {(file.size / 1024 / 1024).toFixed(2)} MB
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
                        <label className="block text-sm font-display mb-3">Binding Direction</label>
                        <div className="flex border-2 border-black w-full max-w-md">
                            <button
                                onClick={() => setBinding("left")}
                                className={clsx(
                                    "flex-1 py-3 px-4 font-display transition-all",
                                    binding === "left" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                )}
                            >
                                Left Binding (Standard)
                            </button>
                            <button
                                onClick={() => setBinding("right")}
                                className={clsx(
                                    "flex-1 py-3 px-4 font-display border-l-2 border-black transition-all",
                                    binding === "right" ? "bg-[#F472B6]" : "bg-white hover:bg-gray-100"
                                )}
                            >
                                Right Binding (Arabic/Hebrew)
                            </button>
                        </div>
                    </div>

                    <div className="mb-8 p-6 bg-gray-50 border border-gray-300 font-sans text-sm">
                        <h4 className="font-bold mb-2">How it works:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>We will arrange your {totalPages} pages into a saddle-stitch layout.</li>
                            <li>Your final booklet will have exactly <strong>{Math.ceil(totalPages / 4) * 4}</strong> pages (blank pages are automatically added to the end if necessary).</li>
                            <li>When printing the downloaded file, make sure to print <strong>Double-Sided (Flip on Short Edge)</strong>.</li>
                        </ul>
                    </div>

                    {error && (
                        <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                            {error}
                        </div>
                    )}

                    <RetroActionButton
                        label="Create Booklet Spreads"
                        isProcessing={isProcessing}
                        processingText="Arranging Pages..."
                        onClick={handleCreateBooklet}
                        color="pink"
                        icon={<Download className="w-5 h-5" />}
                    />
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
