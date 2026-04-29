import { selectedShowAtom, shows } from "@/lib/atoms";
import type { SeasonType } from "@/types";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { useLocation } from "wouter";
import SettingsIcon from "~icons/tabler/adjustments";
import Controls from "./controls";
import { Button } from "./ui/button";
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
  const [showControls, setShowControls] = useState(true);
  const selectedShow = useAtomValue(selectedShowAtom);
  const [, navigate] = useLocation();
  const titles = shows
    .sort((a, b) =>
      a.title === selectedShow.title
        ? -1
        : b.title === selectedShow.title
          ? 1
          : 0,
    )
    .map((show) => ({
      value: show.slug,
      label: show.title,
      channel: show.channel,
    }));

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-2 pt-2 pb-2 md:pt-8">
      <div className="flex w-full flex-col gap-2 max-md:justify-end md:flex-row md:items-end md:justify-between">
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

        <p className="font-mono text-xs text-nowrap text-olive-500 sm:text-sm">
          [
          <span className="text-olive-700">
            {displayedSeasons.flatMap((s) => s.politicalGuests).length}{" "}
            politiques
          </span>
          &thinsp;/&thinsp;
          {displayedSeasons.flatMap((s) => s.seasonGuests).length} invités{" "}
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
        <Button
          size="icon-sm"
          aria-label="Paramètres"
          variant="outline"
          className={
            "absolute top-2 right-2 mt-1 md:top-8" +
            (showControls ? " bg-primary/5" : "")
          }
          onClick={() => setShowControls(!showControls)}
        >
          <SettingsIcon />
        </Button>
      </div>
      {showControls && <Controls />}
    </header>
  );
}
