import type { ListItemType } from "@/types";
import TopListItem from "./topListItem";

export default function TopList<T extends ListItemType>({
  title,
  list,
  renderItem,
}: {
  title: string;
  list: [string, T][];
  renderItem: (id: string, item: T) => React.ReactNode;
}) {
  return (
    <section className="flex w-full flex-col gap-1.5 md:gap-3">
      <h2 className="font-display text-base font-medium sm:text-xl">{title}</h2>
      <div className="no-scrollbar scroll-mask-x-8 -mt-8 flex h-24 w-full items-end gap-0 overflow-x-scroll pb-1 pl-4">
        {Object.entries(list).map(([id, [, item]]) => (
          <TopListItem key={id} id={id} item={item} renderItem={renderItem} />
        ))}
      </div>
    </section>
  );
}
