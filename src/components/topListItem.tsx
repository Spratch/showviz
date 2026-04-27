import { useTooltip } from "@/hooks/useTooltip";
import type { ListItemType, PersonType } from "@/types";
import PersonInfos from "./personInfos";

export default function TopListItem<T extends ListItemType>({
  id,
  item,
  renderItem,
}: {
  id: string;
  item: ListItemType;
  renderItem: (id: string, item: T) => React.ReactNode;
}) {
  const { elementRef, tooltipHandlers } = useTooltip({
    header:
      "categories" in item ? (
        <PersonInfos showImage={false} guest={item as PersonType} />
      ) : (
        <p className="text-primary font-display shrink-0 text-sm text-nowrap">
          <span className="flex items-center gap-1.5">
            {"color" in item && item.color && (
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              ></span>
            )}{" "}
            {item.name}
          </span>
        </p>
      ),
    content: (
      <div className="flex flex-col gap-1 font-mono text-xs">
        {item.episodes.map((episode) => (
          <span>
            {new Date(episode).toLocaleDateString("fr", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        ))}
      </div>
    ),
    id: id + item.name,
  });

  return (
    <div
      ref={elementRef}
      {...tooltipHandlers}
      data-offset={60}
      className={
        "bg-background relative -ml-3 rounded-full p-0.5 transition-[padding] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:pb-8 sm:-ml-3.5 md:-ml-4 " +
        (item.name === "Gouvernement" ? " opacity-60" : "")
      }
    >
      {renderItem(id, item as T)}
      <div className="absolute inset-x-0 -bottom-1 flex items-center justify-center">
        <div className="bg-background border-foreground text-2xs rounded-sm border px-1 font-mono text-nowrap">
          {item.occurences}
        </div>
      </div>
    </div>
  );
}
