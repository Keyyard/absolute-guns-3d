import { Player, ItemStack } from "@minecraft/server";

/**
 * Apply durability damage to an ItemStack held by a player.
 * If the item breaks, play break sound and remove it from the selected slot.
 */
export function applyDurabilityDamage(player: Player, itemUsed: ItemStack, amount = 1) {
  if (!itemUsed) return;

  const durComp: any = itemUsed.getComponent("minecraft:durability");
  if (!durComp) return;

  durComp.damage = (durComp.damage ?? 0) + amount;

  const maxDurability = durComp.maxDurability ?? durComp.max_durability ?? 100;
  const currentDamage = durComp.damage ?? 0;

  const inv = player.getComponent("minecraft:inventory");
  const slot = (player as any).selectedSlotIndex ?? 0;

  if (currentDamage >= maxDurability) {
    try {
      player.playSound("random.break", { volume: 0.8, pitch: 0.9 });
    } catch {}

    try {
      if (inv && inv.container) inv.container.setItem(slot, undefined);
    } catch {}
  } else {
    try {
      if (inv && inv.container) inv.container.setItem(slot, itemUsed);
    } catch {}
  }
}
