// content/station-images.js
// Single source of truth for /station image placement.
// Each public section gets a distinct visual. Do not recycle the forecourt across modules.

export const STATION_IMAGES = {
  "hero-forecourt": {
    file: "/images/roviq-hero-forecourt.webp",
    alt: "Roviq Station main forecourt at dusk",
    section: "Hero only",
  },
  "forecourt-secondary": {
    file: "/images/roviq-forecourt-secondary.webp",
    alt: "Roviq Station forecourt reference",
    section: "Core concept only",
  },
  "ev-charging": {
    file: "/images/roviq-ev-charging.webp",
    alt: "Roviq Station dedicated EV fast-charging bay",
    section: "EV charging only",
  },
  "portable-cafe": {
    file: "/images/roviq-portable-cafe.webp",
    alt: "Roviq portable café concept",
    section: "Portable café / satellite format only",
  },
  "local-oregon": {
    file: "/images/roviq-oregon.webp",
    alt: "Roviq Station Oregon design with Pacific Northwest character",
    section: "Portland / local adaptation only",
  },
  "interior-cafe": {
    file: "/images/roviq-interior-cafe.webp",
    alt: "Roviq Station café and market interior",
    section: "Interior only",
  },
  "motorcourt": {
    file: "/images/roviq-motorcourt.webp",
    alt: "Roviq Motorcourt boutique lodging",
    section: "Motor Court only",
  },
  "swap-station": {
    file: "/images/roviq-swap-station.webp",
    alt: "Roviq Swap Station battery swap bay",
    section: "Post Station / battery swap only",
  },
  "relay-station": {
    file: "/images/roviq-relay-station.webp",
    alt: "Roviq Relay Station vehicle handoff",
    section: "Vehicle Relay only",
  },
};
