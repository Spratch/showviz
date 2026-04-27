import Header from "@/components/header";
import HemicyclePersonCircle from "@/components/hemicyclePersonCircle";
import PersonCircle from "@/components/personCircle";
import Season from "@/components/season";
import Tooltip from "@/components/ui/tooltip";
import useScreenDimensions from "@/hooks/useScreenWidth";
import {
  convertedDateRangeAtom,
  filteredDateRangeAtom,
  hideNeutralEpisodesAtom,
  originTotalAtom,
  selectedShowAtom,
  showDateRangeAtom,
  showParliamentAtom,
  shows,
} from "@/lib/atoms";
import { getPersonInfos, partiesOrder } from "@/lib/utils";
import type { PartyType, PersonType, PersonWithOccurencesType } from "@/types";
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
  const hideNeutralEpisodes = useAtomValue(hideNeutralEpisodesAtom);

  const displayedSeasons = seasons
    .sort((a, b) => b.id.localeCompare(a.id))
    .map((season) => {
      const filteredEpisodes = season.episodes.filter((e) => {
        const episodeDate = new Date(e.date);

        const politicalGuestIds = hideNeutralEpisodes
          ? new Set(season.politicalGuests.map((g) => g.id))
          : null;

        if (
          politicalGuestIds &&
          !e.guestsIds.some((id) => politicalGuestIds.has(id))
        )
          return false;

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
    const isMedium = screenWidth < 832;

    const outerRadius = isSmall ? 180 : isMedium ? 300 : 480;
    const innerRadius = isSmall ? 20 : isMedium ? 50 : 100;
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

  const mostInvitedGuests = Object.entries(
    displayedSeasons
      .flatMap((season) =>
        hideNeutralEpisodes ? season.politicalGuests : season.seasonGuests,
      )
      .reduce(
        (
          acc: Record<string, Omit<PersonWithOccurencesType, "index">>,
          item,
        ) => {
          if (acc[item.id]) {
            acc[item.id].occurences += 1;
            acc[item.id].party = item.party;
          } else {
            acc[item.id] = {
              ...item,
              occurences: 1,
            };
          }
          return acc;
        },
        {},
      ),
  )
    .filter(([, guest]) => guest.occurences > 1)
    .sort(([, a], [, b]) => b.occurences - a.occurences)
    .reduce<[string, PersonWithOccurencesType][]>(
      (acc, [id, guest], i, arr) => {
        const prevRank = acc[i - 1]?.[1].index ?? 0;
        const index =
          i > 0 && arr[i - 1][1].occurences !== guest.occurences
            ? prevRank + 1
            : prevRank || 1;

        return [...acc, [id, { ...guest, index }]];
      },
      [],
    );

  const mostInvitedParties = Object.entries(
    displayedSeasons
      .flatMap((season) => season.politicalGuests)
      .reduce(
        (acc: Record<string, PartyType & { occurences: number }>, item) => {
          const partyName = item.party?.name;

          // Parti normal
          if (partyName && partyName !== "Gouvernement") {
            if (acc[partyName]) {
              acc[partyName].occurences += 1;
            } else {
              acc[partyName] = {
                ...item.party,
                name: partyName,
                occurences: 1,
              };
            }
          }

          // Parti gouv
          if (item.isGouv) {
            if (acc["Gouvernement"]) {
              acc["Gouvernement"].occurences += 1;
            } else {
              acc["Gouvernement"] = {
                abbr: "Gouv",
                color: "#FBC408",
                name: "Gouvernement",
                occurences: 1,
              };
            }
          }

          return acc;
        },
        {},
      ),
  )
    // .filter(([, party]) => party.occurences > 1)
    .sort(([, a], [, b]) => b.occurences - a.occurences)
    .reduce<[string, PartyType & { occurences: number; index: number }][]>(
      (acc, [name, party], i, arr) => {
        const prevRank = acc[i - 1]?.[1].index ?? 0;
        const index =
          i > 0 && arr[i - 1][1].occurences !== party.occurences
            ? prevRank + 1
            : prevRank || 1;

        return [...acc, [name, { ...party, index }]];
      },
      [],
    );

  return (
    <>
      <Header displayedSeasons={displayedSeasons} />
      <main className="flex w-full max-w-5xl grow flex-col gap-8 px-2 pb-8 md:gap-16 md:pt-6">
        {!showParliament ? (
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-medium">
              Invités par saisons
            </h2>
            <div className="flex w-full flex-col gap-8">
              {displayedSeasons.map((season) => {
                return <Season key={season.id} season={season} />;
              })}
            </div>
          </section>
        ) : (
          <section className="flex w-full grow flex-col">
            <h2 className="font-display text-xl font-medium">
              Répartition des invités politiques
            </h2>
            <div className="flex min-h-64 w-full items-center justify-center sm:h-96 md:h-150">
              <div className="relative mt-auto max-sm:ml-3">
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
                <span className="font-display mx-auto -ml-2 inline-block w-[3ch] text-center text-xl font-medium oldstyle-nums max-sm:pt-4 sm:-ml-1 sm:text-2xl md:text-3xl">
                  {fakeParliamentMembers.length}
                </span>
              </div>
            </div>
          </section>
        )}

        <div className="flex w-full flex-col gap-4 md:gap-8">
          {mostInvitedParties.length > 0 && (
            <section className="flex w-full flex-col gap-1.5 md:gap-3">
              <h2 className="font-display text-xl font-medium">
                Partis les plus fréquents
              </h2>
              <div className="relative -ml-8 overflow-x-hidden">
                <div className="pointer-events-none absolute top-0 left-0 z-30 h-full w-8 -translate-x-1.5 bg-linear-to-r from-olive-200 via-olive-200"></div>
                <div className="pointer-events-none absolute top-0 right-0 z-30 h-full w-8 translate-x-1.5 bg-linear-to-l from-olive-200 via-olive-200"></div>
                <div className="no-scrollbar group/parties flex w-full gap-0 overflow-x-scroll pr-8 pb-1 pl-12 transition-[padding] hover:pl-9">
                  {Object.entries(mostInvitedParties).map(([id, [, party]]) => (
                    <div
                      key={id}
                      className={
                        "bg-background relative -ml-4 rounded-full transition-[margin] group-hover/parties:-ml-1" +
                        (party.name === "Gouvernement"
                          ? " border-primary border-2 border-dashed p-0"
                          : " p-0.5")
                      }
                    >
                      <PersonCircle
                        person={{
                          id: party.name,
                          name: party.name,
                          parties: [party],
                          party,
                        }}
                        viewMode={true}
                      />
                      <div className="absolute inset-x-0 -bottom-1 flex items-center justify-center">
                        <div className="bg-background border-foreground text-2xs rounded-sm border px-1 font-mono text-nowrap">
                          {party.occurences}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {mostInvitedGuests.length > 0 && (
            <section className="flex w-full flex-col gap-1.5 md:gap-3">
              <h2 className="font-display text-xl font-medium">
                Invités les plus fréquents
              </h2>
              <div className="relative -ml-8 overflow-x-hidden">
                <div className="pointer-events-none absolute top-0 left-0 z-30 h-full w-8 -translate-x-1.5 bg-linear-to-r from-olive-200 via-olive-200"></div>
                <div className="pointer-events-none absolute top-0 right-0 z-30 h-full w-8 translate-x-1.5 bg-linear-to-l from-olive-200 via-olive-200"></div>
                <div className="no-scrollbar group/parties flex w-full gap-0 overflow-x-scroll pr-8 pb-1 pl-10 transition-[padding] hover:pl-9">
                  {Object.entries(mostInvitedGuests).map(([id, [, guest]]) => (
                    <div
                      key={id}
                      style={
                        {
                          "--party-color": guest.party?.color,
                        } as React.CSSProperties
                      }
                      className="bg-background relative -ml-2 rounded-full p-0.5 transition-[margin] group-hover/parties:-ml-1"
                    >
                      <a
                        href={`https://fr.wikipedia.org/wiki/${guest.name}`}
                        target="_blank"
                        className={
                          "flex aspect-square size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-olive-300" +
                          (guest.party
                            ? ` border-2 border-(--party-color)`
                            : " border-border border")
                        }
                      >
                        {guest.image ? (
                          <img
                            src={`https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${guest.image}&width=80`}
                            className="size-full object-cover object-top"
                            alt=""
                          />
                        ) : (
                          // <UserIcon className="size-6 text-olive-400" />
                          <p className="text-2xs/tight font-display max-w-full p-1 text-center text-balance">
                            {guest.name.split(" ")[0].charAt(0)}.{" "}
                            {guest.name.split(" ").slice(1).join(" ")}
                          </p>
                        )}
                      </a>
                      <div className="absolute inset-x-0 -bottom-1 flex items-center justify-center">
                        <div className="bg-background border-foreground text-2xs rounded-sm border px-1 font-mono text-nowrap">
                          {guest.occurences}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      <Tooltip screenDimensions={screenDimensions} />
    </>
  );
}
