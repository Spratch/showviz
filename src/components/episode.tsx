import { useTooltip } from "@/hooks/useTooltip";
import { hideNeutralEpisodesAtom } from "@/lib/atoms";
import { getPersonInfos } from "@/lib/utils";
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
  const guests = episode.guestsIds.map((id) =>
    getPersonInfos(id, episode.date),
  );

  const { elementRef, tooltipHandlers } = useTooltip({
    guests,
    episode,
  });

  return (
    <article
      ref={elementRef}
      {...tooltipHandlers}
      className={`relative flex flex-row items-start gap-px rounded-[20px] border-olive-400 bg-olive-300 sm:rounded-3xl md:rounded-[28px] ${politicalGuests.length > 0 ? "" : hideNeutralEpisodes ? "hidden" : ""}`}
    >
      <div className="flex aspect-square size-10 shrink-0 flex-wrap content-center items-center justify-center rounded-full border-olive-400 bg-olive-300 p-1.5 sm:size-12 sm:p-2 md:size-14 md:p-2">
        {Array.from({
          length: episode.guestsIds.length,
        }).map((_, i) => {
          const guest = politicalGuests.find(
            (g) => g?.id === episode.guestsIds[i],
          );
          return (
            <span
              key={i}
              className={`aspect-square size-1.75 rounded-full bg-(--current-color)/75 sm:size-2 md:size-2.25 ${guest?.isGouv ? "border border-olive-600" : ""}`}
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
