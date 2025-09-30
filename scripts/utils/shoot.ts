import { world, Player, EntityInventoryComponent, ItemStack, Vector3 } from "@minecraft/server";
import { Vector3Utils } from "@minecraft/math";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { GUNS, CurrentGun, playerGuns, playerFireCooldowns } from "../data/guns";

export function shoot(player: Player, currentGun: CurrentGun): void {
  const gun = GUNS.find(g => g.id === currentGun.id);
  if (!gun) return;

  // Decrement ammo
  currentGun.currentAmmo--;

  // Spawn arrow projectile
  const arrow = player.dimension.spawnEntity("minecraft:arrow", player.location);
  if (arrow) {
    const projectileComponent = arrow.getComponent("minecraft:projectile");
    if (projectileComponent) {
      // Shoot towards player's view direction
      const direction = player.getViewDirection();
      projectileComponent.shoot(Vector3Utils.scale(direction, 2));
    }
  }

  // Set cooldown
  playerFireCooldowns.set(player.id, gun.fireRate);
}

export function reload(player: Player, currentGun: CurrentGun): boolean {
  const gun = GUNS.find(g => g.id === currentGun.id);
  if (!gun) return false;

  const inventory = player.getComponent("minecraft:inventory") as EntityInventoryComponent;
  if (!inventory) return false;

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
      // Reload ammo
      currentGun.currentAmmo = gun.maxAmmo;
      return true;
    }
  }
  return false; // No ammo found
}