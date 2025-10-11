import { Player, system, world } from "@minecraft/server";
import { GUNS, playerReloadCooldowns, getPlayerAmmo } from "../data/guns";
import { getContainer } from "./utils/inventoryUtils";
import { getHeldGun, hasAmmoInContainer } from "./utils/gunUtils";

export function updateActionBar(player: Player): void {
  const container = getContainer(player);
  if (!container) return;

  const gun = getHeldGun(player);

  // No gun equipped
  if (!gun) {
    player.onScreenDisplay.setTitle(`ammo:""`);
    system.runTimeout(() => {
      player.onScreenDisplay.setTitle(`ammo2:""`);
    }, 2);
    return;
  }

  const reloadCooldown = playerReloadCooldowns.get(player.id) || 0;
  if (reloadCooldown > 0) {
    player.onScreenDisplay.setTitle(`ammo:"§cR.."`);
    return;
  }

  const currentAmmo = getPlayerAmmo(player, gun);
  player.onScreenDisplay.setTitle(`ammo:[${currentAmmo}]`, {
    stayDuration: 1,
    fadeInDuration: 1,
    fadeOutDuration: 1,
  });

  system.runTimeout(() => {
    player.onScreenDisplay.setTitle(`ammo2:[${gun.maxAmmo}]`, {
      stayDuration: 1,
      fadeInDuration: 1,
      fadeOutDuration: 1,
    });
  }, 2);
}

export function setShootMessage(player: Player): void {
  const gun = getHeldGun(player);
  if (!gun) {
    return;
  }

  const currentAmmo = getPlayerAmmo(player, gun);

  player.onScreenDisplay.setTitle(`ammo:[${currentAmmo}]`, {
    stayDuration: 1,
    fadeInDuration: 1,
    fadeOutDuration: 1,
  });
}

export function setReloadMessage(player: Player, message: string): void {
  const gun = getHeldGun(player);
  if (!gun) return;
  player.onScreenDisplay.setTitle(`ammo:message`);
}

export function setReloadingMessage(player: Player): void {
  const gun = getHeldGun(player);
  if (!gun) return;
  player.onScreenDisplay.setTitle(`ammo:"§cR.."`);
}

export function setReloadedMessage(player: Player): void {
  const gun = getHeldGun(player);
  if (!gun) return;
  player.onScreenDisplay.setTitle(`ammo:"§2R"`);
  system.runTimeout(() => {
    setShootMessage(player);
  }, 10);
}

export function setOutOfAmmoMessage(player: Player): void {
  const gun = getHeldGun(player);
  if (!gun) return;
  player.onScreenDisplay.setTitle(`ammo:§c[0]`);
}
