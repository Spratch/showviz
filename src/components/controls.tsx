import {
  filteredDateRangeAtom,
  hideNeutralEpisodesAtom,
  originTotalAtom,
  showParliamentAtom,
} from "@/lib/atoms";
import { getDateFromOrigin } from "@/lib/utils";
import { useAtom, useAtomValue } from "jotai";
import CalendarIcon from "~icons/tabler/calendar-event";
import FilterIcon from "~icons/tabler/filter";
import HemicycleIcon from "~icons/tabler/wifi";
import { Button } from "./ui/button";
import { FieldGroup } from "./ui/field";
import { SliderControlled } from "./ui/sliderControlled";

export default function Controls() {
  const [hideNeutralEpisodes, setHideNeutralEpisodes] = useAtom(
    hideNeutralEpisodesAtom,
  );
  const [showParliament, setShowParliament] = useAtom(showParliamentAtom);

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
    <FieldGroup className="flex w-full flex-row gap-1.5 font-mono text-xs/tight max-sm:gap-x-0 sm:gap-2.5">
      <div className="flex flex-col justify-between gap-1.5 sm:gap-2.5">
        <Button
          variant={hideNeutralEpisodes ? "default" : "outline"}
          size="icon-sm"
          onClick={() => {
            setHideNeutralEpisodes((prev) => !prev);
            if (showParliament && hideNeutralEpisodes) {
              setShowParliament(false);
            }
          }}
          title="N'afficher que les épisodes avec des invités politiques"
        >
          <FilterIcon />
        </Button>
        {/*<SwitchChoiceCard
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
        />*/}

        <Button
          variant={showParliament ? "default" : "outline"}
          size="icon-sm"
          onClick={() => {
            setShowParliament((prev) => !prev);
            if (!hideNeutralEpisodes && !showParliament) {
              setHideNeutralEpisodes(true);
            }
          }}
          title="Afficher les politiques en parlement"
        >
          <HemicycleIcon />
        </Button>
        {/*<SwitchChoiceCard
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
        />*/}
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
  );
}
