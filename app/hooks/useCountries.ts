import { useMemo } from "react";

const countries = [
  {
    value: "GAZA",
    label: "Gaza",
    flag: "🇵🇸",
    latlng: [31.5017, 34.4668],
    region: "Gaza Strip"
  },
  {
    value: "KHAN_YUNIS",
    label: "Khan Yunis",
    flag: "🇵🇸",
    latlng: [31.3462, 34.2951],
    region: "Gaza Strip"
  },
  {
    value: "RAFAH",
    label: "Rafah",
    flag: "🇵🇸",
    latlng: [31.2969, 34.2435],
    region: "Gaza Strip"
  },
  {
    value: "DEIR_AL_BALAH",
    label: "Deir al-Balah",
    flag: "🇵🇸",
    latlng: [31.4187, 34.3492],
    region: "Gaza Strip"
  },
  {
    value: "JABALIA",
    label: "Jabalia",
    flag: "🇵🇸",
    latlng: [31.5281, 34.4831],
    region: "Gaza Strip"
  }
];

const useCountries = () => {
  const getAll = useMemo(() => countries, []);

  const getByValue = (value: string) => {
    return countries.find((item) => item.value === value);
  };

  return {
    getAll,
    getByValue
  };
};

export default useCountries; 