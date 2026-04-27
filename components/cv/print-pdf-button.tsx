"use client";

import { Button } from "@heroui/react";

export function PrintPdfButton({ label, className }: { label: string; className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className={["text-foreground print:hidden", className].filter(Boolean).join(" ")}
      onPress={() => {
        if (typeof window !== "undefined") window.print();
      }}
    >
      {label}
    </Button>
  );
}
