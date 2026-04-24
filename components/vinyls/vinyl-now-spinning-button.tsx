"use client";

import { useTransition } from "react";
import { Disc3 } from "lucide-react";
import { toast } from "@heroui/react";
import { setNowSpinningAction } from "@/actions/vinyls";

interface VinylNowSpinningButtonProps {
  vinylId: string;
  title: string;
  isCurrentlySpinning: boolean;
}

export function VinylNowSpinningButton({
  vinylId,
  title,
  isCurrentlySpinning,
}: VinylNowSpinningButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await setNowSpinningAction(vinylId);
      if (result.success) {
        toast.success(
          isCurrentlySpinning ? `Stopped playing "${title}"` : `Now spinning "${title}"`,
        );
      } else {
        toast.danger(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isCurrentlySpinning ? `Stop spinning ${title}` : `Set ${title} as now spinning`}
      className={[
        "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        isCurrentlySpinning
          ? "bg-teal-400/15 text-teal-500 hover:bg-teal-400/25"
          : "bg-content2 text-default-500 hover:bg-content3",
      ].join(" ")}
    >
      <Disc3
        size={12}
        className={isCurrentlySpinning ? "animate-spin-slow" : ""}
        aria-hidden="true"
      />
      {isPending ? "…" : isCurrentlySpinning ? "Spinning" : "Set Spinning"}
    </button>
  );
}
