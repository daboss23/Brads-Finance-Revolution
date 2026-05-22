"use client";

import { FileText } from "lucide-react";

export function ExportButtons({ clientId }: { clientId: string }) {
  function trigger(format: "docx" | "pdf") {
    const a = document.createElement("a");
    a.href = `/api/export/${clientId}/${format}`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => trigger("docx")}
        className="inline-flex items-center gap-2 rounded border border-border bg-card px-4 py-2.5 text-[12px] font-medium text-foreground/70 hover:text-foreground hover:border-border/80 transition-colors"
      >
        <FileText className="h-3.5 w-3.5" />
        Download Word
      </button>
      <button
        onClick={() => trigger("pdf")}
        className="inline-flex items-center gap-2 rounded border border-gold/35 bg-gold/5 px-4 py-2.5 text-[12px] font-medium text-gold/80 hover:text-gold hover:border-gold/55 transition-colors"
      >
        <FileText className="h-3.5 w-3.5" />
        Download PDF
      </button>
    </div>
  );
}
