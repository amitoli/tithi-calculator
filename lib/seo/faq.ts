export const FAQ_ITEMS = [
  {
    question: "How do I calculate a Barshik or Barkhanta date?",
    answer:
      "Barshik (also called Barkhanta) is the first-year Hindu death anniversary. It is observed on the same lunar tithi as the date of passing, not on the Gregorian calendar date one year later. Enter the date of demise in Nepali (B.S.) month and gatey or in Gregorian form, choose the place of passing, and this calculator returns the next matching tithi day. Later years are the same rite, called annual shraddha.",
  },
  {
    question: "How to find a Hindu death anniversary tithi?",
    answer:
      "Read the tithi at the time of death in the local timezone of the place of passing. If death was before local sunrise, the printed panchang tithi for that civil day is the sunrise tithi. Annual rites then fall on the civil day whose sunrise tithi matches that death tithi, in the same lunar month and paksha.",
  },
  {
    question: "How does Adhik Maas change the Barshik date?",
    answer:
      "Adhik Maas is an intercalary lunar month. When one falls between the date of passing and the anniversary, the lunar year is about 13 months instead of 12, so the Gregorian Barshik date shifts later by roughly a month. This calculator detects Adhik Maas and schedules the nija (regular) matching tithi, which is why a Barshik date calculator after Adhik Maas often disagrees with a simple 365-day count.",
  },
  {
    question: "Is a Nepali gatey the same as a tithi?",
    answer:
      "No. Gatey is the civil day on the Bikram Sambat calendar. Tithi is the lunar elongation (the moon’s phase) used for shraddha. Families often remember “Mangsir 15,” which this tool converts to a Gregorian instant; the rite still follows the tithi at that place and time.",
  },
  {
    question: "Have you handled sunrise timing and regional variations?",
    answer:
      "Sunrise is computed for the selected city (latitude, longitude, and timezone). A pre-sunrise death uses that morning’s sunrise tithi. The day’s printed tithi is the sunrise tithi. If the death tithi is skipped at sunrise (kshaya), the day when it falls in Aparahna is used. Regional month naming is handled by Purnimanta (Nepal and North India, month ends on Purnima) versus Amanta (South and West India, month ends on Amavasya). Place lists include Nepal, Assam Nepali-belt towns, and other diaspora cities. Local priests and published panchangs can still differ on sandhi (tithi-change) rules; confirm the final date with your family pujari.",
  },
  {
    question: "What if the time of death is unknown?",
    answer:
      "Leave the time blank if it is unknown. Midnight is not filled in, because midnight often sits on a tithi change and would look like a time you chose. A midday reading is used only so a tithi can still be assigned. If the true time was close to sunrise or a tithi sandhi, add the recorded time when you have it.",
  },
  {
    question: "After Barkhanta, which date should we observe?",
    answer:
      "Barkhanta and annual shraddha are the same observance: the death tithi, once a year. Barkhanta is only the name for the first year. This page shows the next date. After that year has passed, the following year's shraddha is the one that matters.",
  },
] as const;
