import type { PersonType } from "@/types";
import UserIcon from "~icons/tabler/user";

export default function PersonInfos({
  guest,
  showImage = true,
}: {
  guest: PersonType;
  showImage?: boolean;
}) {
  return (
    <div
      style={{ "--party-color": guest.party?.color } as React.CSSProperties}
      className="z-0 flex max-w-[35ch] shrink-0 items-center gap-2.5 overflow-hidden"
    >
      {showImage && (
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
              className="size-full object-cover object-[center_15%]"
              alt=""
            />
          ) : (
            <UserIcon className="size-6 text-olive-400" />
          )}
        </a>
      )}

      <div className="font-display flex min-w-0 flex-col overflow-hidden text-sm">
        <p
          className={`flex min-w-0 overflow-hidden ${!showImage ? "flex-col items-start" : "items-center gap-1.5"}`}
        >
          <a
            href={`https://fr.wikipedia.org/wiki/${guest.name}`}
            target="_blank"
            className="text-primary shrink-0 text-nowrap"
          >
            {guest.name}
          </a>

          {guest.party && (
            <span className="flex items-center gap-1.5">
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
            </span>
          )}
        </p>
        {guest.categories && guest.categories.length > 0 && (
          <span className="text-muted-foreground max-w-[35ch] truncate font-mono text-xs italic first-letter:capitalize">
            {guest.categories[0]}
          </span>
        )}
      </div>
    </div>
  );
}
