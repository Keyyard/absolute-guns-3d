import { Player } from "@minecraft/server";
import { GUNS, ensurePlayerAmmoInitialized, getPlayerAmmo } from "../../data/guns";
import { Gun } from "../../data/types";
import { getHeldItem } from "./inventoryUtils";

export function getHeldGun(player: Player): Gun | undefined {
  const held = getHeldItem(player);
  if (!held) return undefined;
  return GUNS.find((g) => g.id === held.typeId);
}

export function ensurePlayerGunInitialized(player: Player, gun: Gun): void {
  // Ensure a scoreboard-backed ammo entry exists for this player/gun.
  ensurePlayerAmmoInitialized(player as Player, gun);
}

export function getCurrentAmmo(player: Player, gun: Gun): number {
  return getPlayerAmmo(player as Player, gun);
}

export function hasAmmoInContainer(container: any, ammoTypeId: string): boolean {
  if (!container) return false;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === ammoTypeId && item.amount > 0) return true;
  }
  return false;
}

export function findAndConsumeAmmo(container: any, ammoTypeId: string): boolean {
  if (!container) return false;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === ammoTypeId && item.amount > 0) {
      if (item.amount > 1) {
        item.amount--;
        container.setItem(i, item);
      } else {
        container.setItem(i, undefined);
      }
      return true;
    }
  }
  return false;
}
