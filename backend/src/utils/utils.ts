export const extractInterval = (inputString: string): [number, number] => {
  // обработка случая, когда в строке указано количество 1000
  // "Резка круга 1000 лентопильным станком"
  if (inputString.includes('1000')) {
    inputString = formatString(inputString, 1000);
  }

  // Split the string at the slash or hyphen
  const parts = inputString.includes('/')
    ? inputString.split('/')
    : inputString.split('-');

  // Extract the desired substrings
  const from = Number(parts[0].trim().split(' ').pop()); // Get the last word before the slash
  const to = Number(parts[1].trim().split(' ')[0]); // Get the first word after the slash

  return [from, to]; // Return as a tuple
};

const formatString = (inputString: string, targetNumber: number): string => {
  const regex = new RegExp(`\\b${targetNumber}\\b`);
  return inputString.replace(regex, `${targetNumber}/${targetNumber}`);
};

export const isPresentInArray = (
  category: string,
  categories: string[],
): boolean => {
  return categories.some((element) => element === category);
};
