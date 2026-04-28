import type { FamilyType, PartyType, PersonType } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import families from "../data/families.json";
import people from "../data/people.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function startOfMonth(timestamp: number): Date {
  const d = new Date(timestamp);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function getDateFromOrigin(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export function monthIndex(origin: Date, date: Date): number {
  return (
    (date.getFullYear() - origin.getFullYear()) * 12 +
    (date.getMonth() - origin.getMonth())
  );
}

export const currents = (families as FamilyType[]).flatMap((f) => f.currents);
export const partiesOrder = new Map(
  currents.flatMap((c) => c.parties).map((p, i) => [p.full_name, i]),
);

export const getPartyInfos = (party: PartyType) => {
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

export const getPersonInfos = (
  personId: string,
  episode: NonNullable<PersonType["episode"]>,
): PersonType => {
  const person: Omit<PersonType, "episode"> | undefined = (
    people as Omit<PersonType, "episode">[]
  ).find((p) => p.id === personId);
  if (!person)
    return {
      id: personId,
      name: personId,
      parties: [],
      episode: episode,
    };
  const foundParty =
    (person.parties &&
      person.parties.find(
        (party) =>
          (party.start ? party.start <= episode.date : true) &&
          (party.end ? party.end >= episode.date : true),
      )) ||
    null;
  const isGouv =
    person.parties &&
    person.parties.some(
      (party) =>
        (party.start ? party.start <= episode.date : true) &&
        (party.end ? party.end >= episode.date : true) &&
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

  return { ...person, party, isGouv, episode };
};
