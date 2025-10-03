import { Player } from "@minecraft/server";

const gunTypes = ["rifle", "sniper", "shotgun", "smg"] as const;
type GunType = (typeof gunTypes)[number];

function getAmmoItemId(type: GunType): string {
  switch (type) {
    case "rifle":
      return "keyyard:rifle_ammo";
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

function getProjectileTypeId(type: GunType): string {
  switch (type) {
    case "rifle":
      return "minecraft:arrow";
    case "sniper":
      return "minecraft:arrow";
    case "shotgun":
      return "minecraft:snowball";
    case "smg":
      return "minecraft:egg";
    default:
      return "minecraft:arrow";
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
  ammoTypeId: string;
  projectileTypeId: string;
  uncertainty?: number;
}

export interface CurrentGun {
  id: string; // Matches Gun.id
  name: string;
  type: string;
  currentAmmo: number;
}

export type GunInput = Omit<Gun, "ammoTypeId" | "projectileTypeId"> &
  Partial<Pick<Gun, "ammoTypeId" | "projectileTypeId">>;

// Omit means these fields are required in input
// Partial means these fields are optional in input
// Pick means we are picking only these fields from Gun to be optional in input

// Function to create a Gun, filling in default ammoTypeId and projectileTypeId based on type if not provided

export function createGun(input: GunInput): Gun {
  const { ammoTypeId, projectileTypeId, ...rest } = input;
  return {
    ...rest,
    ammoTypeId: ammoTypeId ?? getAmmoItemId(rest.type),
    projectileTypeId: projectileTypeId ?? getProjectileTypeId(rest.type),
  } as Gun;
}

export const GUNS: readonly Gun[] = [
  createGun({
    id: "keyyard:rifle_basic",
    name: "Rifle",
    type: "rifle",
    maxAmmo: 20,
    fireRate: 4,
    shootPower: 13,
    reloadTime: 60,
  }),
  createGun({
    id: "minecraft:crossbow",
    name: "Sniper",
    type: "sniper",
    maxAmmo: 5,
    fireRate: 40,
    shootPower: 80,
    reloadTime: 100,
  }),
];

export const playerGuns = new Map<string, Map<string, number>>(); // player.id -> gun.id -> currentAmmo
export const playerFireCooldowns = new Map<string, number>(); // player.id -> ticks until next shot
export const playerReloadCooldowns = new Map<string, number>(); // player.id -> ticks until reload complete
