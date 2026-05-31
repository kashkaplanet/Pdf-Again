"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Download, ArrowRight, FileJson, AlertTriangle, Copy, Check } from "lucide-react";

export default function PdfToJsonClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [jsonResult, setJsonResult] = useState<string | null>(null);
    const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [includeMetadata, setIncludeMetadata] = useState(true);
    const [includePageInfo, setIncludePageInfo] = useState(true);

    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setJsonResult(null);
            setConvertedUrl(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFilesSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleRemoveFile = () => {
        setFile(null);
        setJsonResult(null);
        setConvertedUrl(null);
        setError(null);
        setCopied(false);
    };

    const handleConvert = async () => {
        if (!file) return;

        setIsConverting(true);
        setError(null);
        setCopied(false);

        try {
            const arrayBuffer = await file.arrayBuffer();

            // Dynamic import of pdfjs-dist for client-side usage
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";

            const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

            const result: Record<string, unknown> = {
                fileName: file.name,
                fileSize: file.size,
                totalPages: pdf.numPages,
            };

            // Extract metadata
            if (includeMetadata) {
                const metadata = await pdf.getMetadata();
                result.metadata = {
                    info: metadata.info || {},
                    contentDispositionFilename: (metadata as any).contentDispositionFilename || null,
                };
            }

            // Extract text from each page
            const pages: Record<string, unknown>[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const viewport = page.getViewport({ scale: 1.0 });

                const pageData: Record<string, unknown> = {
                    pageNumber: i,
                };

                if (includePageInfo) {
                    pageData.width = Math.round(viewport.width * 100) / 100;
                    pageData.height = Math.round(viewport.height * 100) / 100;
                }

                // Extract text items with positions
                const textItems = textContent.items
                    .filter((item: any) => item.str !== undefined)
                    .map((item: any) => ({
                        text: item.str,
                        x: Math.round(item.transform[4] * 100) / 100,
                        y: Math.round(item.transform[5] * 100) / 100,
                        width: Math.round(item.width * 100) / 100,
                        height: Math.round(item.height * 100) / 100,
                        fontName: item.fontName || undefined,
                    }));

                pageData.textItems = textItems;

                // Also include full page text as a convenience field
                pageData.fullText = textContent.items
                    .filter((item: any) => item.str !== undefined)
                    .map((item: any) => item.str)
                    .join(" ")
                    .replace(/\s+/g, " ")
                    .trim();

                pages.push(pageData);
            }

            result.pages = pages;

            const jsonStr = JSON.stringify(result, null, 2);
            setJsonResult(jsonStr);

            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            setConvertedUrl(url);
        } catch (err: any) {
            console.error("Failed to convert PDF to JSON:", err);
            setError(err.message || "An error occurred during conversion.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (convertedUrl && file) {
            const a = document.createElement("a");
            a.href = convertedUrl;
            a.download = file.name.replace(/\.[^/.]+$/, "") + ".json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const handleCopy = async () => {
        if (jsonResult) {
            try {
                await navigator.clipboard.writeText(jsonResult);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch {
                // Fallback
                const textarea = document.createElement("textarea");
                textarea.value = jsonResult;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    };

    return (
        <ToolPageWrapper
            title="PDF to JSON"
            description="Extract structured text data from PDF documents into JSON format."
            icon={FileJson}
            color="blue"
        >
            {!file ? (
                <RetroCard variant="default">
                    <RetroFileUploader
                        onFilesSelected={handleFilesSelected}
                        accept={{ "application/pdf": [".pdf"] }}
                        multiple={false}
                        title="Upload PDF"
                        description="Select a .pdf file to convert to JSON"
                        variant="blue"
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
                            color="blue"
                        />
                    </div>

                    {/* Options */}
                    {!jsonResult && (
                        <div className="mb-8 space-y-3">
                            <h3 className="text-sm font-display mb-3">Options</h3>
                            <label className="flex items-center gap-3 p-3 border-2 border-black bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={includeMetadata}
                                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                                    className="w-5 h-5 accent-[#60A5FA]"
                                />
                                <div>
                                    <span className="font-display text-sm">Include Document Metadata</span>
                                    <p className="text-xs text-gray-500 font-sans">Title, author, creator, producer info</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 border-2 border-black bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={includePageInfo}
                                    onChange={(e) => setIncludePageInfo(e.target.checked)}
                                    className="w-5 h-5 accent-[#60A5FA]"
                                />
                                <div>
                                    <span className="font-display text-sm">Include Page Dimensions</span>
                                    <p className="text-xs text-gray-500 font-sans">Width and height of each page in points</p>
                                </div>
                            </label>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 border-2 border-black bg-red-100 text-red-800 font-display flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {/* JSON Preview */}
                    {jsonResult && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-display">JSON Preview</h3>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-white hover:bg-gray-100 font-display text-xs transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                            <div className="border-2 border-black bg-[#1e1e2e] text-[#cdd6f4] p-4 max-h-80 overflow-auto">
                                <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                                    {jsonResult.slice(0, 5000)}
                                    {jsonResult.length > 5000 && (
                                        <span className="text-gray-500">
                                            {"\n\n"}... ({(jsonResult.length / 1024).toFixed(1)} KB total — download for full output)
                                        </span>
                                    )}
                                </pre>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex gap-4">
                        {convertedUrl ? (
                            <>
                                <RetroActionButton
                                    label="Download .json"
                                    isProcessing={false}
                                    processingText=""
                                    onClick={handleDownload}
                                    color="blue"
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
                                label="Convert to JSON"
                                isProcessing={isConverting}
                                processingText="Extracting data..."
                                onClick={handleConvert}
                                disabled={!file}
                                color="blue"
                                icon={<ArrowRight className="w-5 h-5" />}
                            />
                        )}
                    </div>
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
