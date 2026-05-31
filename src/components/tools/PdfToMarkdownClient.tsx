"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { FileText, ArrowRight, Download, AlertTriangle, Copy } from "lucide-react";
import { RetroVariant } from "@/config/design";

export default function PdfToMarkdownClient({
    title = "PDF to Markdown",
    description = "Convert your PDF document into Markdown format.",
    variant = "blue" as RetroVariant,
}) {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [markdownText, setMarkdownText] = useState<string | null>(null);

    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setMarkdownText(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFilesSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleRemoveFile = () => {
        setFile(null);
        setMarkdownText(null);
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
            const numPages = pdfDocument.numPages;
            
            let fullText = "";

            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const textContent = await page.getTextContent();
                
                let lastY = -1;
                let currentLineText = "";
                const lines: string[] = [];

                for (const item of textContent.items) {
                    const itemText = (item as any).str;
                    const itemY = (item as any).transform[5];

                    if (lastY !== -1 && Math.abs(itemY - lastY) > 5) {
                        if (currentLineText.trim()) {
                            lines.push(currentLineText.trimEnd());
                        }
                        currentLineText = "";
                    }

                    currentLineText += itemText;
                    lastY = itemY;
                }

                if (currentLineText.trim()) {
                    lines.push(currentLineText.trimEnd());
                }

                fullText += lines.join("\n") + "\n\n";
            }

            const lines = fullText.split('\n');
            const mdLines = lines.map(line => {
                const trimmed = line.trim();
                if (trimmed.length > 0 && trimmed.length < 50 && trimmed === trimmed.toUpperCase()) {
                    return `## ${trimmed}`;
                }
                if (trimmed.match(/^[•\-\*]\s/)) {
                    return `- ${trimmed.substring(2).trim()}`;
                }
                return trimmed;
            });

            let markdown = `# ${file.name.replace(/\.[^/.]+$/, "")}\n\n`;
            
            try {
                const metadata = await pdfDocument.getMetadata();
                if (metadata && metadata.info && (metadata.info as any).Title) {
                    markdown = `# ${(metadata.info as any).Title}\n\n`;
                }
            } catch (e) {
                // Ignore metadata errors
            }

            markdown += mdLines.join('\n');
            markdown = markdown.replace(/\n{3,}/g, '\n\n');

            setMarkdownText(markdown);
        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (markdownText && file) {
            const blob = new Blob([markdownText], { type: "text/markdown" });
            const a = document.createElement("a");
            a.href = window.URL.createObjectURL(blob);
            a.download = file.name.replace(/\.[^/.]+$/, "") + ".md";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const copyAll = () => {
        if (markdownText) {
            navigator.clipboard.writeText(markdownText);
        }
    };

    return (
        <ToolPageWrapper
            title={title}
            description={description}
            icon={FileText}
            color={variant}
        >
            {!file ? (
                <RetroCard variant="default">
                    <RetroFileUploader
                        onFilesSelected={handleFilesSelected}
                        accept={{ "application/pdf": [".pdf"] }}
                        multiple={false}
                        title="Upload PDF"
                        description="Select a .pdf file to convert to MD"
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
                    
                    {markdownText && (
                        <div className="mb-8 border-2 border-black bg-white overflow-hidden">
                            <div className="bg-gray-100 p-3 border-b-2 border-black flex items-center justify-between font-display font-bold">
                                <span className="flex items-center gap-2"><FileText className="w-5 h-5" /> Markdown Output</span>
                                <button onClick={copyAll} className="flex items-center gap-1 text-sm bg-black text-white px-2 py-1 hover:bg-gray-800">
                                    <Copy className="w-4 h-4" /> Copy
                                </button>
                            </div>
                            <div className="p-4 bg-gray-50 max-h-64 overflow-y-auto">
                                <pre className="font-mono text-sm whitespace-pre-wrap">{markdownText}</pre>
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
                        {markdownText ? (
                            <>
                                <RetroActionButton
                                    label="Download .md"
                                    isProcessing={false}
                                    processingText=""
                                    onClick={handleDownload}
                                    color={variant}
                                    icon={<Download className="w-5 h-5" />}
                                />
                                <RetroActionButton
                                    label="Convert Another"
                                    isProcessing={false}
                                    processingText=""
                                    onClick={handleRemoveFile}
                                    color="default"
                                    icon={<ArrowRight className="w-5 h-5" />}
                                />
                            </>
                        ) : (
                            <RetroActionButton
                                label="Convert to MD"
                                isProcessing={isConverting}
                                processingText="Converting..."
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
