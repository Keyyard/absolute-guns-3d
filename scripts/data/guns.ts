import { Player } from "@minecraft/server";

export interface Gun {
  id: string; // Item ID, e.g., "minecraft:iron_hoe"
  name: string;
  type: string; // e.g., "rifle" (for future expansion)
  maxAmmo: number;
  fireRate: number; // ticks between shots (for cooldown)
}

export interface CurrentGun {
  id: string; // Matches Gun.id
  name: string;
  type: string;
  currentAmmo: number;
}

export const GUNS: readonly Gun[] = [
  { id: "minecraft:iron_hoe", name: "Iron Hoe Gun", type: "rifle", maxAmmo: 10, fireRate: 10 } // Placeholder for iron_hoe
];

export const playerGuns = new Map<string, CurrentGun>(); // player.id -> CurrentGun
export const playerFireCooldowns = new Map<string, number>(); // player.id -> ticks until next shot