import { Player } from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { GUNS, Gun, playerReloadCooldowns, playerGuns } from "../data/guns";
import { getContainer } from "./utils/inventoryUtils";
import { hasAmmoInContainer, findAndConsumeAmmo } from "./utils/gunUtils";

export function startReload(player: Player, gun: Gun): boolean {
  const container = getContainer(player);
  if (!container) return false;
  if (!hasAmmoInContainer(container, gun.ammoTypeId)) return false;

  // Start reload
  try {
    player.playAnimation("animation.player.reload");
  } catch {}
  playerReloadCooldowns.set(player.id, gun.reloadTime);
  return true;
}

export function completeReload(player: Player, gun: Gun): void {
  // Consume ammo
  const container = getContainer(player);
  if (!container) return;
  // Consume one ammo from container
  findAndConsumeAmmo(container, gun.ammoTypeId);
  // Set ammo to max
  let playerGunAmmo = playerGuns.get(player.id);
  if (!playerGunAmmo) {
    playerGunAmmo = new Map();
    playerGuns.set(player.id, playerGunAmmo);
  }
  playerGunAmmo.set(gun.id, gun.maxAmmo);
}
