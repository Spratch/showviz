import { hideNeutralEpisodesAtom } from "@/lib/atoms";
import type { PersonType, ShowType } from "@/types";
import { useAtomValue } from "jotai";
import PersonCircle from "./personCircle";

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
      className={`flex flex-row items-start ${politicalGuests.length > 0 ? "" : hideNeutralEpisodes ? "hidden" : ""} gap-px rounded-[20px] border-olive-400 bg-olive-300 sm:rounded-3xl md:rounded-[28px]`}
    >
      <div className="flex aspect-square h-10 shrink-0 flex-wrap content-center items-center justify-center rounded-full border-olive-400 bg-olive-300 p-1.5 hover:bg-olive-200 sm:h-12 sm:p-2 md:h-14 md:p-2">
        {Array.from({
          length: episode.guestsIds.length,
        }).map((_, i) => {
          const guest = politicalGuests.find(
            (g) => g?.id === episode.guestsIds[i],
          );
          return (
            <span
              key={i}
              className={`aspect-square w-1.75 rounded-full bg-(--current-color)/75 sm:w-2 md:w-2.25 ${guest?.isGouv ? "border border-olive-600" : ""}`}
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
        <div className="flex flex-wrap">
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
