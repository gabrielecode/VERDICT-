import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Decision } from '../types';
import { formatDate, getTimeRemaining } from '../utils';

/**
 * Genera un file PDF riassuntivo e professionale di una decisione conclusa.
 * Include titolo, metadati, verdetto ufficiale, opzioni con voti e percentuali,
 * rating e sintesi dei commenti della discussione.
 */
export async function generateDecisionSummaryPDF(decision: Decision): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 16;

  const totalVotes = decision.options.reduce((sum, opt) => sum + (Number(opt.votes) || 0), 0);
  const timeInfo = getTimeRemaining(decision.deadline);
  const isConcluded = timeInfo.status === 'expired' || Boolean(decision.finalDecision);

  // Trova il voto massimo per determinare la scelta vincente
  const maxVotes = Math.max(...decision.options.map((o) => Number(o.votes) || 0), 0);
  const winningOptions = decision.options.filter(
    (o) => Number(o.votes) > 0 && Number(o.votes) === maxVotes
  );

  // Funzione helper per verificare se serve una nuova pagina
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 22) {
      doc.addPage();
      currentY = 18;
      return true;
    }
    return false;
  };

  // --- 1. BANNER SUPERIORE E BRANDING ---
  // Barra superiore d'accento (3mm)
  doc.setFillColor(37, 99, 235); // Blue primary #2563EB
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Intestazione Brand & ID Documento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('EASYDECISION · PIATTAFORMA DECISIONALE', margin, currentY);

  const docIdText = `ID: #${decision.id.slice(0, 8).toUpperCase()}`;
  doc.text(docIdText, pageWidth - margin, currentY, { align: 'right' });
  currentY += 7;

  // Titolo del Documento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('REPORT RIASSUNTIVO DECISIONE', margin, currentY);

  // Badge Stato (Conclusa o In corso)
  const statusBadgeText = isConcluded ? 'DECISIONE CONCLUSA' : 'VOTAZIONE IN CORSO';
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  if (isConcluded) {
    doc.setFillColor(240, 253, 244); // Green 50
    doc.setDrawColor(34, 197, 94); // Green 500
    doc.setTextColor(21, 128, 61); // Green 700
  } else {
    doc.setFillColor(254, 243, 199); // Amber 50
    doc.setDrawColor(245, 158, 11); // Amber 500
    doc.setTextColor(180, 83, 9); // Amber 700
  }
  const badgeWidth = doc.getTextWidth(statusBadgeText) + 8;
  doc.roundedRect(pageWidth - margin - badgeWidth, currentY - 5, badgeWidth, 6.5, 1.5, 1.5, 'FD');
  doc.text(statusBadgeText, pageWidth - margin - badgeWidth + 4, currentY - 0.7);

  currentY += 4;

  // Linea separatrice
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // --- 2. TITOLO DELLA DECISIONE & METADATI ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(decision.title, contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 6 + 2;

  // Box Metadati a griglia (Categoria, Creatore, Date, Tipologia, Voti)
  const metaBoxY = currentY;
  const typeLabels: Record<string, string> = {
    single: 'Scelta Singola',
    multiple: 'Scelta Multipla',
    yes_no: 'Sì / No',
    rating: 'Valutazione a Stelle (1-5)',
  };
  const audienceLabels: Record<string, string> = {
    org: 'Membri Organizzazione',
    private: 'Privata (Solo invitati)',
    link: 'Accesso Pubblico tramite Link',
  };

  const metaRows = [
    [
      { label: 'Categoria', val: decision.category || 'Generale' },
      { label: 'Creato da', val: `${decision.creator?.name || 'Membro'} (${decision.creator?.role || 'Membro'})` },
    ],
    [
      { label: 'Data Creazione', val: formatDate(decision.createdAt) },
      { label: 'Scadenza / Chiusura', val: formatDate(decision.deadline) },
    ],
    [
      { label: 'Tipologia Votazione', val: typeLabels[decision.type] || decision.type },
      { label: 'Accessibilità', val: audienceLabels[decision.audience] || decision.audience },
    ],
    [
      { label: 'Totale Votanti', val: `${totalVotes} ${totalVotes === 1 ? 'voto espresso' : 'voti espressi'}` },
      { label: 'Anonimato', val: decision.isAnonymous ? 'Votazione Anonima' : 'Votazione Nominale' },
    ],
  ];

  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  const metaBoxHeight = metaRows.length * 6.5 + 4;
  doc.roundedRect(margin, metaBoxY, contentWidth, metaBoxHeight, 2, 2, 'FD');

  let rowY = metaBoxY + 5;
  const col1X = margin + 4;
  const col2X = margin + contentWidth / 2 + 2;

  metaRows.forEach((row) => {
    // Colonna 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${row[0].label}:`, col1X, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(row[0].val, col1X + 28, rowY);

    // Colonna 2
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(`${row[1].label}:`, col2X, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(row[1].val, col2X + 32, rowY);

    rowY += 6.5;
  });

  currentY = metaBoxY + metaBoxHeight + 6;

  // --- 3. DESCRIZIONE / QUESITO ---
  if (decision.description && decision.description.trim()) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text('DESCRIZIONE & CONTESTO', margin, currentY);
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(decision.description.trim(), contentWidth - 8);
    const descBoxHeight = descLines.length * 4.5 + 6;

    checkPageBreak(descBoxHeight + 2);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, descBoxHeight, 1.5, 1.5, 'FD');

    doc.text(descLines, margin + 4, currentY + 4.5);
    currentY += descBoxHeight + 6;
  }

  // --- 4. VERDETTO FINALE UFFICIALE (Se presente o sintesi esito) ---
  if (decision.finalDecision) {
    checkPageBreak(35);
    const verdictY = currentY;
    const finalLines = doc.splitTextToSize(decision.finalDecision.text, contentWidth - 10);
    const verdictBoxHeight = finalLines.length * 5 + 18;

    doc.setFillColor(239, 246, 255); // Blue 50
    doc.setDrawColor(147, 197, 253); // Blue 300
    doc.setLineWidth(0.6);
    doc.roundedRect(margin, verdictY, contentWidth, verdictBoxHeight, 2, 2, 'FD');

    // Intestazione box verdetto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(29, 78, 216); // Blue 700
    doc.text('VERDETTO UFFICIALE (DECISIONE PRESA)', margin + 5, verdictY + 6);

    // Testo della decisione
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(finalLines, margin + 5, verdictY + 12);

    // Metadati verdetto (Responsabile e Data)
    const metaVerdictY = verdictY + verdictBoxHeight - 4.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Responsabile attuazione: ${decision.finalDecision.responsible}    ·    Data ratifica: ${decision.finalDecision.date}`,
      margin + 5,
      metaVerdictY
    );

    currentY = verdictY + verdictBoxHeight + 7;
  } else if (isConcluded && winningOptions.length > 0) {
    // Esito provvisorio da voti se nessun verdetto formale è stato ancora compilato
    checkPageBreak(25);
    const winnerY = currentY;
    doc.setFillColor(240, 253, 244); // Green 50
    doc.setDrawColor(134, 239, 172); // Green 300
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, winnerY, contentWidth, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(21, 128, 61); // Green 700
    doc.text('ESITO DELLA VOTAZIONE (MAGGIORANZA DEI CONSENSI)', margin + 5, winnerY + 5.5);

    const winnerText =
      winningOptions.length === 1
        ? `Opzione più votata: "${winningOptions[0].text}" con ${winningOptions[0].votes} voti (${
            totalVotes > 0 ? ((winningOptions[0].votes / totalVotes) * 100).toFixed(1) : 0
          }%)`
        : `Parità tra ${winningOptions.length} opzioni (${winningOptions.map((w) => `"${w.text}"`).join(', ')}) con ${maxVotes} voti ciascuna.`;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(doc.splitTextToSize(winnerText, contentWidth - 10), margin + 5, winnerY + 11.5);

    currentY = winnerY + 24;
  }

  // --- 5. TABELLA RISULTATI DELLE OPZIONI ---
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('RISULTATI DETTAGLIATI DELLA VOTAZIONE', margin, currentY);
  currentY += 3;

  const tableHead = [['#', 'Opzione Proposta', 'Voti Espressi', '% Consenso', 'Esito']];
  const tableBody = decision.options.map((opt, index) => {
    const letter = String.fromCharCode(65 + index);
    const votes = Number(opt.votes) || 0;
    const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0';

    let statusText = '-';
    if (isConcluded && votes > 0 && votes === maxVotes) {
      statusText = winningOptions.length > 1 ? 'Parita vincente' : 'Opzione vincente';
    } else if (votes > 0) {
      statusText = 'Consenso parziale';
    } else {
      statusText = 'Nessun voto';
    }

    return [letter, opt.text, `${votes}`, `${percentage}%`, statusText];
  });

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: currentY,
    margin: { left: margin, right: margin },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [51, 65, 85],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [15, 23, 42], // Navy dark #0F172A
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      3: { cellWidth: 26, halign: 'right' },
      4: { cellWidth: 32, halign: 'center' },
    },
    didParseCell: (data) => {
      // Evidenzia la riga vincente se la decisione è conclusa
      if (data.section === 'body') {
        const rowOption = decision.options[data.row.index];
        const isWinner =
          isConcluded &&
          Number(rowOption?.votes) > 0 &&
          Number(rowOption?.votes) === maxVotes;
        if (isWinner) {
          data.cell.styles.fillColor = [240, 253, 244]; // Green 50
          if (data.column.index === 4) {
            data.cell.styles.textColor = [21, 128, 61]; // Green 700
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    },
  });

  // Aggiorna currentY in base a dove è terminata la tabella
  currentY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : currentY + 35;

  // --- 6. SEZIONE VALUTAZIONE RATING (Se applicabile) ---
  if (decision.type === 'rating') {
    checkPageBreak(30);
    const avg =
      totalVotes > 0
        ? (
            decision.options.reduce((sum, opt, idx) => sum + (Number(opt.votes) || 0) * (idx + 1), 0) /
            totalVotes
          ).toFixed(1)
        : '0.0';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('DETTAGLIO VALUTAZIONE A STELLE', margin, currentY);
    currentY += 3;

    autoTable(doc, {
      head: [['Valutazione', 'Descrizione Livello', 'Voti Raccolti', '% sul Totale']],
      body: [
        ['1 Stella', 'Scarso / Disaccordo forte', `${decision.options[0]?.votes || 0}`, `${totalVotes > 0 ? (((decision.options[0]?.votes || 0) / totalVotes) * 100).toFixed(1) : 0}%`],
        ['2 Stelle', 'Sotto le aspettative', `${decision.options[1]?.votes || 0}`, `${totalVotes > 0 ? (((decision.options[1]?.votes || 0) / totalVotes) * 100).toFixed(1) : 0}%`],
        ['3 Stelle', 'Neutrale / Accettabile', `${decision.options[2]?.votes || 0}`, `${totalVotes > 0 ? (((decision.options[2]?.votes || 0) / totalVotes) * 100).toFixed(1) : 0}%`],
        ['4 Stelle', 'Buono / Favorevole', `${decision.options[3]?.votes || 0}`, `${totalVotes > 0 ? (((decision.options[3]?.votes || 0) / totalVotes) * 100).toFixed(1) : 0}%`],
        ['5 Stelle', 'Eccellente / Consenso pieno', `${decision.options[4]?.votes || 0}`, `${totalVotes > 0 ? (((decision.options[4]?.votes || 0) / totalVotes) * 100).toFixed(1) : 0}%`],
      ],
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.5 },
      headStyles: { fillColor: [71, 85, 105], textColor: 255 },
      foot: [['Punteggio Medio', `Media finale: ${avg} su 5.0 stelle`, `Totale: ${totalVotes}`, '100%']],
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    });

    currentY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : currentY + 30;
  }

  // --- 7. SINTESI DISCUSSIONE E COMMENTI DEL TEAM ---
  if (decision.comments && decision.comments.length > 0) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`CONTRIBUTI E COMMENTI DEL TEAM (${decision.comments.length})`, margin, currentY);
    currentY += 3;

    const commentsBody = decision.comments.map((comm) => [
      comm.author || 'Anonimo',
      formatDate(comm.timestamp),
      comm.text,
    ]);

    autoTable(doc, {
      head: [['Autore', 'Data & Ora', 'Intervento / Considerazione']],
      body: commentsBody,
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [51, 65, 85],
      },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 35 },
        2: { cellWidth: 'auto' },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    currentY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : currentY + 30;
  }

  // --- 8. FOOTER SU TUTTE LE PAGINE (Numerazione e Data Stampa) ---
  const totalPages = doc.getNumberOfPages();
  const printTimestamp = new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Linea separatrice footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    // Informazioni footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      `EasyDecision · Documento riassuntivo generato il ${printTimestamp}`,
      margin,
      pageHeight - 7
    );
    doc.text(
      `Pagina ${i} di ${totalPages}`,
      pageWidth - margin,
      pageHeight - 7,
      { align: 'right' }
    );
  }

  // Salva il file PDF con nome pulito e descrittivo
  const safeTitle = decision.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 40)
    .replace(/^_+|_+$/g, '');
  doc.save(`report_decisione_${safeTitle || 'riassunto'}.pdf`);
}
