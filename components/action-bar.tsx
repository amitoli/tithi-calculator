"use client";

import { CalendarPlus, FileDown, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap">
        <Button onClick={onIcs} disabled={busy !== null} className="flex-1">
          <CalendarPlus />
          {busy === "ics" ? "Preparing…" : "Add all milestones to Google / Apple Calendar"}
        </Button>
        <Button variant="secondary" onClick={onPdf} disabled={busy !== null} className="flex-1">
          <FileDown />
          {busy === "pdf" ? "Preparing…" : "Download printable PDF ritual checklist"}
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <a href={whatsAppShareUrl(result)} target="_blank" rel="noopener noreferrer">
            <Share2 />
            Share schedule via WhatsApp
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
