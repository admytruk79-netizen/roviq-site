// content/station-images.js
// Single source of truth for /station image placement.
// Each public section gets a distinct visual. Do not recycle the forecourt across modules.

export const STATION_IMAGES = {
  "hero-forecourt": {
    file: "/images/roviq-hero-forecourt.png",
    alt: "Roviq Station main forecourt at dusk",
    section: "Hero only",
  },
  "forecourt-secondary": {
    file: "/images/roviq-forecourt-secondary.png",
    alt: "Roviq Station forecourt reference",
    section: "Core concept only",
  },
  "ev-charging": {
    file: "/images/roviq-ev-charging.png",
    alt: "Roviq Station dedicated EV fast-charging bay",
    section: "EV charging only",
  },
  "portable-cafe": {
    file: "/images/cafe.png",
    alt: "Roviq portable café concept",
    section: "Portable café / satellite format only",
  },
  "local-oregon": {
    file: "/images/Oregon.png",
    alt: "Roviq Station Oregon design with Pacific Northwest character",
    section: "Portland / local adaptation only",
  },
  "interior-cafe": {
    file: "/images/roviq-interior-cafe.png",
    alt: "Roviq Station café and market interior",
    section: "Interior only",
  },
  "motorcourt": {
    file: "/images/roviq-motorcourt.png",
    alt: "Roviq Motorcourt boutique lodging",
    section: "Motor Court only",
  },
  "swap-station": {
    file: "/images/roviq-swap-station.png",
    alt: "Roviq Swap Station battery swap bay",
    section: "Post Station / battery swap only",
  },
  "relay-station": {
    file: "/images/roviq-relay-station.png",
    alt: "Roviq Relay Station vehicle handoff",
    section: "Vehicle Relay only",
  },
};
