import jsPDF from 'jspdf';

export interface PDFSection {
    title: string;
    content: string | string[];
}

export const generateAestheticPDF = (
    title: string,
    subtitle: string,
    description: string,
    sections: PDFSection[],
    filename: string = "document.pdf"
) => {
    const doc = new jsPDF();
    let y = 0;

    // Helper to add page background and border
    const addPageAesthetics = () => {
        // Page background
        doc.setFillColor(252, 250, 246); // Very light warm ivory
        doc.rect(0, 0, 210, 297, 'F');
        
        // Blueprint / Technical grid lines background
        doc.setDrawColor(240, 235, 230);
        doc.setLineWidth(0.1);
        for (let i = 0; i < 210; i += 10) {
            doc.line(i, 0, i, 297);
        }
        for (let i = 0; i < 297; i += 10) {
            doc.line(0, i, 210, i);
        }

        // Left spine / binding edge
        doc.setFillColor(25, 30, 35);
        doc.rect(0, 0, 8, 297, 'F');
        // Binding rings holes
        doc.setFillColor(252, 250, 246);
        for(let i = 20; i < 290; i += 30) {
            doc.circle(4, i, 1.5, 'F');
        }

        // Solid header bar at the very top
        doc.setFillColor(25, 30, 35); // Dark slate almost black
        doc.rect(8, 0, 202, 18, 'F');

        // Red accent line under header
        doc.setFillColor(180, 50, 50);
        doc.rect(8, 18, 202, 1.5, 'F');
        
        // Outer border
        doc.setDrawColor(200, 190, 180);
        doc.setLineWidth(1);
        doc.rect(14, 25, 188, 262);
        
        // Inner border
        doc.setLineWidth(0.2);
        doc.rect(16, 27, 184, 258);
        
        // Corner decorative accents
        const size = 6;
        doc.setLineWidth(0.8);
        doc.setDrawColor(180, 50, 50); // Red corners
        // Top Left
        doc.line(14, 25 + size, 14, 25);
        doc.line(14, 25, 14 + size, 25);
        // Top Right
        doc.line(202 - size, 25, 202, 25);
        doc.line(202, 25, 202, 25 + size);
        // Bottom Left
        doc.line(14, 287 - size, 14, 287);
        doc.line(14, 287, 14 + size, 287);
        // Bottom Right
        doc.line(202 - size, 287, 202, 287);
        doc.line(202, 287, 202, 287 - size);

        // Header Text in the top dark bar
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(200, 200, 200);
        doc.text("P O L I   I N T E L L I G E N C E   D I R E C T O R A T E", 105, 11, { align: "center", charSpace: 3 });
        doc.setTextColor(180, 50, 50);
        doc.text("CLASSIFIED", 195, 11, { align: "right" });

        // Footer Text
        doc.setFont("times", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 95, 90);
        const pageNum = doc.getNumberOfPages();
        doc.text(`PAGE ${pageNum} // P.I.D. DOSSIER`, 105, 283, { align: "center" });
        
        // Add Simulated Barcode / Tech scan line at bottom left
        doc.setDrawColor(50, 50, 50);
        doc.setLineWidth(0.2);
        for(let i=0; i<30; i++) {
           const x = 20 + i*1.2;
           if(i%5!==0 && i%7!==0) doc.line(x, 280, x, 284);
           else if (i%5===0) { doc.setLineWidth(0.6); doc.line(x, 280, x, 284); doc.setLineWidth(0.2); }
        }
        doc.setFontSize(5);
        doc.setFont("helvetica", "normal");
        doc.text("REF: POLI-" + new Date().getFullYear() + "-" + Math.floor(Math.random()*9000+1000), 20, 286);

        // Watermark
        doc.setFont("times", "bolditalic");
        doc.setFontSize(80);
        doc.setTextColor(242, 238, 232); // Very subtle
        doc.text("P O L I", 105, 160, { align: "center", angle: 45 });

        // Official Seal (Faux Image/Logo)
        doc.setDrawColor(25, 30, 35);
        doc.setLineWidth(0.5);
        doc.circle(185, 45, 10);
        doc.circle(185, 45, 8.5);
        doc.setFontSize(6);
        doc.setTextColor(180, 50, 50); // Red inner logo
        doc.text("★", 185, 43, { align: "center" });
        doc.setTextColor(25, 30, 35);
        doc.text("P O L I", 185, 45.5, { align: "center" });
        doc.setFontSize(4);
        doc.text("INTELLIGENCE", 185, 48, { align: "center" });
        doc.text("DIR.", 185, 50, { align: "center" });
        
        doc.setTextColor(180, 50, 50);
        doc.setFontSize(40);
        doc.text("CONFIDENTIAL", 185, 260, { align: "right", angle: 10, charSpace: 5 }); // Stamp

        y = 40; // reset y
    };

    // First Page
    addPageAesthetics();

    // Classification Header
    y += 10;
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(180, 50, 50); // Deep red
    doc.text("TOP SECRET // AUTHORIZED PERSONNEL ONLY", 105, y, { align: "center", charSpace: 1 });
    y += 8;

    // Abstract geometric illustration
    doc.setDrawColor(200, 190, 180);
    doc.setLineWidth(0.3);
    doc.circle(105, y + 15, 12);
    doc.circle(105, y + 15, 18);
    // Intersection lines
    doc.line(80, y + 15, 130, y + 15);
    doc.line(105, y - 5, 105, y + 35);
    // Small dots
    doc.setFillColor(180, 50, 50);
    doc.circle(105, y + 15, 2, 'F');
    y += 45;

    // Main Title
    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.setTextColor(30, 40, 50); // Dark slate
    const safeTitle = doc.splitTextToSize(title.toUpperCase(), 150);
    doc.text(safeTitle, 105, y, { align: "center" });
    y += (safeTitle.length * 10) + 2;

    // Subtitle
    if (subtitle) {
        doc.setFont("times", "italic");
        doc.setFontSize(14);
        doc.setTextColor(100, 90, 80);
        const safeSubtitle = doc.splitTextToSize(subtitle, 150);
        doc.text(safeSubtitle, 105, y, { align: "center" });
        y += (safeSubtitle.length * 6) + 10;
    }

    // Elegant Divider
    const center = 105;
    doc.setDrawColor(200, 190, 180);
    doc.setLineWidth(0.5);
    doc.line(40, y, center - 10, y);
    doc.line(center + 10, y, 170, y);
    doc.setFontSize(10);
    doc.text("✧", center, y + 1, { align: "center" });
    y += 15;

    const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > 270) {
            doc.addPage();
            addPageAesthetics();
        }
    };

    // Description text
    if (description) {
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.setTextColor(50, 45, 40);
        const descLines = doc.splitTextToSize(description, 145);
        checkPageBreak(descLines.length * 6);
        doc.text(descLines, 30, y, { align: "justify", maxWidth: 145 });
        y += (descLines.length * 6) + 15;
    }

    // Sections
    sections.forEach(section => {
        // Section Header
        checkPageBreak(25);
        
        doc.setDrawColor(180, 50, 50); // Red accent
        doc.setLineWidth(0.8);
        doc.line(26, y - 4, 26, y + 2); // Left bar marker
        
        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.setTextColor(20, 30, 40);
        doc.text(section.title.toUpperCase(), 30, y);
        
        // Subtle dotted line under header
        doc.setLineWidth(0.2);
        doc.setDrawColor(200, 190, 180);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(30, y + 4, 175, y + 4);
        doc.setLineDashPattern([], 0); // reset

        y += 12;

        // Section Content
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        doc.setTextColor(60, 55, 50);
        
        if (Array.isArray(section.content)) {
            section.content.forEach((item, i) => {
                const textLines = doc.splitTextToSize(`• ${item}`, 145);
                checkPageBreak(textLines.length * 6 + 4);
                // Highlight bullet point text slightly
                doc.setFont("times", "bold");
                doc.setTextColor(180, 50, 50);
                doc.text("•", 30, y);
                doc.setFont("times", "normal");
                doc.setTextColor(60, 55, 50);
                doc.text(doc.splitTextToSize(`${item}`, 140), 34, y);

                y += (textLines.length * 6) + 3;
            });
            y += 8;
        } else {
            const contentLines = doc.splitTextToSize(section.content, 145);
            checkPageBreak(contentLines.length * 6 + 4);
            doc.text(contentLines, 30, y, { align: "justify", maxWidth: 145 });
            y += (contentLines.length * 6) + 12;
        }
    });

    // End marker
    checkPageBreak(50);
    y += 10;
    
    // Authorization Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 95, 90);
    doc.text("AUTHORIZED BY:", 30, y);
    doc.text("SECURITY CLEARED:", 130, y);
    y += 12;
    
    // Faux Signature
    doc.setFont("courier", "italic"); // Often handwriting-like or distinct
    doc.setFontSize(18);
    doc.setTextColor(30, 40, 70); // Dark blue pen color
    doc.text("E. V. Sterling", 30, y); // Director or archivist name
    
    // Status Stamp
    doc.setFont("times", "bolditalic");
    doc.setFontSize(14);
    doc.setTextColor(180, 50, 50); // Red
    doc.text("VERIFIED & LOGGED", 130, y);
    
    y += 15;
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(150, 140, 130);
    doc.text("--- END OF RECORD ---", 105, y, { align: "center" });

    doc.save(filename);
};
