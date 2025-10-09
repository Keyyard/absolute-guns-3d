import { Vector3Utils } from "@minecraft/math";
import { Player, Vector3 } from "@minecraft/server";
import { Gun, playerFireCooldowns, playerGuns } from "../../data/guns";

function getSpawnLoc(player: Player, gun: Gun): Vector3 {
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
  return spawnLoc;
}

export function decreaseAmmo(player: Player, gun: Gun): void {
  let playerGunAmmo = playerGuns.get(player.id);
  if (playerGunAmmo) {
    const currentAmmo = playerGunAmmo.get(gun.id) || 0;
    if (currentAmmo > 0) {
      playerGunAmmo.set(gun.id, currentAmmo - 1);
    }
  }
}

export function fireBullet(player: Player, gun: Gun): void {
  const spawnLoc = getSpawnLoc(player, gun);
  const bullet = player.dimension.spawnEntity(gun.projectileTypeId, spawnLoc);

  const projectileComponent = bullet.getComponent("minecraft:projectile");
  if (projectileComponent) {
    // Shoot towards player's view direction
    const direction = player.getViewDirection();
    projectileComponent.shoot(Vector3Utils.scale(direction, gun.shootPower), {
      uncertainty: gun.uncertainty || 0,
    });
  }
}

export function fireVfx(player: Player, gun: Gun): void {
  try {
    player.playSound("gun.shoot", { volume: 0.4, pitch: 1 });
    player.playAnimation("animation.player.wields_gun");
    player.runCommand(`camerashake add @s ${gun.recoil} 0.1 positional`);
  } catch {}
}
