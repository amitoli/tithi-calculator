"use client";

import { CalendarPlus, FileDown, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { downloadIcs } from "@/lib/export/ics";
import { downloadRitualPdf } from "@/lib/export/pdf";
import { whatsAppShareUrl } from "@/lib/export/whatsapp";
import type { CalculationResult } from "@/lib/panchang/types";

export function ActionBar({ result }: { result: CalculationResult }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function onPdf() {
    setBusy("pdf");
    try {
      await downloadRitualPdf(result);
    } finally {
      setBusy(null);
    }
  }

  function onIcs() {
    setBusy("ics");
    try {
      downloadIcs(result);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button
        onClick={onIcs}
        disabled={busy !== null}
        variant="secondary"
        size="sm"
        className="h-9 px-2 text-xs"
      >
        <CalendarPlus />
        {busy === "ics" ? "Preparing" : "Calendar"}
      </Button>
      <Button
        variant="secondary"
        onClick={onPdf}
        disabled={busy !== null}
        size="sm"
        className="h-9 px-2 text-xs"
      >
        <FileDown />
        {busy === "pdf" ? "Preparing" : "PDF"}
      </Button>
      <Button variant="outline" size="sm" className="h-9 px-2 text-xs" asChild>
        <a href={whatsAppShareUrl(result)} target="_blank" rel="noopener noreferrer">
          <Share2 />
          WhatsApp
        </a>
      </Button>
    </div>
  );
}
