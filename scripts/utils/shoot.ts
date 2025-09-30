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
      projectileComponent.shoot(Vector3Utils.scale(direction, gun.shootPower));
    }
  }

  // Set cooldown
  playerFireCooldowns.set(player.id, gun.fireRate);
}