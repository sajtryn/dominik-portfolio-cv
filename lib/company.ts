export const COMPANY = {
  name: "VictoriaCamp-IT Dominik Rodziewicz",
  brand: "VictoriaCamp-IT",
  owner: "Dominik Rodziewicz",
  street: "Slaska 85",
  postalCity: "66-620 Gubin",
  nip: "9261694957",
  email: "dominikit32123@gmail.com",
  phone: "+48 665 763 296",
  github: "https://github.com/sajtryn",
} as const;

export const phoneHref = `tel:${COMPANY.phone.replace(/\s+/g, "")}`;
