export type ShowType = {
  slug: string;
  title: string;
  channel: string;
  start: string;
  end: string;
  seasonsNumber?: number;
  firstSeason?: number;
  diffusions: {
    id: string;
    title?: string;
    date: string;
    guestsIds: string[];
    viewers?: number;
    viewersPercentage?: number;
    showTitle?: string;
  }[];
};

export type SeasonType = {
  id: string;
  politicalGuests: PersonType[];
  seasonGuests: PersonType[];
  episodes: ShowType["diffusions"];
};

export type PartyType = {
  name: string;
  start?: string;
  end?: string;
  full_name?: string;
  abbr?: string;
  color?: string;
};

export type PersonDataType = {
  birthDate?: string;
  gender?: string;
  occupations?: string[];
  parties: PartyType[];
};

export type PersonType = PersonDataType & {
  id: string;
  name: string;
  categories?: string[];
  isGouv?: boolean;
  party?: PartyType;
  image?: string;
  episode: {
    showTitle?: string;
    date: string;
    title?: string;
  };
};

export type PersonWithOccurencesType = PersonType & {
  occurences: number;
  index: number;
  episodes: NonNullable<PersonType["episode"]>[];
};

export type EpisodeWithPersonType = NonNullable<PersonType["episode"]> & {
  person?: PersonType;
};

export type PartyWithOccurencesType = PartyType & {
  occurences: number;
  index: number;
  episodes: EpisodeWithPersonType[];
};

export type CurrentType = {
  name: string;
  name_en?: string;
  name_de?: string;
  color: string;
  keyword?: string;
  parties: PartyType[];
  source?: string[];
};

export type FamilyType = {
  name: string;
  name_en?: string;
  name_de?: string;
  color: string;
  currents: CurrentType[];
};

export type TooltipContentType = {
  x?: number;
  y?: number;
  header: React.ReactNode;
  content: React.ReactNode;
  id: string;
};

export type ListItemType = PersonWithOccurencesType | PartyWithOccurencesType;
