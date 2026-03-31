/**
 * 在本地默认应用中打开 Excel 文件
 * 使用系统 open 命令（macOS）打开指定的导出文件
 */
import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const EXPORTS_DIR = path.resolve(
  process.cwd(),
  "../ai-test-agent-system/exports"
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // 安全检查
    const sanitized = path.basename(filename);
    if (!sanitized.endsWith(".xlsx") || !sanitized.startsWith("testcases_")) {
      return NextResponse.json({ error: "无效的文件名" }, { status: 400 });
    }

    const filepath = path.join(EXPORTS_DIR, sanitized);

    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    // macOS 使用 open 命令打开文件
    return new Promise<NextResponse>((resolve) => {
      exec(`open "${filepath}"`, (error) => {
        if (error) {
          console.error("Failed to open file:", error);
          resolve(
            NextResponse.json(
              { error: `打开文件失败: ${error.message}` },
              { status: 500 }
            )
          );
        } else {
          resolve(NextResponse.json({ success: true }));
        }
      });
    });
  } catch (error) {
    console.error("Failed to open file:", error);
    return NextResponse.json({ error: "打开文件失败" }, { status: 500 });
  }
}
