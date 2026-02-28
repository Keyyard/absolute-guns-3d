import { Player } from "@minecraft/server";
import { Gun, FireMode } from "./types";
import { createGun } from "./gunHelpers";

export { createGun } from "./gunHelpers";

export const GUNS: readonly Gun[] = [
  createGun({
    id: "absolute_guns:ak47",
    name: "AK47",
    type: "rifle",
    maxAmmo: 30,
    fireRate: 3,
    shootPower: 13,
    recoil: 0.3,
    reloadTime: 60,
    shootSound: "gun.abgak47",
    projectileTypeId: "absolute_guns_bullet:ak47",
    // Example weapon stats for the AK47 used by the new damage system
    stats: {
      damage: 5,
      damageDropOff: 0.04,
      armorPenetration: 0.2,
      maxRange: 90,
      knockback: { x: 0.5, y: 0.5 },
    },
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
    shootSound: "gun.abgak47",
    projectileTypeId: "absolute_guns_bullet:ak47_gold",
    stats: {
      damage: 6.5,
      damageDropOff: 0.04,
      armorPenetration: 0.2,
      maxRange: 3,
      knockback: { x: 0.5, y: 0.5 },
    },
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
    shootSound: "gun.abgak47",
    projectileTypeId: "absolute_guns_bullet:ak74u",
    stats: {
      damage: 5.5,
      damageDropOff: 0.04,
      armorPenetration: 0.2,
      maxRange: 90,
      knockback: { x: 0.5, y: 0.5 },
    },
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
    shootSound: "gun.abgbizon",
    projectileTypeId: "absolute_guns_bullet:bizon",
    stats: {
      damage: 5,
      damageDropOff: 0.05,
      armorPenetration: 0.2,
      maxRange: 90,
      knockback: { x: 0.5, y: 0.5 },
    },
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
    shootSound: "gun.abgflamethrower",
    projectileTypeId: "absolute_guns_bullet:flame",
    stats: {
      damage: 1,
      damageDropOff: 0.0,
      armorPenetration: 0.2,
      maxRange: 12,
      knockback: { x: 0.5, y: 0.5 },
    },
  }),
  createGun({
    id: "absolute_guns:glock",
    name: "Glock",
    type: "pistol",
    maxAmmo: 17,
    fireRate: 10,
    shootPower: 25,
    recoil: 0.1,
    reloadTime: 40,
    ammoTypeId: "absolute_guns:pistol_ammo",
    mode: FireMode.SEMI,
    shootSound: "gun.abgglock",
    reloadAnimation: "animation.abg3.reload",
    drawAnimation: "animation.abg3.draw",
    shootAnimation: "animation.abg3.shoot",
    projectileTypeId: "absolute_guns_bullet:glock",
    stats: {
      damage: 3,
      damageDropOff: 0.06,
      armorPenetration: 0.2,
      maxRange: 90,
      knockback: { x: 0.5, y: 0.5 },
    },
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
    shootSound: "gun.abgsilenced",
    ammoTypeId: "absolute_guns:pistol_ammo",
    projectileTypeId: "absolute_guns_bullet:glock_tactical",
    mode: FireMode.SEMI,
    stats: {
      damage: 3.5,
      damageDropOff: 0.06,
      armorPenetration: 0.2,
      maxRange: 90,
      knockback: { x: 0.5, y: 0.5 },
    },
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
    shootSound: "gun.abgm1014",
    mode: FireMode.SHOTGUN,
    stats: {
      damage: 8,
      damageDropOff: 0.1,
      armorPenetration: 0.1,
      maxRange: 30,
      knockback: { x: 1.0, y: 1.0 },
    },
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
    shootSound: "gun.abgm4",
    projectileTypeId: "absolute_guns_bullet:m16",
    stats: {
      damage: 5.5,
      damageDropOff: 0.04,
      armorPenetration: 0.25,
      maxRange: 100,
      knockback: { x: 0.5, y: 0.5 },
    },
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
    shootSound: "gun.abgm3",
    mode: FireMode.SHOTGUN,
    stats: {
      damage: 7,
      damageDropOff: 0.1,
      armorPenetration: 0.1,
      maxRange: 25,
      knockback: { x: 1.0, y: 1.0 },
    },
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
    shootSound: "gun.abgm4",
    projectileTypeId: "absolute_guns_bullet:m4",
    stats: {
      damage: 5,
      damageDropOff: 0.04,
      armorPenetration: 0.25,
      maxRange: 100,
      knockback: { x: 0.5, y: 0.5 },
    },
  }),
  createGun({
    id: "absolute_guns:mg42",
    name: "MG42",
    type: "lmg",
    maxAmmo: 250,
    fireRate: 1,
    shootPower: 13,
    recoil: 0.1,
    reloadTime: 120,
    shootSound: "gun.abgmg42",
    projectileTypeId: "absolute_guns_bullet:mg42",
    stats: {
      damage: 6,
      damageDropOff: 0.03,
      armorPenetration: 0.3,
      maxRange: 120,
      knockback: { x: 0.6, y: 0.6 },
    },
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
    ammoTypeId: "minecraft:tnt",
    projectileTypeId: "absolute_guns_bullet:mgl",
    shootSound: "gun.abgmgl",
    stats: {
      damage: 20,
      damageDropOff: 0.0,
      armorPenetration: 0.5,
      maxRange: 50,
      knockback: { x: 2.0, y: 2.0 },
    },
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
    shootSound: "gun.abgmp40",
    projectileTypeId: "absolute_guns_bullet:mp40",
    stats: {
      damage: 4.5,
      damageDropOff: 0.05,
      armorPenetration: 0.15,
      maxRange: 70,
      knockback: { x: 0.4, y: 0.4 },
    },
  }),
  createGun({
    id: "absolute_guns:mp5",
    name: "MP5",
    type: "smg",
    maxAmmo: 30,
    fireRate: 3,
    shootPower: 12,
    recoil: 0.07,
    reloadTime: 50,
    shootSound: "gun.abgmp5",
    projectileTypeId: "absolute_guns_bullet:mp5",
    stats: {
      damage: 4,
      damageDropOff: 0.05,
      armorPenetration: 0.2,
      maxRange: 80,
      knockback: { x: 0.4, y: 0.4 },
    },
  }),
  createGun({
    id: "absolute_guns:mp5k",
    name: "MP5K",
    type: "smg",
    maxAmmo: 30,
    fireRate: 3,
    shootPower: 12,
    recoil: 0.07,
    reloadTime: 40,
    shootSound: "gun.abgmp5",
    projectileTypeId: "absolute_guns_bullet:mp5k",
    stats: {
      damage: 4,
      damageDropOff: 0.05,
      armorPenetration: 0.2,
      maxRange: 75,
      knockback: { x: 0.4, y: 0.4 },
    },
  }),
  createGun({
    id: "absolute_guns:pkm",
    name: "PKM",
    type: "lmg",
    maxAmmo: 100,
    fireRate: 2,
    shootPower: 13,
    recoil: 0.1,
    reloadTime: 100,
    shootSound: "gun.abgak47",
    projectileTypeId: "absolute_guns_bullet:pkm",
    stats: {
      damage: 6,
      damageDropOff: 0.03,
      armorPenetration: 0.3,
      maxRange: 110,
      knockback: { x: 0.6, y: 0.6 },
    },
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
    reloadAnimation: "animation.simple_reload50",
    projectileTypeId: "absolute_guns_bullet:rpg7",
    shootSound: "gun.abgrpg7",
    stats: { 
      damage: 50,
      damageDropOff: 0.0,
      armorPenetration: 1.0,
      maxRange: 100,
      knockback: { x: 3.0, y: 3.0 },
    },
  }),
  createGun({
    id: "absolute_guns:rpk",
    name: "RPK",
    type: "lmg",
    maxAmmo: 75,
    fireRate: 2,
    shootPower: 13,
    recoil: 0.2,
    reloadTime: 80,
    shootSound: "gun.abgak47",
    projectileTypeId: "absolute_guns_bullet:rpk",
    stats: {
      damage: 5.5,
      damageDropOff: 0.03,
      armorPenetration: 0.25,
      maxRange: 105,
      knockback: { x: 0.5, y: 0.5 },
    },
  }),
  createGun({
    id: "absolute_guns:spas",
    name: "SPAS",
    type: "shotgun",
    maxAmmo: 8,
    fireRate: 18,
    shootPower: 15,
    recoil: 1.0,
    reloadTime: 60,
    reloadAnimation: "animation.simple_reload30",
    drawAnimation: "animation.abg3.draw",
    shootAnimation: "animation.abg3.shoot",
    mode: FireMode.SHOTGUN,
    shootSound: "gun.abgm1014",
    stats: {
      damage: 8,
      damageDropOff: 0.1,
      armorPenetration: 0.1,
      maxRange: 30,
      knockback: { x: 1.0, y: 1.0 },
    },
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
    shootSound: "gun.abgump45",
    projectileTypeId: "absolute_guns_bullet:ump45",
    stats: {
      damage: 4.5,
      damageDropOff: 0.05,
      armorPenetration: 0.2,
      maxRange: 85,
      knockback: { x: 0.4, y: 0.4 },
    },
  }),
];

function sanitizeObjectiveId(input: string) {
  return input.replace(/[^a-zA-Z0-9_]/g, "_"); // replaces any non-alphanumeric/underscore chars with underscore
}

function dynamicPropertyKeyForGun(gun: Gun) {
  return `abg_ammo_${sanitizeObjectiveId(gun.id)}`;
}

export function ensurePlayerAmmoInitialized(player: Player, gun: Gun): void {
  try {
    const key = dynamicPropertyKeyForGun(gun);
    const existing = player.getDynamicProperty(key);
    if (existing === undefined || typeof existing !== "number") {
      try {
        player.setDynamicProperty(key, gun.maxAmmo);
      } catch {}
    }
  } catch {}
}

export function getPlayerAmmo(player: Player, gun: Gun): number {
  try {
    const key = dynamicPropertyKeyForGun(gun);
    const val = player.getDynamicProperty(key);
    if (typeof val === "number") return val;
    return gun.maxAmmo;
  } catch {
    return gun.maxAmmo;
  }
}

export function setPlayerAmmo(player: Player, gun: Gun, amount: number): void {
  try {
    const key = dynamicPropertyKeyForGun(gun);
    player.setDynamicProperty(key, amount);
  } catch {}
}

export function decreasePlayerAmmo(player: Player, gun: Gun, amount = 1): boolean {
  try {
    const cur = getPlayerAmmo(player, gun);
    if (cur <= 0) return false;
    setPlayerAmmo(player, gun, Math.max(0, cur - amount));
    return true;
  } catch {
    return false;
  }
}

export const playerFireCooldowns = new Map<string, number>(); // player.id -> ticks until next shot
export const playerReloadCooldowns = new Map<string, number>(); // player.id -> ticks until reload complete
