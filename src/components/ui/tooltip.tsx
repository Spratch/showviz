import { tooltipContentAtom } from "@/lib/atoms";
import type { TooltipContentType } from "@/types";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import CloseIcon from "~icons/tabler/x";
import PersonInfos from "../personInfos";
import { Button } from "./button";

type Props = {
  screenDimensions: { screenWidth: number; screenHeight: number };
  tooltipContent: TooltipContentType;
};

export default function Tooltip(props: Omit<Props, "tooltipContent">) {
  const tooltipContent = useAtomValue(tooltipContentAtom);

  if (!tooltipContent) return null;

  return <TooltipContent {...props} tooltipContent={tooltipContent} />;
}

export function TooltipContent({ screenDimensions, tooltipContent }: Props) {
  const setTooltipContent = useSetAtom(tooltipContentAtom);
  const { x = 0, y = 0, guests, episode } = tooltipContent!;
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate the position of the tooltip
  useEffect(() => {
    if (tooltipRef.current) {
      const circleWidth =
        screenDimensions.screenWidth < 640
          ? 40
          : screenDimensions.screenWidth < 768
            ? 48
            : 56;

      // Top position
      const tooltipHeight = tooltipRef.current.clientHeight;
      if (y - tooltipHeight < 0) {
        if (y + circleWidth + tooltipHeight > screenDimensions.screenHeight) {
          tooltipRef.current.style.top = `${screenDimensions.screenHeight - tooltipHeight}px`;
        } else {
          tooltipRef.current.style.top = `${y + circleWidth}px`;
        }
      } else {
        tooltipRef.current.style.top = `${y - tooltipHeight}px`;
      }

      // Left position
      const tooltipWidth = tooltipRef.current.clientWidth;
      if (x + tooltipWidth > screenDimensions.screenWidth) {
        tooltipRef.current.style.right = "4px";
        tooltipRef.current.style.left = "auto";
      } else {
        tooltipRef.current.style.left = `${x}px`;
        tooltipRef.current.style.right = "auto";
      }
    }
  }, [y, x, screenDimensions]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 pointer-fine:hidden"
        onTouchStart={(e) => {
          if (window.matchMedia("(pointer: fine)").matches) return;
          e.preventDefault();
          setTooltipContent(null);
        }}
      />
      <div
        ref={tooltipRef}
        className="fixed z-50 flex max-h-[80vh] max-w-[95vw] justify-start py-1 transition-all duration-500 select-none"
        onMouseEnter={(e) => {
          e.stopPropagation();
          setTooltipContent({
            ...tooltipContent,
            episode: { ...episode, id: episode.id + "hover" },
          });
        }}
        onMouseLeave={() => setTooltipContent(null)}
      >
        <div className="bg-background border-border z-30 flex max-w-[40ch] flex-col gap-1.5 overflow-hidden overflow-x-hidden overflow-y-scroll rounded-lg border px-2.5 py-2">
          <div className="font-display flex w-full items-center justify-between gap-2 border-b border-dashed pb-1 text-xs">
            <div className="flex flex-col">
              {episode.title && (
                <p className="max-w-[35ch] font-medium text-balance">
                  {episode.title}
                </p>
              )}
              <span className="text-balance">
                Invité
                {guests.reduce(
                  (n, g) => n + (g.gender === "masculin" ? 1 : -1),
                  0,
                ) > 0
                  ? ""
                  : "e"}
                {guests.length > 1 ? "s" : ""} de l'émission du{" "}
                {new Date(episode.date).toLocaleDateString("fr", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <Button
              size="icon-xs"
              aria-label="Fermer"
              variant="secondary"
              onClick={() => setTooltipContent(null)}
            >
              <CloseIcon />
            </Button>
          </div>
          <div className="flex flex-col items-start gap-x-2 gap-y-2">
            {guests.map((guest) => (
              <PersonInfos key={guest.episodeDate + guest.id} guest={guest} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
