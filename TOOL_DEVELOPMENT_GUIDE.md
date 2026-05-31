# Tool Component Development Guidelines

This directory contains the individual React client components for each PDF/File tool.

To maintain a consistent and unified UI design across all tools, please adhere to the following standard layout pattern when creating new tools or updating existing ones.

## Standard Layout Pattern

All tool components should use `ToolPageWrapper`, `RetroCard`, and `RetroFileUploader`.

### Key Rules:
1. **No Maximum Widths on RetroCards**: Do not add `max-w-xl`, `max-w-2xl`, etc. to the `RetroCard` components. Let them fill the available space naturally (they are constrained by the parent wrapper).
2. **Conditional Rendering of States**: Split the UI into two distinct `<RetroCard>` elements based on whether a file has been selected (`!file` vs `file`).
3. **Hide Action Buttons Initially**: Ensure that action buttons (like "Convert", "Extract") are only rendered *after* a file is selected. They should not be visible in the initial empty state.

### Example Template:

```tsx
"use client";

import React, { useState } from "react";
import { useGlobalFileDrop } from "@/hooks/useGlobalFileDrop";
import { RetroFileUploader } from "@/components/RetroFileUploader";
import { RetroCard, RetroActionButton, RetroFileItem } from "@/components/RetroCard";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { FileText, ArrowRight, Download, AlertTriangle } from "lucide-react";
import { RetroVariant } from "@/config/design";

export default function ExampleToolClient({
    title = "Example Tool",
    description = "Description of what this tool does.",
    variant = "blue" as RetroVariant,
}) {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);

    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setResult(null);
        }
    };

    useGlobalFileDrop({
        onFilesSelected: handleFilesSelected,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleRemoveFile = () => {
        setFile(null);
        setResult(null);
        setError(null);
    };

    const handleProcess = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);
        
        // Tool specific processing logic here...
        
        setIsProcessing(false);
    };

    return (
        <ToolPageWrapper
            title={title}
            description={description}
            icon={FileText}
            color={variant}
        >
            {!file ? (
                // STATE 1: Empty State / Uploader
                // Notice there is NO max-w limit here
                <RetroCard variant="default">
                    <RetroFileUploader
                        onFilesSelected={handleFilesSelected}
                        accept={{ "application/pdf": [".pdf"] }}
                        multiple={false}
                        title="Upload File"
                        description="Select a file to process"
                        variant={variant}
                    />
                </RetroCard>
            ) : (
                // STATE 2: File Selected / Processing UI
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

                    <div className="mt-8 flex gap-4">
                        {result ? (
                            // Action: Processing Complete
                            <>
                                <RetroActionButton
                                    label="Download Result"
                                    isProcessing={false}
                                    processingText=""
                                    onClick={() => {}}
                                    color={variant}
                                    icon={<Download className="w-5 h-5" />}
                                />
                                <RetroActionButton
                                    label="Process Another"
                                    isProcessing={false}
                                    processingText=""
                                    onClick={handleRemoveFile}
                                    color="default"
                                    icon={<ArrowRight className="w-5 h-5" />}
                                />
                            </>
                        ) : (
                            // Action: Ready to Process
                            <RetroActionButton
                                label="Process File"
                                isProcessing={isProcessing}
                                processingText="Processing..."
                                onClick={handleProcess}
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
```
