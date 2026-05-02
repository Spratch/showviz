import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";

export function SliderControlled({
  title,
  labels,
  max,
  Icon,
  ...props
}: SliderPrimitive.Root.Props & {
  title: string;
  labels: string[];
  max: number;
  Icon?: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string;
    }
  >;
}) {
  return (
    <div
      className={cn(
        "grid w-full gap-1.5 rounded-lg border p-2.5 text-sm sm:gap-3",
        props.className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2">
        <Label
          htmlFor="slider-date"
          className="font-display text-xs text-nowrap sm:text-sm"
        >
          {Icon && <Icon className="mt-0.5" />}
          {title}
        </Label>
        <span className="text-muted-foreground text-2xs text-nowrap sm:text-xs">
          {labels.join(" - ")}
        </span>
      </div>
      <Slider id="slider-date" min={0} max={max} step={1} {...props} />
    </div>
  );
}
