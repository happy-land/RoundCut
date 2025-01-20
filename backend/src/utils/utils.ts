export const extractInterval = (inputString: string): [number, number] => {
  // Split the string at the slash or hyphen
  const parts = inputString.includes('/')
    ? inputString.split('/')
    : inputString.split('-');

  // Extract the desired substrings
  const from = Number(parts[0].trim().split(' ').pop()); // Get the last word before the slash
  const to = Number(parts[1].trim().split(' ')[0]); // Get the first word after the slash

  return [from, to]; // Return as a tuple
};

export const isPresentInArray = (
  category: string,
  categories: string[],
): boolean => {
  // console.log(`isUniqueCategory: ${category}`);
  // if (categories.length === 0) return false;
  return categories.some((element) => element === category);
};
