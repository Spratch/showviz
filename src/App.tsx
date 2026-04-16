import { motion } from "motion/react";
import { useState } from "react";
import "./App.css";
import { FieldGroup } from "./components/ui/field";
import PersonCircle from "./components/ui/personCircle";
import { SwitchChoiceCard } from "./components/ui/switchChoiceCard";
import families from "./data/families.json";
import people from "./data/people.json";
import quelleEpoque from "./data/quelle-epoque.json";
import type { FamilyType, PartyType, PersonType, ShowType } from "./types";

export default function App() {
  const shows: ShowType[] = [quelleEpoque];
  const data = shows[0];
  const currents = (families as FamilyType[]).flatMap((f) => f.currents);
  const partiesOrder = new Map(
    currents.flatMap((c) => c.parties).map((p, i) => [p.full_name, i]),
  );

  const getPartyInfos = (party: PartyType) => {
    const partyCurrent = currents.find((c) =>
      c.parties.flatMap((p) => p.full_name).includes(party.name),
    );
    const partyAbbr = partyCurrent?.parties.find(
      (p) => p.full_name === party.name,
    )?.name;
    return partyCurrent
      ? { color: partyCurrent.color, abbr: partyAbbr, partyCurrent }
      : { color: "lime", abbr: party.name, partyCurrent };
  };

  const getPersonInfos = (
    personId: string,
    episodeDate: string,
  ): PersonType | null => {
    const person: PersonType | undefined = (people as PersonType[]).find(
      (p) => p.id === personId,
    );
    if (!person || !(person.parties.length > 0)) return null;
    const foundParty =
      person.parties.find(
        (party) =>
          (party.start ? party.start <= episodeDate : true) &&
          (party.end ? party.end >= episodeDate : true),
      ) || null;
    const isGouv = person.parties.some(
      (party) =>
        (party.start ? party.start <= episodeDate : true) &&
        (party.end ? party.end >= episodeDate : true) &&
        party.name === "Gouvernement",
    );
    const { abbr, color, partyCurrent } = foundParty
      ? getPartyInfos(foundParty)
      : {};
    const party = foundParty
      ? {
          name: foundParty.name,
          abbr,
          color,
          partyCurrent,
        }
      : undefined;

    return { ...person, party, isGouv, episodeDate };
  };

  const seasonMap = data.diffusions.reduce(
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

  const seasons = Object.values(seasonMap);

  const [hideNeutralEpisodes, setHideNeutralEpisodes] = useState(false);
  const [showParliament, setShowParliament] = useState(false);

  return (
    <main className="flex min-h-svh w-svw flex-col items-center bg-olive-200 py-8 text-olive-600 antialiased">
      <header className="flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-2 pb-6 md:pt-8">
        <h1 className="font-display max-w-[30ch] text-2xl/tight font-medium text-pretty">
          Appartenances politiques des invités de&nbsp;
          <span className="text-olive-800 italic">{data.title}</span>
        </h1>
        <FieldGroup className="flex w-full flex-row gap-2.5 font-mono text-xs/tight">
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
            onCheckedChange={() => setShowParliament((prev) => !prev)}
            checked={showParliament}
          />
        </FieldGroup>
      </header>

      {!showParliament ? (
        <section className="flex max-w-5xl flex-col gap-8 px-2">
          {seasons
            .sort((a, b) => b.id.localeCompare(a.id))
            .map((season) => {
              return (
                <section key={season.id} className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 font-mono text-olive-700">
                    <div className="flex items-baseline gap-2">
                      <h2>
                        S{season.id}
                        <span className="ml-2 text-sm text-olive-600">
                          {season.episodes[0].date.split("-")[0]}-
                          {
                            season.episodes[
                              season.episodes.length - 1
                            ].date.split("-")[0]
                          }
                        </span>
                      </h2>
                      <p className="text-sm text-olive-500">
                        [
                        <span className="italic">
                          {season.episodes.length} épisodes
                        </span>
                        ]
                      </p>
                    </div>
                    <p className="text-sm text-olive-500">
                      [
                      <span className="text-olive-700">
                        {season.politicalGuests.length} politiques
                      </span>
                      /{season.seasonGuests.length} invités{" "}
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
                          <motion.article
                            layoutId={`episode-${episode.id}`}
                            className={`flex flex-row items-center ${politicalGuests.length > 0 ? "border" : hideNeutralEpisodes ? "hidden" : ""} gap-px rounded-4xl border-olive-400 bg-olive-300`}
                            key={episode.id}
                          >
                            <div className="-m-px flex aspect-square h-16 shrink-0 flex-wrap content-center items-center justify-center rounded-full border border-olive-400 bg-olive-300 p-3 hover:bg-olive-200">
                              {Array.from({
                                length: episode.guestsIds.length,
                              }).map((_, i) => {
                                const guest = politicalGuests.find(
                                  (g) => g?.id === episode.guestsIds[i],
                                );
                                return (
                                  <span
                                    key={i}
                                    className={`aspect-square w-2.5 rounded-full bg-(--current-color)/75 ${guest?.isGouv ? "border border-olive-600" : ""}`}
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
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </motion.article>
                        );
                      })}
                  </div>
                </section>
              );
            })}
        </section>
      ) : (
        <section className="flex max-w-5xl flex-wrap px-2">
          {seasons
            .flatMap((s) => s.politicalGuests)
            .filter(Boolean)
            .sort((a, b) => {
              return (
                (partiesOrder.get(a?.party?.name) ?? Infinity) -
                (partiesOrder.get(b?.party?.name) ?? Infinity)
              );
            })
            .map((guest) => {
              if (!guest) return null;
              return (
                <PersonCircle
                  key={guest.episodeDate + guest.id}
                  person={guest}
                />
              );
            })}
        </section>
      )}
    </main>
  );
}
