"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Download, FileText } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export default function TxtToPdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "text/plain": [".txt"] },
    });

    const handleConvert = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            const text = await file.text();
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Courier);
            const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);

            const fontSize = 10;
            const lineHeight = 14;
            const margin = 50;
            const pageWidth = 612;
            const pageHeight = 792;
            const maxLineWidth = pageWidth - margin * 2;

            // Word-wrap text into lines
            const rawLines = text.replace(/\r\n/g, '\n').split('\n');
            const wrappedLines: string[] = [];

            for (const rawLine of rawLines) {
                if (rawLine.length === 0) {
                    wrappedLines.push('');
                    continue;
                }
                const words = rawLine.split(' ');
                let currentLine = '';
                for (const word of words) {
                    const testLine = currentLine ? currentLine + ' ' + word : word;
                    const textWidth = font.widthOfTextAtSize(testLine, fontSize);
                    if (textWidth > maxLineWidth && currentLine) {
                        wrappedLines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                }
                if (currentLine) wrappedLines.push(currentLine);
            }

            // Add title
            const linesPerPage = Math.floor((pageHeight - margin * 2 - 30) / lineHeight);
            let page = pdfDoc.addPage([pageWidth, pageHeight]);
            let y = pageHeight - margin;

            page.drawText(file.name, {
                x: margin,
                y,
                size: 14,
                font: boldFont,
                color: rgb(0.2, 0.2, 0.2),
            });
            y -= 30;

            let lineCount = 0;
            for (const line of wrappedLines) {
                if (lineCount >= linesPerPage || y < margin) {
                    page = pdfDoc.addPage([pageWidth, pageHeight]);
                    y = pageHeight - margin;
                    lineCount = 0;
                }

                page.drawText(line, {
                    x: margin,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(0.1, 0.1, 0.1),
                    maxWidth: maxLineWidth,
                });

                y -= lineHeight;
                lineCount++;
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = file.name.replace(/\.txt$/i, ".pdf");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Conversion failed:", err);
            setError("Failed to convert TXT to PDF. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolPageWrapper
            title="TXT to PDF"
            description="Convert plain text files to PDF documents."
            icon={FileText}
            color="cyan"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        accept={{ "text/plain": [".txt"] }}
                        multiple={false}
                        title="Select Text File"
                        description="Upload a .txt file to convert"
                        variant="cyan"
                    />
                </RetroCard>
            ) : (
                <RetroCard>
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 p-4 bg-[#22D3EE]/10 border-2 border-black">
                            <div className="p-3 bg-[#22D3EE] border-2 border-black">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-display truncate">
                                    {file.name}
                                </h2>
                                <p className="text-sm text-gray-600 font-sans">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F87171] font-display text-sm transition-colors"
                            >
                                Change
                            </button>
                        </div>

                        {error && (
                            <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans">
                                {error}
                            </div>
                        )}

                        <RetroActionButton
                            label="Convert to PDF"
                            isProcessing={isProcessing}
                            processingText="Converting..."
                            onClick={handleConvert}
                            color="cyan"
                            icon={<Download className="w-5 h-5" />}
                        />
                    </div>
                </RetroCard>
            )}

            <div className="mt-6 text-center text-sm text-gray-600 font-sans">
                <p>Supports .txt files with automatic word wrapping.</p>
                <p>Preserves line breaks and formatting.</p>
            </div>
        </ToolPageWrapper>
    );
}
