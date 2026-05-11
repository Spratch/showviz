import type { PersonType, ShowType } from "@/types";
import PersonInfos from "./personInfos";

export function EpisodeTooltipContent({ guests }: { guests: PersonType[] }) {
  return (
    <div className="flex flex-col items-start gap-x-2 gap-y-2">
      {guests.length > 0 ? (
        guests.map((guest) => (
          <PersonInfos key={guest.episode?.date + guest.id} guest={guest} />
        ))
      ) : (
        <p className="font-mono text-xs">Aucun invité détecté</p>
      )}
    </div>
  );
}

export function EpisodeTooltipHeader({
  guests,
  episode,
}: {
  guests: PersonType[];
  episode: ShowType["diffusions"][number];
}) {
  return (
    <div className="flex h-full flex-col justify-center">
      {(episode.title || episode.showTitle) && (
        <p className="max-w-[35ch] font-medium text-balance">
          {episode.showTitle && (
            <span className="font-normal">
              {episode.showTitle.split("-").pop()}
            </span>
          )}{" "}
          {episode.title && episode.title.replace(" : ", " : ")}
        </p>
      )}
      <span className="text-balance">
        Invité
        {guests.reduce((n, g) => n + (g.gender === "masculin" ? 1 : -1), 0) > 0
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
  );
}
