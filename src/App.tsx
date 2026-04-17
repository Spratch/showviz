import { Hemicycle } from "@hemicycle/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { FieldGroup } from "./components/ui/field";
import PersonCircle from "./components/ui/personCircle";
import { SliderControlled } from "./components/ui/sliderControlled";
import { SwitchChoiceCard } from "./components/ui/switchChoiceCard";
import quelleEpoque from "./data/quelle-epoque.json";
import useScreenWidth from "./hooks/useScreenWidth";
import { convertedDateRangeAtom, showDateRangeAtom } from "./lib/atoms";
import { getPersonInfos, partiesOrder } from "./lib/utils";
import type { PersonType, ShowType } from "./types";

export default function App() {
  const shows: ShowType[] = [quelleEpoque];
  const data = shows[0];

  const seasonMap = useMemo(() => {
    return data.diffusions.reduce(
      (acc, episode) => {
        const season = episode.id.split("-")[0];

        if (!acc[season]) {
          acc[season] = {
            id: season,
            episodes: [],
            seasonGuests: [],
            politicalGuests: [],
          };
        }

        const episodeGuests = episode.guestsIds.map((guestId) =>
          getPersonInfos(guestId, episode.date),
        );

        const episodePoliticalGuests = episodeGuests.filter(
          (guest) => guest?.party,
        );

        acc[season].episodes.push(episode);
        acc[season].seasonGuests.push(...episodeGuests);
        acc[season].politicalGuests.push(...episodePoliticalGuests);

        return acc;
      },
      {} as Record<
        string,
        {
          id: string;
          episodes: typeof data.diffusions;
          seasonGuests: ReturnType<typeof getPersonInfos>[];
          politicalGuests: ReturnType<typeof getPersonInfos>[];
        }
      >,
    );
  }, [data]);
  const seasons = useMemo(() => Object.values(seasonMap), [seasonMap]);

  const setShowDateRange = useSetAtom(showDateRangeAtom);
  useEffect(() => {
    const sortedSeasons = seasons.sort((a, b) => a.id.localeCompare(b.id));
    const firstEpisodeDate = new Date(
      sortedSeasons[0].episodes[0].date,
    ).getTime();
    const lastEpisodeDate = new Date(
      sortedSeasons.at(-1)!.episodes.at(-1)!.date,
    ).getTime();
    setShowDateRange({ min: firstEpisodeDate, max: lastEpisodeDate });
  }, [seasons, setShowDateRange]);

  const [min, max] = useAtomValue(convertedDateRangeAtom);

  const displayedSeasons = seasons
    .map((season) => {
      const filteredEpisodes = season.episodes.filter((e) => {
        const episodeDate = new Date(e.date);
        return episodeDate >= min && episodeDate <= max;
      });
      const filterGuests = (guests: PersonType[]) =>
        guests.filter((g) =>
          filteredEpisodes.flatMap((e) => e.guestsIds).includes(g.id),
        );
      const filteredPoliticalGuests = filterGuests(season.politicalGuests);
      const filteredGuests = filterGuests(season.seasonGuests);
      if (filteredEpisodes.length === 0) return null;

      return {
        ...season,
        politicalGuests: filteredPoliticalGuests,
        seasonGuests: filteredGuests,
        episodes: filteredEpisodes,
      };
    })
    .filter((s) => s !== null);

  const fakeParliamentMembers = useMemo(() => {
    return displayedSeasons
      .flatMap((s) => s.politicalGuests)
      .sort((a, b) => {
        return (
          (partiesOrder.get(a?.party?.name) ?? Infinity) -
          (partiesOrder.get(b?.party?.name) ?? Infinity)
        );
      })
      .filter((m) => m !== null);
  }, [displayedSeasons]);

  const screenWidth = useScreenWidth();
  const isSmall = screenWidth < 640 || fakeParliamentMembers.length < 15;
  const isMedium =
    (screenWidth < 768 && !isSmall) ||
    (fakeParliamentMembers.length < 32 && fakeParliamentMembers.length > 14);

  const hemicycle = new Hemicycle({
    rows: Math.max(
      1,
      Math.round(
        fakeParliamentMembers.length / (isSmall ? 8 : isMedium ? 9 : 10),
      ),
    ),
    orderBy: "radial",
    totalSeats:
      fakeParliamentMembers.length > 0 ? fakeParliamentMembers.length : 1,
    outerRadius: isSmall ? 220 : isMedium ? 300 : 480,
    innerRadius: isSmall ? 30 : isMedium ? 80 : 100,
    totalAngle: 180,
  });
  const hemicycleLayout = hemicycle.getSeatsLayout();

  const [hideNeutralEpisodes, setHideNeutralEpisodes] = useState(false);
  const [showParliament, setShowParliament] = useState(false);

  return (
    <main className="flex min-h-svh w-svw flex-col items-center bg-olive-200 py-8 text-olive-600 antialiased">
      <header className="flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-2 pb-6 md:pt-8">
        <div className="flex w-full items-baseline-last justify-between">
          <h1 className="font-display max-w-[30ch] text-2xl/tight font-medium text-pretty">
            Appartenances politiques des invités de&nbsp;
            <span className="text-olive-800 italic">{data.title}</span>
          </h1>
          <p className="font-mono text-xs text-olive-500 sm:text-sm">
            [
            <span className="text-olive-700">
              {displayedSeasons.flatMap((s) => s.politicalGuests).length}{" "}
              politiques
            </span>
            &thinsp;/&thinsp;
            {
              displayedSeasons.flatMap((s) => s.seasonGuests).length
            } invités{" "}
            <span className="text-olive-700">
              (
              {(
                (displayedSeasons.flatMap((s) => s.politicalGuests).length /
                  displayedSeasons.flatMap((s) => s.seasonGuests).length) *
                100
              ).toFixed(1)}
              %)
            </span>
            ]
          </p>
        </div>
        <FieldGroup className="flex w-full flex-col gap-2.5 font-mono text-xs/tight sm:flex-row">
          <SwitchChoiceCard
            title="Focus politique"
            description="N'afficher que les épisodes avec des invités politiques"
            id="hide-neutral-episodes"
            onCheckedChange={() => {
              setHideNeutralEpisodes((prev) => !prev);
              if (showParliament && hideNeutralEpisodes) {
                setShowParliament(false);
              }
            }}
            checked={hideNeutralEpisodes}
          />

          <SwitchChoiceCard
            title="Vue parlement"
            description="Afficher les politiques en parlement"
            id="show-parliament"
            onCheckedChange={() => {
              setShowParliament((prev) => !prev);
              if (!hideNeutralEpisodes && !showParliament) {
                setHideNeutralEpisodes(true);
              }
            }}
            checked={showParliament}
          />

          <SliderControlled title="Filtrer par date" />
        </FieldGroup>
      </header>

      {!showParliament ? (
        <section className="flex w-full max-w-5xl flex-col gap-8 px-2">
          {displayedSeasons
            .sort((a, b) => b.id.localeCompare(a.id))
            .map((season) => {
              return (
                <section key={season.id} className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 font-mono text-olive-700">
                    <div className="flex items-baseline gap-2 text-sm sm:text-base">
                      <h2>
                        S{season.id}
                        <span className="ml-1.5 text-xs text-olive-600 sm:ml-2 sm:text-sm">
                          {season.episodes[0].date.split("-")[0]}-
                          {
                            season.episodes[
                              season.episodes.length - 1
                            ].date.split("-")[0]
                          }
                        </span>
                      </h2>
                      <p className="text-xs text-olive-500 sm:text-sm">
                        [
                        <span className="italic">
                          {season.episodes.length} épisodes
                        </span>
                        ]
                      </p>
                    </div>
                    <p className="text-xs text-olive-500 sm:text-sm">
                      [
                      <span className="text-olive-700">
                        {season.politicalGuests.length} politiques
                      </span>
                      &thinsp;/&thinsp;{season.seasonGuests.length} invités{" "}
                      <span className="text-olive-700">
                        (
                        {(
                          (season.politicalGuests.length /
                            season.seasonGuests.length) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                      ]
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {season.episodes
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((episode) => {
                        const politicalGuests = season.politicalGuests.filter(
                          (g) =>
                            g &&
                            episode.guestsIds.includes(g.id) &&
                            g.episodeDate === episode.date,
                        );
                        return (
                          <article
                            className={`flex flex-row items-center ${politicalGuests.length > 0 ? "border" : hideNeutralEpisodes ? "hidden" : ""} gap-px rounded-4xl border-olive-400 bg-olive-300`}
                            key={episode.id}
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
                                          guest?.party?.color ??
                                          "var(--color-olive-400)",
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
                      })}
                  </div>
                </section>
              );
            })}
        </section>
      ) : (
        <section className="flex w-full max-w-5xl grow flex-wrap items-center justify-center overflow-hidden px-2">
          <div className="relative mt-72">
            {fakeParliamentMembers.length > 0 &&
              fakeParliamentMembers.map((guest, index) => {
                return (
                  <PersonCircle
                    key={guest.episodeDate + guest.id}
                    person={guest}
                    position={hemicycleLayout[index]}
                  />
                );
              })}
          </div>
        </section>
      )}
    </main>
  );
}
