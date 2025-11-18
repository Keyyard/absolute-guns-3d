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
  // Play shoot animation (use configured shootAnimation or fallback)
  try {
    player.playAnimation(gun.shootAnimation ?? "animation.abg3.shoot");
  } catch {}
  playerFireCooldowns.set(player.id, gun.fireRate);
}
