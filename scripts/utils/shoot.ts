import { world, Player, EntityInventoryComponent, ItemStack, Vector3 } from "@minecraft/server";
import { Vector3Utils } from "@minecraft/math";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { GUNS, Gun, playerGuns, playerFireCooldowns } from "../data/guns";

export function shoot(player: Player, gun: Gun): void {
  // Decrement ammo
  let playerGunAmmo = playerGuns.get(player.id);
  if (playerGunAmmo) {
    const currentAmmo = playerGunAmmo.get(gun.id) || 0;
    if (currentAmmo > 0) {
      playerGunAmmo.set(gun.id, currentAmmo - 1);
    }
  }

  // Spawn arrow projectile
  const arrow = player.dimension.spawnEntity("minecraft:arrow", player.location);
  if (arrow) {
    const projectileComponent = arrow.getComponent("minecraft:projectile");
    if (projectileComponent) {
      // Shoot towards player's view direction
      const direction = player.getViewDirection();
      projectileComponent.shoot(Vector3Utils.scale(direction, gun.shootPower), {
        uncertainty: 0.1
      });
    }
  }

  // Set cooldown
  playerFireCooldowns.set(player.id, gun.fireRate);
}