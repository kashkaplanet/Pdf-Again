import {
    FileText, Scissors, FileArchive, FileOutput, FileImage,
    Lock, Unlock, Stamp, Hash, Trash2, FileSearch,
    RotateCcw, PenTool, Layers, Wrench, Palette, Globe,
    GitCompare, Eye, FileType, Combine, Maximize2,
    EyeOff, Info, ArrowDownUp, Receipt, Scale, Table,
    Sparkles, Zap, Shield, MessageSquare, Presentation, Landmark,
    Binary, List, AlignVerticalSpaceAround, ImagePlus, Link2, Scaling,
    Crop, Expand, ShieldCheck, FileJson, CopyPlus, MessageSquareOff, FilePlus2, LayoutGrid,
    SplitSquareHorizontal, BookOpen, FileCode
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export interface TutorialStep {
    title: string;
    description: string;
}

export interface Tool {
    name: string;
    href: string;
    icon: LucideIcon;
    description: string;
    disabled?: boolean;
    popular?: boolean;
    tutorialSteps?: TutorialStep[];
}

export interface Section {
    title: string;
    color: string;
    icon: LucideIcon;
    description: string;
    tools: Tool[];
}

// Tool categories mapped to the design
export const sections: Section[] = [
    {
        title: "ORGANIZE PDF",
        color: "pink",
        icon: Layers,
        description: "Merge, split, and arrange your PDF pages with ease",
        tools: [
            {
                name: "Extract Pages",
                href: "/extract-pages",
                icon: FileOutput,
                description: "Select and save specific pages as a new PDF.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the PDF file you want to extract pages from." },
                    { title: "Select Pages", description: "Click on the pages you want to keep. You can also type page ranges (e.g., 1-5, 8)." },
                    { title: "Extract", description: "Click the 'Extract PDF' button to create a new document with only the selected pages." },
                    { title: "Download", description: "Save your new PDF file instantly." }
                ]
            },
            {
                name: "Merge PDF",
                href: "/merge-pdf",
                icon: Combine,
                description: "Combine multiple PDFs into one unified document.",
                popular: true,
                tutorialSteps: [
                    { title: "Upload Files", description: "Select multiple PDF files from your device. You can drag and drop them to rearrange the order." },
                    { title: "Arrange", description: "Drag the files to sort them in the desired order for the final document." },
                    { title: "Merge", description: "Click 'Merge PDF' to combine them into a single file." },
                    { title: "Download", description: "Download your unified PDF document." }
                ]
            },
            {
                name: "Organize PDF",
                href: "/organize-pdf",
                icon: FileSearch,
                description: "Rearrange, rotate, or delete pages easily.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Upload the PDF you want to organize." },
                    { title: "Edit Pages", description: "Drag and drop pages to reorder them. Hover over a page to rotate or delete unique pages." },
                    { title: "Save Changes", description: "Click 'Organize' to apply your changes." },
                    { title: "Download", description: "Get your newly organized PDF file." }
                ]
            },
            {
                name: "Remove Pages",
                href: "/remove-pages",
                icon: Trash2,
                description: "Delete unwanted pages from your document.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the file containing pages you want to remove." },
                    { title: "Select Pages", description: "Click on the pages you want to delete to mark them for removal." },
                    { title: "Remove", description: "Click the button to delete the selected pages." },
                    { title: "Download", description: "Download the cleaned PDF." }
                ]
            },
            {
                name: "Reverse PDF",
                href: "/reverse-pdf",
                icon: ArrowDownUp,
                description: "Reverse the order of pages in your PDF.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Choose the PDF file you want to reverse." },
                    { title: "Process", description: "The tool automatically reverses the page order." },
                    { title: "Download", description: "Save the PDF with pages in reverse order." }
                ]
            },
            {
                name: "Split PDF",
                href: "/split-pdf",
                icon: Scissors,
                description: "Separate pages or split a PDF into smaller files.",
                popular: true,
                tutorialSteps: [
                    { title: "Upload PDF", description: "Upload the PDF you want to split." },
                    { title: "Choose Method", description: "Select 'Split by ranges' or 'Extract all pages'." },
                    { title: "Set Ranges", description: "If splitting by range, define the page numbers (e.g., 1-5)." },
                    { title: "Split & Download", description: "Click 'Split PDF' to download a ZIP file containing your separated PDFs." }
                ]
            },
            {
                name: "Duplicate Pages",
                href: "/duplicate-pages",
                icon: CopyPlus,
                description: "Repeat specific pages multiple times for labels and tickets.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the PDF file." },
                    { title: "Set Copies", description: "Choose to duplicate all pages uniformly, or set custom amounts per page." },
                    { title: "Duplicate", description: "Click to create the duplicated pages." },
                    { title: "Download", description: "Save the extended PDF." }
                ]
            },
            {
                name: "Insert Blank Pages",
                href: "/insert-blank-pages",
                icon: FilePlus2,
                description: "Add blank pages to your PDF for double-sided printing.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select your PDF file." },
                    { title: "Set Positions", description: "Choose to insert after every page, at the end, or at custom page numbers." },
                    { title: "Insert", description: "Click to generate the new document." },
                    { title: "Download", description: "Save the PDF with inserted blank pages." }
                ]
            },
            {
                name: "N-Up PDF",
                href: "/n-up-pdf",
                icon: LayoutGrid,
                description: "Combine multiple pages onto a single sheet (grid print).",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the PDF file." },
                    { title: "Configure Grid", description: "Choose 2-Up, 4-Up, etc., and select the paper size/orientation." },
                    { title: "Combine", description: "Click to combine the pages." },
                    { title: "Download", description: "Save the new grid PDF." }
                ]
            },
            {
                name: "Split in Half",
                href: "/split-in-half",
                icon: SplitSquareHorizontal,
                description: "Cut each page down the middle to create two separate pages.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select your PDF file (e.g., a scanned book)." },
                    { title: "Set Direction", description: "Choose vertical or horizontal split and reading order." },
                    { title: "Split", description: "Click 'Split Pages & Download'." },
                    { title: "Download", description: "Save the separated PDF." }
                ]
            },
            {
                name: "Create Booklet",
                href: "/create-booklet",
                icon: BookOpen,
                description: "Arrange pages side-by-side into printer spreads.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select your PDF file." },
                    { title: "Set Binding", description: "Choose Left or Right binding." },
                    { title: "Arrange", description: "Click 'Create Booklet Spreads'." },
                    { title: "Download", description: "Save the print-ready booklet." }
                ]
            },
        ]
    },
    {
        title: "EDIT PDF",
        color: "purple",
        icon: PenTool,
        description: "Modify, annotate, and customize your PDFs",
        tools: [
            {
                name: "Add TOC to PDF",
                href: "/add-bookmarks",
                icon: List,
                description: "Add a visual Table of Contents page to your PDF.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the PDF file." },
                    { title: "Add Sections", description: "Define your section titles and corresponding page numbers." },
                    { title: "Download", description: "Download your PDF with a new Table of Contents page." }
                ]
            },
            {
                name: "Flatten PDF",
                href: "/flatten-pdf",
                icon: Layers,
                description: "Merge layers and lock annotations permanently.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the PDF with interactive forms or annotations." },
                    { title: "Flatten", description: "Click the button to merge all layers into a single background layer." },
                    { title: "Download", description: "Save the flattened PDF. Contents can no longer be edited." }
                ]
            },
            {
                name: "Grayscale PDF",
                href: "/grayscale-pdf",
                icon: Palette,
                description: "Convert colored PDFs to black and white.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Upload your colored PDF document." },
                    { title: "Convert", description: "The tool processes the file to remove color information." },
                    { title: "Download", description: "Download the high-quality black and white PDF." }
                ]
            },
            {
                name: "Header & Footer",
                href: "/header-footer",
                icon: AlignVerticalSpaceAround,
                description: "Add custom text headers and footers to every page.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Upload the PDF document." },
                    { title: "Configure", description: "Enter the text for your header and footer." },
                    { title: "Apply", description: "Apply the text and download your stamped PDF." }
                ]
            },
            {
                name: "Page Numbers",
                href: "/page-numbers",
                icon: Hash,
                description: "Add page numbers to your document headers/footers.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the PDF requiring page numbers." },
                    { title: "Configure", description: "Choose the position, format, and typography for the numbers." },
                    { title: "Add Numbers", description: "Click to apply page numbering." },
                    { title: "Download", description: "Save your paginated document." }
                ]
            },
            {
                name: "PDF Metadata",
                href: "/pdf-metadata",
                icon: Info,
                description: "View and edit PDF properties and metadata.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Upload the PDF to view its metadata." },
                    { title: "Edit Fields", description: "Modify Title, Author, Subject, Keywords, and other properties." },
                    { title: "Update", description: "Click 'Update Metadata' to save your changes." },
                    { title: "Download", description: "Get the updated PDF file." }
                ]
            },
            {
                name: "Redact PDF",
                href: "/redact-pdf",
                icon: EyeOff,
                description: "Permanently remove sensitive information.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Open the PDF containing sensitive info." },
                    { title: "Mark for Redaction", description: "Select text or areas to black out." },
                    { title: "Redact", description: "Confirm redaction to permanently remove the content." },
                    { title: "Download", description: "Save the secure PDF." }
                ]
            },
            {
                name: "Resize PDF",
                href: "/resize-pdf",
                icon: Maximize2,
                description: "Change PDF page size and margins.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Choose the file you want to resize." },
                    { title: "Select Size", description: "Choose a standard page size (A4, Letter) or set custom dimensions." },
                    { title: "Resize", description: "The tool scales your pages to the new size." },
                    { title: "Download", description: "Download your resized document." }
                ]
            },
            {
                name: "Rotate PDF",
                href: "/rotate-pdf",
                icon: RotateCcw,
                description: "Rotate pages 90, 180, or 270 degrees.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the PDF to rotate." },
                    { title: "Rotate Pages", description: "Rotate individual pages or all pages at once using the buttons." },
                    { title: "Apply", description: "Click 'Apply' to save the new orientation." },
                    { title: "Download", description: "Download your correctly oriented PDF." }
                ]
            },
            {
                name: "Watermark PDF",
                href: "/watermark-pdf",
                icon: Stamp,
                description: "Add text or image watermarks for security.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Upload the document you want to watermark." },
                    { title: "Customize", description: "Enter text or upload an image. Adjust opacity, position, and rotation." },
                    { title: "Stamp", description: "Apply the watermark to all pages." },
                    { title: "Download", description: "Save your watermarked PDF." }
                ]
            },
            {
                name: "Crop PDF",
                href: "/crop-pdf",
                icon: Crop,
                description: "Trim the edges of your PDF pages by setting custom crop margins.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the PDF you want to crop." },
                    { title: "Set Crop Values", description: "Enter how much to trim from the top, bottom, left, and right edges." },
                    { title: "Crop", description: "Click 'Crop & Download' to apply the crop." },
                    { title: "Download", description: "Save your cropped PDF file." }
                ]
            },
            {
                name: "Add Margins",
                href: "/add-margins",
                icon: Expand,
                description: "Add white space margins around PDF pages for printing or binding.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the PDF you want to add margins to." },
                    { title: "Set Margins", description: "Choose uniform or per-side margins and set the desired values." },
                    { title: "Apply", description: "Click 'Add Margins & Download' to create the expanded PDF." },
                    { title: "Download", description: "Save your PDF with new margins." }
                ]
            },
            {
                name: "Scale Pages",
                href: "/scale-pages",
                icon: Scaling,
                description: "Enlarge or shrink the content of your PDF pages.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the PDF you want to scale." },
                    { title: "Set Scale", description: "Choose a percentage (e.g., 80% to shrink) and the alignment." },
                    { title: "Scale", description: "Click 'Scale & Download' to resize the content." },
                    { title: "Download", description: "Save your scaled PDF." }
                ]
            },
            {
                name: "Change Background",
                href: "/change-background",
                icon: Palette,
                description: "Add a solid color behind your PDF content.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select your PDF file." },
                    { title: "Pick Color", description: "Choose a background color (like yellow or dark mode gray)." },
                    { title: "Apply", description: "Click 'Apply Color & Download'." },
                    { title: "Download", description: "Save the colored PDF." }
                ]
            },
        ]
    },
    {
        title: "OPTIMIZE PDF",
        color: "orange",
        icon: Zap,
        description: "Compress, repair, and enhance your documents",
        tools: [
            {
                name: "Compress PDF",
                href: "/compress-pdf",
                icon: FileArchive,
                description: "Reduce file size while maintaining quality.",
                popular: true,
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select your large PDF file." },
                    { title: "Select Quality", description: "Choose between 'Extreme', 'Recommended', or 'Less' compression levels." },
                    { title: "Compress", description: "Click to start the compression engine." },
                    { title: "Download", description: "Download your smaller, optimized PDF." }
                ]
            },
            {
                name: "OCR PDF",
                href: "/ocr-pdf",
                icon: FileSearch,
                description: "Make scanned PDFs searchable and selectable.",
                disabled: true
            },
            {
                name: "Repair PDF",
                href: "/repair-pdf",
                icon: Wrench,
                description: "Recover data from corrupted or damaged PDFs.",
                tutorialSteps: [
                    { title: "Upload File", description: "Upload the corrupt PDF file." },
                    { title: "Repair", description: "Our tool analyzes and attempts to fix the file structure." },
                    { title: "Download", description: "Save the repaired PDF to your device." }
                ]
            },
            {
                name: "Remove Annotations",
                href: "/remove-annotations",
                icon: MessageSquareOff,
                description: "Strip all comments, highlights, and drawings.",
                tutorialSteps: [
                    { title: "Upload File", description: "Select the PDF with annotations." },
                    { title: "Analyze", description: "Review how many annotations are detected." },
                    { title: "Remove", description: "Click to permanently strip all annotations." },
                    { title: "Download", description: "Save the clean PDF." }
                ]
            },
        ]
    },
    {
        title: "PDF SECURITY",
        color: "green",
        icon: Shield,
        description: "Protect, encrypt, and sign your documents",
        tools: [
            {
                name: "Protect PDF",
                href: "/protect-pdf",
                icon: Lock,
                description: "Encrypt your PDF with a strong password.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Choose the PDF you want to secure." },
                    { title: "Set Password", description: "Enter a strong password to encrypt the file." },
                    { title: "Protect", description: "Click 'Protect PDF' to apply encryption." },
                    { title: "Download", description: "Download your password-protected file." }
                ]
            },
            {
                name: "Sign PDF",
                href: "/sign-pdf",
                icon: PenTool,
                description: "Add your digital signature to documents.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the document you need to sign." },
                    { title: "Create Signature", description: "Draw, type, or upload your signature image." },
                    { title: "Place Signature", description: "Drag and drop the signature onto the correct page and position." },
                    { title: "Download", description: "Save the signed document." }
                ]
            },
            {
                name: "Unlock PDF",
                href: "/unlock-pdf",
                icon: Unlock,
                description: "Remove passwords and security restrictions.",
                popular: true,
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the password-protected (encrypted) PDF." },
                    { title: "Unlock", description: "If you know the password, enter it. If user permissions are restricted, the tool removes them." },
                    { title: "Download", description: "Download the unlocked, unrestricted PDF." }
                ]
            },
            {
                name: "Sanitize PDF",
                href: "/sanitize-pdf",
                icon: ShieldCheck,
                description: "Strip all hidden metadata, author info, and timestamps for privacy.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the PDF you want to sanitize." },
                    { title: "Review Metadata", description: "See all metadata fields found in your document." },
                    { title: "Sanitize", description: "Click 'Sanitize PDF' to remove all identifying information." },
                    { title: "Download", description: "Download the clean, anonymous PDF." }
                ]
            },
        ]
    },
    {
        title: "CONVERT TO PDF",
        color: "cyan",
        icon: FileType,
        description: "Transform any document into PDF format",
        tools: [
            {
                name: "Batch Convert (ZIP)",
                href: "/batch-convert",
                icon: FileArchive,
                description: "Upload a ZIP of images and merge them into one PDF.",
                tutorialSteps: [
                    { title: "Upload ZIP", description: "Upload a .zip file containing your image files." },
                    { title: "Convert", description: "We will extract and merge all images." },
                    { title: "Download", description: "Download your unified PDF." }
                ]
            },
            { name: "Excel to PDF", href: "/excel-to-pdf", icon: Table, description: "Convert Excel spreadsheets to PDF format.", disabled: true },
            {
                name: "HTML to PDF",
                href: "/html-to-pdf",
                icon: Globe,
                description: "Save web pages as PDF documents.",
                tutorialSteps: [
                    { title: "Enter URL", description: "Paste the web address (URL) of the page you want to convert." },
                    { title: "Convert", description: "Click 'Convert' to capture the webpage." },
                    { title: "Download", description: "Save the webpage as a PDF document." }
                ]
            },
            {
                name: "JPG to PDF",
                href: "/jpg-to-pdf",
                icon: FileImage,
                description: "Convert images to high-quality PDF documents.",
                popular: true,
                tutorialSteps: [
                    { title: "Upload Images", description: "Select JPG images from your device." },
                    { title: "Adjust", description: "Reorder images or adjust margin and orientation settings." },
                    { title: "Convert", description: "Click to generate the PDF." },
                    { title: "Download", description: "Save your new PDF photo album." }
                ]
            },
            {
                name: "PNG to PDF",
                href: "/png-to-pdf",
                icon: FileImage,
                description: "Convert PNG images to PDF documents.",
                tutorialSteps: [
                    { title: "Upload PNGs", description: "Select PNG images using the file picker." },
                    { title: "Adjust", description: "Reorder images or adjust settings as needed." },
                    { title: "Convert", description: "Click to generate the PDF." },
                    { title: "Download", description: "Save your new PDF." }
                ]
            },
            { name: "PPT to PDF", href: "/ppt-to-pdf", icon: Presentation, description: "Convert PowerPoint presentations to PDF.", disabled: true },
            { name: "RTF to PDF", href: "/rtf-to-pdf", icon: FileText, description: "Convert Rich Text Format files to PDF.", disabled: true },
            {
                name: "TXT to PDF",
                href: "/txt-to-pdf",
                icon: FileText,
                description: "Convert plain text files to PDF documents.",
                tutorialSteps: [
                    { title: "Upload TXT", description: "Select your plain text file." },
                    { title: "Convert", description: "The tool converts the text into a clean PDF document." },
                    { title: "Download", description: "Save your new PDF." }
                ]
            },
            {
                name: "WEBP to PDF",
                href: "/webp-to-pdf",
                icon: FileImage,
                description: "Convert WEBP images to PDF documents.",
                tutorialSteps: [
                    { title: "Upload WEBP", description: "Select WebP images." },
                    { title: "Convert", description: "Click to turn them into a PDF." },
                    { title: "Download", description: "Save the result." }
                ]
            },
            { name: "Word to PDF", href: "/word-to-pdf", icon: FileText, description: "Convert Microsoft Word documents to PDF.", popular: true, disabled: true },
        ]
    },
    {
        title: "CONVERT FROM PDF",
        color: "blue",
        icon: ArrowDownUp,
        description: "Convert PDFs to other formats",
        tools: [
            { name: "Extract Images", href: "/extract-images", icon: ImagePlus, description: "Extract all embedded images and pictures from a PDF document." },
            { name: "Extract Form Data", href: "/extract-form-data", icon: FileJson, description: "Export interactive PDF form data to JSON." },
            { name: "PDF to Excel", href: "/pdf-to-excel", icon: Table, description: "Convert PDF tables and data to Excel spreadsheets.", disabled: true },
            { name: "PDF to GIF", href: "/pdf-to-gif", icon: FileImage, description: "Convert PDF pages into an animated GIF." },
            { name: "PDF to JPG", href: "/pdf-to-jpg", icon: FileImage, description: "Convert PDF pages to high-quality images." },
            {
                name: "PDF to JSON",
                href: "/pdf-to-json",
                icon: FileJson,
                description: "Extract structured text data from PDF into JSON format.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the PDF file to convert." },
                    { title: "Configure", description: "Choose whether to include metadata and page dimensions." },
                    { title: "Convert", description: "Click 'Convert to JSON' to extract the data." },
                    { title: "Download", description: "Preview the JSON output, copy it, or download as a .json file." }
                ]
            },
            {
                name: "PDF to XML",
                href: "/pdf-to-xml",
                icon: FileCode,
                description: "Extract text content and layout from a PDF into XML.",
                tutorialSteps: [
                    { title: "Upload PDF", description: "Select the PDF file to convert." },
                    { title: "Configure", description: "Choose whether to include metadata and coordinates." },
                    { title: "Convert", description: "Click 'Convert to XML'." },
                    { title: "Download", description: "Preview the XML output or download the file." }
                ]
            },
            { name: "PDF to Markdown", href: "/pdf-to-markdown", icon: FileText, description: "Convert PDF documents to Markdown format for easy editing." },
            { name: "PDF to ODT", href: "/pdf-to-odt", icon: FileText, description: "Convert PDF documents to OpenDocument Text format.", disabled: true },
            { name: "PDF to PNG", href: "/pdf-to-png", icon: FileImage, description: "Convert PDF pages to high-quality PNG images." },
            { name: "PDF to PPT", href: "/pdf-to-ppt", icon: Presentation, description: "Convert PDF pages to PowerPoint slides (images).", disabled: true },
            { name: "PDF to RTF", href: "/pdf-to-rtf", icon: FileText, description: "Convert PDF documents to Rich Text Format.", disabled: true },
            { name: "PDF to TXT", href: "/pdf-to-txt", icon: FileText, description: "Extract text content from PDF documents." },
            { name: "PDF to WebP", href: "/pdf-to-webp", icon: FileImage, description: "Convert PDF pages to modern WebP images.", disabled: true },
            { name: "PDF to Word", href: "/pdf-to-word", icon: FileText, description: "Convert PDF documents to editable Word files.", popular: true, disabled: true },
        ]
    },
    {
        title: "DATA & FINANCE",
        color: "yellow",
        icon: Table,
        description: "Convert between spreadsheet, data, and financial formats",
        tools: [
            { name: "CSV to Excel", href: "/csv-to-excel", icon: Table, description: "Convert CSV files to Excel spreadsheets.", disabled: true },
            { name: "Excel to CSV", href: "/excel-to-csv", icon: Table, description: "Convert Excel spreadsheets to CSV format.", disabled: true },
            { name: "Invoice Extractor", href: "/invoice-extractor", icon: Receipt, description: "Automatically extract data from invoices.", disabled: true },
            { name: "Bank Statement Analyzer", href: "/bank-statement-analyzer", icon: Landmark, description: "AI-powered analysis of bank statement PDFs.", disabled: true },
            { name: "Bank Statement Converter", href: "/bank-statement-converter", icon: Landmark, description: "Convert bank statements between PDF, CSV, and Excel formats.", disabled: true },
        ]
    },
    {
        title: "ENCODING & BINARY",
        color: "indigo",
        icon: Binary,
        description: "Encode and decode files using Base64 binary format",
        tools: [
            { name: "Binary to JPG", href: "/binary-to-jpg", icon: Binary, description: "Restore a JPG image from a Base64-encoded binary text file." },
            { name: "Binary to PDF", href: "/binary-to-pdf", icon: Binary, description: "Restore a PDF from a Base64-encoded binary text file." },
            { name: "Binary to TXT", href: "/binary-to-txt", icon: Binary, description: "Restore a text file from a Base64-encoded binary text file." },
            { name: "JPG to Binary", href: "/jpg-to-binary", icon: Binary, description: "Convert JPG images to Base64 binary text for safe storage." },
            { name: "PDF to Binary", href: "/pdf-to-binary", icon: Binary, description: "Convert PDF to Base64 binary text for safe storage." },
            { name: "TXT to Binary", href: "/txt-to-binary", icon: Binary, description: "Convert text files to Base64 binary text for safe storage." },
        ]
    },
    {
        title: "VIEW & COMPARE",
        color: "lime",
        icon: Eye,
        description: "View and compare PDF documents side by side",
        tools: [
            { name: "Compare PDF", href: "/compare-pdf", icon: GitCompare, description: "Compare two PDFs side-by-side for differences." },
            { name: "Extract Links", href: "/extract-links", icon: Link2, description: "Easily extract all hyperlinks and URLs from a PDF document." },
            { name: "Legal Comparison", href: "/legal-comparison", icon: Scale, description: "Compare legal documents for modifications." },
            { name: "Page Size Detector", href: "/page-size-detector", icon: Scaling, description: "Analyze your PDF to find the exact dimensions of every page." },
            { name: "View PDF", href: "/view-pdf", icon: Eye, description: "Read and view PDF documents online." },
        ]
    },
];

// All tools flattened for search
export const allTools = sections.flatMap(section =>
    section.tools
        .filter(tool => !tool.disabled)
        .map(tool => ({ ...tool, sectionColor: section.color, sectionTitle: section.title }))
);

// Popular tools pulled from all sections
export const popularTools = sections.flatMap(section =>
    section.tools
        .filter(tool => tool.popular && !tool.disabled)
        .map(tool => ({ ...tool, sectionColor: section.color, sectionTitle: section.title }))
);

// Feature badges for hero section
export const features = [
    { icon: Sparkles, text: "100% Free", color: "bg-[#A3E635]" },
    { icon: Zap, text: "Lightning Fast", color: "bg-[#FB923C]" },
    { icon: MessageSquare, text: "Chat with PDF", color: "bg-[#22D3EE]" },
];

// Find the section a tool belongs to by its href
export function getSectionForTool(href: string) {
    for (const section of sections) {
        const tool = section.tools.find(t => t.href === href);
        if (tool) return { section, tool };
    }
    return null;
}

// Get related tools (same category, excluding current tool)
export function getRelatedTools(href: string, limit = 4) {
    const result = getSectionForTool(href);
    if (!result) return [];
    return result.section.tools
        .filter(t => t.href !== href && !t.disabled)
        .slice(0, limit)
        .map(t => ({ ...t, sectionColor: result.section.color, sectionTitle: result.section.title }));
}
