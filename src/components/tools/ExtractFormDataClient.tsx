"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from "pdf-lib";
import { Download, FileJson, Loader2, Copy, Check } from "lucide-react";
import clsx from "clsx";

export default function ExtractFormDataClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Record<string, any> | null>(null);
    const [fieldCount, setFieldCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleFileSelected = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setIsLoading(true);
            setFormData(null);
            
            try {
                const arrayBuffer = await files[0].arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                const form = pdfDoc.getForm();
                const fields = form.getFields();

                const extracted: Record<string, any> = {};
                let count = 0;

                fields.forEach(field => {
                    const name = field.getName();
                    let value: any = null;

                    if (field instanceof PDFTextField) {
                        value = field.getText();
                    } else if (field instanceof PDFCheckBox) {
                        value = field.isChecked();
                    } else if (field instanceof PDFDropdown) {
                        value = field.getSelected();
                    } else if (field instanceof PDFRadioGroup) {
                        value = field.getSelected();
                    }

                    if (value !== null && value !== undefined) {
                        extracted[name] = value;
                        count++;
                    }
                });

                setFormData(extracted);
                setFieldCount(count);
            } catch (err: any) {
                console.error("Failed to read form data:", err);
                setError("Failed to read PDF form data. The file might be encrypted or not contain interactive AcroForm fields.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleCopy = () => {
        if (!formData) return;
        navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!formData || !file) return;
        const blob = new Blob([JSON.stringify(formData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `form-data_${file.name}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <ToolPageWrapper
            title="Extract Form Data"
            description="Read interactive PDF forms (AcroForms) and export all filled data as a structured JSON file."
            icon={FileJson}
            color="blue"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        title="Select Fillable PDF Form"
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
                                <FileJson className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-display truncate max-w-[200px] sm:max-w-md">
                                    {file.name}
                                </h2>
                                <p className="text-sm text-gray-600 font-sans">
                                    {fieldCount} form fields found
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setFile(null); setFormData(null); }}
                            className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F87171] font-display text-sm transition-colors"
                        >
                            Change
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans mb-6">
                            {error}
                        </div>
                    )}

                    {!error && fieldCount === 0 && (
                        <div className="p-6 border-2 border-black bg-white text-center mb-8">
                            <h3 className="text-xl font-display mb-2">No Form Fields Found</h3>
                            <p className="text-sm text-gray-600 font-sans">
                                This PDF does not contain any interactive AcroForm fields. 
                                If it looks like a form, it might be flattened or just a scanned image.
                            </p>
                        </div>
                    )}

                    {!error && formData && fieldCount > 0 && (
                        <>
                            <div className="mb-6 relative group">
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 bg-white border-2 border-black hover:bg-gray-100 transition-colors"
                                        title="Copy JSON"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <pre className="w-full h-[400px] p-4 bg-gray-50 border-2 border-black overflow-auto font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                    <code className="text-gray-800">
                                        {JSON.stringify(formData, null, 2)}
                                    </code>
                                </pre>
                            </div>

                            <RetroActionButton
                                label="Download JSON File"
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
