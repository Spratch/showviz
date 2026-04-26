import type { PersonType } from "@/types";
import { motion } from "motion/react";

export default function PersonCircle({
  person,
  position = undefined,
  viewMode = undefined,
}: {
  person: PersonType;
  position?: { x: number; y: number } | undefined;
  viewMode?: boolean | undefined;
}) {
  return (
    <motion.div
      layoutId={person.episodeDate + person.id}
      layoutDependency={position?.x || viewMode}
      id={person.episodeDate + person.id}
      className={`ring-ring text-2xs flex aspect-square flex-col items-center justify-center overflow-hidden rounded-full bg-(--current-color)/75 p-1.5 ${person?.isGouv ? "border-2 border-olive-600" : ""} ${position ? "absolute size-6 sm:size-8 md:size-12 md:text-xs" : "relative size-10 text-xs sm:size-12 sm:text-sm md:size-14"}`}
      style={
        {
          "--current-color": person?.party?.color,
          top: position?.y,
          left: position?.x,
        } as React.CSSProperties
      }
    >
      <p className="max-w-full truncate font-mono text-olive-800">
        {person?.party?.abbr}
      </p>
    </motion.div>
  );
}
