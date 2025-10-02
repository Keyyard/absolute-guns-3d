import { Player } from "@minecraft/server";

const gunTypes = ["rifle", "sniper", "shotgun", "smg"] as const;
type GunType = (typeof gunTypes)[number];

function getAmmoType(type: GunType): string {
  switch (type) {
    case "rifle":
      return "minecraft:apple";
    case "sniper":
      return "minecraft:arrow";
    case "shotgun":
      return "minecraft:snowball";
    case "smg":
      return "minecraft:egg";
    default:
      return "minecraft:apple";
  }
}
export interface Gun {
  id: string; // Item ID, e.g., "minecraft:iron_hoe"
  name: string;
  type: GunType;
  maxAmmo: number;
  fireRate: number; // ticks between shots (for cooldown)
  shootPower: number; // velocity of bullet / speed of bullet traveling
  reloadTime: number; // ticks to reload
  ammoType: string;
  uncertainty?: number; // Optional: lower is more accurate
}

export interface CurrentGun {
  id: string; // Matches Gun.id
  name: string;
  type: string;
  currentAmmo: number;
}

export const GUNS: readonly Gun[] = [
  {
    id: "minecraft:bow",
    name: "Rifle",
    type: "rifle",
    maxAmmo: 20,
    fireRate: 1,
    shootPower: 13,
    reloadTime: 60,
    ammoType: getAmmoType("rifle"),
  },
  {
    id: "minecraft:crossbow",
    name: "Sniper",
    type: "sniper",
    maxAmmo: 5,
    fireRate: 40,
    shootPower: 80,
    reloadTime: 100,
    ammoType: getAmmoType("sniper"),
    uncertainty: 0.01,
  },
];

export const playerGuns = new Map<string, Map<string, number>>(); // player.id -> gun.id -> currentAmmo
export const playerFireCooldowns = new Map<string, number>(); // player.id -> ticks until next shot
export const playerReloadCooldowns = new Map<string, number>(); // player.id -> ticks until reload complete
