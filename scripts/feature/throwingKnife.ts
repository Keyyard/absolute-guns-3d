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
  // Add sound and recoil effects
  try {
    player.playSound("gun.abgawm", { volume: 6, pitch: 1.2 });
    player.runCommand(`camerashake add @s 0.23 0.2 rotational`);
  } catch {}
  // Update durability for the held item (uses minecraft:durability component).
  const held = getHeldItem(player);
  if (held) applyDurabilityDamage(player, held);
}

export function modifyMovement(player: Player) {
  const held = getHeldItem(player);
  if (held?.typeId != "absolute_guns:tactical_knife_scope") return;
  if (player.isSneaking) player.addEffect(`slowness`, 4, { amplifier: 8, showParticles: false });
}
