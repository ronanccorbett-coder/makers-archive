// src/app/_lib/mock-data.ts
//
// Mock drops so the site is presentable before the database has real
// content. The home page falls back to these when the live query returns
// nothing. Delete this file once you have real data.

import type { DropCardData } from "../_components/drop-card";

// Garment-focused stock photography from Unsplash — every image is an actual
// piece of clothing (single garments, flatlays, and a couple of rails) so the
// masonry feed reads like a real catalogue. Intentionally mixed aspect ratios
// (tall portraits + a few landscapes) to exercise the tile packing. Replace
// with real product photography.
const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=80`;

export const MOCK_DROPS: DropCardData[] = [
  {
    id: "mock-1",
    slug: "wool-capelet-014",
    title: "Wool Capelet",
    coverImageUrl: img("1434389677669-e08b4cac3105"), // cream knit poncho
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
    coverImageUrl: img("1594633312681-425c7b97ccd1"), // satin high-rise trouser
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
    coverImageUrl: img("1596755094514-f87e34085b2c"), // dotted chambray shirt
    reservedCount: 41,
    goalCount: 60,
    status: "live",
    designer: { studioName: "Hale & Pine" },
    refNumber: "016",
  },
  {
    id: "mock-4",
    slug: "selvedge-denim-017",
    title: "Selvedge Denim, Three Washes",
    coverImageUrl: img("1542272604-787c3835535d"), // folded jeans trio (landscape)
    reservedCount: 100,
    goalCount: 100,
    status: "funded",
    designer: { studioName: "M. Okafor Studio" },
    refNumber: "017",
  },
  {
    id: "mock-5",
    slug: "nylon-bomber-018",
    title: "Nylon Bomber, Tobacco",
    coverImageUrl: img("1591047139829-d91aecb6caea"), // tan bomber on hanger
    reservedCount: 12,
    goalCount: 75,
    status: "live",
    designer: { studioName: "North & Needle" },
    refNumber: "018",
  },
  {
    id: "mock-6",
    slug: "graphic-tee-original-019",
    title: 'Graphic Tee, "Original"',
    coverImageUrl: img("1576566588028-4147f3842f27"), // cream printed tee
    reservedCount: 58,
    goalCount: 60,
    status: "live",
    designer: { studioName: "Wren & Mae" },
    refNumber: "019",
  },
  {
    id: "mock-7",
    slug: "ribbed-knit-coat-020",
    title: "Ribbed Knit & Wool Coat",
    coverImageUrl: img("1608748010899-18f300247112"), // camel knit + coat
    reservedCount: 47,
    goalCount: 70,
    status: "live",
    designer: { studioName: "Halden Studio" },
    refNumber: "020",
  },
  {
    id: "mock-8",
    slug: "screen-print-tee-021",
    title: "Screen-Print Tee, Onyx",
    coverImageUrl: img("1583743814966-8936f5b7be1a"), // black printed tee on hanger
    reservedCount: 9,
    goalCount: 40,
    status: "live",
    designer: { studioName: "Ink & Awl" },
    refNumber: "021",
  },
  {
    id: "mock-9",
    slug: "weekend-edit-022",
    title: "Weekend Edit, Denim & Stripe",
    coverImageUrl: img("1525507119028-ed4c629a60a3"), // denim + shirt flatlay
    reservedCount: 31,
    goalCount: 55,
    status: "live",
    designer: { studioName: "Field & Co." },
    refNumber: "022",
  },
  {
    id: "mock-10",
    slug: "colour-rail-023",
    title: "The Colour Rail",
    coverImageUrl: img("1489987707025-afc232f7ea0f"), // colour-sorted rail (landscape)
    reservedCount: 64,
    goalCount: 120,
    status: "live",
    designer: { studioName: "Spectrum Studio" },
    refNumber: "023",
  },
  {
    id: "mock-11",
    slug: "skeleton-crop-tee-024",
    title: "Skeleton Crop Tee",
    coverImageUrl: img("1503342217505-b0a15ec3261c"), // skeleton-hand tee (landscape)
    reservedCount: 88,
    goalCount: 90,
    status: "live",
    designer: { studioName: "Mercer & Vale" },
    refNumber: "024",
  },
  {
    id: "mock-12",
    slug: "pocket-tee-705-025",
    title: 'Pocket Tee, "705"',
    coverImageUrl: img("1618354691373-d851c5c3a990"), // black 705 tee on hanger
    reservedCount: 5,
    goalCount: 60,
    status: "live",
    designer: { studioName: "Warp & Weft" },
    refNumber: "025",
  },
];

export function findMockDrop(slug: string) {
  return MOCK_DROPS.find((d) => d.slug === slug);
}
