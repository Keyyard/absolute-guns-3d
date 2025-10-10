import { system, world, ItemStack, Player } from "@minecraft/server";
import { GUNS, playerFireCooldowns, playerGuns, playerReloadCooldowns } from "./data/guns";
import { shoot } from "./feature/shoot";
import { startReload, completeReload } from "./feature/reload";
import { updateActionBar, setReloadingMessage, setReloadedMessage, setOutOfAmmoMessage } from "./feature/ui";
import { getHeldGun, ensurePlayerGunInitialized, getCurrentAmmo } from "./feature/utils/gunUtils";
import { Vector3Utils } from "@minecraft/math";
import { getHeldItem } from "./feature/utils/inventoryUtils";

class GameController {
  private playerShooting = new Map<string, boolean>();
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
    player.sendMessage("Throwing Tactical Knife!");
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
    if (held) this.handleDurabilityDamage(player, held);
  }

  // Decrease durability on the provided item, taking Unbreaking into account.
  private handleDurabilityDamage(player: Player, itemUsed: ItemStack) {
    if (!itemUsed) return;

    const durComp: any = itemUsed.getComponent("minecraft:durability");
    if (!durComp) return;

    const durabilityModifier = 1;
    durComp.damage = (durComp.damage ?? 0) + durabilityModifier;

    const maxDurability = durComp.maxDurability ?? durComp.max_durability ?? 100;
    const currentDamage = durComp.damage ?? 0;

    // If item is broken, play a break sound and remove it from the player's slot.
    if (currentDamage >= maxDurability) {
      try {
        player.playSound("random.break", { volume: 0.8, pitch: 0.9 });
      } catch {}

      const inv = player.getComponent("minecraft:inventory");
      if (inv && inv.container) {
        const slot = (player as any).selectedSlotIndex ?? 0;
        inv.container.setItem(slot, undefined);
      }
    } else {
      // Update the item in the player's slot so the new damage value is visible.
      const inv = player.getComponent("minecraft:inventory");
      if (inv && inv.container) {
        const slot = (player as any).selectedSlotIndex ?? 0;
        inv.container.setItem(slot, itemUsed);
      }
    }
  }

  private afterPlayerJoin(event: any) {
    const messages = [
      `<Keyyard> Hello, thank you for installing Absolute Guns!`,
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
    playerGuns.delete(playerId);
    playerFireCooldowns.delete(playerId);
    playerReloadCooldowns.delete(playerId);
    this.playerShooting.delete(playerId);
  }

  private GameLoop() {
    this.tickId = system.runInterval(() => {
      for (const player of world.getAllPlayers()) {
        updateActionBar(player);

        // Handle continuous shooting
        if (this.playerShooting.get(player.id)) {
          const gun = getHeldGun(player);
          const reloadCooldown = playerReloadCooldowns.get(player.id) || 0;
          if (gun) {
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
  }
}

new GameController();
