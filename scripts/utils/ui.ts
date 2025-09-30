import { Player, EntityInventoryComponent } from "@minecraft/server";
import { GUNS, CurrentGun, playerGuns, playerReloadCooldowns } from "../data/guns";

export function updateActionBar(player: Player): void {
  const inventory = player.getComponent("minecraft:inventory") as EntityInventoryComponent;
  if (!inventory) return;

  const container = inventory.container;
  const heldItem = container.getItem(player.selectedSlotIndex);
  if (heldItem) {
    const gun = GUNS.find(g => g.id === heldItem.typeId);
    if (gun) {
      let currentGun = playerGuns.get(player.id);
      if (!currentGun) {
        // Initialize if not present
        currentGun = {
          id: gun.id,
          name: gun.name,
          type: gun.type,
          currentAmmo: gun.maxAmmo
        };
        playerGuns.set(player.id, currentGun);
      }

      const reloadCooldown = playerReloadCooldowns.get(player.id) || 0;
      if (reloadCooldown > 0) {
        player.onScreenDisplay.setActionBar(`${currentGun.name} | Reloading... (${Math.ceil(reloadCooldown / 20)}s)`);
      } else {
        player.onScreenDisplay.setActionBar(`${currentGun.name} | ${currentGun.currentAmmo}/${gun.maxAmmo}`);
      }
      return;
    }
  }
  // No gun equipped
  player.onScreenDisplay.setActionBar("");
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