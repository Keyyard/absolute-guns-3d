import { Vector3Utils } from "@minecraft/math";
import { Player, Vector3 } from "@minecraft/server";
import { Gun, playerFireCooldowns, playerGuns } from "../data/guns";

import { decreaseAmmo, fireVfx, fireBullet } from "./utils/shootUtils";

export function shoot(player: Player, gun: Gun): void {
  decreaseAmmo(player, gun);

  fireVfx(player, gun);
  fireBullet(player, gun);

  playerFireCooldowns.set(player.id, gun.fireRate);
}
