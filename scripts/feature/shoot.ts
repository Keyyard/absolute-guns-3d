import { Vector3Utils } from "@minecraft/math";
import { Player, Vector3 } from "@minecraft/server";
import { playerFireCooldowns, decreasePlayerAmmo } from "../data/guns";
import { Gun } from "../data/types";

import { fireVfx, fireBullet } from "./utils/shootUtils";
import { setShootMessage } from "./ui";

export function shoot(player: Player, gun: Gun): void {
  const decreaseAmmo = decreasePlayerAmmo(player, gun);
  if (!decreaseAmmo) return;
  fireVfx(player, gun);
  fireBullet(player, gun);
  setShootMessage(player);
  // Play shoot animation if defined
  if (gun.shootAnimation) {
    try {
      player.playAnimation(gun.shootAnimation);
    } catch {}
  }
  playerFireCooldowns.set(player.id, gun.fireRate);
}
