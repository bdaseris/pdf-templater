import { Page, A4_WIDTH, A4_HEIGHT } from '../types';
import html2canvas from 'html2canvas';

export const generateHTML = (pages: Page[], backgroundColor: string) => {
  const styles = `
    body { margin: 0; padding: 0; background: #555; display: flex; flex-direction: column; align-items: center; min-height: 100vh; font-family: sans-serif; gap: 20px; padding: 20px; }
    .page { 
      position: relative; 
      width: ${A4_WIDTH}px; 
      height: ${A4_HEIGHT}px; 
      background-color: ${backgroundColor}; 
      overflow: hidden; 
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
    .element { position: absolute; box-sizing: border-box; }
    @media print {
      body { background: white; display: block; padding: 0; gap: 0; }
      .page { box-shadow: none; margin: 0; page-break-after: always; width: 100%; height: 100%; }
      .page:last-child { page-break-after: auto; }
    }
  `;

  const pagesHtml = pages.map((page, index) => {
    const elementsHtml = page.elements
      .filter(el => el.isVisible)
      .map(el => {
        const styleString = Object.entries(el.style).map(([k, v]) => {
            const key = k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
            return `${key}: ${v}`;
        }).join('; ');

        const commonStyle = `left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; ${styleString}`;

        if (el.type === 'text') {
          return `<div class="element" style="${commonStyle}">${el.content}</div>`;
        } else if (el.type === 'image') {
          return `<img class="element" src="${el.content}" style="${commonStyle}; object-fit: cover;" />`;
        } else {
          return `<div class="element" style="${commonStyle}; border-radius: ${el.style.borderRadius || '0'}"></div>`;
        }
      }).join('\n');

    return `
    <!-- Page ${index + 1}: ${page.name} -->
    <div class="page" id="page-${page.id}">
      ${elementsHtml}
    </div>`;
  }).join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exported Template</title>
  <style>${styles}</style>
</head>
<body>
  ${pagesHtml}
</body>
</html>
  `;
};

export const downloadHTML = (pages: Page[], backgroundColor: string) => {
  const html = generateHTML(pages, backgroundColor);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadImage = async (elementId: string, format: 'png' | 'jpeg') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Temporarily remove selection rings/guides for screenshot
  const controls = element.querySelectorAll('.controls');
  controls.forEach((el: any) => el.style.display = 'none');

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true, // For images
      backgroundColor: null
    });

    const link = document.createElement('a');
    link.download = `template.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, 1.0);
    link.click();
  } catch (err) {
    console.error("Export failed", err);
    alert("Export failed. Note: External images must allow CORS.");
  } finally {
     controls.forEach((el: any) => el.style.display = '');
  }
};

export const printToPDF = (pages: Page[], backgroundColor: string) => {
  const html = generateHTML(pages, backgroundColor);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
};
