"use client";

import { useTransition } from "react";
import { Button } from "@heroui/react";
import { toast } from "@heroui/react";
import { deleteVinylAction } from "@/actions/vinyls";

interface VinylDeleteButtonProps {
  vinylId: string;
  title: string;
}

export function VinylDeleteButton({ vinylId, title }: VinylDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteVinylAction({ id: vinylId });
      if (result.success) {
        toast.success(`"${title}" removed`);
      } else {
        toast.danger(result.error ?? "Failed to delete");
      }
    });
  }

  return (
    <Button
      size="sm"
      variant="danger-soft"
      isDisabled={isPending}
      onPress={handleDelete}
      aria-label={`Delete ${title}`}
    >
      {isPending ? "Removing…" : "Remove"}
    </Button>
  );
}
