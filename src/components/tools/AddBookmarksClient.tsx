"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { usePDF } from "@/hooks/usePDF";
import { List, ArrowRight, Download, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { RetroVariant } from "@/config/design";

export default function AddBookmarksClient({
    title = "Add Table of Contents",
    description = "Add a visual Table of Contents page to your PDF.",
    variant = "purple" as RetroVariant,
}) {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
    const { pageCount, loading } = usePDF(file);
    
    const [tocItems, setTocItems] = useState<{title: string, page: number}[]>([
        { title: "Chapter 1", page: 1 }
    ]);

    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setConvertedUrl(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFilesSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleRemoveFile = () => {
        setFile(null);
        setConvertedUrl(null);
        setError(null);
    };

    const handleConvert = async () => {
        if (!file) return;
        if (tocItems.length === 0) {
            setError("Please add at least one Table of Contents item.");
            return;
        }

        setIsConverting(true);
        setError(null);

        try {
            const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            
            // Create TOC page
            const tocPage = pdfDoc.insertPage(0);
            const { width, height } = tocPage.getSize();
            
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            // Draw TOC Title
            tocPage.drawText('Table of Contents', {
                x: 50,
                y: height - 80,
                size: 24,
                font: boldFont,
                color: rgb(0, 0, 0),
            });

            // Draw TOC Items
            let currentY = height - 130;
            for (const item of tocItems) {
                tocPage.drawText(item.title, {
                    x: 50,
                    y: currentY,
                    size: 12,
                    font: font,
                    color: rgb(0, 0, 0),
                });
                
                tocPage.drawText(item.page.toString(), {
                    x: width - 80,
                    y: currentY,
                    size: 12,
                    font: font,
                    color: rgb(0, 0, 0),
                });
                
                // Draw dot leaders
                const titleWidth = font.widthOfTextAtSize(item.title, 12);
                const dotsStr = '.'.repeat(Math.floor((width - 130 - titleWidth) / font.widthOfTextAtSize('.', 12)));
                tocPage.drawText(dotsStr, {
                    x: 50 + titleWidth + 5,
                    y: currentY,
                    size: 12,
                    font: font,
                    color: rgb(0, 0, 0),
                });
                
                currentY -= 20;
                
                if (currentY < 50) {
                     break;
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            setConvertedUrl(url);
        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (convertedUrl && file) {
            const a = document.createElement("a");
            a.href = convertedUrl;
            a.download = file.name.replace(/\.[^/.]+$/, "") + "_toc.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const addTocItem = () => {
        setTocItems([...tocItems, { title: "New Section", page: tocItems.length > 0 ? tocItems[tocItems.length - 1].page + 1 : 1 }]);
    };

    const updateTocItem = (index: number, field: 'title' | 'page', value: string | number) => {
        const newItems = [...tocItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setTocItems(newItems);
    };

    const removeTocItem = (index: number) => {
        setTocItems(tocItems.filter((_, i) => i !== index));
    };

    return (
        <ToolPageWrapper
            title={title}
            description={description}
            icon={List}
            color={variant}
        >
            {!file ? (
                <RetroCard variant="default">
                    <RetroFileUploader
                        onFilesSelected={handleFilesSelected}
                        accept={{ "application/pdf": [".pdf"] }}
                        multiple={false}
                        title="Upload PDF"
                        description="Select a .pdf file to add TOC"
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
                    
                    {!convertedUrl && (
                        <div className="mb-8 p-4 border-2 border-black bg-white">
                            <h3 className="font-display font-bold mb-4 flex items-center justify-between">
                            Table of Contents Items
                            <button onClick={addTocItem} className="text-sm bg-black text-white px-2 py-1 flex items-center gap-1 hover:bg-gray-800">
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </h3>
                        
                        <div className="space-y-3">
                            {tocItems.map((item, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input 
                                        type="text" 
                                        value={item.title} 
                                        onChange={(e) => updateTocItem(index, 'title', e.target.value)}
                                        className="flex-1 border-2 border-black p-2 font-display text-sm"
                                        placeholder="Section Title"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="font-display text-sm">Page:</span>
                                        {loading ? (
                                            <span className="w-32 text-xs text-gray-500 font-sans">Loading...</span>
                                        ) : (
                                            <select 
                                                value={item.page} 
                                                onChange={(e) => updateTocItem(index, 'page', parseInt(e.target.value) || 1)}
                                                className="w-32 border-2 border-black p-2 font-display text-sm bg-white cursor-pointer focus:outline-none"
                                            >
                                                {Array.from({ length: pageCount || 1 }, (_, i) => i + 1).map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <button onClick={() => removeTocItem(index)} className="p-2 text-red-600 hover:bg-red-100 border-2 border-transparent hover:border-red-600 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {tocItems.length === 0 && (
                                <div className="text-center text-gray-500 py-4 font-display">No items added.</div>
                            )}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 border-2 border-black bg-red-100 text-red-800 font-display flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {file && (
                    <div className="mt-8 flex gap-4">
                        {convertedUrl ? (
                            <>
                                <RetroActionButton
                                    label="Download PDF"
                                    isProcessing={false}
                                    processingText=""
                                    onClick={handleDownload}
                                    color={variant}
                                    icon={<Download className="w-5 h-5" />}
                                />
                                <RetroActionButton
                                    label="Process Another"
                                    isProcessing={false}
                                    processingText=""
                                    onClick={handleRemoveFile}
                                    color="default"
                                    icon={<ArrowRight className="w-5 h-5" />}
                                />
                            </>
                        ) : (
                            <RetroActionButton
                                label="Add Table of Contents"
                                isProcessing={isConverting}
                                processingText="Processing..."
                                onClick={handleConvert}
                                disabled={!file}
                                color={variant}
                                icon={<ArrowRight className="w-5 h-5" />}
                            />
                        )}
                    </div>
                )}
            </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
