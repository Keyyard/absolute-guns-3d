import { system, world, ItemStack, Player } from "@minecraft/server";
import { GUNS, playerFireCooldowns, playerReloadCooldowns } from "./data/guns";
import { shoot } from "./feature/shoot";
import { startReload, completeReload } from "./feature/reload";
import { updateActionBar, setReloadingMessage, setReloadedMessage, setOutOfAmmoMessage } from "./feature/ui";
import { getHeldGun, ensurePlayerGunInitialized, getCurrentAmmo } from "./feature/utils/gunUtils";
import { Vector3Utils } from "@minecraft/math";
import { getHeldItem } from "./feature/utils/inventoryUtils";
import { applyDurabilityDamage } from "./feature/utils/durabilityUtils";

class GameController {
  private playerShooting = new Map<string, boolean>();
  private lastHeldGun = new Map<string, string | null>();
  private tickId?: number;

  constructor() {
    this.registerEvents();
    this.GameLoop();
  }

  private registerEvents() {
    world.afterEvents.itemStartUse.subscribe((event) => this.afterItemStartUse(event));
    world.afterEvents.itemReleaseUse.subscribe((event) => this.afterItemReleaseUse(event));
    world.afterEvents.playerLeave.subscribe((event) => this.afterPlayerLeave(event));
    world.afterEvents.playerJoin.subscribe((event) => this.afterPlayerJoin(event));
    world.afterEvents.itemUse.subscribe((event) => this.afterItemUse(event));
  }

  private afterItemUse(event: any) {
    const { source: player, itemStack } = event;
    if (itemStack.typeId !== "absolute_guns:tactical_knife_scope") return;
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

  private afterPlayerJoin(event: any) {
    // Ensure we mark the player's current held gun so the draw animation isn't
    // played automatically if they were already holding a gun before joining.
    try {
      const joinedPlayer = (event &&
        (event.player ?? world.getAllPlayers().find((p) => p.id === event.playerId))) as any;
      if (joinedPlayer) {
        const held = getHeldGun(joinedPlayer as any);
        this.lastHeldGun.set(joinedPlayer.id, held ? held.id : null);
        if (held) {
          try {
            ensurePlayerGunInitialized(joinedPlayer as any, held);
          } catch {}
        }
      }
    } catch {}
    const messages = [
      `/title @a title hi`,
      `<Keyyard> This is a pre-release version, expect bugs and missing features.`,
      `<Keyyard> Join our Discord to request features or report bugs.`,
      `<Keyyard> Type this URL to your browser to get in: discord.gg/s2VfQr69uz`,
      `<Keyyard> Or type the code: s2VfQr69uz`,
      `<Keyyard> You can star the project on GitHub at github.com/Keyyard/absolute-guns-3d`,
      `<Keyyard> Starring on GitHub encourages us to update the addon`,
      `<Keyyard> And you can request feature, report bug directly at Issues tab too!`,
      `<Keyyard> Enjoy the addon!`,
    ];
    messages.forEach((m) => {
      system.runTimeout(() => {
        world.getAllPlayers().forEach((p) => p.playSound("random.levelup", { volume: 0.5, pitch: 1.0 }));
        world.sendMessage(m);
      }, 200 + 20 * 2 * (messages.indexOf(m) + 1));
    });
  }

  private afterItemStartUse(event: any) {
    const { source: player, itemStack } = event;
    const gun = getHeldGun(player) || GUNS.find((g) => g.id === itemStack.typeId);
    if (!gun) return;
    ensurePlayerGunInitialized(player, gun);
    const currentAmmo = getCurrentAmmo(player, gun);

    const reloadCooldown = playerReloadCooldowns.get(player.id) || 0;
    if (reloadCooldown > 0) return; // Still reloading

    if (currentAmmo <= 0) {
      const started = startReload(player, gun);
      if (started) setReloadingMessage(player);
      else setOutOfAmmoMessage(player);
    } else {
      this.playerShooting.set(player.id, true);
    }
  }

  private afterItemReleaseUse(event: any) {
    const { source: player, itemStack } = event;
    const gun = GUNS.find((g) => g.id === itemStack?.typeId);
    if (!gun) return;
    this.playerShooting.set(player.id, false);
  }

  private afterPlayerLeave(event: any) {
    const playerId = event.playerId;
    playerFireCooldowns.delete(playerId);
    playerReloadCooldowns.delete(playerId);
    this.playerShooting.delete(playerId);
    this.lastHeldGun.delete(playerId);
  }

  private GameLoop() {
    this.tickId = system.runInterval(() => {
      for (const player of world.getAllPlayers()) {
        // Detect when a player starts holding (or switches) a gun so we can play
        // the gun draw animation and initialize any per-player state for that gun.
        const currentlyHeld = getHeldGun(player);
        const currentHeldId = currentlyHeld ? currentlyHeld.id : null;
        const hadEntry = this.lastHeldGun.has(player.id);
        const prevHeldId = hadEntry ? this.lastHeldGun.get(player.id) || null : null;
        if (currentHeldId !== prevHeldId) {
          if (currentlyHeld) {
            // Initialize ammo / state for the newly-held gun
            try {
              ensurePlayerGunInitialized(player, currentlyHeld);
            } catch {}
            // Play draw animation (use configured drawAnimation or fallback)
            try {
              player.playAnimation(currentlyHeld.drawAnimation ?? "animation.abg3.draw");
            } catch {}
          }
          this.lastHeldGun.set(player.id, currentHeldId);
        }

        // Handle continuous shooting
        if (this.playerShooting.get(player.id)) {
          const gun = getHeldGun(player);
          if (!gun) {
            this.playerShooting.set(player.id, false);
          } else {
            const reloadCooldown = playerReloadCooldowns.get(player.id) || 0;
            const currentAmmo = getCurrentAmmo(player, gun);
            if (currentAmmo > 0 && reloadCooldown === 0 && this.playerShooting.get(player.id) === true) {
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
    }, 1);
    const UILoopId = system.runInterval(() => {
      for (const player of world.getAllPlayers()) {
        updateActionBar(player);
      }
    }, 4);
  }
}

new GameController();
