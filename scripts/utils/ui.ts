import { Player, EntityInventoryComponent } from "@minecraft/server";
import { GUNS, playerGuns, playerReloadCooldowns } from "../data/guns";

export function updateActionBar(player: Player): void {
  const inventory = player.getComponent("minecraft:inventory") as EntityInventoryComponent;
  if (!inventory) return;

  const container = inventory.container;
  const heldItem = container.getItem(player.selectedSlotIndex);
  if (heldItem) {
    const gun = GUNS.find((g) => g.id === heldItem.typeId);
    if (gun) {
      const playerGunAmmo = playerGuns.get(player.id);
      const currentAmmo = playerGunAmmo?.get(gun.id) ?? gun.maxAmmo;

      const reloadCooldown = playerReloadCooldowns.get(player.id) || 0;
      if (reloadCooldown > 0) {
        player.onScreenDisplay.setActionBar(`${gun.name} | Reloading... (${Math.ceil(reloadCooldown / 20)}s)`);
      } else if (currentAmmo <= 0) {
        // Check if can reload
        let canReload = false;
        for (let i = 0; i < container.size; i++) {
          const item = container.getItem(i);
          if (item && item.typeId === gun.ammoTypeId && item.amount > 0) {
            canReload = true;
            break;
          }
        }
        if (!canReload) {
          player.onScreenDisplay.setActionBar(`${gun.name} | §cOut of ammo`);
        } else {
          player.onScreenDisplay.setActionBar(`${gun.name} | ${currentAmmo}/${gun.maxAmmo}`);
        }
      } else {
        player.onScreenDisplay.setActionBar(`${gun.name} | ${currentAmmo}/${gun.maxAmmo}`);
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
