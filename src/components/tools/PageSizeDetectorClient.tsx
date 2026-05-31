"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Scaling, ArrowRight, AlertTriangle, FileSearch } from "lucide-react";
import { RetroVariant } from "@/config/design";
import { PDFDocument } from 'pdf-lib';

interface PageDimensions {
    page: number;
    width: number;
    height: number;
    name: string;
    orientation: string;
}

export default function PageSizeDetectorClient({
    title = "Page Size Detector",
    description = "Analyze your PDF to find the dimensions of every page.",
    variant = "lime" as RetroVariant,
}) {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pageSizes, setPageSizes] = useState<PageDimensions[] | null>(null);

    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setPageSizes(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFilesSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleRemoveFile = () => {
        setFile(null);
        setPageSizes(null);
        setError(null);
    };

    const determinePaperSize = (width: number, height: number): string => {
        // Convert to points to mm approx (1 pt = 0.352778 mm)
        const w_mm = Math.round(width * 0.352778);
        const h_mm = Math.round(height * 0.352778);
        
        const min = Math.min(w_mm, h_mm);
        const max = Math.max(w_mm, h_mm);

        if (Math.abs(min - 210) < 5 && Math.abs(max - 297) < 5) return "A4";
        if (Math.abs(min - 148) < 5 && Math.abs(max - 210) < 5) return "A5";
        if (Math.abs(min - 297) < 5 && Math.abs(max - 420) < 5) return "A3";
        if (Math.abs(min - 216) < 5 && Math.abs(max - 279) < 5) return "Letter";
        if (Math.abs(min - 216) < 5 && Math.abs(max - 356) < 5) return "Legal";
        
        return "Custom";
    };

    const handleConvert = async () => {
        if (!file) return;

        setIsConverting(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            
            const sizes: PageDimensions[] = pages.map((page, index) => {
                const { width, height } = page.getSize();
                return {
                    page: index + 1,
                    width: Math.round(width),
                    height: Math.round(height),
                    name: determinePaperSize(width, height),
                    orientation: width > height ? "Landscape" : "Portrait"
                };
            });
            
            setPageSizes(sizes);

        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <ToolPageWrapper
            title={title}
            description={description}
            icon={Scaling}
            color={variant}
        >
            {!file ? (
                <RetroCard variant="default">
                    <RetroFileUploader
                        onFilesSelected={handleFilesSelected}
                        accept={{ "application/pdf": [".pdf"] }}
                        multiple={false}
                        title="Upload PDF"
                        description="Select a .pdf file to analyze sizes"
                        variant={variant}
                    />
                </RetroCard>
            ) : (
                <RetroCard variant="default">
                    <div className="mb-8">
                        <RetroFileItem
                            name={file.name}
                            size={(file.size / 1024).toFixed(1) + " KB"}
                            index={0}
                            onRemove={handleRemoveFile}
                            color={variant}
                        />
                    </div>
                    
                    {pageSizes && (
                        <div className="mb-8 border-2 border-black bg-white overflow-hidden">
                            <div className="bg-gray-100 p-3 border-b-2 border-black flex items-center gap-2 font-display font-bold">
                                <FileSearch className="w-5 h-5" /> Results
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b-2 border-black font-display text-sm">
                                            <th className="p-2 border-r-2 border-black">Page</th>
                                            <th className="p-2 border-r-2 border-black">Size (pts)</th>
                                            <th className="p-2 border-r-2 border-black">Format</th>
                                            <th className="p-2">Orientation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageSizes.map((ps, idx) => (
                                            <tr key={idx} className="border-b border-gray-200 font-display text-sm hover:bg-gray-50">
                                                <td className="p-2 border-r-2 border-black">{ps.page}</td>
                                                <td className="p-2 border-r-2 border-black">{ps.width} × {ps.height}</td>
                                                <td className="p-2 border-r-2 border-black font-bold">{ps.name}</td>
                                                <td className="p-2">{ps.orientation}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 border-2 border-black bg-red-100 text-red-800 font-display flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <div className="mt-8 flex gap-4">
                        {pageSizes ? (
                            <RetroActionButton
                                label="Analyze Another File"
                                isProcessing={false}
                                processingText=""
                                onClick={handleRemoveFile}
                                color="default"
                                icon={<ArrowRight className="w-5 h-5" />}
                            />
                        ) : (
                            <RetroActionButton
                                label="Detect Page Sizes"
                                isProcessing={isConverting}
                                processingText="Analyzing..."
                                onClick={handleConvert}
                                disabled={!file}
                                color={variant}
                                icon={<ArrowRight className="w-5 h-5" />}
                            />
                        )}
                    </div>
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
