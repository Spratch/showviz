import { tooltipContentAtom } from "@/lib/atoms";
import type { PersonType, ShowType } from "@/types";
import { useSetAtom } from "jotai";
import { useRef } from "react";

type TooltipContent = {
  guests: PersonType[];
  episode: ShowType["diffusions"][number];
};

export function useTooltip(tooltipContent: TooltipContent) {
  const setTooltipContent = useSetAtom(tooltipContentAtom);
  const elementRef = useRef<HTMLDivElement>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getCoords = () => {
    const rect = elementRef.current?.getBoundingClientRect();
    return rect ? { y: rect.top, x: rect.left } : null;
  };

  const createTooltip = () => {
    clearTimeout(tooltipTimeout.current ?? undefined);
    const coords = getCoords();
    setTooltipContent({ ...tooltipContent, ...coords });
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    e.stopPropagation();
    createTooltip();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    createTooltip();
  };

  const handleMouseLeave = () => {
    tooltipTimeout.current = setTimeout(() => {
      setTooltipContent((current) => {
        if (current?.episode.id === tooltipContent.episode.id) {
          return null;
        }
        return current;
      });
    }, 300);
  };

  return {
    elementRef,
    tooltipHandlers: {
      onMouseEnter: handleMouseEnter,
      onTouchEnd: handleTouchEnd,
      onMouseLeave: handleMouseLeave,
    },
  };
}
