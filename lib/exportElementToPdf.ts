export interface PdfExportOptions {
  fileName: string;
  title: string;
  subtitle?: string;
  metaLines?: string[];
}

const MARGIN = 40;

const addImageAcrossPages = (
  pdf: import("jspdf").jsPDF,
  imgData: string,
  startY: number,
  contentWidth: number,
  imgHeight: number,
  pageHeight: number,
) => {
  const pageContentHeight = pageHeight - MARGIN * 2;
  let heightLeft = imgHeight;
  let position = startY;

  pdf.addImage(imgData, "PNG", MARGIN, position, contentWidth, imgHeight);
  heightLeft -= pageHeight - startY - MARGIN;

  while (heightLeft > 0) {
    pdf.addPage();
    position = MARGIN - (imgHeight - heightLeft);
    pdf.addImage(imgData, "PNG", MARGIN, position, contentWidth, imgHeight);
    heightLeft -= pageContentHeight;
  }
};

/**
 * Renders a DOM element to a PDF, prefixed with a text header (title/subtitle/meta lines).
 * Uses html2canvas-pro (not html2canvas) because this app's Tailwind v4 stylesheet resolves
 * colors via oklch(), which the classic html2canvas throws on.
 */
export async function exportElementToPdf(element: HTMLElement, options: PdfExportOptions): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const backgroundColor = window.getComputedStyle(document.body).backgroundColor || "#ffffff";

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  let cursorY = MARGIN;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(20);
  pdf.text(options.title, MARGIN, cursorY);
  cursorY += 24;

  if (options.subtitle) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(90);
    pdf.text(options.subtitle, MARGIN, cursorY);
    cursorY += 16;
  }

  if (options.metaLines?.length) {
    pdf.setFontSize(9);
    pdf.setTextColor(130);
    for (const line of options.metaLines) {
      pdf.text(line, MARGIN, cursorY);
      cursorY += 13;
    }
  }

  cursorY += 12;

  const contentWidth = pageWidth - MARGIN * 2;
  const imgHeight = (canvas.height * contentWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/png");

  addImageAcrossPages(pdf, imgData, cursorY, contentWidth, imgHeight, pageHeight);

  pdf.save(options.fileName);
}
