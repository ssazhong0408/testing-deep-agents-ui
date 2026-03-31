/**
 * 版权所有 (c) 2023-2026 北京慧测信息技术有限公司(但问智能) 保留所有权利。
 * 
 * 本代码版权归北京慧测信息技术有限公司(但问智能)所有，仅用于学习交流目的，未经公司商业授权，
 * 不得用于任何商业用途，包括但不限于商业环境部署、售卖或以任何形式进行商业获利。违者必究。
 * 
 * 授权商业应用请联系微信：huice666
 */
// NOTE  MC80OmFIVnBZMlhtbTc3bHY1Zm9pYTg2VlVWVFV3PT06YTE4YWIzNjU=

import { ContentBlock } from "@langchain/core/messages";
import { toast } from "sonner";
// eslint-disable  MS80OmFIVnBZMlhtbTc3bHY1Zm9pYTg2VlVWVFV3PT06YTE4YWIzNjU=

// Returns a Promise of a typed multimodal block for images or documents
export async function fileToContentBlock(
  file: File,
): Promise<ContentBlock.Multimodal.Data> {
  const supportedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const supportedDocTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/markdown",
    "text/plain",
  ];
  const supportedFileTypes = [...supportedImageTypes, ...supportedDocTypes];

  if (!supportedFileTypes.includes(file.type)) {
    toast.error(
      `不支持的文件类型: ${file.type}。支持: 图片(JPEG/PNG/GIF/WEBP)、PDF、DOCX、DOC、MD、TXT`,
    );
    return Promise.reject(new Error(`Unsupported file type: ${file.type}`));
  }

  const data = await fileToBase64(file);

  if (supportedImageTypes.includes(file.type)) {
    return {
      type: "image",
      mimeType: file.type,
      data,
      metadata: { name: file.name },
    };
  }

  // 文档类型 (PDF, DOCX, DOC, MD, TXT)
  return {
    type: "file",
    mimeType: file.type,
    data,
    metadata: { filename: file.name },
  };
}
// FIXME  Mi80OmFIVnBZMlhtbTc3bHY1Zm9pYTg2VlVWVFV3PT06YTE4YWIzNjU=

// Helper to convert File to base64 string
export async function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data:...;base64, prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Type guard for Base64ContentBlock
export function isBase64ContentBlock(
  block: unknown,
): block is ContentBlock.Multimodal.Data {
  if (typeof block !== "object" || block === null || !("type" in block))
    return false;
  // file type (documents)
  if (
    (block as { type: unknown }).type === "file" &&
    "mimeType" in block &&
    typeof (block as { mimeType?: unknown }).mimeType === "string"
  ) {
    const mime = (block as { mimeType: string }).mimeType;
    if (
      mime.startsWith("image/") ||
      mime === "application/pdf" ||
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mime === "application/msword" ||
      mime === "text/markdown" ||
      mime === "text/plain"
    ) {
      return true;
    }
  }
  // image type (new)
  if (
    (block as { type: unknown }).type === "image" &&
    "mimeType" in block &&
    typeof (block as { mimeType?: unknown }).mimeType === "string" &&
    (block as { mimeType: string }).mimeType.startsWith("image/")
  ) {
    return true;
  }
  return false;
}
// TODO  My80OmFIVnBZMlhtbTc3bHY1Zm9pYTg2VlVWVFV3PT06YTE4YWIzNjU=
