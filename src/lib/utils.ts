import type { FamilyType, PersonType } from "@/types";
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

export const getPartyInfos = (partyName: string, isFullName = true) => {
  const partyCurrent = currents.find((c) =>
    c.parties
      .flatMap((p) => (isFullName ? p.full_name : p.name))
      .includes(partyName),
  );
  const foundParty = partyCurrent?.parties.find(
    (p) => (isFullName ? p.full_name : p.name) === partyName,
  );

  const partyAbbr = isFullName ? foundParty?.name : partyName;

  const partyFullName = foundParty?.full_name;

  return partyCurrent
    ? {
        color: partyCurrent.color,
        abbr: partyAbbr,
        partyCurrent,
        full_name: partyFullName,
      }
    : { color: "lime", abbr: partyName, partyCurrent };
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
    ? getPartyInfos(foundParty.name)
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

export function computeHemicycleParams(n: number, screenWidth: number) {
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
