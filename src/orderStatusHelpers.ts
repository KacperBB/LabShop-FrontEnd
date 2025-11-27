export const orderStatusLabels: Record<number, string> = {
  0: "Oczekuje na płatność",
  1: "Zapłacony",
  2: "W trakcie realizacji",
  3: "Wysłany",
  4: "Odebrany",
};

export const orderStatusOptions = [
  { value: 0, label: "Oczekuje na płatność" },
  { value: 1, label: "Zapłacony" },
  { value: 2, label: "W trakcie realizacji" },
  { value: 3, label: "Wysłany" },
  { value: 4, label: "Odebrany" },
];
