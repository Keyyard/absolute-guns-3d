export const gunTypes = ["rifle", "sniper", "shotgun", "smg", "lmg", "pistol", "special"] as const;
export type GunType = (typeof gunTypes)[number];

export enum FireMode {
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
