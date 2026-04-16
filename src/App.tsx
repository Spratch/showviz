import type { CSSProperties } from "react";
import "./App.css";
import families from "./data/families.json";
import people from "./data/people.json";
import quelleEpoque from "./data/quelle-epoque.json";
import type { FamilyType, PartyType, PersonType, ShowType } from "./types";

export default function App() {
  const shows: ShowType[] = [quelleEpoque];
  const data = shows[0];
  const currents = (families as FamilyType[]).flatMap((f) => f.currents);

  const diffusionsBySeason = data.diffusions.reduce(
    (acc, diffusion) => {
      const season = diffusion.id.split("-")[0];
      if (!acc[season]) {
        acc[season] = [];
      }
      acc[season].push(diffusion);
      return acc;
    },
    {} as Record<string, typeof data.diffusions>,
  );

  const getPartyInfos = (party: PartyType) => {
    const partyCurrent = currents.find((c) =>
      c.parties.flatMap((p) => p.full_name).includes(party.name),
    );
    const partyAbbr = partyCurrent?.parties.find(
      (p) => p.full_name === party.name,
    )?.name;
    return partyCurrent
      ? { color: partyCurrent.color, abbr: partyAbbr }
      : { color: "lime", abbr: party.name };
  };

  const getPersonInfos = (personId: string, episodeDate: string) => {
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
    const party = foundParty
      ? {
          name: foundParty.name,
          abbr: getPartyInfos(foundParty).abbr,
          color: getPartyInfos(foundParty).color,
        }
      : null;

    return { ...person, party, isGouv };
  };
  return (
    <main className="flex flex-col h-svh w-svw items-center antialiased bg-olive-200 text-olive-600">
      <header className="flex flex-col max-w-5xl w-full pt-8 pb-6 px-2">
        <h1 className="text-2xl/tight max-w-[30ch] text-pretty font-display font-medium">
          Appartenances politiques des invités de&nbsp;
          <span className="italic text-olive-800">{data.title}</span>
        </h1>
      </header>
      <section className="flex flex-col-reverse px-2 gap-6 max-w-5xl">
        {Object.entries(diffusionsBySeason).map(([season, episodes]) => {
          return (
            <section key={season} className="flex flex-col gap-2">
              <div className="flex gap-2 items-baseline font-mono text-olive-700">
                <h2>
                  S{season}
                  <span className="text-sm text-olive-600 ml-2">
                    {episodes[0].date.split("-")[0]}-
                    {episodes[episodes.length - 1].date.split("-")[0]}
                  </span>
                </h2>
                <p className="text-sm text-olive-500">
                  [{episodes.length} épisodes]
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {episodes
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((episode) => {
                    const politicalGuests = episode.guestsIds
                      .map((guest) => getPersonInfos(guest, episode.date))
                      .filter((guest) => guest?.party);
                    return (
                      <article
                        className={`flex flex-row items-center ${politicalGuests.length > 0 ? "border" : ""} rounded-4xl border-olive-400 gap-px bg-olive-300`}
                        key={episode.id}
                      >
                        <div className="flex flex-wrap items-center justify-center content-center shrink-0 rounded-full aspect-square h-16 p-3 border border-olive-400 bg-olive-300 -m-px">
                          {Array.from({
                            length: episode.guestsIds.length,
                          }).map((_, i) => (
                            <span
                              key={i}
                              className={`bg-(--current-color)/75 w-2.5 aspect-square rounded-full`}
                              style={
                                {
                                  "--current-color":
                                    politicalGuests.find(
                                      (g) => g?.id === episode.guestsIds[i],
                                    )?.party?.color ?? "var(--color-olive-400)",
                                } as CSSProperties
                              }
                            ></span>
                          ))}
                        </div>
                        {politicalGuests.length > 0 && (
                          <div className="flex -m-px">
                            {politicalGuests.map((guest) => {
                              return (
                                <div
                                  key={guest?.id}
                                  className={` items-center justify-center p-1.5 w-16 flex bg-(--current-color)/75 flex-col aspect-square rounded-full ${guest?.isGouv ? "border-2 border-olive-600" : ""}`}
                                  style={
                                    {
                                      "--current-color": guest?.party?.color,
                                    } as CSSProperties
                                  }
                                >
                                  <p className="text-olive-800  font-mono text-sm">
                                    {guest?.party?.abbr}
                                  </p>
                                </div>
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
    </main>
  );
}
