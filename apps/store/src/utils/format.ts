export const toTitleCase = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase())
