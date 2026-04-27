import {
  filteredDateRangeAtom,
  hideNeutralEpisodesAtom,
  originTotalAtom,
  selectedShowAtom,
  showParliamentAtom,
  shows,
} from "@/lib/atoms";
import { getDateFromOrigin } from "@/lib/utils";
import type { SeasonType } from "@/types";
import { useAtom, useAtomValue } from "jotai";
import { useLocation } from "wouter";
import CalendarIcon from "~icons/tabler/calendar-event";
import FilterIcon from "~icons/tabler/filter";
import HemicycleIcon from "~icons/tabler/wifi";
import { FieldGroup } from "./ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { SliderControlled } from "./ui/sliderControlled";
import { SwitchChoiceCard } from "./ui/switchChoiceCard";

export default function Header({
  displayedSeasons,
}: {
  displayedSeasons: SeasonType[];
}) {
  const [hideNeutralEpisodes, setHideNeutralEpisodes] = useAtom(
    hideNeutralEpisodesAtom,
  );
  const [showParliament, setShowParliament] = useAtom(showParliamentAtom);
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

  const { origin, totalMonths } = useAtomValue(originTotalAtom);
  const [dateRange, setDateRange] = useAtom(filteredDateRangeAtom);

  const dateRangeLabels = dateRange.map((i) =>
    getDateFromOrigin(origin, i).toLocaleDateString("fr", {
      month: "2-digit",
      year: "numeric",
    }),
  );
  const dateSliderMax = totalMonths - 1;

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-2 pt-2 pb-2 md:pt-8">
      <div className="flex w-full flex-col gap-2 md:flex-row md:items-baseline-last md:justify-between">
        <h1 className="font-display max-w-[40ch] text-2xl/tight font-medium text-balance">
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
              <SelectValue className="text-2xl text-olive-800 italic" />
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
      </div>
      <FieldGroup className="grid w-full grid-cols-1 gap-1.5 font-mono text-xs/tight max-sm:gap-x-0 sm:grid-cols-3 sm:gap-2.5">
        <div className="col-span-2 grid w-full grid-cols-2 gap-1.5 sm:gap-2.5">
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
            Icon={FilterIcon}
          />

          <SwitchChoiceCard
            title="Vue parlement"
            description="Afficher les politiques en parlement"
            id="show-parliament"
            onCheckedChange={() => {
              setShowParliament((prev) => !prev);
              if (!hideNeutralEpisodes && !showParliament) {
                setHideNeutralEpisodes(true);
              }
            }}
            checked={showParliament}
            Icon={HemicycleIcon}
          />
        </div>

        <SliderControlled
          title="Filtrer par date"
          labels={dateRangeLabels}
          max={dateSliderMax}
          value={dateRange}
          onValueChange={(value) =>
            setDateRange(value as number[] | readonly number[])
          }
          Icon={CalendarIcon}
        />
      </FieldGroup>
    </header>
  );
}
