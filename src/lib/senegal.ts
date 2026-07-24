export const SENEGAL_REGIONS = [
  "Dakar",
  "Thiès",
  "Diourbel",
  "Fatick",
  "Kaffrine",
  "Kaolack",
  "Kédougou",
  "Kolda",
  "Louga",
  "Matam",
  "Saint-Louis",
  "Sédhiou",
  "Tambacounda",
  "Ziguinchor",
];

const SENEGAL_PHONE_REGEX = /^(?:\+221|221)?7[0-8]\d{7}$/;

export function isValidSenegalPhone(value: string) {
  return SENEGAL_PHONE_REGEX.test(value.replace(/[\s.-]/g, ""));
}
