export type ShowType = {
  title: string;
  channel: string;
  start: string;
  end: string;
  diffusions: {
    id: string;
    date: string;
    guestsIds: string[];
    viewers: number;
    viewersPercentage: number;
  }[];
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
  episodeDate?: string;
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
