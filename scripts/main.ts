import { system, world, ItemStack, Player, EntityDamageCause } from "@minecraft/server";
import { GUNS, playerFireCooldowns, playerReloadCooldowns } from "./data/guns";
import { shoot } from "./feature/shoot";
import { startReload, completeReload } from "./feature/reload";
import { updateActionBar, setReloadingMessage, setReloadedMessage, setOutOfAmmoMessage } from "./feature/ui";
import { getHeldGun, ensurePlayerGunInitialized, getCurrentAmmo } from "./feature/utils/gunUtils";
import { Vector3Utils } from "@minecraft/math";
import { getHeldItem } from "./feature/utils/inventoryUtils";
import { applyDurabilityDamage } from "./feature/utils/durabilityUtils";
import { modifyMovement, throwTacticalKnife } from "./feature/throwingKnife";
import { DamageHandler } from "./feature/damageHandler";
import { distanceBetween } from "./feature/damageHandler";

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
    world.afterEvents.projectileHitEntity.subscribe((event) => this.afterProjectileHitEntity(event));
    world.afterEvents.playerBreakBlock.subscribe((event) => this.afterPlayerBreakBlock(event));
  }

  private afterPlayerBreakBlock(event: any) {
    const player = event.player;
    const itemStack = getHeldItem(player);
    if (itemStack && itemStack.typeId === "absolute_guns:tactical_knife_scope") {
      applyDurabilityDamage(player, itemStack);
    }
  }

  private afterProjectileHitEntity(event: any) {
    try {
      const projectile = event?.projectile ?? event?.projectileEntity;
      const shooter = event?.source ?? event?.sourceEntity ?? null;
      const hitInfo = typeof event?.getEntityHit === "function" ? event.getEntityHit() : undefined;
      const hitEntity = hitInfo?.entity ?? event?.entity;
      if (!hitEntity || !projectile) return;

      // Identify the weapon that spawned this projectile (we tag bullets on
      // spawn). If no tag is found, fall back to matching projectile type.
      let weaponId: string | undefined;
      try {
        const tags = typeof projectile.getTags === "function" ? projectile.getTags() : [];
        for (const t of tags || []) {
          if (typeof t === "string" && t.startsWith("abg_weapon:")) {
            weaponId = t.split(":")[1];
            break;
          }
        }
      } catch {}

      let gun = weaponId ? GUNS.find((g) => g.id === weaponId) : undefined;
      if (!gun) gun = GUNS.find((g) => g.projectileTypeId === projectile.typeId);
      if (!gun) return;

      const stats = (gun as any).stats;
      if (!stats) return; // advanced system only for guns that expose stats

      const bullet: any = projectile;
      if (!bullet.spawnLocation) bullet.spawnLocation = bullet.location;
      const damage = DamageHandler.getDamages(stats, hitEntity, bullet);
      if (!damage || damage <= 0) return;

      try {
        hitEntity.applyDamage(damage, {
          cause: EntityDamageCause.override,
          damagingProjectile: projectile,
          damagingEntity: shooter,
        });
        world.sendMessage(`Dealt ${damage} damage to ${hitEntity.id}`);
      } catch {}

      // Apply knockback adjusted by armor knockback resistance
      try {
        const direction = shooter ? shooter.getViewDirection() : { x: 0, y: 0, z: 0 };
        const knockbackRes = DamageHandler.getKnockbackResistance(hitEntity);
        const kbX = (stats.knockback?.x || 0) * knockbackRes;
        const kbY = (stats.knockback?.y || 0) * knockbackRes;
        if (typeof hitEntity.applyKnockback === "function") {
          hitEntity.applyKnockback(direction.x, direction.z, kbX, kbY);
        }
      } catch {}

      try {
        DamageHandler.handleArmorDurability(hitEntity, damage);
      } catch {}
    } catch {}
  }
  private afterItemUse(event: any) {
    const { source: player, itemStack } = event;
    throwTacticalKnife(player, itemStack);
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
      `§4Absolute Guns §l3 §rBeta v1.1`,
      `Welcome Back! this is a beta version, it's §uonly 5%% complete§r from what we envision for the addon. §4Please be patient§f.`,
      `Join our discord to report bugs: §bdiscord.gg/5zeEqwFbww`,
      `And check out our Github: github.com/Keyyard/absolute-guns-3d`,
      `Please forward all bugs and suggestions there in the Issues tab!`,
      `Creators: §4AzozGamer936, §cKeyyard, §jBeyond64`,
      `Enjoy the addon!`,
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
        //Modify player fov when scoped through tactical knife
        modifyMovement(player);

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
    // Check projectile maxRange and remove if exceeded
    system.runInterval(() => {
      const dims = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];
      for (const dimId of dims) {
        const dim = world.getDimension(dimId);
        const entities = dim.getEntities();
        for (const entity of entities) {
          if (entity.typeId.startsWith("absolute_guns_bullet:")) {
            const gun = GUNS.find((g) => g.projectileTypeId === entity.typeId);
            if (gun && gun.stats && gun.stats.maxRange) {
              const spawnLoc = (entity as any).spawnLocation;
              if (spawnLoc) {
                const dist = distanceBetween(spawnLoc, entity.location);
                if (dist > gun.stats.maxRange) {
                  entity.remove();
                }
              }
            }
          }
        }
      }
    }, 1); // Check every tick
    const UILoopId = system.runInterval(() => {
      for (const player of world.getAllPlayers()) {
        updateActionBar(player);
      }
    }, 4);
  }
}

new GameController();
