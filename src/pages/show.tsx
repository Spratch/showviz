import Header from "@/components/header";
import PersonCircle from "@/components/personCircle";
import Season from "@/components/season";
import Tooltip from "@/components/ui/tooltip";
import useScreenDimensions from "@/hooks/useScreenWidth";
import {
  convertedDateRangeAtom,
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

  const screenDimensions = useScreenDimensions();
  const { screenWidth } = screenDimensions;
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
      <Tooltip screenDimensions={screenDimensions} />
    </>
  );
}
