import mammoth from 'mammoth';

const MIN_TEXT_LENGTH = 50;

export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === 'application/pdf') {
    return extractFromPdf(buffer);
  }

  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractFromDocx(buffer);
  }

  throw new Error(`Formato de archivo no soportado: ${file.type}`);
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const text = result.text?.trim() ?? '';
  if (text.length < MIN_TEXT_LENGTH) {
    throw new Error('No se pudo extraer texto del PDF. Verificá que no sea un PDF escaneado sin OCR.');
  }

  return text;
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ buffer });
  const text = value?.trim() ?? '';

  if (text.length < MIN_TEXT_LENGTH) {
    throw new Error('No se pudo extraer texto del archivo DOCX.');
  }

  return text;
}
