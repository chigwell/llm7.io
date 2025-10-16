"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import {
  RefreshCw,
  Copy,
  Check,
  Terminal,
  Eye,
  Maximize2,
  Minimize2,
  Info,
  Sparkles,
  Code2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/buttonShadcn";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import parser from "html-react-parser";
import type { ComponentPropsInfo } from "@/lib/TsASTAbstractionForDoc";
import { useIsMobile } from "@/hooks/use-mobile";

interface ComponentShowcaseProps {
  componentName: string;
  description?: string | React.JSX.Element | React.JSX.Element[];
  component: React.ComponentType<Record<string, unknown>>;
  defaultProps?: Record<string, unknown>;
  codeString: string;
  propsInfo?: ComponentPropsInfo | null;
}

interface ComponentShowCaseTableProps {
  components: ComponentShowcaseProps[];
}

export default function ComponentShowCaseTable({
  components,
}: ComponentShowCaseTableProps) {
  const [refreshKeys, setRefreshKeys] = useState<Record<number, number>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<number, boolean>
  >({});
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const truncateDescription = (
    description: string | React.JSX.Element | React.JSX.Element[] | undefined,
    wordLimit = 25
  ): {
    content: string | React.JSX.Element | React.JSX.Element[];
    isTruncated: boolean;
  } => {
    if (!description)
      return { content: "No description available", isTruncated: false };

    if (typeof description === "string") {
      const words = description.split(" ");
      if (words.length <= wordLimit)
        return { content: description, isTruncated: false };
      return {
        content: words.slice(0, wordLimit).join(" ") + "...",
        isTruncated: true,
      };
    }

    // For JSX elements, extract text content for length checking
    const extractText = (
      element: React.JSX.Element | React.JSX.Element[]
    ): string => {
      if (Array.isArray(element)) {
        return element.map(extractText).join(" ");
      }
      if (typeof element === "object" && element.props?.children) {
        if (typeof element.props.children === "string") {
          return element.props.children;
        }
        if (Array.isArray(element.props.children)) {
          return element.props.children
            .map((child: unknown) => (typeof child === "string" ? child : ""))
            .join(" ");
        }
      }
      return "";
    };

    const textContent = extractText(description);
    const words = textContent.split(" ").filter(Boolean);

    if (words.length <= wordLimit)
      return { content: description, isTruncated: false };
    return {
      content: words.slice(0, wordLimit).join(" ") + "...",
      isTruncated: true,
    };
  };

  const toggleDescription = useCallback((index: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  const handleRefresh = useCallback((componentIndex: number) => {
    setIsRefreshing(true);
    setRefreshKeys((prev) => ({
      ...prev,
      [componentIndex]: (prev[componentIndex] || 0) + 1,
    }));
    setTimeout(() => setIsRefreshing(false), 800);
  }, []);

  const handleCopyCode = useCallback((code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const toggleFullscreen = useCallback(
    (index: number) => {
      setFullscreenIndex(fullscreenIndex === index ? null : index);
    },
    [fullscreenIndex]
  );

  if (components.length === 0) {
    return (
      <Card className="border-dashed border-2 animate-in fade-in-50 duration-500 bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-950/30">
        <CardContent className="p-8 sm:p-12 text-center">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mb-6 animate-in zoom-in-50 duration-700 delay-200 shadow-lg">
            <Code2 className="h-10 w-10 sm:h-12 sm:w-12" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-3 animate-in slide-in-from-bottom-4 duration-500 delay-300 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            No Components Found
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base animate-in slide-in-from-bottom-4 duration-500 delay-500 max-w-md mx-auto">
            No components available to showcase at this time. Add some
            components to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`${isMobile ? "space-y-4" : "space-y-6 sm:space-y-8"}`}>
      {components.map((comp, index) => {
        const { content: descriptionContent, isTruncated } =
          truncateDescription(
            typeof comp.description === "string"
              ? parser(comp.description)
              : comp.description || "No description available",
            25
          );
        const isExpanded = expandedDescriptions[index];
        const displayDescription = isExpanded
          ? typeof comp.description === "string"
            ? parser(comp.description)
            : comp.description
          : descriptionContent;

        return (
          <Card
            key={`${comp.componentName}-${refreshKeys[index] || 0}-${index}`}
            className={`group overflow-hidden transition-all duration-500 ease-out animate-in slide-in-from-bottom-8 fade-in-0 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 border-0 shadow-lg hover:shadow-2xl backdrop-blur-sm ${
              fullscreenIndex === index
                ? "fixed inset-2 sm:inset-4 z-50 shadow-2xl scale-100 rounded-xl"
                : "hover:-translate-y-1 hover:scale-[1.01]"
            }`}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: "both",
            }}
          >
            <CardHeader
              className={`border-b bg-gradient-to-r from-slate-50/80 via-white to-blue-50/50 dark:from-slate-800/80 dark:via-slate-900 dark:to-blue-950/50 transition-all duration-300 ${
                isMobile ? "p-3" : "p-4 sm:p-6"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 transition-colors duration-200 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 dark:from-slate-100 dark:via-blue-200 dark:to-purple-300 bg-clip-text text-transparent">
                      <span className="break-words">{comp.componentName}</span>
                    </CardTitle>
                  </div>
                  <div className="space-y-2">
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed animate-in fade-in-50 slide-in-from-left-4 duration-400 delay-300">
                      {displayDescription}
                    </CardDescription>
                    {isTruncated && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDescription(index)}
                        className="h-auto p-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Show more
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFullscreen(index)}
                    className="shrink-0 transition-all duration-200 hover:scale-110 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl p-2"
                  >
                    <div
                      className={`transition-transform duration-300 ${
                        fullscreenIndex === index ? "rotate-180" : ""
                      }`}
                    >
                      {fullscreenIndex === index ? (
                        <Minimize2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Maximize2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      )}
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "sm"}
                    onClick={() => handleRefresh(index)}
                    className="shrink-0 transition-all duration-200 hover:scale-105 hover:shadow-md bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50 rounded-xl"
                    disabled={isRefreshing}
                  >
                    <RefreshCw
                      className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} ${
                        isMobile ? "mr-1" : "mr-2"
                      } transition-transform duration-500 text-blue-600 dark:text-blue-400 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    <span className={isMobile ? "text-xs" : "text-sm"}>
                      Refresh
                    </span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs defaultValue="preview" className="w-full">
                <div className="border-b bg-gradient-to-r from-slate-50/50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-950/30">
                  <TabsList className={`${isMobile ? "h-10" : "h-12 sm:h-14"} w-full justify-start rounded-none bg-transparent p-0 overflow-x-auto`}>
                    <TabsTrigger
                      value="preview"
                      className={`data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm border-b-2 border-transparent data-[state=active]:border-blue-500 rounded-none ${isMobile ? "h-10 px-3" : "h-12 sm:h-14 px-4 sm:px-8"} ${isMobile ? "text-xs" : "text-xs sm:text-sm"} font-medium transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group whitespace-nowrap`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 translate-y-full group-data-[state=active]:translate-y-0 transition-transform duration-300"></div>
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 relative z-10" />
                      <span className="relative z-10">Preview</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="code"
                      className={`data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm border-b-2 border-transparent data-[state=active]:border-blue-500 rounded-none ${isMobile ? "h-10 px-3" : "h-12 sm:h-14 px-4 sm:px-8"} ${isMobile ? "text-xs" : "text-xs sm:text-sm"} font-medium transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group whitespace-nowrap`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 translate-y-full group-data-[state=active]:translate-y-0 transition-transform duration-300"></div>
                      <Terminal className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 relative z-10" />
                      <span className="relative z-10">Code</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="props"
                      className={`data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm border-b-2 border-transparent data-[state=active]:border-blue-500 rounded-none ${isMobile ? "h-10 px-3" : "h-12 sm:h-14 px-4 sm:px-8"} ${isMobile ? "text-xs" : "text-xs sm:text-sm"} font-medium transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group whitespace-nowrap`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 translate-y-full group-data-[state=active]:translate-y-0 transition-transform duration-300"></div>
                      <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 relative z-10" />
                      <span className="relative z-10">Props</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="preview"
                  className="m-0 border-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-400"
                >
                  <div className={`${isMobile ? "p-3" : "p-4 sm:p-8"}`}>
                                          <div className={`flex flex-col sm:flex-row sm:items-center justify-between ${isMobile ? "mb-3 gap-2" : "mb-4 sm:mb-6 gap-3"}`}>
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-semibold text-foreground">
                          Live Component Preview
                        </h4>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs animate-in zoom-in-50 duration-300 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800 w-fit"
                      >
                        Refreshed: {refreshKeys[index] || 0} times
                      </Badge>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out"></div>
                      <div className="relative rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-blue-950/30 backdrop-blur-sm transition-all duration-300 group-hover:border-blue-300 dark:group-hover:border-blue-600 group-hover:shadow-xl overflow-hidden">
                        <div
                          key={refreshKeys[index] || 0}
                          className={`w-full transition-all duration-500 animate-in zoom-in-50 fade-in-0 ${isMobile ? "p-3" : "p-4 sm:p-8"}`}
                        >
                          {isClient && (
                            <div className="w-full overflow-auto">
                              <comp.component {...(comp.defaultProps || {})} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="code"
                  className="m-0 border-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-400"
                >
                  <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 transition-colors duration-200 gap-3">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <div className="p-1 rounded bg-gradient-to-br from-blue-500 to-purple-600">
                            <Code2 className="h-3 w-3 text-white" />
                          </div>
                          Source Code
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-xs animate-in zoom-in-50 duration-300 delay-100 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50"
                        >
                          TypeScript
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs animate-in zoom-in-50 duration-300 delay-200"
                        >
                          {comp.codeString.split("\n").length} lines
                        </Badge>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleCopyCode(comp.codeString, index)}
                        className={`h-9 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md rounded-xl ${
                          copiedIndex === index
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        }`}
                      >
                        <div className="flex items-center transition-all duration-200">
                          {copiedIndex === index ? (
                            <>
                              <Check className="h-3 w-3 mr-2 animate-in zoom-in-50 duration-200" />
                              <span className="animate-in slide-in-from-right-2 duration-200 text-xs sm:text-sm">
                                Copied!
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-2" />
                              <span className="text-xs sm:text-sm">Copy</span>
                            </>
                          )}
                        </div>
                      </Button>
                    </div>

                    <div className="relative overflow-hidden animate-in fade-in-50 duration-500 delay-200">
                      {isClient && (
                        <>
                          <div
                            className={`overflow-auto ${
                              isMobile
                                ? "max-h-64"
                                : "max-h-96 sm:max-h-[600px]"
                            }`}
                          >
                            <SyntaxHighlighter
                              language="typescript"
                              customStyle={{
                                margin: 0,
                                borderRadius: 0,
                                fontSize: isMobile ? "10px" : "12px",
                                lineHeight: isMobile ? "1.4" : "1.5",
                                padding: isMobile ? "12px" : "24px",
                                backgroundColor: "transparent",
                                color: "var(--foreground)",
                              }}
                              showLineNumbers={!isMobile}
                              lineNumberStyle={{
                                minWidth: isMobile ? "2em" : "3em",
                                paddingRight: isMobile ? "0.5em" : "1em",
                                color: "var(--muted-foreground)",
                                userSelect: "none",
                                fontSize: isMobile ? "9px" : "11px",
                              }}
                              codeTagProps={{
                                className:
                                  "dark:text-white text-black font-mono",
                                style: {
                                  fontFamily:
                                    "JetBrains Mono, Consolas, Monaco, 'Courier New', monospace",
                                },
                              }}
                              wrapLongLines={true}
                              PreTag={({ children, ...props }) => (
                                <pre
                                  {...props}
                                  className="dark:bg-slate-950 bg-slate-50 dark:text-white text-black font-mono transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                                  style={{
                                    fontFamily:
                                      "JetBrains Mono, Consolas, Monaco, 'Courier New', monospace",
                                  }}
                                >
                                  {children}
                                </pre>
                              )}
                            >
                              {comp.codeString}
                            </SyntaxHighlighter>
                          </div>
                          <style jsx global>{`
                            pre code span,
                            .hljs span,
                            .token {
                              background: transparent !important;
                            }
                          `}</style>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="props"
                  className="m-0 border-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-400"
                >
                  <div className="p-4 sm:p-8">
                    <div className="space-y-6">
                      {/* Props Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                        <h4 className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-blue-700 dark:from-slate-100 dark:to-blue-300 bg-clip-text text-transparent">
                          Component Props
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs animate-in zoom-in-50 duration-300 delay-100 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800"
                          >
                            {comp.propsInfo?.props?.length
                              ? (() => {
                                  const requiredCount =
                                    comp.propsInfo.props.filter(
                                      (p) => p.required
                                    ).length;
                                  const optionalCount =
                                    comp.propsInfo.props.filter(
                                      (p) => !p.required
                                    ).length;
                                  return `${comp.propsInfo.props.length} props (${requiredCount} required, ${optionalCount} optional)`;
                                })()
                              : comp.defaultProps &&
                                Object.keys(comp.defaultProps).length > 0
                              ? `${
                                  Object.keys(comp.defaultProps).length
                                } default props`
                              : "No props"}
                          </Badge>
                          {comp.propsInfo?.propsInterfaceName && (
                            <Badge
                              variant="secondary"
                              className="text-xs animate-in zoom-in-50 duration-300 delay-200 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50"
                            >
                              {comp.propsInfo.propsInterfaceName}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Component Description */}
                      {comp.propsInfo?.description && (
                        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 animate-in slide-in-from-top-4 duration-500">
                          <h5 className="text-sm font-medium mb-3 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Component Description
                          </h5>
                          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                            {comp.propsInfo.description}
                          </p>
                        </div>
                      )}

                      {/* Props Interface Definition */}
                      {comp.propsInfo?.propsInterfaceName &&
                        comp.propsInfo.props &&
                        comp.propsInfo.props.length > 0 && (
                          <div className="space-y-4 mb-8">
                            <h5 className="text-md font-medium flex items-center gap-2">
                              <div className="p-1 rounded bg-gradient-to-br from-green-500 to-emerald-600">
                                <Code2 className="h-3 w-3 text-white" />
                              </div>
                              Interface Definition
                            </h5>
                            <div className="relative group">
                              <div className="absolute top-3 right-3 z-10">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const interfaceCode = `interface ${
                                      comp.propsInfo?.propsInterfaceName
                                    } {${
                                      comp.propsInfo?.extendsFrom &&
                                      comp.propsInfo.extendsFrom.length > 0
                                        ? `\n  // extends ${comp.propsInfo.extendsFrom.join(
                                            ", "
                                          )}`
                                        : ""
                                    }
${comp.propsInfo?.props
  ?.map(
    (prop) =>
      `  ${prop.description ? `/** ${prop.description} */\n  ` : ""}${
        prop.name
      }${prop.required ? "" : "?"}: ${prop.type};`
  )
  .join("\n")}
}`;
                                    handleCopyCode(interfaceCode, index);
                                  }}
                                  className={`h-8 text-xs transition-all duration-300 hover:scale-105 rounded-lg ${
                                    copiedIndex === index
                                      ? "bg-green-600 hover:bg-green-700 text-white"
                                      : "bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800"
                                  }`}
                                >
                                  {copiedIndex === index ? (
                                    <>
                                      <Check className="h-3 w-3 mr-1" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copy
                                    </>
                                  )}
                                </Button>
                              </div>
                              <div className="rounded-xl border bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 overflow-hidden shadow-lg">
                                <div className="bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-900 dark:to-blue-950 px-4 py-3 border-b">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs font-mono bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50"
                                    >
                                      TypeScript
                                    </Badge>
                                    <span className="text-sm font-mono text-muted-foreground">
                                      {comp.propsInfo.propsInterfaceName}
                                    </span>
                                  </div>
                                </div>
                                <div
                                  className={`${
                                    isMobile ? "p-2" : "p-4"
                                  } font-mono ${
                                    isMobile ? "text-xs" : "text-xs sm:text-sm"
                                  } overflow-x-auto`}
                                >
                                  <div className="text-blue-600 dark:text-blue-400">
                                    interface{" "}
                                    <span className="text-green-600 dark:text-green-400 font-semibold">
                                      {comp.propsInfo.propsInterfaceName}
                                    </span>
                                    {comp.propsInfo.extendsFrom &&
                                      comp.propsInfo.extendsFrom.length > 0 && (
                                        <span className="text-purple-600 dark:text-purple-400">
                                          {" extends "}
                                          <span className="text-orange-600 dark:text-orange-400">
                                            {comp.propsInfo.extendsFrom.join(
                                              ", "
                                            )}
                                          </span>
                                        </span>
                                      )}
                                    {" {"}
                                  </div>
                                  <div className="ml-2 sm:ml-4 mt-2 space-y-2">
                                    {comp.propsInfo.props.map((prop) => (
                                      <div
                                        key={prop.name}
                                        className="group hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded transition-colors"
                                      >
                                        {prop.description && (
                                          <div className="text-green-600 dark:text-green-400 text-xs mb-1 italic">
                                            {`/** ${prop.description} */`}
                                          </div>
                                        )}
                                        <div className="flex flex-wrap items-center gap-1">
                                          <span
                                            className={`font-semibold ${
                                              prop.required
                                                ? "text-red-600 dark:text-red-400"
                                                : "text-blue-600 dark:text-blue-400"
                                            }`}
                                          >
                                            {prop.name}
                                          </span>
                                          <span
                                            className={`${
                                              prop.required
                                                ? "text-red-500 dark:text-red-500 font-bold"
                                                : "text-blue-500 dark:text-blue-500"
                                            }`}
                                          >
                                            {prop.required ? "" : "?"}
                                          </span>
                                          <span className="text-gray-600 dark:text-gray-400">
                                            :{" "}
                                          </span>
                                          <span className="text-orange-600 dark:text-orange-400 font-medium break-all">
                                            {prop.type}
                                          </span>
                                          <span className="text-gray-600 dark:text-gray-400">
                                            ;
                                          </span>
                                          {prop.required && (
                                            <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded dark:bg-red-900/30 dark:text-red-300">
                                              required
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="text-blue-600 dark:text-blue-400 mt-2">
                                    {"}"}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Separator className="my-6 animate-in fade-in-50 duration-500 delay-200" />
                          </div>
                        )}

                      {/* AST-extracted Props */}
                      {comp.propsInfo?.props &&
                      comp.propsInfo.props.length > 0 ? (
                        <div className="space-y-4">
                          <h5 className="text-md font-medium flex items-center gap-2">
                            <div className="p-1 rounded bg-gradient-to-br from-purple-500 to-pink-600">
                              <Sparkles className="h-3 w-3 text-white" />
                            </div>
                            Detailed Props Information
                          </h5>

                          <div className="grid gap-4">
                            {comp.propsInfo.props.map((prop, propIndex) => (
                              <div
                                key={prop.name}
                                className="group p-4 sm:p-6 rounded-xl border bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 hover:from-blue-50/50 hover:to-purple-50/30 dark:hover:from-blue-950/30 dark:hover:to-purple-950/20 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-in slide-in-from-left-4 fade-in-0 shadow-sm"
                                style={{
                                  animationDelay: `${propIndex * 100}ms`,
                                  animationFillMode: "both",
                                }}
                              >
                                <div className="space-y-3">
                                  {/* Prop Header */}
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="space-y-2 flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <code className="text-sm font-mono font-bold text-primary transition-colors duration-200 group-hover:text-primary/80 break-all">
                                          {prop.name}
                                        </code>
                                        {prop.required ? (
                                          <Badge
                                            variant="destructive"
                                            className="text-xs bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                                          >
                                            required
                                          </Badge>
                                        ) : (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700"
                                          >
                                            optional
                                          </Badge>
                                        )}
                                        {prop.isUnion && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
                                          >
                                            union
                                          </Badge>
                                        )}
                                      </div>

                                      {/* Type Information */}
                                      <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="text-xs text-muted-foreground">
                                            Type:
                                          </span>
                                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                                            {prop.type}
                                          </code>
                                        </div>

                                        {/* Union Types */}
                                        {prop.unionTypes &&
                                          prop.unionTypes.length > 0 && (
                                            <div className="flex flex-wrap items-start gap-2">
                                              <span className="text-xs text-muted-foreground mt-1">
                                                Options:
                                              </span>
                                              <div className="flex flex-wrap gap-1">
                                                {prop.unionTypes.map(
                                                  (unionType, idx) => (
                                                    <Badge
                                                      key={idx}
                                                      variant="outline"
                                                      className="text-xs font-mono"
                                                    >
                                                      {unionType}
                                                    </Badge>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}

                                        {/* Enum Values */}
                                        {prop.enumValues &&
                                          prop.enumValues.length > 0 && (
                                            <div className="flex flex-wrap items-start gap-2">
                                              <span className="text-xs text-muted-foreground mt-1">
                                                Values:
                                              </span>
                                              <div className="flex flex-wrap gap-1">
                                                {prop.enumValues.map(
                                                  (enumValue, idx) => (
                                                    <Badge
                                                      key={idx}
                                                      variant="secondary"
                                                      className="text-xs font-mono"
                                                    >
                                                      {enumValue}
                                                    </Badge>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    </div>

                                    {/* Default Value */}
                                    {prop.defaultValue !== undefined && (
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                          variant="default"
                                          className="text-xs font-mono bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 transition-all duration-200 group-hover:scale-105"
                                        >
                                          default
                                        </Badge>
                                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-green-700 dark:text-green-300 break-all">
                                          {typeof prop.defaultValue === "string"
                                            ? `"${prop.defaultValue}"`
                                            : JSON.stringify(prop.defaultValue)}
                                        </code>
                                      </div>
                                    )}
                                  </div>

                                  {/* Description */}
                                  {prop.description && (
                                    <div className="pt-3 border-t border-dashed">
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {prop.description}
                                      </p>
                                    </div>
                                  )}

                                  {/* Tags */}
                                  {prop.tags && prop.tags.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 pt-2">
                                      <span className="text-xs text-muted-foreground">
                                        Tags:
                                      </span>
                                      {prop.tags.map((tag, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          @{tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <Separator className="my-6 animate-in fade-in-50 duration-500 delay-300" />
                        </div>
                      ) : null}

                      {/* Fallback to Default Props */}
                      {(!comp.propsInfo?.props ||
                        comp.propsInfo.props.length === 0) &&
                      comp.defaultProps &&
                      Object.keys(comp.defaultProps).length > 0 ? (
                        <div className="space-y-4">
                          <h5 className="text-md font-medium flex items-center gap-2">
                            <div className="p-1 rounded bg-gradient-to-br from-orange-500 to-red-600">
                              <Terminal className="h-3 w-3 text-white" />
                            </div>
                            Default Props (Fallback)
                          </h5>

                          <div className="grid gap-3">
                            {Object.entries(comp.defaultProps).map(
                              ([key, value], propIndex) => (
                                <div
                                  key={key}
                                  className="group p-4 rounded-lg border bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 hover:from-orange-50/50 hover:to-red-50/30 dark:hover:from-orange-950/30 dark:hover:to-red-950/20 transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-in slide-in-from-left-4 fade-in-0"
                                  style={{
                                    animationDelay: `${propIndex * 100}ms`,
                                    animationFillMode: "both",
                                  }}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="space-y-1 flex-1 min-w-0">
                                      <code className="text-sm font-mono font-semibold text-primary transition-colors duration-200 group-hover:text-primary/80 break-all">
                                        {key}
                                      </code>
                                      <p className="text-xs text-muted-foreground">
                                        Type: {typeof value}
                                      </p>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs font-mono transition-all duration-200 group-hover:scale-105 break-all"
                                    >
                                      {typeof value === "string"
                                        ? `"${value}"`
                                        : typeof value === "function"
                                        ? "function"
                                        : JSON.stringify(value)}
                                    </Badge>
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          <Separator className="my-6 animate-in fade-in-50 duration-500 delay-300" />
                        </div>
                      ) : null}

                      {/* Extends Information */}
                      {comp.propsInfo?.extendsFrom &&
                        comp.propsInfo.extendsFrom.length > 0 && (
                          <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 animate-in slide-in-from-bottom-4 duration-500 delay-500">
                            <h5 className="text-sm font-medium mb-3 text-green-900 dark:text-green-100 flex items-center gap-2">
                              <Code2 className="h-4 w-4" />
                              Extends
                            </h5>
                            <div className="flex gap-2 flex-wrap">
                              {comp.propsInfo.extendsFrom.map((extend, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs font-mono text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/30"
                                >
                                  {extend}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Examples */}
                      {comp.propsInfo?.examples &&
                        comp.propsInfo.examples.length > 0 && (
                          <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 animate-in slide-in-from-bottom-4 duration-500 delay-600">
                            <h5 className="text-sm font-medium mb-4 text-purple-900 dark:text-purple-100 flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Examples
                            </h5>
                            <div className="space-y-3">
                              {comp.propsInfo.examples.map((example, idx) => (
                                <div key={idx} className="relative group">
                                  <pre className="text-xs sm:text-sm bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg border overflow-x-auto font-mono">
                                    <code>{example}</code>
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* No Props State */}
                      {(!comp.propsInfo?.props ||
                        comp.propsInfo.props.length === 0) &&
                        (!comp.defaultProps ||
                          Object.keys(comp.defaultProps).length === 0) && (
                          <div className="text-center py-8 sm:py-12 animate-in fade-in-50 zoom-in-95 duration-500">
                            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 animate-in zoom-in-50 duration-700 delay-200 shadow-lg">
                              <Info className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h5 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 animate-in slide-in-from-bottom-4 duration-500 delay-300 bg-gradient-to-r from-slate-900 to-blue-700 dark:from-slate-100 dark:to-blue-300 bg-clip-text text-transparent">
                              No Props Required
                            </h5>
                            <p className="text-muted-foreground text-sm sm:text-base animate-in slide-in-from-bottom-4 duration-500 delay-500 max-w-md mx-auto">
                              This component doesn&apos;t require any props to
                              function. It works out of the box!
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
