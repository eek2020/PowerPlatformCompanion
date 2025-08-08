// Simple PDF text extraction using pdfjs-dist in the browser
// Workerless mode to avoid bundler issues; OK for our parsing use-case
import * as pdfjsLib from 'pdfjs-dist'

export type ParsedPdf = {
  pageCount: number
  text: string
  pages: string[]
}

export async function extractPdfText(data: ArrayBuffer): Promise<ParsedPdf> {
  // pdfjs can consume a Uint8Array
  const bytes = new Uint8Array(data)
  // Workerless mode
  const loadingTask = (pdfjsLib as any).getDocument({ data: bytes, disableWorker: true })
  const pdf = await loadingTask.promise

  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map((it: any) => (typeof it.str === 'string' ? it.str : '')).join(' ')
    pages.push(text)
  }
  return { pageCount: pdf.numPages, text: pages.join('\n'), pages }
}
