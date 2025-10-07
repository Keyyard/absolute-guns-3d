import { Vector3Utils } from "@minecraft/math";
import { Player } from "@minecraft/server";
import { Gun, playerFireCooldowns, playerGuns } from "../data/guns";

export function shoot(player: Player, gun: Gun): void {
  // Decrement ammo
  let playerGunAmmo = playerGuns.get(player.id);
  if (playerGunAmmo) {
    const currentAmmo = playerGunAmmo.get(gun.id) || 0;
    if (currentAmmo > 0) {
      playerGunAmmo.set(gun.id, currentAmmo - 1);
    }
  }

  // Compute muzzle position and spawn projectile from there
  const headPos = player.getHeadLocation();
  const viewDir = player.getViewDirection();
  const FORWARD_DIST = 1.2;
  const forward = Vector3Utils.scale(viewDir, FORWARD_DIST);

  // Compute right vector perpendicular to view using up=(0,1,0): right = (-z, 0, x)
  let right = { x: -viewDir.z, y: 0, z: viewDir.x };
  const rightLen = Math.sqrt(right.x * right.x + right.y * right.y + right.z * right.z);
  if (rightLen < 1e-4) {
    right = { x: 1, y: 0, z: 0 };
  } else {
    right.x /= rightLen;
    right.y /= rightLen;
    right.z /= rightLen;
  }
  const rightOffset = Vector3Utils.scale(right, 0.22);

  const spawnLoc = Vector3Utils.add(Vector3Utils.add(headPos, forward), rightOffset);
  const bullet = player.dimension.spawnEntity(gun.projectileTypeId, spawnLoc);

  try {
    player.playSound("gun.shoot", { volume: 0.4, pitch: 1 });
  } catch {}

  if (bullet) {
    const projectileComponent = bullet.getComponent("minecraft:projectile");
    if (projectileComponent) {
      // Shoot towards player's view direction
      const direction = player.getViewDirection();
      projectileComponent.shoot(Vector3Utils.scale(direction, gun.shootPower), {
        uncertainty: gun.uncertainty || 0,
      });
    }
  }

  try {
    player.runCommand(`camerashake add @s ${gun.recoil} 0.1 positional`);
  } catch {}

  try {
    // Spawn the muzzle particle at the same spawn location used for the projectile
    player.dimension.spawnParticle("minecraft:basic_smoke_particle", spawnLoc);
  } catch {}

  // Set cooldown
  playerFireCooldowns.set(player.id, gun.fireRate);
}
