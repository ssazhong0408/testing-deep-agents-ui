/**
 * 导出文件下载 API
 * 根据文件名从后端 exports/ 目录下载 Excel 文件
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const EXPORTS_DIR = path.resolve(
  process.cwd(),
  "../ai-test-agent-system/exports"
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // 安全检查：防止路径遍历攻击
    const sanitized = path.basename(filename);
    if (!sanitized.endsWith(".xlsx") || !sanitized.startsWith("testcases_")) {
      return NextResponse.json({ error: "无效的文件名" }, { status: 400 });
    }

    const filepath = path.join(EXPORTS_DIR, sanitized);

    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    const buffer = fs.readFileSync(filepath);
    const encodedFilename = encodeURIComponent(sanitized);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedFilename}`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Failed to download export:", error);
    return NextResponse.json({ error: "下载失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const sanitized = path.basename(filename);
    if (!sanitized.endsWith(".xlsx") || !sanitized.startsWith("testcases_")) {
      return NextResponse.json({ error: "无效的文件名" }, { status: 400 });
    }

    const filepath = path.join(EXPORTS_DIR, sanitized);
    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    fs.unlinkSync(filepath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete export:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
