export type SourceItem = {
  id: string;
  label: string;
  icon: string;
  color: string;
};

/**
 * When a card is selected, its connected cards enter Active state.
 * Connections are bidirectional by design but defined once.
 */
export const cardConnections: Record<string, string[]> = {
  brands:       ["pricing", "products", "availability"],
  media:        ["social", "newsletters", "ads"],
  pricing:      ["brands", "products", "retailers"],
  categories:   ["products", "brands", "evisibility"],
  social:       ["media", "influencers", "ads"],
  availability: ["brands", "products", "retailers"],
  products:     ["brands", "pricing", "categories"],
  influencers:  ["social", "media", "ads"],
  ads:          ["media", "social", "evisibility"],
  novelties:    ["support-chats", "retailers", "products"],
  newsletters:  ["media", "social", "evisibility"],
  evisibility:  ["seo", "ads", "retailers"],
  retailers:    ["pricing", "availability", "products"],
  reviews:      ["products", "brands", "retailers"],
  seo:          ["evisibility", "media", "support-chats"],
  "support-chats": ["novelties", "seo", "social"],
};

export const sourcesGrid: SourceItem[][] = [
  [
    { id: "brands",      label: "Brands",          icon: "brands",       color: "#46FEC3" },
    { id: "media",       label: "Media",            icon: "media",        color: "#F43F5E" },
    { id: "pricing",     label: "Pricing",          icon: "pricing",      color: "#2563EB" },
    { id: "categories",  label: "Categories",       icon: "categories",   color: "#FBBF24" },
  ],
  [
    { id: "social",      label: "Social",           icon: "social",       color: "#9333EA" },
    { id: "availability",label: "Availability",     icon: "availability", color: "#FF8000" },
    { id: "products",    label: "Products",         icon: "products",     color: "#06B6D4" },
    { id: "influencers", label: "Influencers",      icon: "influencers",  color: "#EC4899" },
  ],
  [
    { id: "ads",         label: "Ads",              icon: "ads",          color: "#10B981" },
    { id: "novelties",   label: "Novelties",        icon: "novelties",    color: "#4338CA" },
    { id: "newsletters", label: "Newsletters",      icon: "newsletters",  color: "#FB923C" },
    { id: "evisibility", label: "E-visibility",     icon: "evisibility",  color: "#7C3AED" },
  ],
  [
    { id: "retailers",   label: "Retailers",        icon: "retailers",    color: "#F472B6" },
    { id: "reviews",     label: "Reviews",          icon: "reviews",      color: "#00D4FF" },
    { id: "seo",         label: "SEO & AI rankings",icon: "seo",          color: "#84CC16" },
    { id: "support-chats", label: "Support Chats",  icon: "support-chats", color: "#FF4560" },
  ],
];
