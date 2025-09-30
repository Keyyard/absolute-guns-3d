import {
  system,
  world
} from "@minecraft/server";
import { GUNS, playerFireCooldowns, playerGuns, playerReloadCooldowns } from "./data/guns";
import { shoot } from "./utils/shoot";
import { startReload, completeReload } from "./utils/reload";
import { updateActionBar, setReloadingMessage, setReloadedMessage, setOutOfAmmoMessage } from "./utils/ui";

// Initialize on script load
world.afterEvents.itemUse.subscribe((event) => {
  const { source: player, itemStack } = event;
  const gun = GUNS.find(g => g.id === itemStack.typeId);
  if (!gun) return;

  let currentGun = playerGuns.get(player.id);
  if (!currentGun) {
    currentGun = {
      id: gun.id,
      name: gun.name,
      type: gun.type,
      currentAmmo: gun.maxAmmo
    };
    playerGuns.set(player.id, currentGun);
  }

  const cooldown = playerFireCooldowns.get(player.id) || 0;
  const reloadCooldown = playerReloadCooldowns.get(player.id) || 0;
  if (cooldown > 0 || reloadCooldown > 0) return; // Still cooling down or reloading

  if (currentGun.currentAmmo > 0) {
    shoot(player, currentGun);
  } else {
    const started = startReload(player, currentGun);
    if (started) {
      setReloadingMessage(player);
    } else {
      setOutOfAmmoMessage(player);
    }
  }
});

// Periodic updates for action bar and cooldowns
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    updateActionBar(player);

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
        const currentGun = playerGuns.get(player.id);
        if (currentGun) {
          completeReload(player, currentGun);
          setReloadedMessage(player);
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
});
