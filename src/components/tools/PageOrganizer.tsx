"use client";

import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { PDFThumbnail } from "@/components/PDFThumbnail";
import { RotateCw, Trash2, GripVertical } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import clsx from "clsx";

export interface PageState {
    originalIndex: number;
    rotation: number;
    id: string; // unique id for dnd
}

interface PageOrganizerProps {
    pdfProxy: PDFDocumentProxy | null;
    pages: PageState[];
    onPagesChange: (newPages: PageState[]) => void;
    onClose: () => void;
    onSelectPage: (index: number) => void;
    currentPage: number;
}

export function PageOrganizer({
    pdfProxy,
    pages,
    onPagesChange,
    onClose,
    onSelectPage,
    currentPage,
}: PageOrganizerProps) {

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const newPages = Array.from(pages);
        const [reorderedItem] = newPages.splice(result.source.index, 1);
        newPages.splice(result.destination.index, 0, reorderedItem);

        onPagesChange(newPages);
    };

    const handleRotate = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newPages = [...pages];
        newPages[index] = {
            ...newPages[index],
            rotation: (newPages[index].rotation + 90) % 360
        };
        onPagesChange(newPages);
    };

    const handleDelete = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newPages = pages.filter((_, i) => i !== index);
        onPagesChange(newPages);
    };

    if (!pdfProxy) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-zinc-900 border-l border-zinc-700 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-zinc-800">
                <h2 className="text-white font-semibold">Organize Pages</h2>
                <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-white transition-colors"
                >
                    Done
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="pages-list">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-3"
                            >
                                {pages.map((page, index) => (
                                    <Draggable
                                        key={page.id}
                                        draggableId={page.id}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={clsx(
                                                    "bg-zinc-800 rounded-lg p-3 border group transition-colors",
                                                    snapshot.isDragging ? "border-purple-500 shadow-xl opacity-90 ring-2 ring-purple-500/20" : "border-zinc-700 hover:border-zinc-600",
                                                    currentPage === index ? "ring-2 ring-blue-500/50" : ""
                                                )}
                                                onClick={() => onSelectPage(index)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="mt-2 text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing"
                                                    >
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>

                                                    <div className="relative flex-1 min-h-[100px] bg-zinc-900/50 rounded-md overflow-hidden flex justify-center items-center">
                                                        <div style={{ transform: `rotate(${page.rotation}deg)` }} className="transition-transform duration-200">
                                                            <PDFThumbnail
                                                                pdfProxy={pdfProxy}
                                                                pageIndex={page.originalIndex}
                                                                width={120}
                                                                hidePageLabel={true}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-700/50 pl-8">
                                                    <span className="text-zinc-400 text-sm font-medium">
                                                        Page {index + 1}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={(e) => handleRotate(index, e)}
                                                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
                                                            title="Rotate 90°"
                                                        >
                                                            <RotateCw className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(index, e)}
                                                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                                                            title="Delete Page"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
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
        </div>
    );
}


