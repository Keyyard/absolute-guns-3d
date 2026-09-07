import { Vector3Utils } from "@minecraft/math";
import { Dimension, Entity, ItemStack, MolangVariableMap, Player, Vector3 } from "@minecraft/server";
import { getContainer } from "./utils/inventoryUtils";

export type GrenadeKind = "frag" | "flash" | "smoke";

export interface Grenade {
  kind: GrenadeKind;
  itemId: string;
  entityTypeId: string;
  /** Ticks between the throw and the detonation. */
  fuseTicks: number;
  /** Velocity multiplier applied to the thrower's view direction. */
  throwPower: number;
  throwSound: string;
}

export const GRENADES: Grenade[] = [
  {
    kind: "frag",
    itemId: "absolute_guns:frag_grenade",
    entityTypeId: "absolute_guns_grenade:frag_grenade",
    fuseTicks: 35,
    throwPower: 1.6,
    throwSound: "random.bow",
  },
  {
    kind: "flash",
    itemId: "absolute_guns:flash_grenade",
    entityTypeId: "absolute_guns_grenade:flash_grenade",
    fuseTicks: 40,
    throwPower: 1.7,
    throwSound: "random.bow",
  },
  {
    kind: "smoke",
    itemId: "absolute_guns:smoke_grenade",
    entityTypeId: "absolute_guns_grenade:smoke_grenade",
    fuseTicks: 30,
    throwPower: 1.5,
    throwSound: "random.bow",
  },
];

/** Blast radius of the frag grenade, in blocks. */
const FRAG_RADIUS = 4.5;
/** Furthest a flashbang can still affect a player, in blocks. */
const FLASH_RADIUS = 14;
/** Blindness applied point-blank with the player looking straight at the blast. */
const FLASH_MAX_BLINDNESS_TICKS = 140;
/** Box the flashbang's sparks scatter within, passed to the particle as variable.direction. */
const FLASH_SPARK_SPREAD: Vector3 = { x: 3, y: 3, z: 3 };
/** How long a smoke cloud keeps emitting, in ticks. */
const SMOKE_DURATION = 220;
/** Radius of the smoke cloud, in blocks. */
const SMOKE_RADIUS = 3.5;
/** Per-player throw cooldown so a held right-click cannot spam grenades. */
const THROW_COOLDOWN_TICKS = 20;

interface ActiveGrenade {
  grenade: Grenade;
  entity: Entity;
  dimension: Dimension;
  /** Last known position, so a despawned projectile still detonates sensibly. */
  location: Vector3;
  fuse: number;
  thrower?: Player;
}

interface SmokeCloud {
  dimension: Dimension;
  location: Vector3;
  ticksLeft: number;
}

const activeGrenades: ActiveGrenade[] = [];
const smokeClouds: SmokeCloud[] = [];
const throwCooldowns = new Map<string, number>();

export function getGrenade(itemTypeId?: string): Grenade | undefined {
  if (!itemTypeId) return undefined;
  return GRENADES.find((g) => g.itemId === itemTypeId);
}

/**
 * Throws the held grenade: spawns the projectile, consumes one from the stack
 * and starts its fuse. No-op for any other item.
 */
export function throwGrenade(player: Player, itemStack: ItemStack): void {
  const grenade = getGrenade(itemStack?.typeId);
  if (!grenade) return;
  if ((throwCooldowns.get(player.id) || 0) > 0) return;

  const viewDirection = player.getViewDirection();
  const spawnLocation = Vector3Utils.add(player.getHeadLocation(), Vector3Utils.scale(viewDirection, 0.8));

  let projectile: Entity | undefined;
  try {
    projectile = player.dimension.spawnEntity(grenade.entityTypeId, spawnLocation);
  } catch {
    return;
  }
  if (!projectile) return;

  const projectileComponent = projectile.getComponent("minecraft:projectile");
  if (projectileComponent) {
    projectileComponent.owner = player;
    projectileComponent.shoot(Vector3Utils.scale(viewDirection, grenade.throwPower));
  }

  consumeOne(player, grenade.itemId);
  throwCooldowns.set(player.id, THROW_COOLDOWN_TICKS);

  activeGrenades.push({
    grenade,
    entity: projectile,
    dimension: player.dimension,
    location: spawnLocation,
    fuse: grenade.fuseTicks,
    thrower: player,
  });

  try {
    player.playSound(grenade.throwSound, { volume: 0.6, pitch: 1.4 });
  } catch {}
}

/** Removes one grenade from the player's selected slot. */
function consumeOne(player: Player, itemId: string): void {
  const container = getContainer(player);
  if (!container) return;
  const slot = player.selectedSlotIndex;
  const held = container.getItem(slot);
  if (!held || held.typeId !== itemId) return;
  if (held.amount <= 1) {
    container.setItem(slot, undefined);
  } else {
    held.amount -= 1;
    container.setItem(slot, held);
  }
}

/** Advances every fuse and smoke cloud. Call once per tick. */
export function tickGrenades(): void {
  for (const [playerId, ticks] of throwCooldowns) {
    if (ticks <= 1) throwCooldowns.delete(playerId);
    else throwCooldowns.set(playerId, ticks - 1);
  }

  for (let i = activeGrenades.length - 1; i >= 0; i--) {
    const active = activeGrenades[i];

    // Track the projectile while it lives; once it despawns we fall back to the
    // last position we saw it in.
    if (active.entity.isValid) {
      active.location = active.entity.location;
      if (active.fuse % 4 === 0) {
        try {
          active.dimension.spawnParticle("minecraft:basic_smoke_particle", active.location);
        } catch {}
      }
    }

    active.fuse--;
    if (active.fuse > 0) continue;

    if (active.entity.isValid) {
      try {
        active.entity.remove();
      } catch {}
    }
    activeGrenades.splice(i, 1);
    detonate(active);
  }

  for (let i = smokeClouds.length - 1; i >= 0; i--) {
    const cloud = smokeClouds[i];
    cloud.ticksLeft--;
    if (cloud.ticksLeft <= 0) {
      smokeClouds.splice(i, 1);
      continue;
    }
    if (cloud.ticksLeft % 2 === 0) emitSmoke(cloud);
  }
}

function detonate(active: ActiveGrenade): void {
  const { dimension, location } = active;
  switch (active.grenade.kind) {
    case "frag":
      detonateFrag(dimension, location, active.thrower);
      break;
    case "flash":
      detonateFlash(dimension, location);
      break;
    case "smoke":
      detonateSmoke(dimension, location);
      break;
  }
}

function detonateFrag(dimension: Dimension, location: Vector3, thrower?: Player): void {
  try {
    dimension.spawnParticle("minecraft:huge_explosion_emitter", location);
  } catch {}
  try {
    dimension.playSound("random.explode", location, { volume: 2 });
  } catch {}
  try {
    // No block damage: this is a PvP add-on, the blast should not grief the map.
    dimension.createExplosion(location, FRAG_RADIUS, {
      breaksBlocks: false,
      causesFire: false,
      allowUnderwater: true,
      source: thrower && thrower.isValid ? thrower : undefined,
    });
  } catch {}
}

function detonateFlash(dimension: Dimension, location: Vector3): void {
  try {
    dimension.spawnParticle("minecraft:huge_explosion_emitter", location);
    // electric_spark reads variable.direction as a spread extent, scattering
    // itself within +/- direction/2. Without it the particle's Molang errors out.
    const spark = new MolangVariableMap();
    spark.setVector3("direction", FLASH_SPARK_SPREAD);
    for (let i = 0; i < 16; i++) {
      dimension.spawnParticle("minecraft:electric_spark_particle", location, spark);
    }
  } catch {}
  try {
    dimension.playSound("random.explode", location, { volume: 2, pitch: 1.7 });
  } catch {}

  let nearby: Player[] = [];
  try {
    nearby = dimension.getPlayers({ location, maxDistance: FLASH_RADIUS });
  } catch {}

  for (const player of nearby) {
    const eye = player.getHeadLocation();
    const toBlast = Vector3Utils.subtract(location, eye);
    const distance = Vector3Utils.magnitude(toBlast);
    if (distance < 0.001 || distance > FLASH_RADIUS) continue;

    const direction = Vector3Utils.normalize(toBlast);

    // A wall between the player and the blast blocks it entirely.
    let blocked = false;
    try {
      blocked = dimension.getBlockFromRay(eye, direction, { maxDistance: distance - 0.5 }) !== undefined;
    } catch {}
    if (blocked) continue;

    // Facing away from the blast means no flash; looking straight at it is worst.
    const facing = Math.max(0, Vector3Utils.dot(player.getViewDirection(), direction));
    const falloff = 1 - distance / FLASH_RADIUS;
    const strength = facing * falloff;
    if (strength <= 0.05) continue;

    const blindness = Math.round(20 + strength * FLASH_MAX_BLINDNESS_TICKS);
    try {
      player.addEffect("blindness", blindness, { amplifier: 0, showParticles: false });
      player.addEffect("nausea", Math.round(blindness * 0.75), { amplifier: 0, showParticles: false });
      player.playSound("beacon.activate", { volume: 0.2 + 0.6 * strength, pitch: 1.9 });
    } catch {}
  }
}

function detonateSmoke(dimension: Dimension, location: Vector3): void {
  try {
    dimension.playSound("random.fizz", location, { volume: 2, pitch: 0.8 });
  } catch {}
  const cloud: SmokeCloud = { dimension, location, ticksLeft: SMOKE_DURATION };
  smokeClouds.push(cloud);
  emitSmoke(cloud);
}

function emitSmoke(cloud: SmokeCloud): void {
  try {
    for (let i = 0; i < 10; i++) {
      cloud.dimension.spawnParticle("minecraft:basic_smoke_particle", jitter(cloud.location, SMOKE_RADIUS));
    }
    for (let i = 0; i < 4; i++) {
      cloud.dimension.spawnParticle("minecraft:campfire_smoke_particle", jitter(cloud.location, SMOKE_RADIUS * 0.6));
    }
  } catch {}
}

/** A random point inside a sphere of the given radius around `location`. */
function jitter(location: Vector3, radius: number): Vector3 {
  return {
    x: location.x + (Math.random() * 2 - 1) * radius,
    y: location.y + Math.random() * radius,
    z: location.z + (Math.random() * 2 - 1) * radius,
  };
}

/** Drops any state held for a player who left. */
export function clearGrenadeState(playerId: string): void {
  throwCooldowns.delete(playerId);
}
