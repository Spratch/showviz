import type { PersonType, PersonWithOccurencesType } from "@/types";
import Laurel1Icon from "~icons/tabler/laurel-wreath-1";
import Laurel2Icon from "~icons/tabler/laurel-wreath-2";
import Laurel3Icon from "~icons/tabler/laurel-wreath-3";
import UserIcon from "~icons/tabler/user";

export default function PersonInfos({
  guest,
}: {
  guest: PersonWithOccurencesType | PersonType;
}) {
  const hasIndex = "index" in guest;

  const laurels = [
    { Icon: Laurel1Icon, className: "text-amber-500" },
    { Icon: Laurel2Icon, className: "text-zinc-400" },
    { Icon: Laurel3Icon, className: "text-yellow-600/70" },
  ];

  const laurel = laurels[hasIndex ? guest.index - 1 : 0];

  return (
    <div
      style={{ "--party-color": guest.party?.color } as React.CSSProperties}
      className="z-0 flex max-w-[35ch] shrink-0 items-center gap-2.5 overflow-hidden"
    >
      {hasIndex && (
        <p className="shrink-0 font-mono text-sm text-olive-500">
          {laurel ? (
            <laurel.Icon className={`no-scaling size-6 ${laurel.className}`} />
          ) : (
            guest.index
          )}
        </p>
      )}
      <a
        href={`https://fr.wikipedia.org/wiki/${guest.name}`}
        target="_blank"
        className={
          "flex aspect-square size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-olive-300" +
          (guest.party
            ? ` border-2 border-(--party-color)`
            : " border-border border")
        }
      >
        {guest.image ? (
          <img
            src={`https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${guest.image}&width=80`}
            className="size-full object-cover object-top"
            alt=""
          />
        ) : (
          <UserIcon className="size-6 text-olive-400" />
        )}
      </a>

      <div className="font-display flex min-w-0 flex-col overflow-hidden text-sm">
        <p className="flex min-w-0 items-center gap-1.5 overflow-hidden">
          <a
            href={`https://fr.wikipedia.org/wiki/${guest.name}`}
            target="_blank"
            className="text-primary shrink-0 text-nowrap"
          >
            {guest.name}
          </a>

          {guest.party && (
            <>
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ backgroundColor: guest.party.color }}
              ></span>
              <span className="text-muted-foreground -ml-0.5 flex min-w-0 gap-1">
                {guest.isGouv && (
                  <span className="shrink-0 underline underline-offset-2">
                    Gouvernement
                  </span>
                )}
                {guest.party.name !== "Gouvernement" && (
                  <span className="truncate">{guest.party.name}</span>
                )}
              </span>
            </>
          )}
        </p>
        {hasIndex && (
          <span className="text-foreground font-mono text-xs">
            {guest.occurences}&thinsp;interventions
          </span>
        )}
        {guest.categories && guest.categories.length > 0 && (
          <span className="text-muted-foreground max-w-[30ch] truncate font-mono text-xs italic first-letter:capitalize">
            {guest.categories[0]}
          </span>
        )}
      </div>
    </div>
  );
}
