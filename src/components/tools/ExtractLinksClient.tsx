"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Link2, ArrowRight, AlertTriangle, Copy, ExternalLink } from "lucide-react";
import { RetroVariant } from "@/config/design";
import { PDFDocument } from 'pdf-lib';

export default function ExtractLinksClient({
    title = "Extract Links",
    description = "Find and extract all hyperlinks from your PDF document.",
    variant = "lime" as RetroVariant,
}) {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [links, setLinks] = useState<string[] | null>(null);

    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setLinks(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFilesSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleRemoveFile = () => {
        setFile(null);
        setLinks(null);
        setError(null);
    };

    const handleConvert = async () => {
        if (!file) return;

        setIsConverting(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";

            const pdfDocument = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            const allLinks = new Set<string>();

            for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const annotations = await page.getAnnotations();
                
                for (const annotation of annotations) {
                    if (annotation.subtype === 'Link' && annotation.url) {
                        allLinks.add(annotation.url);
                    }
                }
                page.cleanup();
            }

            setLinks(Array.from(allLinks));
        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setIsConverting(false);
        }
    };

    const copyAll = () => {
        if (links) {
            navigator.clipboard.writeText(links.join('\n'));
        }
    };

    return (
        <ToolPageWrapper
            title={title}
            description={description}
            icon={Link2}
            color={variant}
        >
            {!file ? (
                <RetroCard variant="default">
                    <RetroFileUploader
                        onFilesSelected={handleFilesSelected}
                        accept={{ "application/pdf": [".pdf"] }}
                        multiple={false}
                        title="Upload PDF"
                        description="Select a .pdf file to extract links"
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
                    
                    {links && (
                        <div className="mb-8 border-2 border-black bg-white overflow-hidden">
                            <div className="bg-gray-100 p-3 border-b-2 border-black flex items-center justify-between font-display font-bold">
                                <span className="flex items-center gap-2"><Link2 className="w-5 h-5" /> Found {links.length} Links</span>
                                {links.length > 0 && (
                                    <button onClick={copyAll} className="flex items-center gap-1 text-sm bg-black text-white px-2 py-1 hover:bg-gray-800">
                                        <Copy className="w-4 h-4" /> Copy All
                                    </button>
                                )}
                            </div>
                            <div className="max-h-64 overflow-y-auto p-4 space-y-2">
                                {links.length === 0 ? (
                                    <p className="text-gray-500 font-display text-center">No hyperlinks found in this document.</p>
                                ) : (
                                    links.map((link, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 border border-gray-200 hover:bg-gray-50">
                                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-display text-sm truncate max-w-[90%]">
                                                {link}
                                            </a>
                                            <ExternalLink className="w-4 h-4 text-gray-400" />
                                        </div>
                                    ))
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

                    <div className="mt-8 flex gap-4">
                        {links ? (
                            <RetroActionButton
                                label="Scan Another File"
                                isProcessing={false}
                                processingText=""
                                onClick={handleRemoveFile}
                                color="default"
                                icon={<ArrowRight className="w-5 h-5" />}
                            />
                        ) : (
                            <RetroActionButton
                                label="Extract Links"
                                isProcessing={isConverting}
                                processingText="Scanning..."
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
