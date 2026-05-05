import { shows } from "@/data/shows";
import type { TooltipContentType } from "@/types";
import { atom } from "jotai";
import { getDateFromOrigin, monthIndex, startOfMonth } from "./utils";

export const selectedShowAtom = atom(shows[0]);

export const hideNeutralEpisodesAtom = atom(false);
export const showParliamentAtom = atom(true);

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
