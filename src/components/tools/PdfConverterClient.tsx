"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { FileText, ArrowRight, Download, AlertTriangle, FileType } from "lucide-react";

export default function PdfConverterClient() {
    const [file, setFile] = useState<File | null>(null);
    const [format, setFormat] = useState<string>("docx");
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [convertedUrl, setConvertedUrl] = useState<string | null>(null);

    const formats = [
        { id: "docx", label: "Word (.docx)", icon: FileText, color: "blue" },
        { id: "txt", label: "Text (.txt)", icon: FileText, color: "zinc" },
        { id: "images", label: "Images (.zip)", icon: FileType, color: "cyan" },
    ];

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

        setIsConverting(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";

            const pdfDocument = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

            let blob: Blob;

            if (format === "docx") {
                const { Document, Packer, Paragraph, TextRun } = await import('docx');
                let fullText = "";
                for (let i = 1; i <= pdfDocument.numPages; i++) {
                    const page = await pdfDocument.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + "\n";
                    page.cleanup();
                }
                const lines = fullText.split(/\r?\n/);
                const children = lines.map((line: string) =>
                    new Paragraph({ children: [new TextRun(line)] })
                );
                const doc = new Document({
                    sections: [{ properties: {}, children: children }],
                });
                blob = await Packer.toBlob(doc);
            } else if (format === "txt") {
                let fullText = "";
                for (let i = 1; i <= pdfDocument.numPages; i++) {
                    const page = await pdfDocument.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + "\n";
                    page.cleanup();
                }
                blob = new Blob([fullText], { type: "text/plain" });
            } else if (format === "images") {
                const JSZip = (await import('jszip')).default;
                const zip = new JSZip();

                for (let i = 1; i <= pdfDocument.numPages; i++) {
                    const page = await pdfDocument.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });

                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) continue;

                    await page.render({
                        canvasContext: ctx as any,
                        viewport: viewport,
                    } as any).promise;

                    const imageBlob = await new Promise<Blob | null>(resolve => {
                        canvas.toBlob(b => resolve(b), "image/jpeg", 0.9);
                    });

                    if (imageBlob) {
                        zip.file(`page_${i}.jpg`, imageBlob);
                    }
                    page.cleanup();
                }
                blob = await zip.generateAsync({ type: "blob" });
            } else {
                throw new Error("Unsupported format");
            }

            const url = window.URL.createObjectURL(blob);
            setConvertedUrl(url);
        } catch (err: any) {
            setError(err.message || "An error occurred during conversion.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (convertedUrl && file) {
            const a = document.createElement("a");
            a.href = convertedUrl;
            const ext = format === "images" ? "_images.zip" : `.${format}`;
            a.download = file.name.replace(/\.[^/.]+$/, "") + ext;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <ToolPageWrapper
            title="PDF Converter"
            description="Convert your PDF documents into various formats including Word, Text, and Images."
            icon={FileType}
            color="purple"
        >
            <RetroCard className="max-w-2xl mx-auto py-12" variant="default">
                <div className="mb-8">
                    {!file ? (
                        <RetroFileUploader
                            onFilesSelected={handleFilesSelected}
                            accept={{ "application/pdf": [".pdf"] }}
                            multiple={false}
                            title="Upload PDF"
                            description="Select a .pdf file to convert"
                            variant="purple"
                        />
                    ) : (
                        <div className="space-y-6">
                            <RetroFileItem
                                name={file.name}
                                size={(file.size / 1024).toFixed(1) + " KB"}
                                index={0}
                                onRemove={handleRemoveFile}
                                color="purple"
                            />

                            <div className="grid grid-cols-3 gap-4">
                                {formats.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFormat(f.id)}
                                        className={`p-4 border-2 border-black font-display text-sm flex flex-col items-center gap-2 transition-all ${format === f.id
                                            ? "bg-black text-white translate-x-1 translate-y-1 shadow-none"
                                            : "bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                            }`}
                                    >
                                        <f.icon className="w-6 h-6" />
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 border-2 border-black bg-red-100 text-red-800 font-display flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="mt-8 flex gap-4">
                    {convertedUrl ? (
                        <>
                            <RetroActionButton
                                label="Download Result"
                                isProcessing={false}
                                processingText=""
                                onClick={handleDownload}
                                color="green"
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
                            label={`Convert to ${format.toUpperCase()}`}
                            isProcessing={isConverting}
                            processingText="Converting..."
                            onClick={handleConvert}
                            disabled={!file}
                            color="purple"
                            icon={<ArrowRight className="w-5 h-5" />}
                        />
                    )}
                </div>
            </RetroCard>
        </ToolPageWrapper>
    );
}
