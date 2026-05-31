"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function ProtectPdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFileSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleProtect = async () => {
        if (!file) return;

        if (password.length < 4) {
            setError("Password must be at least 4 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfBytes = new Uint8Array(arrayBuffer);

            const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt-lite');
            const encryptedPdf = await encryptPDF(pdfBytes, password, password);

            const blob = new Blob([encryptedPdf as BlobPart], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `protected_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to protect PDF:", err);
            setError(err instanceof Error ? err.message : "Failed to process PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolPageWrapper
            title="Protect PDF"
            description="Add password protection to your PDF files."
            icon={Lock}
            color="green"
        >
            {!file ? (
                <RetroCard>
                    <RetroFileUploader
                        onFilesSelected={handleFileSelected}
                        multiple={false}
                        title="Select PDF to Protect"
                        description="Drag & drop or click to browse"
                        variant="green"
                    />
                </RetroCard>
            ) : (
                <RetroCard className="max-w-xl mx-auto">
                    {/* File Info */}
                    <div className="flex items-center justify-between mb-8 p-4 bg-[#34D399]/10 border-2 border-black">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-[#34D399] border-2 border-black">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-display truncate max-w-[200px]">
                                    {file.name}
                                </h2>
                                <p className="text-sm text-gray-600 font-sans">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setFile(null); setPassword(""); setConfirmPassword(""); setError(null); }}
                            className="px-4 py-2 border-2 border-black bg-white hover:bg-[#F87171] font-display text-sm transition-colors"
                        >
                            Change
                        </button>
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-display mb-2">
                            <Lock className="w-4 h-4 inline mr-2" />
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter a strong password"
                                className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-[#34D399] outline-none pr-12 font-sans"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-display mb-2">
                            Confirm Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-[#34D399] outline-none font-sans"
                        />
                    </div>

                    {/* Info Notice */}
                    <div className="mb-6 p-4 bg-[#FB923C]/10 border-2 border-[#FB923C] text-sm font-sans">
                        <strong>Note:</strong> Client-side PDF encryption has limitations. For maximum security, use desktop software like Adobe Acrobat.
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-[#F87171]/10 border-2 border-[#F87171] text-sm font-sans">
                            {error}
                        </div>
                    )}

                    <RetroActionButton
                        label="Protect & Download PDF"
                        isProcessing={isProcessing}
                        processingText="Processing..."
                        onClick={handleProtect}
                        disabled={!password || !confirmPassword}
                        color="green"
                        icon={<Lock className="w-5 h-5" />}
                    />
                </RetroCard>
            )}
        </ToolPageWrapper>
    );
}
