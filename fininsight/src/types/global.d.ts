declare module "node-cron" {
    import cron from "node-cron";
    export default cron;
  }
  
declare module 'pdfjs-dist/build/pdf' {
    const pdfjsLib: any;
    export = pdfjsLib;
}

declare module 'pdfjs-dist/build/pdf.worker.min.js?url' {
    const workerSrc: string;
    export default workerSrc;
}

declare module "pdfjs-dist/build/pdf.worker.min.js?url" {
  const workerSrc: string;
  export default workerSrc;
}

declare module "pdf-parse" {
  export interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  export default function pdf(
    data: BufferSource | string | ArrayBuffer
  ): Promise<PDFParseResult>;
}
