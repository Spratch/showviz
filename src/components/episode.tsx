import { hideNeutralEpisodesAtom } from "@/lib/atoms";
import type { PersonType, ShowType } from "@/types";
import { useAtomValue } from "jotai";
import PersonCircle from "./ui/personCircle";

export default function Episode({
  episode,
  politicalGuests,
}: {
  episode: ShowType["diffusions"][number];
  politicalGuests: PersonType[];
}) {
  const hideNeutralEpisodes = useAtomValue(hideNeutralEpisodesAtom);
  return (
    <article
      className={`flex flex-row items-center ${politicalGuests.length > 0 ? "border" : hideNeutralEpisodes ? "hidden" : ""} gap-px rounded-4xl border-olive-400 bg-olive-300`}
    >
      <div className="-m-px flex aspect-square h-10 shrink-0 flex-wrap content-center items-center justify-center rounded-full border border-olive-400 bg-olive-300 p-1.5 hover:bg-olive-200 sm:h-12 sm:p-2 md:h-16 md:p-3">
        {Array.from({
          length: episode.guestsIds.length,
        }).map((_, i) => {
          const guest = politicalGuests.find(
            (g) => g?.id === episode.guestsIds[i],
          );
          return (
            <span
              key={i}
              className={`aspect-square w-1.75 rounded-full bg-(--current-color)/75 sm:w-2 md:w-2.5 ${guest?.isGouv ? "border border-olive-600" : ""}`}
              style={
                {
                  "--current-color":
                    guest?.party?.color ?? "var(--color-olive-400)",
                } as React.CSSProperties
              }
            ></span>
          );
        })}
      </div>
      {politicalGuests.length > 0 && (
        <div className="-m-px flex">
          {politicalGuests.map((guest) => {
            if (!guest) return null;
            return (
              <PersonCircle
                key={episode.id + guest.id}
                person={guest}
                viewMode={hideNeutralEpisodes}
              />
            );
          })}
        </div>
      )}
    </article>
  );
}
