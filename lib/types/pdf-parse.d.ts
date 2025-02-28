declare module 'pdf-parse' {
  interface PDFParseResult {
    text: string;
    numpages: number;
    info: any;
    metadata: any;
    version: string;
  }

  function PDFParse(dataBuffer: Buffer, options?: any): Promise<PDFParseResult>;
  
  export = PDFParse;
} 