export const extractInterval = (inputString: string): [number, number] => {
  // Split the string at the slash
  const parts = inputString.split('/');

  // Extract the desired substrings
  const from = Number(parts[0].trim().split(' ').pop()); // Get the last word before the slash
  const to = Number(parts[1].trim().split(' ')[0]); // Get the first word after the slash

  return [from, to]; // Return as a tuple
};
