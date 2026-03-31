"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Download, ExternalLink, FileSpreadsheet, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportedFile {
  filename: string;
  size: number;
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function extractTimestamp(filename: string): string {
  // testcases_20260331_144502.xlsx -> 2026-03-31 14:45:02
  const match = filename.match(/testcases_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
  }
  return filename;
}

export function ExcelExportPanel() {
  const [files, setFiles] = useState<ExportedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exports");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error("Failed to fetch export files:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchFiles();
    }
  }, [open, fetchFiles]);

  // 自动轮询：面板打开时每 10 秒刷新一次
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(fetchFiles, 10000);
    return () => clearInterval(interval);
  }, [open, fetchFiles]);

  const handleDownload = useCallback((filename: string) => {
    const link = document.createElement("a");
    link.href = `/api/exports/${encodeURIComponent(filename)}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleDelete = useCallback(
    async (filename: string) => {
      try {
        const res = await fetch(`/api/exports/${encodeURIComponent(filename)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setFiles((prev) => prev.filter((f) => f.filename !== filename));
        }
      } catch (err) {
        console.error("Failed to delete file:", err);
      }
    },
    []
  );

  const handleOpenFile = useCallback(async (filename: string) => {
    try {
      const res = await fetch(
        `/api/exports/${encodeURIComponent(filename)}/open`,
        { method: "POST" }
      );
      if (!res.ok) {
        const data = await res.json();
        console.error("Failed to open file:", data.error);
      }
    } catch (err) {
      console.error("Failed to open file:", err);
    }
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative"
          id="export-records-btn"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          导出记录
          {files.length > 0 && (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2F6868] px-1 text-[10px] text-white">
              {files.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[420px] sm:w-[480px]" side="right">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[#2F6868]" />
              导出记录
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchFiles}
              disabled={loading}
              className="h-8 w-8"
            >
              <RefreshCw
                className={cn("h-4 w-4", loading && "animate-spin")}
              />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileSpreadsheet className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm">暂无导出记录</p>
              <p className="mt-1 text-xs opacity-60">
                生成测试用例后将自动导出 Excel
              </p>
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.filename}
                className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#2F6868]/10">
                  <FileSpreadsheet className="h-5 w-5 text-[#2F6868]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {file.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {extractTimestamp(file.filename)} · {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-500 hover:text-blue-600"
                    onClick={() => handleOpenFile(file.filename)}
                    title="打开文件"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#2F6868] hover:text-[#2F6868]"
                    onClick={() => handleDownload(file.filename)}
                    title="下载"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(file.filename)}
                    title="删除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
