import parliament from "@/data/parliament.json";
import { useTooltip } from "@/hooks/useTooltip";
import { getPartyInfos, partiesOrder } from "@/lib/utils";
import type { PartyType, PartyWithOccurencesType, RegimeType } from "@/types";
import TvIcon from "~icons/tabler/device-tv";
import { HemicycleIcon } from "./header";

type Props = {
  parties: {
    percentage: number;
    decimal: number;
    id: string;
    party: PartyWithOccurencesType;
    raw: number;
    floored: number;
  }[];
  title?: string;
  intervals?: number;
  comparizon?: {
    start: string;
    end: string;
  };
};
export default function PercentageBar({
  parties,
  title,
  intervals = 3,
  comparizon,
}: Props) {
  const mergedParliementParties: (PartyType & {
    percentage: number;
    occurences: number;
  })[] = [];
  let totalDeputiesFromFilteredLegislatures = 0;
  let comparizonTitle = "";

  if (comparizon) {
    const filteredLegislatures = (parliament as RegimeType[])
      .flatMap((regime) => regime.legislatures)
      .filter((legislature) => {
        const legislatureEnd =
          legislature.end === "now"
            ? new Date().toISOString().slice(0, 10)
            : legislature.end;
        return (
          legislature.begin <= comparizon.end &&
          legislatureEnd >= comparizon.start
        );
      });

    const merged: Record<string, number> = {};

    filteredLegislatures
      .flatMap((legislature) => legislature.parties)
      .forEach(({ name, deputies }) => {
        merged[name] = (merged[name] ?? 0) + deputies;
      });

    totalDeputiesFromFilteredLegislatures = filteredLegislatures
      .flatMap((legislature) => legislature.total_deputies)
      .reduce((acc, total) => acc + total);

    mergedParliementParties.push(
      ...Object.entries(merged).map(([name, deputies]) => {
        const percentage =
          (deputies / totalDeputiesFromFilteredLegislatures) * 100;
        const foundParty = getPartyInfos(name, false);

        return {
          name,
          full_name: foundParty.full_name,
          abbr: foundParty.abbr,
          color: foundParty.color,
          occurences: deputies,
          percentage,
        };
      }),
    );

    comparizonTitle = `Représentation des partis à l'Assemblée nationale en ${filteredLegislatures.length > 1 ? filteredLegislatures.map((l) => l.legislature).join(", ") + " (cumulé)" : filteredLegislatures[0].legislature}`;
  }

  return (
    <div className="flex flex-col gap-0">
      {title && <p className="font-display">{title}</p>}
      <div className="relative flex h-10 w-full overflow-hidden rounded-sm">
        {parties.map(({ id, party, percentage }) => {
          return (
            <PercentageParty
              key={id}
              party={{ ...party, percentage }}
              context="show"
            />
          );
        })}
        <div className="pointer-events-none absolute inset-0 flex justify-evenly">
          {Array.from({ length: intervals }).map((_, i: number) => (
            <div
              key={i}
              className="border-primary h-full w-px border-l border-dashed"
            ></div>
          ))}
        </div>
      </div>
      <div className="flex h-4 w-full items-center justify-evenly font-mono">
        {Array.from({ length: intervals }).map((_, i: number) => (
          <div key={i} className="text-3xs">
            {(((i + 1) * 100) / (intervals + 1)).toFixed(0)}%
          </div>
        ))}
      </div>

      {comparizon && (
        <>
          <div className="relative flex h-10 w-full overflow-hidden rounded-sm">
            {mergedParliementParties
              .sort(
                (a, b) =>
                  (partiesOrder.get(a.full_name) ?? Infinity) -
                  (partiesOrder.get(b.full_name) ?? Infinity),
              )
              .map((party, index) => {
                return (
                  <PercentageParty
                    key={party.name + index}
                    party={party}
                    context="parliament"
                    dataOffset={"0,-56"}
                  />
                );
              })}
            <div className="pointer-events-none absolute inset-0 flex justify-evenly">
              {Array.from({ length: intervals }).map((_, i: number) => (
                <div
                  key={i}
                  className="border-primary h-full w-px border-l border-dashed"
                ></div>
              ))}
            </div>
          </div>
          <p className="font-display">{comparizonTitle}</p>
        </>
      )}
    </div>
  );
}

export function PercentageParty({
  party,
  context,
  dataOffset = "0,0",
}: {
  party: PartyType & {
    percentage: number;
    occurences: number;
  };
  context: string;
  dataOffset?: string;
}) {
  const { elementRef, tooltipHandlers } = useTooltip({
    header: (
      <p className="text-primary font-display shrink-0 text-sm text-nowrap">
        <span className="flex items-center gap-1.5">
          {"color" in party && party.color && (
            <span
              className="inline-block size-2 shrink-0 rounded-full"
              style={{ backgroundColor: party.color }}
            ></span>
          )}{" "}
          {party.full_name || party.name}
        </span>
      </p>
    ),
    content: (
      <p className="flex gap-1 font-mono text-xs">
        {context === "parliament" ? <HemicycleIcon /> : <TvIcon />}
        {party.occurences}
        {context === "parliament" ? ` député` : ` participation`}
        {party.occurences > 1 ? "s " : " "}
        <span className="text-primary font-mono">
          (
          {context === "show"
            ? `~${party.percentage}`
            : party.percentage.toFixed(1)}
          %)
        </span>
      </p>
    ),
    id: party.name,
  });

  return (
    <div
      ref={elementRef}
      {...tooltipHandlers}
      className="bg-current-blended text-2xs h-full overflow-hidden font-mono"
      data-party={party.full_name || party.name}
      data-offset={dataOffset}
      tabIndex={0}
      style={
        {
          width: `${party.percentage}%`,
          "--current-color": party.color,
        } as React.CSSProperties
      }
    >
      <div className="flex h-full flex-col justify-between px-0.75 pt-px">
        {party.abbr && party.percentage > 3 && (
          <span className="text-primary">{party.abbr}</span>
        )}
        {party.percentage > 3 && (
          <span className="text-3xs max-sm:hidden">
            {party.percentage.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
