export type Member = {
  id: string;
  name: string;
  x: number;
  y: number;
};

export type Formation = {
  members: Member[];
};

export const FORMATION_FORMAT_VERSION = 1;

export type FormationFile = {
  version: typeof FORMATION_FORMAT_VERSION;
  members: Member[];
};
