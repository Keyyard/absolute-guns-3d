import { Player } from "@minecraft/server";
import { GUNS, playerGuns } from "../../data/guns";
import { Gun } from "../../data/types";
import { getHeldItem } from "./inventoryUtils";

export function getHeldGun(player: Player): Gun | undefined {
  const held = getHeldItem(player);
  if (!held) return undefined;
  return GUNS.find((g) => g.id === held.typeId);
}

export function ensurePlayerGunInitialized(player: Player, gun: Gun): void {
  let playerGunAmmo = playerGuns.get(player.id);
  if (!playerGunAmmo) {
    playerGunAmmo = new Map<string, number>();
    playerGuns.set(player.id, playerGunAmmo);
  }
  if (playerGunAmmo.get(gun.id) === undefined) {
    playerGunAmmo.set(gun.id, gun.maxAmmo);
  }
}

export function getCurrentAmmo(player: Player, gun: Gun): number {
  const playerGunAmmo = playerGuns.get(player.id);
  return playerGunAmmo?.get(gun.id) ?? gun.maxAmmo;
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
