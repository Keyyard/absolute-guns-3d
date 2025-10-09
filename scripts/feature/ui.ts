import { Player } from "@minecraft/server";
import { GUNS, playerGuns, playerReloadCooldowns } from "../data/guns";
import { getContainer } from "./utils/inventoryUtils";
import { getHeldGun, getCurrentAmmo, hasAmmoInContainer } from "./utils/gunUtils";

export function updateActionBar(player: Player): void {
  const container = getContainer(player);
  if (!container) return;

  const gun = getHeldGun(player);
  if (!gun) {
    // No gun equipped
    player.onScreenDisplay.setActionBar("");
    return;
  }

  const currentAmmo = getCurrentAmmo(player, gun);
  const reloadCooldown = playerReloadCooldowns.get(player.id) || 0;
  if (reloadCooldown > 0) {
    player.onScreenDisplay.setActionBar(`${gun.name} | Reloading... (${Math.ceil(reloadCooldown / 20)}s)`);
    return;
  }

  if (currentAmmo <= 0) {
    if (!hasAmmoInContainer(container, gun.ammoTypeId)) {
      player.onScreenDisplay.setActionBar(`${gun.name} | §cOut of ammo`);
    } else {
      player.onScreenDisplay.setActionBar(`${gun.name} | ${currentAmmo}/${gun.maxAmmo}`);
    }
    return;
  }

  player.onScreenDisplay.setActionBar(`${gun.name} | ${currentAmmo}/${gun.maxAmmo}`);
}

export function setReloadMessage(player: Player, message: string): void {
  player.onScreenDisplay.setActionBar(message);
}

export function setReloadingMessage(player: Player): void {
  player.onScreenDisplay.setActionBar("Reloading...");
}

export function setReloadedMessage(player: Player): void {
  player.onScreenDisplay.setActionBar("Reloaded");
}

export function setOutOfAmmoMessage(player: Player): void {
  player.onScreenDisplay.setActionBar("Out of ammo");
}
