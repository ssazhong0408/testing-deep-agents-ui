/**
 * 导出文件列表 API
 * 读取后端 exports/ 目录下的 Excel 文件列表
 */
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// 后端 exports 目录路径（根据实际部署调整）
const EXPORTS_DIR = path.resolve(
  process.cwd(),
  "../ai-test-agent-system/exports"
);

export async function GET() {
  try {
    if (!fs.existsSync(EXPORTS_DIR)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs
      .readdirSync(EXPORTS_DIR)
      .filter((f) => f.endsWith(".xlsx") && f.startsWith("testcases_"))
      .map((filename) => {
        const filepath = path.join(EXPORTS_DIR, filename);
        const stat = fs.statSync(filepath);
        return {
          filename,
          size: stat.size,
          created_at: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Failed to list exports:", error);
    return NextResponse.json({ files: [], error: "读取导出文件列表失败" }, { status: 500 });
  }
}
