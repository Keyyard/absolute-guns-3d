import { Vector3Utils } from "@minecraft/math";
import { ItemStack, Player } from "@minecraft/server";
import { applyDurabilityDamage } from "./utils/durabilityUtils";
import { getHeldItem } from "./utils/inventoryUtils";

export function throwTacticalKnife(player: Player, itemStack: ItemStack): void {
  if (!itemStack || itemStack.typeId !== "absolute_guns:tactical_knife_scope") return;
  const throwKnife = player.dimension.spawnEntity(
    "absolute_guns_bullet:tactical_knife_scope2",
    Vector3Utils.add(player.getHeadLocation(), Vector3Utils.scale(player.getViewDirection(), 1.5))
  );
  if (!throwKnife) return;
  const proj = throwKnife.getComponent("minecraft:projectile");
  if (proj) {
    proj.shoot(Vector3Utils.scale(player.getViewDirection(), 2));
  }
  // Update durability for the held item (uses minecraft:durability component).
  const held = getHeldItem(player);
  if (held) applyDurabilityDamage(player, held);
}
