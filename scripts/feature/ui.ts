import { Player, system, world } from "@minecraft/server";
import { GUNS, playerGuns, playerReloadCooldowns } from "../data/guns";
import { getContainer } from "./utils/inventoryUtils";
import { getHeldGun, getCurrentAmmo, hasAmmoInContainer } from "./utils/gunUtils";

export function updateActionBar(player: Player): void {
  let uiTimer = (player.getDynamicProperty("uiTimer") as number) || 0;
  uiTimer++;

  const container = getContainer(player);
  if (!container) return;

  const gun = getHeldGun(player);
  if (!gun) {
    // No gun equipped
    if (uiTimer == 3) player.onScreenDisplay.setTitle(`ammo:`);
    return;
  }

  const currentAmmo = getCurrentAmmo(player, gun);
  const reloadCooldown = playerReloadCooldowns.get(player.id) || 0;
  if (reloadCooldown > 0) {
    if (uiTimer == 3) player.onScreenDisplay.setTitle(`ammo:"§cR.."`);
    return;
  }

  if (currentAmmo <= 0) {
    if (!hasAmmoInContainer(container, gun.ammoTypeId)) {
      if (uiTimer == 3)
        player.onScreenDisplay.setTitle(`ammo:[${currentAmmo}]`, {
          stayDuration: 1,
          fadeInDuration: 1,
          fadeOutDuration: 1,
        });
      if (uiTimer == 6)
        player.onScreenDisplay.setTitle(`ammo2:[${gun.maxAmmo}]`, {
          stayDuration: 1,
          fadeInDuration: 1,
          fadeOutDuration: 1,
        });
    } else {
      if (uiTimer == 3)
        player.onScreenDisplay.setTitle(`ammo:[${currentAmmo}]`, {
          stayDuration: 1,
          fadeInDuration: 1,
          fadeOutDuration: 1,
        });

      if (uiTimer == 6)
        player.onScreenDisplay.setTitle(`ammo2:[${gun.maxAmmo}]`, {
          stayDuration: 1,
          fadeInDuration: 1,
          fadeOutDuration: 1,
        });
    }
    return;
  }

  if (uiTimer == 3)
    player.onScreenDisplay.setTitle(`ammo:[${currentAmmo}]`, {
      stayDuration: 1,
      fadeInDuration: 1,
      fadeOutDuration: 1,
    });

  if (uiTimer == 6)
    player.onScreenDisplay.setTitle(`ammo2:[${gun.maxAmmo}]`, {
      stayDuration: 1,
      fadeInDuration: 1,
      fadeOutDuration: 1,
    });

  player.setDynamicProperty("uiTimer", uiTimer);
  if (uiTimer > 10) player.setDynamicProperty("uiTimer", 0);
}

export function setReloadMessage(player: Player, message: string): void {
  player.onScreenDisplay.setTitle(`ammo:message`);
}

export function setReloadingMessage(player: Player): void {
  player.onScreenDisplay.setTitle(`ammo:"§cR.."`);
}

export function setReloadedMessage(player: Player): void {
  player.onScreenDisplay.setTitle(`ammo:"§2R"`);
}

export function setOutOfAmmoMessage(player: Player): void {
  player.onScreenDisplay.setTitle(`ammo:§c[0]`);
}
