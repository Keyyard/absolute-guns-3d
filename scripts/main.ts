import { system, world, ItemStack } from "@minecraft/server";
import { GUNS, playerFireCooldowns, playerGuns, playerReloadCooldowns } from "./data/guns";
import { shoot } from "./feature/shoot";
import { startReload, completeReload } from "./feature/reload";
import { updateActionBar, setReloadingMessage, setReloadedMessage, setOutOfAmmoMessage } from "./feature/ui";
import { getHeldGun, ensurePlayerGunInitialized, getCurrentAmmo } from "./feature/utils/gunUtils";

const playerShooting = new Map<string, boolean>(); // player.id -> is shooting

// Initialize on script load

world.afterEvents.itemStartUse.subscribe((event) => {
  const { source: player, itemStack } = event;
  const gun = getHeldGun(player) || GUNS.find((g) => g.id === itemStack.typeId);
  if (!gun) return;
  ensurePlayerGunInitialized(player, gun);
  const currentAmmo = getCurrentAmmo(player, gun);

  const reloadCooldown = playerReloadCooldowns.get(player.id) || 0;
  if (reloadCooldown > 0) return; // Still reloading

  if (currentAmmo <= 0) {
    const started = startReload(player, gun);
    if (started) {
      setReloadingMessage(player);
    } else {
      setOutOfAmmoMessage(player);
    }
  } else {
    playerShooting.set(player.id, true);
  }
});

world.afterEvents.itemReleaseUse.subscribe((event) => {
  const { source: player, itemStack } = event;
  const gun = GUNS.find((g) => g.id === itemStack?.typeId);
  if (!gun) return;

  // Stop shooting (flag off on after-event)
  playerShooting.set(player.id, false);
});

// Periodic updates for action bar and cooldowns
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    updateActionBar(player);

    // Handle continuous shooting
    if (playerShooting.get(player.id)) {
      const gun = getHeldGun(player);
      const reloadCooldown = playerReloadCooldowns.get(player.id) || 0;
      if (gun) {
        const currentAmmo = getCurrentAmmo(player, gun);
        if (currentAmmo > 0 && reloadCooldown === 0 && playerShooting.get(player.id) === true) {
          if ((playerFireCooldowns.get(player.id) || 0) === 0) {
            shoot(player, gun);
          }
        }
      }
    }

    // Decrement cooldowns
    const fireCooldown = playerFireCooldowns.get(player.id);
    if (fireCooldown && fireCooldown > 0) {
      playerFireCooldowns.set(player.id, fireCooldown - 1);
    }

    const reloadCooldown = playerReloadCooldowns.get(player.id);
    if (reloadCooldown && reloadCooldown > 0) {
      playerReloadCooldowns.set(player.id, reloadCooldown - 1);
      if (reloadCooldown - 1 === 0) {
        // Reload complete
        const inventory = player.getComponent("minecraft:inventory");
        if (inventory) {
          const gun = getHeldGun(player);
          if (gun) {
            completeReload(player, gun);
            setReloadedMessage(player);
          }
        }
      }
    }
  }
}, 1); // Every tick

// Cleanup on player leave
world.afterEvents.playerLeave.subscribe((event) => {
  const playerId = event.playerId;
  playerGuns.delete(playerId);
  playerFireCooldowns.delete(playerId);
  playerReloadCooldowns.delete(playerId);
  playerShooting.delete(playerId);
});
