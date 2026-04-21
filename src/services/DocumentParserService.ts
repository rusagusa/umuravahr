import pdfParse from 'pdf-parse';

/**
 * DocumentParserService
 * Extracts raw text from uploaded file buffers (PDF, CSV, TXT).
 * The extracted text is then handed off to GeminiGatewayService for schema parsing.
 */
export class DocumentParserService {
  /**
   * Routes a file buffer to the correct text extractor based on MIME type.
   */
  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    const type = mimeType.toLowerCase();

    if (type === 'application/pdf') {
      return this.extractFromPdf(buffer);
    }

    if (type === 'text/csv' || type === 'text/plain') {
      return this.extractFromText(buffer);
    }

    throw new Error(`Unsupported file type: ${mimeType}. Supported types: PDF, CSV, TXT.`);
  }

  /**
   * Extracts raw text from a PDF buffer using pdf-parse.
   */
  private async extractFromPdf(buffer: Buffer): Promise<string> {
    const result = await pdfParse(buffer);
    const text = result.text.trim();
    if (!text) throw new Error('PDF appears to be empty or image-only (no extractable text).');
    return text;
  }

  /**
   * Decodes a text/CSV buffer to a UTF-8 string.
   */
  private extractFromText(buffer: Buffer): string {
    const text = buffer.toString('utf-8').trim();
    if (!text) throw new Error('Uploaded text file is empty.');
    return text;
  }
}
