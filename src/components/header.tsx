import { shows } from "@/data/shows";
import {
  hideNeutralEpisodesAtom,
  selectedShowAtom,
  showParliamentAtom,
} from "@/lib/atoms";
import type { SeasonType } from "@/types";
import ListIcon from "~icons/tabler/list-details";
import HemicycleIcon from "~icons/tabler/wifi";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

import { useAtomValue, useSetAtom } from "jotai";
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
  const setShowParliament = useSetAtom(showParliamentAtom);
  const setHideNeutralEpisodes = useSetAtom(hideNeutralEpisodesAtom);
  const selectedShow = useAtomValue(selectedShowAtom);
  const [, navigate] = useLocation();
  const titles = shows.map((show) => ({
    value: show.slug,
    label: show.title,
    channel: show.channel,
  }));

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-2 pt-2 pb-2 md:pt-8">
      <div className="flex w-full flex-col gap-2 max-md:justify-end md:flex-row md:justify-between">
        <h1 className="font-display max-w-[40ch] text-xl/tight font-medium text-balance sm:text-2xl/tight">
          <span className="relative z-10">
            Appartenances politiques des&nbsp;invités&nbsp;de&nbsp;
          </span>
          <Select
            items={titles}
            onValueChange={(value) => navigate(`/${value}`)}
            value={selectedShow.slug}
          >
            <SelectTrigger
              className="hover:bg-muted relative z-0 -ml-2.5 inline-flex w-fit gap-x-2.5 border-none bg-transparent"
              aria-label="Sélectionner une émission"
            >
              <SelectValue className="text-xl/tight text-olive-800 italic sm:text-2xl" />
            </SelectTrigger>
            <SelectContent className="-mt-14.75 -ml-px border shadow-none ring-0">
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

        <div className="flex flex-col items-end justify-between">
          <Tabs defaultValue="hemicycle">
            <TabsList>
              <TabsTrigger
                value="hemicycle"
                onClick={() => {
                  setShowParliament(true);
                  setHideNeutralEpisodes(true);
                }}
              >
                <HemicycleIcon />
                Invités politiques
              </TabsTrigger>
              <TabsTrigger
                value="list"
                onClick={() => {
                  setShowParliament(false);
                  setHideNeutralEpisodes(false);
                }}
              >
                <ListIcon />
                Épisodes
              </TabsTrigger>
            </TabsList>
          </Tabs>

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
      </div>
    </header>
  );
}
