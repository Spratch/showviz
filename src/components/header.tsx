import { shows } from "@/data/shows";
import { selectedShowAtom, showParliamentAtom } from "@/lib/atoms";
import type { SeasonType } from "@/types";
import ListIcon from "~icons/tabler/list-details";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

import { useAtom, useAtomValue } from "jotai";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function Header({
  displayedSeasons,
}: {
  displayedSeasons: SeasonType[];
}) {
  const [showParliament, setShowParliament] = useAtom(showParliamentAtom);
  const selectedShow = useAtomValue(selectedShowAtom);
  const [, navigate] = useLocation();
  const titles = shows.map((show) => ({
    value: show.slug,
    label: show.title,
    channel: show.channel,
  }));

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-2 pt-2 pb-2 md:pt-8">
      <div className="flex w-full flex-col items-start gap-2 md:flex-row md:justify-between">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h1 className="font-display max-w-[40ch] text-xl/tight font-medium text-balance sm:text-2xl/tight">
            <span className="relative z-10">
              Historique des&nbsp;invités&nbsp;de&nbsp;
            </span>
            <Select
              items={titles}
              onValueChange={(value) => navigate(`/${value}`)}
              value={selectedShow.slug}
            >
              <SelectTrigger
                className="hover:bg-muted relative z-0 -ml-2.5 inline-flex w-fit gap-x-2.5 border-none bg-transparent max-sm:-mt-1"
                aria-label="Sélectionner une émission"
              >
                <SelectValue className="text-xl/tight text-olive-800 italic sm:text-2xl" />
              </SelectTrigger>
              <SelectContent className="border shadow-none ring-0">
                <SelectGroup className="flex flex-col gap-1">
                  {titles.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                      className="aria-[selected=false]:text-olive-500"
                    >
                      <span className="flex flex-col">
                        <span className="-mb-px font-mono text-xs">
                          {item.channel}
                        </span>
                        <span className="font-display text-2xl/tight font-medium italic">
                          {item.label}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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

        <Tabs
          value={showParliament ? "hemicycle" : "list"}
          className="font-display"
        >
          <TabsList>
            <TabsTrigger
              value="hemicycle"
              onClick={() => setShowParliament(true)}
            >
              <HemicycleIcon />
              Invités politiques
            </TabsTrigger>
            <TabsTrigger value="list" onClick={() => setShowParliament(false)}>
              <ListIcon />
              Épisodes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
}

export function HemicycleIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.2"
      className="tabler-icon"
    >
      <path
        d="M0.96581 7.20134C2.95376 3.75727 7.35722 2.57737 10.8183 4.56139M3.60255 4.56072C7.0462 2.57204 11.4497 3.75194 13.455 7.20067"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.04358 8.39908C3.35875 7.85316 3.77836 7.37467 4.27846 6.99092C4.77856 6.60717 5.34935 6.32568 5.95823 6.16253C6.56712 5.99938 7.20218 5.95776 7.82715 6.04005C8.45212 6.12234 9.05477 6.32692 9.60067 6.64212M4.80212 6.64322C5.34803 6.32803 5.95067 6.12344 6.57564 6.04116C7.20061 5.95887 7.83567 6.00049 8.44456 6.16364C9.05345 6.32679 9.62424 6.60828 10.1243 6.99203C10.6244 7.37577 11.044 7.85427 11.3592 8.40019"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.12246 9.59933C5.44074 9.04824 5.96487 8.64613 6.57958 8.48142C7.19429 8.31671 7.84925 8.40288 8.40043 8.721M6.00237 8.72211C6.55355 8.40399 7.20851 8.31782 7.82322 8.48253C8.43793 8.64724 8.96205 9.04935 9.28033 9.60043"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
