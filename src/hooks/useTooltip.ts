import { tooltipContentAtom } from "@/lib/atoms";
import type { TooltipContentType } from "@/types";
import { useSetAtom } from "jotai";
import { useRef } from "react";

export function useTooltip(
  tooltipContent: Omit<TooltipContentType, "x" | "y">,
) {
  const setTooltipContent = useSetAtom(tooltipContentAtom);
  const elementRef = useRef<HTMLDivElement>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getCoords = () => {
    const rect = elementRef.current?.getBoundingClientRect();
    const xOffset = elementRef.current?.getAttribute("data-offset");
    return rect
      ? { y: rect.top, x: rect.left + (xOffset ? parseInt(xOffset) : 0) }
      : null;
  };

  const createTooltip = () => {
    clearTimeout(tooltipTimeout.current ?? undefined);
    const coords = getCoords();
    setTooltipContent({ ...tooltipContent, ...coords });
  };

  const handleMouseEnter = (e: React.MouseEvent | React.FocusEvent) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    e.stopPropagation();
    createTooltip();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (window.matchMedia("(pointer: fine)").matches) return;
    e.stopPropagation();
    e.preventDefault();
    createTooltip();
  };

  const handleMouseLeave = () => {
    tooltipTimeout.current = setTimeout(() => {
      setTooltipContent((current) => {
        if (current?.id === tooltipContent.id) {
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
      onClick: handleClick,
      onFocus: handleMouseEnter,
      onBlur: handleMouseLeave,
      onMouseLeave: handleMouseLeave,
    },
  };
}
