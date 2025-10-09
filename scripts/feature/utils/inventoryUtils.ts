import { Player, EntityInventoryComponent } from "@minecraft/server";

export function getInventoryComponent(player: Player): EntityInventoryComponent | null {
  const inv = player.getComponent("minecraft:inventory") as EntityInventoryComponent;
  return inv ?? null;
}

export function getContainer(player: Player) {
  const inv = getInventoryComponent(player);
  return inv ? inv.container : null;
}

export function getHeldItem(player: Player) {
  const container = getContainer(player);
  if (!container) return null;
  return container.getItem(player.selectedSlotIndex);
}
