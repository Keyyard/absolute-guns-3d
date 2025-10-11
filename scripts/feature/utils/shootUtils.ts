import { Vector3Utils } from "@minecraft/math";
import { Player, Vector3 } from "@minecraft/server";
import { Gun, FireMode } from "../../data/types";

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

export function fireBullet(player: Player, gun: Gun): void {
  const spawnLoc = getSpawnLoc(player, gun);

  // Shotgun mode: spawn multiple pellets with spread
  if (gun.mode === FireMode.SHOTGUN) {
    const PELLETS = 6;
    const spread = 0.08; // angle factor for spread
    const forward = player.getViewDirection();

    // compute right and up basis
    let right = { x: -forward.z, y: 0, z: forward.x };
    const rightLen = Math.sqrt(right.x * right.x + right.y * right.y + right.z * right.z);
    if (rightLen < 1e-4) {
      right = { x: 1, y: 0, z: 0 };
    } else {
      right.x /= rightLen;
      right.y /= rightLen;
      right.z /= rightLen;
    }
    // up = cross(forward, right)
    const up = {
      x: forward.y * right.z - forward.z * right.y,
      y: forward.z * right.x - forward.x * right.z,
      z: forward.x * right.y - forward.y * right.x,
    };

    for (let i = 0; i < PELLETS; i++) {
      const rx = (Math.random() * 2 - 1) * spread;
      const ry = (Math.random() * 2 - 1) * spread;
      // dir = forward + right*rx + up*ry
      let dir = {
        x: forward.x + right.x * rx + up.x * ry,
        y: forward.y + right.y * rx + up.y * ry,
        z: forward.z + right.z * rx + up.z * ry,
      };
      const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
      if (len > 1e-6) {
        dir.x /= len;
        dir.y /= len;
        dir.z /= len;
      }

      const pellet = player.dimension.spawnEntity(gun.projectileTypeId, spawnLoc);
      if (!pellet) continue;
      const proj = pellet.getComponent("minecraft:projectile");
      if (proj) {
        proj.shoot(Vector3Utils.scale(dir, gun.shootPower * 0.95), { uncertainty: gun.uncertainty || 0 });
      }
    }

    return;
  }

  // Default single projectile behavior
  const bullet = player.dimension.spawnEntity(gun.projectileTypeId, spawnLoc);
  if (!bullet) return;
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
    const soundToPlay =
      gun.shootSound && String(gun.shootSound).toLowerCase() !== "none" ? gun.shootSound : "gun.shoot";
    player.playSound(soundToPlay, { volume: 4, pitch: 1 });
    player.playAnimation("animation.recoil.generic");
    player.runCommand(`camerashake add @s ${gun.recoil} 0.1 rotational`);
  } catch {}
}
