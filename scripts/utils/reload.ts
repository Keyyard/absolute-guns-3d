import { Player, EntityInventoryComponent } from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { GUNS, Gun, playerReloadCooldowns, playerGuns } from "../data/guns";

export function startReload(player: Player, gun: Gun): boolean {
  const inventory = player.getComponent("minecraft:inventory") as EntityInventoryComponent;
  if (!inventory) return false;

  const container = inventory.container;
  let hasAmmo = false;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === gun.projectileTypeId && item.amount > 0) {
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

export function completeReload(player: Player, gun: Gun): void {
  // Consume ammo
  const inventory = player.getComponent("minecraft:inventory") as EntityInventoryComponent;
  if (!inventory) return;

  const container = inventory.container;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === gun.projectileTypeId && item.amount > 0) {
      // Consume one ammo
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
  let playerGunAmmo = playerGuns.get(player.id);
  if (!playerGunAmmo) {
    playerGunAmmo = new Map();
    playerGuns.set(player.id, playerGunAmmo);
  }
  playerGunAmmo.set(gun.id, gun.maxAmmo);
}
