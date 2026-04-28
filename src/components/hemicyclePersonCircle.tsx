import { useTooltip } from "@/hooks/useTooltip";
import type { PersonType } from "@/types";
import { motion } from "motion/react";
import {
  EpisodeTooltipContent,
  EpisodeTooltipHeader,
} from "./episodeTooltipContent";

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
    header: EpisodeTooltipHeader({
      guests: [person],
      episode: {
        id: person.episode!.date + person.id,
        date: person.episode!.date,
        guestsIds: [person.id],
        title: person.episode!.title,
      },
    }),
    content: EpisodeTooltipContent({ guests: [person] }),
    id: person.episode!.date + person.id,
  });
  return (
    <motion.div
      ref={elementRef}
      {...tooltipHandlers}
      layoutId={person.episode!.date + person.id}
      layoutDependency={position?.x || viewMode}
      id={person.episode!.date + person.id}
      data-color={person.party?.color}
      tabIndex={0}
      className={`ring-ring outline-ring text-2xs flex aspect-square flex-col items-center justify-center overflow-hidden rounded-full bg-(--current-color)/75 p-1.5 outline-offset-2 transition-opacity ${person?.isGouv ? "border-2 border-olive-600" : ""} absolute size-4 sm:size-8 md:size-12 md:text-xs`}
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
