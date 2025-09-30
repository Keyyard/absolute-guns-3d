import {
  system,
  world
} from "@minecraft/server";
import { GUNS, playerFireCooldowns, playerGuns } from "./data/guns";
import { reload, shoot } from "./utils/shoot";
import { updateActionBar } from "./utils/ui";

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
  if (cooldown > 0) return; // Still cooling down

  if (currentGun.currentAmmo > 0) {
    shoot(player, currentGun);
  } else {
    const reloaded = reload(player, currentGun);
    if (reloaded) {
      player.onScreenDisplay.setActionBar("Reloaded");
    } else {
      player.onScreenDisplay.setActionBar("Out of ammo");
    }
  }
});

// Periodic updates for action bar and cooldowns
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    updateActionBar(player);

    // Decrement cooldowns
    const cooldown = playerFireCooldowns.get(player.id);
    if (cooldown && cooldown > 0) {
      playerFireCooldowns.set(player.id, cooldown - 1);
    }
  }
}, 18); // Every 18 ticks

// Cleanup on player leave
world.afterEvents.playerLeave.subscribe((event) => {
  const playerId = event.playerId;
  playerGuns.delete(playerId);
  playerFireCooldowns.delete(playerId);
});
