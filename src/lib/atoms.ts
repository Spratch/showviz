import cCeSoir from "@/data/c-ce-soir.json";
import yeuxdAgathe from "@/data/dans-les-yeux-dagathe.json";
import levenement from "@/data/l-evenement.json";
import quelleEpoque from "@/data/quelle-epoque.json";
import thinkerview from "@/data/thinkerview.json";
import type { ShowType, TooltipContentType } from "@/types";
import { atom } from "jotai";
import { getDateFromOrigin, monthIndex, startOfMonth } from "./utils";

// const global: ShowType = {
//   slug: "global",
//   title: "global",
//   channel: "france·tv",
//   start: "",
//   end: "",
//   diffusions: [
//     ...quelleEpoque.diffusions.map((episode) => ({
//       ...episode,
//       showTitle: "global-" + quelleEpoque.title,
//     })),
//     ...levenement.diffusions.map((episode) => ({
//       ...episode,
//       showTitle: "global-" + levenement.title,
//     })),
//     ...yeuxdAgathe.diffusions.map((episode) => ({
//       ...episode,
//       showTitle: "global-" + yeuxdAgathe.title,
//     })),
//     ...cCeSoir.diffusions.map((episode) => ({
//       ...episode,
//       showTitle: "global-" + cCeSoir.title,
//     })),
//   ],
// };
export const shows: ShowType[] = [
  quelleEpoque,
  levenement,
  yeuxdAgathe,
  cCeSoir,
  thinkerview,
  // global,
];
export const selectedShowAtom = atom(shows[0]);

export const hideNeutralEpisodesAtom = atom(false);
export const showParliamentAtom = atom(false);

export const showDateRangeAtom = atom({ min: 0, max: 10000 });
export const originTotalAtom = atom((get) => {
  const { min, max } = get(showDateRangeAtom);
  const origin = startOfMonth(min);
  const totalMonths = monthIndex(origin, startOfMonth(max)) + 1;
  return { origin, totalMonths };
});

const filteredDateRangeOverrideAtom = atom<number[] | null>(null);
export const filteredDateRangeAtom = atom<
  number[] | readonly number[],
  [number[] | readonly number[]],
  void
>(
  (get) => {
    const override = get(filteredDateRangeOverrideAtom);
    if (override !== null) return override;

    const { totalMonths } = get(originTotalAtom);
    return [0, totalMonths - 1];
  },
  (_, set, newValue) => {
    set(filteredDateRangeOverrideAtom, newValue as number[]);
  },
);
export const convertedDateRangeAtom = atom((get) => {
  const { origin } = get(originTotalAtom);
  const [min, max] = get(filteredDateRangeAtom);
  return [getDateFromOrigin(origin, min), getDateFromOrigin(origin, max + 1)];
});

export const tooltipContentAtom = atom<TooltipContentType | null>(null);
