import { SliderControlled } from "@/components/ui/sliderControlled";
import { filteredDateRangeAtom, originTotalAtom } from "@/lib/atoms";
import { getDateFromOrigin } from "@/lib/utils";
import { useAtom, useAtomValue } from "jotai";
import CalendarIcon from "~icons/tabler/calendar-event";

export default function Footer() {
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
    <footer className="pointer-events-none fixed bottom-0 z-30 flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-2 pt-2 pb-2 font-mono md:pt-8">
      <SliderControlled
        title="Filtrer par date"
        labels={dateRangeLabels}
        max={dateSliderMax}
        value={dateRange}
        className="pointer-events-auto"
        onValueChange={(value) =>
          setDateRange(value as number[] | readonly number[])
        }
        Icon={CalendarIcon}
      />
    </footer>
  );
}
