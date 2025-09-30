import { Player, EntityInventoryComponent } from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { GUNS, CurrentGun, playerReloadCooldowns } from "../data/guns";

export function startReload(player: Player, currentGun: CurrentGun): boolean {
  const gun = GUNS.find(g => g.id === currentGun.id);
  if (!gun) return false;

  const inventory = player.getComponent("minecraft:inventory") as EntityInventoryComponent;
  if (!inventory) return false;

  const container = inventory.container;
  let hasAmmo = false;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === "minecraft:apple" && item.amount > 0) {
      hasAmmo = true;
      break;
    }
  }

  if (hasAmmo) {
    // Start reload
    playerReloadCooldowns.set(player.id, gun.reloadTime);
    return true;
  }
  return false; // No ammo
}

export function completeReload(player: Player, currentGun: CurrentGun): void {
  const gun = GUNS.find(g => g.id === currentGun.id);
  if (!gun) return;

  // Consume ammo
  const inventory = player.getComponent("minecraft:inventory") as EntityInventoryComponent;
  if (!inventory) return;

  const container = inventory.container;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === "minecraft:apple" && item.amount > 0) {
      // Consume one apple
      if (item.amount > 1) {
        item.amount--;
        container.setItem(i, item);
      } else {
        container.setItem(i, undefined);
      }
      break;
    }
  }

  // Set ammo to max
  currentGun.currentAmmo = gun.maxAmmo;
}