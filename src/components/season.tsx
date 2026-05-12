import type { SeasonType } from "@/types";
import Episode from "./episode";

export default function Season({ season }: { season: SeasonType }) {
  const lastYear = season.episodes[0].date.split("-")[0];
  const firstYear =
    season.episodes[season.episodes.length - 1].date.split("-")[0];
  const yearRange =
    firstYear === lastYear ? firstYear : `${firstYear}-${lastYear}`;

  return (
    <section className="flex flex-col gap-2">
      <div className="text-primary flex flex-wrap items-baseline justify-between gap-x-2 font-mono">
        <div className="flex items-baseline gap-2 text-sm sm:text-base">
          <h2>
            S{season.id}
            <span className="text-foreground ml-1.5 text-xs sm:ml-2 sm:text-sm">
              {yearRange}
            </span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            [<span className="italic">{season.episodes.length} épisodes</span>]
          </p>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm">
          [
          <span className="text-primary">
            {season.politicalGuests.length} politiques
          </span>
          &thinsp;/&thinsp;{season.seasonGuests.length} invités{" "}
          <span className="text-primary">
            (
            {(
              (season.politicalGuests.length / season.seasonGuests.length) *
              100
            ).toFixed(1)}
            %)
          </span>
          ]
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        {season.episodes
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((episode) => {
            const politicalGuests = season.politicalGuests.filter(
              (g) =>
                g &&
                episode.guestsIds.includes(g.id) &&
                g.episode?.date === episode.date,
            );
            return (
              <Episode
                key={episode.id + episode.date}
                politicalGuests={politicalGuests}
                episode={episode}
              />
            );
          })}
      </div>
    </section>
  );
}
