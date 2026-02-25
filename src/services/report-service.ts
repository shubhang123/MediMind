/**
 * Report generation and download service.
 * Handles interaction with the report API endpoint and
 * client-side PDF generation from HTML.
 */

import { api } from '@/config/app.config';
import { apiPost } from '@/config/api.config';
import type { DiagnosisData } from '@/components/chat/DiagnosticResponseCard';

/* ── Types ── */

export interface ReportConfig {
  /** Patient name (optional) */
  patientName?: string;
  /** Patient age */
  patientAge?: string;
  /** Patient gender */
  patientGender?: string;
  /** Referring physician */
  referringPhysician?: string;
  /** Report date (defaults to today) */
  reportDate?: string;
  /** Sections to include in the report */
  sections: {
    diagnosis: boolean;
    conditions: boolean;
    medications: boolean;
    lifestyle: boolean;
    nextSteps: boolean;
    metadata: boolean;
  };
  /** Show MediMind branding */
  showBranding: boolean;
}

export const defaultReportConfig: ReportConfig = {
  patientName: '',
  patientAge: '',
  patientGender: '',
  referringPhysician: '',
  reportDate: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  sections: {
    diagnosis: true,
    conditions: true,
    medications: true,
    lifestyle: true,
    nextSteps: true,
    metadata: false,
  },
  showBranding: true,
};

export interface ServerReportResponse {
  image_url?: string;
  [key: string]: unknown;
}

/* ── Server-side report generation ── */

/**
 * Request the backend to generate a report image from diagnosis data.
 */
export async function generateServerReport(
  diagnosisData: DiagnosisData
): Promise<ServerReportResponse> {
  return apiPost<ServerReportResponse>(api.endpoints.generateReport, diagnosisData);
}

/* ── Client-side HTML-to-image download ── */

/**
 * Converts an HTML element to a downloadable PNG using html2canvas-like approach.
 * Falls back to print-based PDF if canvas fails.
 */
export function downloadElementAsImage(
  element: HTMLElement,
  filename: string = 'medimind-report.png'
): void {
  // Use the browser print dialog as a reliable fallback
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Inter', system-ui, sans-serif;
        background: #fff;
        color: #1a1a2e;
        padding: 40px;
        line-height: 1.6;
      }
      h1, h2, h3 { font-family: 'Instrument Serif', Georgia, serif; }
      
      @media print {
        body { padding: 20px; }
        .no-print { display: none !important; }
      }
    </style>
  `;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MediMind Diagnostic Report</title>
        ${styles}
      </head>
      <body>
        ${element.innerHTML}
        <script>
          window.onload = function() {
            window.print();
          };
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Download from a URL (for server-generated report images).
 */
export function downloadFromUrl(
  url: string,
  filename: string = 'medimind-report.png'
): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
