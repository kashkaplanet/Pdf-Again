"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { ImagePlus, ArrowRight, Download, AlertTriangle } from "lucide-react";
import { RetroVariant } from "@/config/design";

export default function ExtractImagesClient({
    title = "Extract Images",
    description = "Extract all embedded images and photos from your PDF document.",
    variant = "blue" as RetroVariant,
}) {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [convertedUrl, setConvertedUrl] = useState<string | null>(null);

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
            const JSZip = (await import('jszip')).default;
            const arrayBuffer = await file.arrayBuffer();
            
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";

            const pdfDocument = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            const zip = new JSZip();
            let imageCount = 0;

            for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const opList = await page.getOperatorList();
                
                for (let j = 0; j < opList.fnArray.length; j++) {
                    if (opList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                        const objId = opList.argsArray[j][0];
                        try {
                            const image = await page.objs.get(objId) as any;
                            if (image && image.data) {
                                const width = image.width;
                                const height = image.height;
                                const data = image.data;
                                
                                const canvas = document.createElement('canvas');
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                if (!ctx) continue;
                                
                                const imgData = ctx.createImageData(width, height);
                                if (image.kind === 1) {
                                    for (let k = 0, l = 0; k < data.length; k++, l += 4) {
                                        imgData.data[l] = imgData.data[l + 1] = imgData.data[l + 2] = data[k];
                                        imgData.data[l + 3] = 255;
                                    }
                                } else if (image.kind === 2) {
                                    for (let k = 0, l = 0; k < data.length; k += 3, l += 4) {
                                        imgData.data[l] = data[k];
                                        imgData.data[l + 1] = data[k + 1];
                                        imgData.data[l + 2] = data[k + 2];
                                        imgData.data[l + 3] = 255;
                                    }
                                } else if (image.kind === 3) {
                                    imgData.data.set(new Uint8ClampedArray(data));
                                } else {
                                    continue;
                                }
                                
                                ctx.putImageData(imgData, 0, 0);
                                
                                const blob = await new Promise<Blob | null>(resolve => {
                                    canvas.toBlob(b => resolve(b), "image/jpeg", 0.9);
                                });
                                
                                if (blob) {
                                    imageCount++;
                                    zip.file(`image_p${i}_${imageCount}.jpg`, blob);
                                }
                            }
                        } catch (e) {
                            console.error("Failed to extract an image", e);
                        }
                    }
                }
                page.cleanup();
            }

            if (imageCount === 0) {
                throw new Error("No embedded images found in this PDF.");
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(zipBlob);
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
            a.download = file.name.replace(/\.[^/.]+$/, "") + "_images.zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <ToolPageWrapper
            title={title}
            description={description}
            icon={ImagePlus}
            color={variant}
        >
            {!file ? (
                <RetroCard variant="default">
                    <RetroFileUploader
                        onFilesSelected={handleFilesSelected}
                        accept={{ "application/pdf": [".pdf"] }}
                        multiple={false}
                        title="Upload PDF"
                        description="Select a .pdf file to extract images from"
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
                                        label="Download Images (.zip)"
                                        isProcessing={false}
                                        processingText=""
                                        onClick={handleDownload}
                                        color={variant}
                                        icon={<Download className="w-5 h-5" />}
                                    />
                                    <RetroActionButton
                                        label="Extract Another"
                                        isProcessing={false}
                                        processingText=""
                                        onClick={handleRemoveFile}
                                        color="default"
                                        icon={<ArrowRight className="w-5 h-5" />}
                                    />
                                </>
                            ) : (
                                <RetroActionButton
                                    label="Extract Images"
                                    isProcessing={isConverting}
                                    processingText="Scanning..."
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
