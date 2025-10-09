import { Player } from "@minecraft/server";

const gunTypes = ["rifle", "sniper", "shotgun", "smg", "special"] as const;
type GunType = (typeof gunTypes)[number];

function getAmmoItemId(type: GunType): string {
  switch (type) {
    case "rifle":
      return "absolute_guns:rifle_ammo";
    case "sniper":
      return "absolute_guns:sniper_ammo";
    case "shotgun":
      return "absolute_guns:shotgun_ammo";
    case "smg":
      return "absolute_guns:smg_ammo";
    default:
      return "absolute_guns:rifle_ammo";
  }
}

function getProjectileTypeId(type: GunType): string {
  switch (type) {
    case "rifle":
      return "absolute_guns_bullet:gun";
    case "sniper":
      return "absolute_guns_bullet:gun";
    case "shotgun":
      return "absolute_guns_bullet:shotgun";
    case "smg":
      return "absolute_guns_bullet:gun";
    default:
      return "absolute_guns_bullet:gun";
  }
}

enum FireMode {
  SEMI = "semi",
  AUTO = "auto",
  BURST = "burst",
  SHOTGUN = "shotgun",
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
  recoil: number; // camera shake
  uncertainty?: number; //accuracy
  mode?: FireMode; // default to semi for pistols, auto for rifles/smgs, shotgun for shotguns
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
  // Compute ammo and projectile, with overrides for 'special' guns
  const computedAmmo =
    ammoTypeId ??
    (rest.type === "special"
      ? rest.id === "absolute_guns:flamethrower"
        ? "minecraft:slime_ball"
        : rest.id === "absolute_guns:rpg7"
        ? "absolute_guns:rpg7_ammo"
        : rest.id === "absolute_guns:mgl"
        ? "absolute_guns:mgl_ammo"
        : "absolute_guns:rifle_ammo"
      : getAmmoItemId(rest.type));

  const computedProjectile =
    projectileTypeId ??
    (rest.type === "special"
      ? rest.id === "absolute_guns:flamethrower"
        ? "absolute_guns_bullet:flame"
        : rest.id === "absolute_guns:rpg7"
        ? "absolute_guns_bullet:rpg7"
        : rest.id === "absolute_guns:mgl"
        ? "absolute_guns_bullet:mgl"
        : "absolute_guns_bullet:gun"
      : getProjectileTypeId(rest.type));

  return {
    ...rest,
    ammoTypeId: computedAmmo,
    projectileTypeId: computedProjectile,
  } as Gun;
}

export const GUNS: readonly Gun[] = [
  createGun({
    id: "absolute_guns:ak47",
    name: "AK47",
    type: "rifle",
    maxAmmo: 30,
    fireRate: 4,
    shootPower: 13,
    recoil: 0.5,
    reloadTime: 60,
  }),
  createGun({
    id: "absolute_guns:ak47_gold",
    name: "AK47 Gold",
    type: "rifle",
    maxAmmo: 30,
    fireRate: 4,
    shootPower: 13,
    recoil: 0.5,
    reloadTime: 60,
  }),
  createGun({
    id: "absolute_guns:ak74u",
    name: "AK74U",
    type: "smg",
    maxAmmo: 30,
    fireRate: 4,
    shootPower: 13,
    recoil: 0.5,
    reloadTime: 60,
  }),
  createGun({
    id: "absolute_guns:bizon",
    name: "Bizon",
    type: "smg",
    maxAmmo: 64,
    fireRate: 2,
    shootPower: 12,
    recoil: 0.3,
    reloadTime: 50,
  }),
  createGun({
    id: "absolute_guns:flamethrower",
    name: "Flamethrower",
    type: "special",
    maxAmmo: 100,
    fireRate: 1,
    shootPower: 10,
    recoil: 0.2,
    reloadTime: 80,
  }),
  createGun({
    id: "absolute_guns:glock",
    name: "Glock",
    type: "smg",
    maxAmmo: 17,
    fireRate: 3,
    shootPower: 12,
    recoil: 0.4,
    reloadTime: 40,
  }),
  createGun({
    id: "absolute_guns:glock_tactical",
    name: "Glock Tactical",
    type: "smg",
    maxAmmo: 17,
    fireRate: 3,
    shootPower: 12,
    recoil: 0.4,
    reloadTime: 40,
  }),
  createGun({
    id: "absolute_guns:m1014",
    name: "M1014",
    type: "shotgun",
    maxAmmo: 8,
    fireRate: 20,
    shootPower: 15,
    recoil: 1.0,
    reloadTime: 70,
  }),
  createGun({
    id: "absolute_guns:m16",
    name: "M16",
    type: "rifle",
    maxAmmo: 30,
    fireRate: 4,
    shootPower: 13,
    recoil: 0.5,
    reloadTime: 60,
  }),
  createGun({
    id: "absolute_guns:m3",
    name: "M3",
    type: "shotgun",
    maxAmmo: 8,
    fireRate: 20,
    shootPower: 15,
    recoil: 1.0,
    reloadTime: 70,
  }),
  createGun({
    id: "absolute_guns:m4",
    name: "M4",
    type: "rifle",
    maxAmmo: 30,
    fireRate: 4,
    shootPower: 13,
    recoil: 0.5,
    reloadTime: 60,
  }),
  createGun({
    id: "absolute_guns:mg42",
    name: "MG42",
    type: "rifle",
    maxAmmo: 250,
    fireRate: 1,
    shootPower: 13,
    recoil: 0.6,
    reloadTime: 120,
  }),
  createGun({
    id: "absolute_guns:mgl",
    name: "MGL",
    type: "special",
    maxAmmo: 6,
    fireRate: 10,
    shootPower: 20,
    recoil: 0.8,
    reloadTime: 90,
    ammoTypeId: "absolute_guns:mgl_ammo",
    projectileTypeId: "absolute_guns_bullet:mgl",
  }),
  createGun({
    id: "absolute_guns:mp40",
    name: "MP40",
    type: "smg",
    maxAmmo: 32,
    fireRate: 2,
    shootPower: 12,
    recoil: 0.3,
    reloadTime: 50,
  }),
  createGun({
    id: "absolute_guns:mp5",
    name: "MP5",
    type: "smg",
    maxAmmo: 30,
    fireRate: 3,
    shootPower: 12,
    recoil: 0.4,
    reloadTime: 50,
  }),
  createGun({
    id: "absolute_guns:mp5k",
    name: "MP5K",
    type: "smg",
    maxAmmo: 30,
    fireRate: 3,
    shootPower: 12,
    recoil: 0.4,
    reloadTime: 50,
  }),
  createGun({
    id: "absolute_guns:pkm",
    name: "PKM",
    type: "rifle",
    maxAmmo: 100,
    fireRate: 2,
    shootPower: 13,
    recoil: 0.5,
    reloadTime: 100,
  }),
  createGun({
    id: "absolute_guns:rpg7",
    name: "RPG7",
    type: "special",
    maxAmmo: 1,
    fireRate: 40,
    shootPower: 50,
    recoil: 2.0,
    reloadTime: 100,
    ammoTypeId: "absolute_guns:rpg7_ammo",
    projectileTypeId: "absolute_guns_bullet:rpg7",
  }),
  // mgl_ammo is ammo, not a weapon - it's defined as an item elsewhere

  createGun({
    id: "absolute_guns:rpk",
    name: "RPK",
    type: "rifle",
    maxAmmo: 75,
    fireRate: 2,
    shootPower: 13,
    recoil: 0.5,
    reloadTime: 80,
  }),
  createGun({
    id: "absolute_guns:spas",
    name: "SPAS",
    type: "shotgun",
    maxAmmo: 8,
    fireRate: 20,
    shootPower: 15,
    recoil: 1.0,
    reloadTime: 70,
  }),
  createGun({
    id: "absolute_guns:ump45",
    name: "UMP45",
    type: "smg",
    maxAmmo: 25,
    fireRate: 3,
    shootPower: 12,
    recoil: 0.4,
    reloadTime: 50,
  }),
];

export const playerGuns = new Map<string, Map<string, number>>(); // player.id -> gun.id -> currentAmmo
export const playerFireCooldowns = new Map<string, number>(); // player.id -> ticks until next shot
export const playerReloadCooldowns = new Map<string, number>(); // player.id -> ticks until reload complete
