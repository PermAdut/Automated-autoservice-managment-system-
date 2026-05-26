import * as fs from 'fs';
import * as path from 'path';
import type PDFKit from 'pdfkit';

export const PDF_FONT_REGULAR = 'DejaVuSans';
export const PDF_FONT_BOLD = 'DejaVuSans-Bold';

function resolveFontsDir(): string {
  const candidates = [
    path.join(__dirname, '../assets/fonts'),
    path.join(__dirname, '../../assets/fonts'),
    path.join(process.cwd(), 'src/assets/fonts'),
    path.join(process.cwd(), 'assets/fonts'),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'DejaVuSans.ttf'))) {
      return dir;
    }
  }

  throw new Error(
    `PDF fonts not found. Expected DejaVuSans.ttf in: ${candidates.join(', ')}`,
  );
}

const fontsDir = resolveFontsDir();

export function registerPdfFonts(doc: PDFKit.PDFDocument): void {
  doc.registerFont(PDF_FONT_REGULAR, path.join(fontsDir, 'DejaVuSans.ttf'));
  doc.registerFont(PDF_FONT_BOLD, path.join(fontsDir, 'DejaVuSans-Bold.ttf'));
}
