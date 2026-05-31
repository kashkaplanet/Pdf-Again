"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { extractPages } from "@/core/pdf";
import { usePDF } from "@/hooks/usePDF";
import { PDFThumbnail } from "@/components/PDFThumbnail";
import { Download, FileOutput, CheckCircle, Loader2, X } from "lucide-react";
import clsx from "clsx";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { VirtuosoGrid } from "react-virtuoso";

export default function ExtractPagesPdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const { pdfProxy, pageCount, loading } = usePDF(file);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    // Track order of selection for extraction
    const [selectedPageOrder, setSelectedPageOrder] = useState<number[]>([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setSelectedPages(new Set());
            setSelectedPageOrder([]);
            setError(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const togglePage = (index: number, e?: React.MouseEvent) => {
        if (e?.shiftKey && lastSelectedIndex !== null) {
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            
            // Determine if we are selecting or deselecting based on the target item
            const isSelecting = !selectedPages.has(index);

            setSelectedPages(prev => {
                const newSet = new Set(prev);
                for (let i = start; i <= end; i++) {
                    if (isSelecting) newSet.add(i);
                    else newSet.delete(i);
                }
                return newSet;
            });

            setSelectedPageOrder(prev => {
                let newOrder = [...prev];
                for (let i = start; i <= end; i++) {
                    if (isSelecting && !newOrder.includes(i)) {
                        newOrder.push(i);
                    } else if (!isSelecting && newOrder.includes(i)) {
                        newOrder = newOrder.filter(p => p !== i);
                    }
                }
                return newOrder;
            });
        } else {
            setSelectedPages(prev => {
                const newSet = new Set(prev);
                if (newSet.has(index)) {
                    newSet.delete(index);
                } else {
                    newSet.add(index);
                }
                return newSet;
            });

            setSelectedPageOrder(prev => {
                if (prev.includes(index)) {
                    return prev.filter(p => p !== index);
                } else {
                    return [...prev, index];
                }
            });
        }
        
        setLastSelectedIndex(index);
    };

    const selectAll = () => {
        const allPages = new Set<number>();
        const allPageOrder: number[] = [];
        for (let i = 0; i < pageCount; i++) {
            allPages.add(i);
            allPageOrder.push(i);
        }
        setSelectedPages(allPages);
        setSelectedPageOrder(allPageOrder);
    };

    const deselectAll = () => {
        setSelectedPages(new Set());
        setSelectedPageOrder([]);
        setError(null);
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const items = Array.from(selectedPageOrder);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSelectedPageOrder(items);
    };

    const handleExtractPages = async () => {
        if (!file || selectedPages.size === 0) return;

        setIsProcessing(true);
        setError(null);
        try {
            // Use the user-defined order
            const pagesToExtract = selectedPageOrder;
            const blob = await extractPages(file, pagesToExtract);

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `extracted_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error("Failed to extract pages:", err);
            setError("Failed to extract pages from PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolPageWrapper
            title="Extract Pages"
            description="Select pages to extract into a new PDF document."
            icon={FileOutput}
            color="pink"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        title="Select PDF to Extract Pages From"
                        description="Drag & drop or click to browse"
                        variant="pink"
                    />
                </RetroCard>
            ) : (
                <RetroCard>
                    {/* File Info */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-[#F472B6] border-2 border-black">
                                <FileOutput className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-display truncate max-w-[300px]">
                                    {file.name}
                                </h2>
                                <p className="text-sm text-gray-600 font-sans">
                                    {pageCount} pages total • {selectedPages.size} selected
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={selectAll}
                                className="px-4 py-2 border-2 border-black bg-[#F472B6] font-display text-sm transition-colors hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                Select All
                            </button>
                            <button
                                onClick={deselectAll}
                                className="px-4 py-2 border-2 border-black bg-white font-display text-sm transition-colors hover:bg-gray-100"
                            >
                                Deselect All
                            </button>
                            <button
                                onClick={() => setFile(null)}
                                className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F87171] font-display text-sm transition-colors"
                            >
                                Change File
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-[#F472B6] animate-spin mb-4" />
                            <p className="text-gray-600 font-sans">Loading PDF pages...</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600 font-sans mb-4 text-center">
                                Click pages to select. Drag selected pages to reorder.
                            </p>

                            {/* Selected Pages Drag & Drop Area */}
                            {selectedPageOrder.length > 0 && (
                                <div className="mb-8 p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                                    <h3 className="text-sm font-display mb-3 text-gray-500 uppercase tracking-wider">
                                        Selected Pages ({selectedPageOrder.length}) - Drag to Reorder
                                    </h3>
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <Droppable droppableId="selected-pages" direction="horizontal">
                                            {(provided) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className="flex gap-4 overflow-x-auto pb-4 px-2 min-h-[140px]"
                                                >
                                                    {Array.from(new Set(selectedPageOrder)).map((pageIndex, index) => (
                                                        <Draggable
                                                            key={`selected-${pageIndex}`}
                                                            draggableId={`selected-${pageIndex}`}
                                                            index={index}
                                                        >
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={clsx(
                                                                        "relative flex-shrink-0 w-[100px] bg-white border-2 border-black cursor-grab active:cursor-grabbing",
                                                                        snapshot.isDragging && "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-2 scale-105 z-50 ring-2 ring-[#F472B6]"
                                                                    )}
                                                                >
                                                                    <div className="relative">
                                                                        {pdfProxy && (
                                                                            <PDFThumbnail
                                                                                pdfProxy={pdfProxy}
                                                                                pageIndex={pageIndex}
                                                                                width={100}
                                                                                hidePageLabel={true}
                                                                            />
                                                                        )}
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                togglePage(pageIndex);
                                                                            }}
                                                                            className="absolute -top-2 -right-2 bg-[#F87171] text-white rounded-full p-1 border-2 border-black hover:scale-110 transition-transform"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                    <div className="text-center py-1 bg-white border-t-2 border-black text-xs font-display">
                                                                        Page {pageIndex + 1}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </div>
                            )}


                            {error && (
                                <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                                    {error}
                                </div>
                            )}

                            {pdfProxy && (
                                <VirtuosoGrid
                                    useWindowScroll
                                    totalCount={pageCount}
                                    overscan={200}
                                    components={{
                                        List: GridList,
                                        Item: GridItem
                                    }}
                                    itemContent={(index) => (
                                        <div
                                            key={index}
                                            onClick={(e) => togglePage(index, e)}
                                            className={clsx(
                                                "relative cursor-pointer border-2 transition-all w-full",
                                                selectedPages.has(index)
                                                    ? "border-[#F472B6]"
                                                    : "border-black hover:border-[#F472B6]"
                                            )}
                                        >
                                            <PDFThumbnail
                                                pdfProxy={pdfProxy}
                                                pageIndex={index}
                                                width={150}
                                                selected={selectedPages.has(index)}
                                                hidePageLabel={true}
                                            />
                                            <div className="text-center py-2 bg-white border-t-2 border-black text-sm font-display">
                                                Page {index + 1}
                                            </div>
                                        </div>
                                    )}
                                />
                            )}

                            <div className="flex justify-center">
                                <RetroActionButton
                                    label={`Extract ${selectedPages.size} Page${selectedPages.size !== 1 ? 's' : ''} & Download`}
                                    isProcessing={isProcessing}
                                    processingText="Extracting..."
                                    onClick={handleExtractPages}
                                    disabled={selectedPages.size === 0}
                                    color="pink"
                                    icon={<Download className="w-5 h-5" />}
                                />
                            </div>
                        </>
                    )}
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}

const GridList = React.forwardRef(({ style, children, ...props }: any, ref: any) => (
    <div
        ref={ref}
        {...props}
        style={{ ...style, display: "flex", flexWrap: "wrap", gap: "1rem" }}
        className="mb-8"
    >
        {children}
    </div>
));
GridList.displayName = "GridList";

const GridItem = ({ children, ...props }: any) => (
    <div
        {...props}
        className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.66rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)]"
    >
        {children}
    </div>
);
GridItem.displayName = "GridItem";
