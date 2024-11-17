import { TAdminCut } from './types';

export const getCutId = (cuts: TAdminCut[], cutName: string): number => {
  const currentCut = cuts.find((cut) => cut.name === cutName);
  if (!currentCut) {
    return -1;
  }
  return currentCut.id;
};
