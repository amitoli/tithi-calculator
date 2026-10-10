import { jsPDF } from "jspdf";
import { BARSHIK_SAMAGRI } from "../samagri";
import { formatCivilDate, formatShortDate } from "../timezone";
import type { CalculationResult } from "../panchang/types";

function wrap(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 6): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  for (const line of lines) {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

export async function downloadRitualPdf(result: CalculationResult) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const tz = result.input.location.timeZone;
  const pageWidth = 210;
  let y = 20;

  doc.setFillColor(180, 83, 9);
  doc.rect(0, 0, pageWidth, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Tithi & Barshik Companion", 14, 12);

  doc.setTextColor(30, 41, 59);
  y = 28;
  doc.setFontSize(11);
  doc.text("Ritual checklist & milestone guide", 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  y = wrap(doc, `Place: ${result.input.location.city}, ${result.input.location.country}`, 14, y, 180);
  y = wrap(
    doc,
    `Calendar: ${result.input.calendar === "purnimanta" ? "Purnimanta (Nepal / North India)" : "Amanta (South / West India)"}`,
    14,
    y,
    180,
  );
  y = wrap(doc, `Death tithi: ${result.deathPanchang.displayName}`, 14, y, 180);
  y = wrap(doc, `Date of passing (A.D.): ${formatCivilDate(result.deathMoment, tz)}`, 14, y, 180);
  if (result.deathNepaliDate) {
    y = wrap(doc, `Date of passing (B.S.): ${result.deathNepaliDate}`, 14, y, 180);
  }
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(180, 83, 9);
  doc.text("Barshik / Barkhanta", 14, y);
  y += 7;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  y = wrap(doc, result.barshik.civilDate, 14, y, 180, 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (result.barshik.nepaliDate) {
    y = wrap(doc, result.barshik.nepaliDate, 14, y, 180);
  }
  y = wrap(doc, result.barshik.tithiName, 14, y, 180);
  y = wrap(
    doc,
    `Civil 365-day comparison: ${result.civilAnniversary.civilDate}${result.civilAnniversary.nepaliDate ? ` / ${result.civilAnniversary.nepaliDate}` : ""}`,
    14,
    y,
    180,
  );
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 83, 9);
  doc.text("Why this date", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  for (const line of result.explanation) {
    y = wrap(doc, `• ${line}`, 14, y, 182, 5.5);
    y += 1;
  }
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 83, 9);
  doc.text("Milestone timeline", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  for (const item of result.timeline) {
    y = wrap(
      doc,
      `${formatShortDate(item.date, tz)}${item.nepaliDate ? ` / ${item.nepaliDate}` : ""}  —  ${item.title}  (${item.tithiName})`,
      14,
      y,
      182,
      5.5,
    );
  }
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 83, 9);
  doc.text("Annual Shraddha dates", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  for (const item of result.annualShraddha) {
    y = wrap(
      doc,
      `${formatShortDate(item.date, tz)}${item.nepaliDate ? ` / ${item.nepaliDate}` : ""}  —  ${item.title}  (${item.tithiName})`,
      14,
      y,
      182,
      5.5,
    );
  }
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 83, 9);
  doc.text("Samagri checklist (typical Barshik / Shraddha)", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  for (const item of BARSHIK_SAMAGRI) {
    y = wrap(doc, `[ ]  ${item.name} — ${item.note}`, 14, y, 182, 5.5);
  }
  y += 8;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  wrap(
    doc,
    "Educational guide only. Customs vary by family, region, and lineage. Confirm dates and offerings with your pujari or a trusted Panchang before performing rites.",
    14,
    y,
    182,
    4.5,
  );

  doc.save("barshik-ritual-guide.pdf");
}
