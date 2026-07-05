// src/app/_lib/mock-data.ts
//
// Mock drops so the site is presentable before the database has real
// content. The home page falls back to these when the live query returns
// nothing. Delete this file once you have real data.

import type { DropCardData } from "../_components/drop-card";

// Editorial fashion stock photography from Unsplash — these URLs are
// stable enough for an MVP. Replace with real product photography.
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80",
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=900&q=80",
  "https://images.unsplash.com/photo-1551803091-e20673f15770?w=900&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80",
  "https://images.unsplash.com/photo-1485518882345-15568b007407?w=900&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80",
];

export const MOCK_DROPS: DropCardData[] = [
  {
    id: "mock-1",
    slug: "wool-capelet-014",
    title: "Wool Capelet",
    coverImageUrl: PLACEHOLDER_IMAGES[0],
    reservedCount: 73,
    goalCount: 80,
    status: "live",
    designer: { studioName: "Sorin Atelier" },
    refNumber: "014",
  },
  {
    id: "mock-2",
    slug: "cord-trouser-015",
    title: "Cord Trouser, High-rise",
    coverImageUrl: PLACEHOLDER_IMAGES[1],
    reservedCount: 22,
    goalCount: 50,
    status: "live",
    designer: { studioName: "Naïma Co." },
    refNumber: "015",
  },
  {
    id: "mock-3",
    slug: "linen-overshirt-016",
    title: "Linen Overshirt",
    coverImageUrl: PLACEHOLDER_IMAGES[2],
    reservedCount: 41,
    goalCount: 60,
    status: "live",
    designer: { studioName: "Hale & Pine" },
    refNumber: "016",
  },
  {
    id: "mock-4",
    slug: "raw-silk-slip-017",
    title: "Bias-Cut Slip, Raw Silk",
    coverImageUrl: PLACEHOLDER_IMAGES[3],
    reservedCount: 100,
    goalCount: 100,
    status: "funded",
    designer: { studioName: "M. Okafor Studio" },
    refNumber: "017",
  },
  {
    id: "mock-5",
    slug: "quilted-vest-018",
    title: "Quilted Vest",
    coverImageUrl: PLACEHOLDER_IMAGES[4],
    reservedCount: 12,
    goalCount: 75,
    status: "live",
    designer: { studioName: "North & Needle" },
    refNumber: "018",
  },
  {
    id: "mock-6",
    slug: "knit-cardigan-019",
    title: "Hand-knit Cardigan",
    coverImageUrl: PLACEHOLDER_IMAGES[5],
    reservedCount: 58,
    goalCount: 60,
    status: "live",
    designer: { studioName: "Wren & Mae" },
    refNumber: "019",
  },
];

export function findMockDrop(slug: string) {
  return MOCK_DROPS.find((d) => d.slug === slug);
}
