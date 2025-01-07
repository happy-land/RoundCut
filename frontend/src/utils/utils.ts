import { mapBaseName } from './mapping';
import { TPriceItem } from './types';

export const extractFirstWord = (input: string): string => {
  // Split the string by spaces and return the first element
  const words = input.split(' ');
  return words[0];
};

export const convertToPriceItem = (arr: string[]): TPriceItem => {
  const createdPriceItem = {
    actualBalance: parsePotentiallyGroupedFloat(arr[0] as string),
    unitWeight: parsePotentiallyGroupedFloat(arr[1] as string),
    unitPrice: parsePotentiallyGroupedFloat(arr[2] as string),
    pricePer1tn: parsePotentiallyGroupedFloat(arr[3] as string),
    pricePer5tn: parsePotentiallyGroupedFloat(arr[4] as string),
    pricePer15tn: parsePotentiallyGroupedFloat(arr[5] as string),
    baseName: mapBaseName(arr[6] as string),
    name: arr[7] as string,
    size: arr[8] as string,
    surface: arr[9] as string,
    other: arr[10] as string,
    productGroup: arr[11] as string,
    length: parsePotentiallyGroupedFloat(arr[12] as string),
    categoryName: arr[14],
  };
  return createdPriceItem;
};

const parsePotentiallyGroupedFloat = (stringValue: string) => {
  return parseFloat(stringValue.replace(',', '.').replace(' ', ''));
};
