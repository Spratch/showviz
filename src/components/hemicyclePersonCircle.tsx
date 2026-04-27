import { useTooltip } from "@/hooks/useTooltip";
import type { PersonType } from "@/types";
import { motion } from "motion/react";

type PersonCircleProps = {
  person: PersonType;
  position?: { x: number; y: number };
  viewMode?: boolean;
};

export default function HemicyclePersonCircle({
  person,
  position = undefined,
  viewMode = undefined,
}: PersonCircleProps) {
  const { elementRef, tooltipHandlers } = useTooltip({
    guests: [person],
    episode: {
      id: person.episodeDate + person.id,
      date: person.episodeDate!,
      guestsIds: [person.id],
    },
  });
  return (
    <motion.div
      ref={elementRef}
      {...tooltipHandlers}
      layoutId={person.episodeDate + person.id}
      layoutDependency={position?.x || viewMode}
      id={person.episodeDate + person.id}
      className={`ring-ring text-2xs flex aspect-square flex-col items-center justify-center overflow-hidden rounded-full bg-(--current-color)/75 p-1.5 ${person?.isGouv ? "border-2 border-olive-600" : ""} ${position ? "absolute size-4 sm:size-8 md:size-12 md:text-xs" : "relative size-10 text-xs sm:size-12 sm:text-sm md:size-14"}`}
      style={
        {
          "--current-color": person?.party?.color,
          top: position?.y,
          left: position?.x,
        } as React.CSSProperties
      }
    >
      <p className="max-w-full truncate font-mono text-olive-800 max-sm:hidden">
        {person?.party?.abbr}
      </p>
    </motion.div>
  );
}
