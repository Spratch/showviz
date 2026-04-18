import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { filteredDateRangeAtom, originTotalAtom } from "@/lib/atoms";
import { getDateFromOrigin } from "@/lib/utils";
import { useAtom, useAtomValue } from "jotai";

export function SliderControlled({ title }: { title: string }) {
  const { origin, totalMonths } = useAtomValue(originTotalAtom);
  const [range, setRange] = useAtom(filteredDateRangeAtom);

  const labels = range.map((i) =>
    getDateFromOrigin(origin, i).toLocaleDateString("fr", {
      month: "2-digit",
      year: "numeric",
    }),
  );
  return (
    <div className="grid w-full gap-3 rounded-lg border p-2.5 text-sm max-sm:max-w-[40ch]">
      <div className="flex flex-wrap items-center justify-between gap-x-2">
        <Label
          htmlFor="slider-date"
          className="font-display text-sm text-nowrap"
        >
          {title}
        </Label>
        <span className="text-muted-foreground text-xs text-nowrap md:text-sm">
          {labels.join(" - ")}
        </span>
      </div>
      <Slider
        id="slider-date"
        value={range}
        onValueChange={(value) =>
          setRange(value as number[] | readonly number[])
        }
        min={0}
        max={totalMonths - 1}
        step={1}
      />
    </div>
  );
}
