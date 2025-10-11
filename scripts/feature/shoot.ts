import { Vector3Utils } from "@minecraft/math";
import { Player, Vector3 } from "@minecraft/server";
import { playerFireCooldowns, decreasePlayerAmmo } from "../data/guns";
import { Gun } from "../data/types";

import { fireVfx, fireBullet } from "./utils/shootUtils";
import { setShootMessage } from "./ui";

export function shoot(player: Player, gun: Gun): void {
  decreasePlayerAmmo(player, gun);

  fireVfx(player, gun);
  fireBullet(player, gun);
  setShootMessage(player);
  playerFireCooldowns.set(player.id, gun.fireRate);
}
