"use client";

import { CareerChat } from "@/components/ai/career-chat";
import { useCareerChatDrawer } from "@/hooks/use-career-chat-drawer";

/**
 * Bridges CareerChatDrawerContext into <CareerChat />.
 * Rendered once from root layout (outside <main>) so the drawer stays mounted
 * across route changes and usePathname() always reflects the active URL.
 */
export function CareerChatHost() {
  const { isOpen, close } = useCareerChatDrawer();
  return <CareerChat isOpen={isOpen} onClose={close} />;
}
