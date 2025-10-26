import { Gun, GunInput, GunType } from "./types";

function getAmmoItemId(type: GunType): string {
  switch (type) {
    case "rifle":
      return "absolute_guns:rifle_ammo";
    case "pistol":
      return "absolute_guns:pistol_ammo";
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
    case "pistol":
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

export function createGun(input: GunInput): Gun {
  const { ammoTypeId, projectileTypeId, ...rest } = input as GunInput & { type: GunType };

  const computedAmmo =
    ammoTypeId ??
    (rest.type === "special"
      ? rest.id === "absolute_guns:flamethrower"
        ? "minecraft:blaze_powder"
        : rest.id === "absolute_guns:rpg7"
        ? "absolute_guns:rpg7_ammo"
        : rest.id === "absolute_guns:mgl"
        ? "minecraft:gunpowder"
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
    ...(rest as any),
    ammoTypeId: computedAmmo,
    projectileTypeId: computedProjectile,
  } as Gun;
}
