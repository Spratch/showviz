import HemicyclePersonCircle from "@/components/hemicyclePersonCircle";
import useScreenDimensions from "@/hooks/useScreenWidth";
import { shows } from "@/lib/atoms";
import {
  computeHemicycleParams,
  getPersonInfos,
  partiesOrder,
} from "@/lib/utils";
import type { ShowType } from "@/types";
import { Hemicycle } from "@hemicycle/core";
import { Link } from "wouter";

const channelOwners = {
  Public: {
    color: "#FF4F3B",
    channels: ["France 2", "France 3", "France 5", "franceinfo"],
  },
  Bouygues: {
    color: "#F66719",
    channels: ["TF1"],
  },
  Indépendant: {
    color: "#CDCCCD",
    channels: ["Indépendant"],
  },
};

export default function Index() {
  const showsByChannelOwner = shows.reduce(
    (acc, show) => {
      let owner = "Indépendant";
      for (const [key, channels] of Object.entries(channelOwners)) {
        if (channels.channels.includes(show.channel)) {
          owner = key;
          break;
        }
      }
      if (!acc[owner]) acc[owner] = [];
      acc[owner].push(show);
      return acc;
    },
    {} as Record<string, ShowType[]>,
  );

  const screenDimensions = useScreenDimensions();
  const { screenWidth } = screenDimensions;

  return (
    <main className="flex w-full grow scale-90 flex-wrap items-center justify-center gap-8 overflow-x-hidden px-2 pb-8 md:gap-16 md:pt-6">
      {Object.entries(showsByChannelOwner).map(([owner, showList]) => (
        <div
          key={owner}
          className="border-border flex aspect-square w-160 flex-col items-center justify-center gap-4 rounded-full border bg-(--owner-color)/55 p-4"
          style={
            {
              "--owner-color":
                channelOwners[owner as keyof typeof channelOwners].color,
            } as React.CSSProperties
          }
        >
          <h2 className="font-display font-medium">{owner}</h2>
          <div className="flex flex-wrap content-center items-center justify-center">
            {showList
              .sort((a, b) => a.start.localeCompare(b.start))
              .map((show) => {
                const showGuests = show.diffusions
                  .flatMap((diffusion) =>
                    diffusion.guestsIds
                      .map((id) => getPersonInfos(id, diffusion))
                      .filter((m) => m.party),
                  )
                  .sort((a, b) => {
                    return (
                      (partiesOrder.get(a?.party?.name) ?? Infinity) -
                      (partiesOrder.get(b?.party?.name) ?? Infinity)
                    );
                  });

                const { rows } = computeHemicycleParams(
                  showGuests.length,
                  screenWidth,
                );

                const hemicycle = new Hemicycle({
                  rows,
                  orderBy: "radial",
                  totalSeats: showGuests.length,
                  outerRadius: 80,
                  innerRadius: 10,
                  totalAngle: 190,
                });
                const hemicycleLayout = hemicycle
                  .getSeatsLayout()
                  .sort((a, b) => a.radialIdx - b.radialIdx);

                return (
                  <Link
                    key={show.slug}
                    href={`/${show.slug}`}
                    className="border-border bg-background relative flex aspect-square w-48 items-center justify-center rounded-full border p-3 pt-24 text-center"
                  >
                    <div className="flex flex-col">
                      <h3 className="font-display text-sm/tight font-medium text-balance">
                        {show.title}
                      </h3>
                      <span className="font-mono text-xs">{show.channel}</span>
                    </div>
                    {showGuests.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative -mt-3.5 -ml-3.5 flex flex-wrap content-center items-center justify-center">
                          {showGuests.map((guest) => (
                            <HemicyclePersonCircle
                              key={guest.id + guest.episode.date}
                              person={guest}
                              position={
                                hemicycleLayout[showGuests.indexOf(guest)]
                              }
                              size="mini"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </main>
  );
}
