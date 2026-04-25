import Header from "@/components/header";
import HemicyclePersonCircle from "@/components/hemicyclePersonCircle";
import Season from "@/components/season";
import Tooltip from "@/components/ui/tooltip";
import useScreenDimensions from "@/hooks/useScreenWidth";
import {
  convertedDateRangeAtom,
  filteredDateRangeAtom,
  originTotalAtom,
  selectedShowAtom,
  showDateRangeAtom,
  showParliamentAtom,
  shows,
} from "@/lib/atoms";
import { getPersonInfos, partiesOrder } from "@/lib/utils";
import type { PersonType } from "@/types";
import { Hemicycle } from "@hemicycle/core";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";

export default function Show({ params }: { params: { showSlug: string } }) {
  const [selectedShow, setSelectedShow] = useAtom(selectedShowAtom);
  const { showSlug } = params;
  useEffect(() => {
    const show = shows.find((s) => s.slug === showSlug);
    if (show) {
      setSelectedShow(show);
    }
  }, [showSlug, setSelectedShow]);

  const seasonMap = useMemo(() => {
    return selectedShow.diffusions.reduce(
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
          episodes: typeof selectedShow.diffusions;
          seasonGuests: ReturnType<typeof getPersonInfos>[];
          politicalGuests: ReturnType<typeof getPersonInfos>[];
        }
      >,
    );
  }, [selectedShow]);
  const seasons = useMemo(() => Object.values(seasonMap), [seasonMap]);

  const setShowDateRange = useSetAtom(showDateRangeAtom);
  const setDateRange = useSetAtom(filteredDateRangeAtom);
  const { totalMonths } = useAtomValue(originTotalAtom);

  useEffect(() => {
    const sortedSeasons = seasons.sort((a, b) => a.id.localeCompare(b.id));
    const firstEpisodeDate = new Date(
      sortedSeasons[0].episodes[0].date,
    ).getTime();
    const lastEpisodeDate = new Date(
      sortedSeasons.at(-1)!.episodes.at(-1)!.date,
    ).getTime();
    setShowDateRange({ min: firstEpisodeDate, max: lastEpisodeDate });
    setDateRange([0, totalMonths - 1]);
  }, [seasons, setShowDateRange, setDateRange, totalMonths]);

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

  const screenDimensions = useScreenDimensions();
  const { screenWidth } = screenDimensions;

  function computeHemicycleParams(n: number, screenWidth: number) {
    const isSmall = screenWidth < 640;
    const isMedium = screenWidth < 768;

    const outerRadius = isSmall ? 220 : isMedium ? 300 : 480;
    const innerRadius = isSmall ? 30 : isMedium ? 80 : 100;
    const dotPx = (isSmall ? 10 : isMedium ? 12 : 14) * 4;

    let rows = 1;
    for (let r = 1; r <= 30; r++) {
      const rowSpacing = (outerRadius - innerRadius) / r;
      const minSpacing = Math.min(rowSpacing, dotPx * 1.1);
      let capacity = 0;
      for (let i = 0; i < r; i++) {
        const radius = innerRadius + rowSpacing * (i + 0.5);
        capacity += Math.floor((Math.PI * radius) / minSpacing);
      }
      if (capacity >= n) {
        rows = r;
        break;
      }
    }

    return { rows, outerRadius, innerRadius };
  }

  const n = fakeParliamentMembers.length || 1;
  const { rows, outerRadius, innerRadius } = computeHemicycleParams(
    n,
    screenWidth,
  );

  const hemicycle = new Hemicycle({
    rows,
    orderBy: "radial",
    totalSeats: n,
    outerRadius,
    innerRadius,
    totalAngle: 190,
  });
  const hemicycleLayout = hemicycle
    .getSeatsLayout()
    .sort((a, b) => a.radialIdx - b.radialIdx);

  const showParliament = useAtomValue(showParliamentAtom);
  return (
    <>
      <Header displayedSeasons={displayedSeasons} />

      {!showParliament ? (
        <section className="flex w-full max-w-5xl flex-col gap-8 px-2">
          {displayedSeasons
            .sort((a, b) => b.id.localeCompare(a.id))
            .map((season) => {
              return <Season key={season.id} season={season} />;
            })}
        </section>
      ) : (
        <section className="flex w-full max-w-5xl grow flex-wrap items-center justify-center px-2">
          <div className="relative mt-72 -ml-10 sm:-ml-12 md:-ml-16">
            {fakeParliamentMembers.length > 0 &&
              fakeParliamentMembers.map((guest, index) => {
                return (
                  <HemicyclePersonCircle
                    key={guest.episodeDate + guest.id}
                    person={guest}
                    position={hemicycleLayout[index]}
                  />
                );
              })}
            <span className="font-display mx-auto text-center text-xl font-medium oldstyle-nums sm:text-2xl md:text-3xl">
              {fakeParliamentMembers.length}
            </span>
          </div>
        </section>
      )}
      <Tooltip screenDimensions={screenDimensions} />
    </>
  );
}
