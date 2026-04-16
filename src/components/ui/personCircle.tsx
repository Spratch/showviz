import type { PersonType } from "@/types";
import { motion } from "motion/react";

export default function PersonCircle({ person }: { person: PersonType }) {
  return (
    <motion.a
      layoutId={person.episodeDate + person.id}
      id={person.episodeDate + person.id}
      href={`https://fr.wikipedia.org/wiki/${person?.name}`}
      target="_blank"
      className={`ring-ring flex aspect-square w-16 flex-col items-center justify-center rounded-full bg-(--current-color)/75 p-1.5 ring-offset-2 outline-0 hover:bg-(--current-color)/30 focus-visible:ring-2 ${person?.isGouv ? "border-2 border-olive-600" : ""}`}
      style={
        {
          "--current-color": person?.party?.color,
        } as React.CSSProperties
      }
    >
      <p className="font-mono text-sm text-olive-800">{person?.party?.abbr}</p>
    </motion.a>
  );
}
