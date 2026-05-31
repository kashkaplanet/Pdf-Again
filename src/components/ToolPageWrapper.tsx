"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";
import { RETRO_COLORS, RetroVariant } from "@/config/design";
import { getRelatedTools, getSectionForTool } from "@/config/tools";
import { usePathname } from "next/navigation";
import { toolContent } from "@/config/tool-content";
import { ToolContentSection } from "@/components/ToolContentSection";

interface ToolPageWrapperProps {
    title: string;
    description: string;
    icon: LucideIcon;
    color: RetroVariant;
    children: React.ReactNode;
}

export function ToolPageWrapper({ title, description, icon: Icon, color, children }: ToolPageWrapperProps) {
    const colorClasses = RETRO_COLORS[color] || RETRO_COLORS.default;
    const pathname = usePathname();
    const sectionInfo = getSectionForTool(pathname);
    const relatedTools = getRelatedTools(pathname, 4);

    const toolContentData = toolContent[pathname.replace(/^\//, "")] || toolContent[pathname.replace(/^\/.*?\//, "")];

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Breadcrumbs */}
            <div className="mb-6">
                <nav className="flex items-center gap-1 text-sm font-display mb-4 flex-wrap">
                    <Link
                        href="/"
                        className="text-gray-500 hover:text-black transition-colors"
                    >
                        Home
                    </Link>
                    {sectionInfo && (
                        <>
                            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                            <Link
                                href={`/#${sectionInfo.section.title.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                                className="text-gray-500 hover:text-black transition-colors"
                            >
                                {sectionInfo.section.title}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="text-black font-bold truncate">{title}</span>
                </nav>

                <div className="flex items-center gap-4">
                    <div className={`p-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${colorClasses.bg}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display uppercase tracking-wide">
                            {title}
                        </h1>
                        <p className="text-gray-600 font-sans mt-1">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            {children}

            {/* Rich Content Section (How-to, Features, FAQ) */}
            {toolContentData && !["ORGANIZE PDF", "EDIT PDF", "OPTIMIZE PDF", "PDF SECURITY", "CONVERT TO PDF", "CONVERT FROM PDF", "ENCODING & BINARY", "VIEW & COMPARE"].includes(sectionInfo?.section.title || "") && <ToolContentSection content={toolContentData} />}

            {/* Related Tools */}
            {relatedTools.length > 0 && (
                <div className="mt-12 pt-6 border-t-2 border-gray-200">
                    <h3 className="text-xl font-display uppercase tracking-wide mb-4 flex items-center gap-2">
                        <div className={`w-2 h-6 ${colorClasses.bg}`} />
                        Related Tools
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {relatedTools.map((tool) => {
                            const ToolIcon = tool.icon;
                            const toolColors = RETRO_COLORS[tool.sectionColor as keyof typeof RETRO_COLORS] || RETRO_COLORS.default;
                            return (
                                <Link
                                    key={tool.name}
                                    href={tool.href}
                                    className="group flex items-center gap-3 p-3 bg-white border-2 border-black
                                               shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                                               hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                                               hover:translate-x-[2px] hover:translate-y-[2px]
                                               transition-all duration-200"
                                >
                                    <div className={`p-1.5 border-2 border-black shrink-0 ${toolColors.bg}`}>
                                        <ToolIcon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-display text-sm tracking-wide group-hover:translate-x-0.5 transition-transform truncate">
                                            {tool.name}
                                        </div>
                                        <div className="text-xs text-gray-500 font-sans truncate">
                                            {tool.description}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
