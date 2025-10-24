/**
 * BonApp Brand Configuration
 * Single source of truth for brand data across the application
 */

export const Brand = {
  name: "BonApp",
  domain: "bonapp.food",
  tagline: "Plan your week deliciously",
  description: "A weekly meal planner to help you organize your meals with ease",

  // URLs
  urls: {
    production: "https://bonapp.food",
    repository: "https://github.com/papay0/bonapp",
  },

  // Social
  social: {
    twitter: "@bonappfood",
    instagram: "@bonappfood",
  },

  // Theme colors (can be extended)
  colors: {
    primary: "#10b981", // emerald-500
    secondary: "#f59e0b", // amber-500
  },
} as const;

export type BrandConfig = typeof Brand;
