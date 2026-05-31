"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Download, FileCode, Loader2, Copy, Check } from "lucide-react";
import clsx from "clsx";

export default function PdfToXmlClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [xmlData, setXmlData] = useState<string | null>(null);
    const [includeMetadata, setIncludeMetadata] = useState(true);
    const [includePositions, setIncludePositions] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleFileSelected = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setXmlData(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const escapeXml = (unsafe: string) => {
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    };

    const handleExtract = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        setXmlData(null);

        try {
            const arrayBuffer = await file.arrayBuffer();

            // Dynamic import of pdfjs-dist for client-side usage
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";

            const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

            let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<pdfDocument>\n`;

            if (includeMetadata) {
                const metaData = await pdf.getMetadata();
                xml += `  <metadata>\n`;
                xml += `    <pages>${pdf.numPages}</pages>\n`;
                if (metaData?.info) {
                    const info: any = metaData.info;
                    if (info.Title) xml += `    <title>${escapeXml(info.Title)}</title>\n`;
                    if (info.Author) xml += `    <author>${escapeXml(info.Author)}</author>\n`;
                    if (info.Creator) xml += `    <creator>${escapeXml(info.Creator)}</creator>\n`;
                    if (info.Producer) xml += `    <producer>${escapeXml(info.Producer)}</producer>\n`;
                    if (info.CreationDate) xml += `    <creationDate>${escapeXml(info.CreationDate)}</creationDate>\n`;
                }
                xml += `  </metadata>\n`;
            }

            xml += `  <pages>\n`;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const viewport = page.getViewport({ scale: 1.0 });

                xml += `    <page number="${i}" width="${viewport.width}" height="${viewport.height}">\n`;
                
                if (textContent.items.length > 0) {
                    xml += `      <content>\n`;
                    for (const item of textContent.items) {
                        if ('str' in item) {
                            if (includePositions) {
                                // item.transform is [scaleX, skewY, skewX, scaleY, translateX, translateY]
                                const x = item.transform[4].toFixed(2);
                                const y = item.transform[5].toFixed(2);
                                xml += `        <text x="${x}" y="${y}">${escapeXml(item.str)}</text>\n`;
                            } else {
                                xml += `        <text>${escapeXml(item.str)}</text>\n`;
                            }
                        }
                    }
                    xml += `      </content>\n`;
                } else {
                    xml += `      <content/>\n`;
                }

                xml += `    </page>\n`;
            }

            xml += `  </pages>\n</pdfDocument>`;
            
            setXmlData(xml);
        } catch (err: any) {
            console.error("Failed to extract XML:", err);
            setError(err.message || "Failed to extract text from PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopy = () => {
        if (!xmlData) return;
        navigator.clipboard.writeText(xmlData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!xmlData || !file) return;
        const blob = new Blob([xmlData], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${file.name.replace('.pdf', '')}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <ToolPageWrapper
            title="PDF to XML"
            description="Extract text content and layout from a PDF into structured XML format."
            icon={FileCode}
            color="blue"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        title="Select PDF"
                        description="Drag & drop or click to browse"
                        variant="blue"
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
                    <div className="flex items-center justify-between mb-8 p-4 bg-[#60A5FA]/10 border-2 border-black">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#60A5FA] border-2 border-black">
                                <FileCode className="w-6 h-6" />
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
                            onClick={() => { setFile(null); setXmlData(null); }}
                            className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F87171] font-display text-sm transition-colors"
                        >
                            Change
                        </button>
                    </div>

                    {!xmlData ? (
                        <>
                            <div className="mb-8 border-2 border-black p-6 bg-white">
                                <h3 className="text-sm font-display mb-4">XML Output Options</h3>
                                
                                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={includeMetadata}
                                            onChange={(e) => setIncludeMetadata(e.target.checked)}
                                            className="peer appearance-none w-5 h-5 border-2 border-black bg-white checked:bg-[#60A5FA] transition-colors cursor-pointer"
                                        />
                                        <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                                    </div>
                                    <span className="font-sans text-sm">Include Document Metadata (Title, Author, etc.)</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={includePositions}
                                            onChange={(e) => setIncludePositions(e.target.checked)}
                                            className="peer appearance-none w-5 h-5 border-2 border-black bg-white checked:bg-[#60A5FA] transition-colors cursor-pointer"
                                        />
                                        <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                                    </div>
                                    <span className="font-sans text-sm">Include absolute text coordinates (X, Y attributes)</span>
                                </label>
                            </div>

                            {error && (
                                <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                                    {error}
                                </div>
                            )}

                            <RetroActionButton
                                label="Convert to XML"
                                isProcessing={isProcessing}
                                processingText="Extracting..."
                                onClick={handleExtract}
                                color="blue"
                                icon={<FileCode className="w-5 h-5" />}
                            />
                        </>
                    ) : (
                        <>
                            <div className="mb-6 relative group">
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 bg-white border-2 border-black hover:bg-gray-100 transition-colors"
                                        title="Copy XML"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <pre className="w-full h-[400px] p-4 bg-gray-50 border-2 border-black overflow-auto font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                    <code className="text-gray-800">
                                        {xmlData.length > 50000 
                                            ? xmlData.substring(0, 50000) + "\n\n... [Output truncated for preview. Download file to see full XML] ..." 
                                            : xmlData}
                                    </code>
                                </pre>
                            </div>

                            <RetroActionButton
                                label="Download XML File"
                                isProcessing={false}
                                processingText=""
                                onClick={handleDownload}
                                color="blue"
                                icon={<Download className="w-5 h-5" />}
                            />
                        </>
                    )}
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
