import type { PersonType } from "@/types";
import { motion } from "motion/react";

export default function PersonCircle({
  person,
  position = undefined,
}: {
  person: PersonType;
  position?: { x: number; y: number } | undefined;
}) {
  return (
    <motion.a
      layoutId={person.episodeDate + person.id}
      id={person.episodeDate + person.id}
      href={`https://fr.wikipedia.org/wiki/${person?.name}`}
      target="_blank"
      className={`ring-ring flex aspect-square w-10 flex-col items-center justify-center rounded-full bg-(--current-color)/75 p-1.5 ring-offset-2 outline-0 hover:bg-(--current-color)/30 focus-visible:ring-2 sm:w-12 md:w-16 ${person?.isGouv ? "border-2 border-olive-600" : ""} ${position ? "absolute" : "relative"}`}
      style={
        {
          "--current-color": person?.party?.color,
          top: position?.y,
          left: position?.x,
        } as React.CSSProperties
      }
    >
      <p className="font-mono text-xs text-olive-800 sm:text-sm">
        {person?.party?.abbr}
      </p>
    </motion.a>
  );
}
