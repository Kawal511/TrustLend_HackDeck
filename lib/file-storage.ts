import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveUploadedFile(
  file: File,
  category: string
): Promise<{ fileUrl: string; filePath: string }> {
  await ensureUploadDir();

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExt = file.name.split('.').pop();
  const filename = `${category}-${randomUUID()}.${fileExt}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await fs.writeFile(filePath, buffer);

  return {
    fileUrl: `/uploads/${filename}`,
    filePath
  };
}

export async function readUploadedFile(fileUrl: string): Promise<Buffer> {
  const fullPath = path.join(process.cwd(), 'public', fileUrl);
  return await fs.readFile(fullPath);
}

export async function deleteUploadedFile(fileUrl: string): Promise<void> {
  const filePath = path.join(process.cwd(), 'public', fileUrl);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Delete file error:', error);
  }
}
