import { Hemicycle } from "@hemicycle/core";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Season from "./components/season";
import { FieldGroup } from "./components/ui/field";
import PersonCircle from "./components/ui/personCircle";
import { SliderControlled } from "./components/ui/sliderControlled";
import { SwitchChoiceCard } from "./components/ui/switchChoiceCard";
import levenement from "./data/l-evenement.json";
import quelleEpoque from "./data/quelle-epoque.json";
import useScreenWidth from "./hooks/useScreenWidth";
import {
  convertedDateRangeAtom,
  hideNeutralEpisodesAtom,
  showDateRangeAtom,
} from "./lib/atoms";
import { getPersonInfos, partiesOrder } from "./lib/utils";
import type { PersonType, ShowType } from "./types";

export default function App() {
  const shows: ShowType[] = [quelleEpoque, levenement];
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

  const [hideNeutralEpisodes, setHideNeutralEpisodes] = useAtom(
    hideNeutralEpisodesAtom,
  );
  const [showParliament, setShowParliament] = useState(false);

  return (
    <main className="flex min-h-svh w-svw flex-col items-center bg-olive-200 py-8 text-olive-600 antialiased">
      <header className="flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-2 pb-6 md:pt-8">
        <div className="flex w-full flex-col gap-2 md:flex-row md:items-baseline-last md:justify-between">
          <h1 className="font-display max-w-[30ch] text-2xl/tight font-medium text-pretty">
            Appartenances politiques des invités de&nbsp;
            <span className="text-olive-800 italic">{data.title}</span>
          </h1>
          <p className="font-mono text-xs text-nowrap text-olive-500 sm:text-sm">
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
              return <Season key={season.id} season={season} />;
            })}
        </section>
      ) : (
        <section className="flex w-full max-w-5xl grow flex-wrap items-center justify-center overflow-hidden px-2">
          <div className="relative mt-72 -ml-10 sm:-ml-12 md:-ml-16">
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
