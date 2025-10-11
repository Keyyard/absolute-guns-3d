import { Player, world } from "@minecraft/server";
import { Gun, FireMode } from "./types";
import { createGun } from "./gunHelpers";

// createGun moved to gunHelpers; re-export for convenience
export { createGun } from "./gunHelpers";

export const GUNS: readonly Gun[] = [
  createGun({
    id: "absolute_guns:ak47",
    name: "AK47",
    type: "rifle",
    maxAmmo: 30,
    fireRate: 2,
    shootPower: 13,
    recoil: 0.3,
    reloadTime: 60,
  }),
  createGun({
    id: "absolute_guns:ak47_gold",
    name: "AK47 Gold",
    type: "rifle",
    maxAmmo: 30,
    fireRate: 2,
    shootPower: 13,
    recoil: 0.15,
    reloadTime: 60,
  }),
  createGun({
    id: "absolute_guns:ak74u",
    name: "AK74U",
    type: "rifle",
    maxAmmo: 30,
    fireRate: 2,
    shootPower: 13,
    recoil: 0.4,
    reloadTime: 60,
  }),
  createGun({
    id: "absolute_guns:bizon",
    name: "Bizon",
    type: "smg",
    maxAmmo: 64,
    fireRate: 2,
    shootPower: 12,
    recoil: 0.1,
    reloadTime: 50,
  }),
  createGun({
    id: "absolute_guns:flamethrower",
    name: "Flamethrower",
    type: "special",
    maxAmmo: 100,
    fireRate: 2,
    shootPower: 4,
    recoil: 0.05,
    reloadTime: 80,
  }),
  createGun({
    id: "absolute_guns:glock",
    name: "Glock",
    type: "pistol",
    maxAmmo: 17,
    fireRate: 10,
    shootPower: 12,
    recoil: 0.1,
    reloadTime: 40,
    ammoTypeId: "absolute_guns:pistol_ammo",
    mode: FireMode.SEMI,
  }),
  createGun({
    id: "absolute_guns:glock_tactical",
    name: "Glock Tactical",
    type: "pistol",
    maxAmmo: 17,
    fireRate: 10,
    shootPower: 12,
    recoil: 0.1,
    reloadTime: 40,
    ammoTypeId: "absolute_guns:pistol_ammo",
    mode: FireMode.SEMI,
  }),
  createGun({
    id: "absolute_guns:m1014",
    name: "M1014",
    type: "shotgun",
    maxAmmo: 7,
    fireRate: 15,
    shootPower: 15,
    recoil: 1.0,
    reloadTime: 70,
    mode: FireMode.SHOTGUN,
  }),
  createGun({
    id: "absolute_guns:m16",
    name: "M16",
    type: "rifle",
    maxAmmo: 30,
    fireRate: 3,
    shootPower: 13,
    recoil: 0.2,
    reloadTime: 60,
  }),
  createGun({
    id: "absolute_guns:m3",
    name: "M3",
    type: "shotgun",
    maxAmmo: 8,
    fireRate: 22,
    shootPower: 15,
    recoil: 1.0,
    reloadTime: 70,
    mode: FireMode.SHOTGUN,
  }),
  createGun({
    id: "absolute_guns:m4",
    name: "M4",
    type: "rifle",
    maxAmmo: 30,
    fireRate: 3,
    shootPower: 13,
    recoil: 0.21,
    reloadTime: 60,
  }),
  createGun({
    id: "absolute_guns:mg42",
    name: "MG42",
    type: "lmg",
    maxAmmo: 250,
    fireRate: 1,
    shootPower: 13,
    recoil: 0.3,
    reloadTime: 120,
  }),
  createGun({
    id: "absolute_guns:mgl",
    name: "MGL",
    type: "special",
    maxAmmo: 6,
    fireRate: 10,
    shootPower: 4,
    recoil: 0.3,
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
    recoil: 0.35,
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
    reloadTime: 40,
  }),
  createGun({
    id: "absolute_guns:pkm",
    name: "PKM",
    type: "lmg",
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
    shootPower: 5,
    recoil: 2.0,
    reloadTime: 100,
    ammoTypeId: "absolute_guns:rpg7_ammo",
    projectileTypeId: "absolute_guns_bullet:rpg7",
  }),
  // mgl_ammo is ammo, not a weapon - it's defined as an item elsewhere

  createGun({
    id: "absolute_guns:rpk",
    name: "RPK",
    type: "lmg",
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
    fireRate: 18,
    shootPower: 15,
    recoil: 1.0,
    reloadTime: 70,
    mode: FireMode.SHOTGUN,
  }),
  createGun({
    id: "absolute_guns:ump45",
    name: "UMP45",
    type: "smg",
    maxAmmo: 25,
    fireRate: 3,
    shootPower: 12,
    recoil: 0.25,
    reloadTime: 50,
  }),
];

function sanitizeObjectiveId(input: string) {
  return input.replace(/[^a-zA-Z0-9_]/g, "_"); // replaces any non-alphanumeric/underscore chars with underscore
}

function objectiveIdForGun(gun: Gun) {
  return `absolute_guns_ammo_${sanitizeObjectiveId(gun.id)}`;
}

function getAmmoObjectiveForGun(gun: Gun) {
  const id = objectiveIdForGun(gun);
  let obj = world.scoreboard.getObjective(id);
  if (!obj) obj = world.scoreboard.addObjective(id, `Ammo: ${gun.name}`);
  return obj;
}

export function ensurePlayerAmmoInitialized(player: Player, gun: Gun): void {
  const obj = getAmmoObjectiveForGun(gun);
  try {
    const score = obj.getScore(player);
    if (score === undefined) obj.setScore(player, gun.maxAmmo);
  } catch (e) {
    try {
      obj.setScore(player, gun.maxAmmo);
    } catch {}
  }
}

export function getPlayerAmmo(player: Player, gun: Gun): number {
  const obj = getAmmoObjectiveForGun(gun);
  try {
    const score = obj.getScore(player);
    return score === undefined ? gun.maxAmmo : score;
  } catch (e) {
    // Scoreboard lookup failed; fall back to gun max ammo.
    return gun.maxAmmo;
  }
}

export function setPlayerAmmo(player: Player, gun: Gun, amount: number): void {
  const obj = getAmmoObjectiveForGun(gun);
  try {
    obj.setScore(player, amount);
  } catch (e) {
    // Ignore scoreboard write failures — caller will still continue.
  }
}

export function decreasePlayerAmmo(player: Player, gun: Gun, amount = 1): void {
  try {
    const cur = getPlayerAmmo(player, gun);
    if (cur <= 0) return;
    setPlayerAmmo(player, gun, Math.max(0, cur - amount));
  } catch (e) {}
}

export const playerFireCooldowns = new Map<string, number>(); // player.id -> ticks until next shot
export const playerReloadCooldowns = new Map<string, number>(); // player.id -> ticks until reload complete
