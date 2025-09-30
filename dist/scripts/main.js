// scripts/main.ts
import {
  world,
  system
} from "@minecraft/server";

// scripts/data/guns.ts
var GUNS = [
  { id: "minecraft:iron_hoe", name: "Iron Hoe Gun", type: "rifle", maxAmmo: 10, fireRate: 10 }
  // Placeholder for iron_hoe
];
var playerGuns = /* @__PURE__ */ new Map();
var playerFireCooldowns = /* @__PURE__ */ new Map();

// node_modules/@minecraft/math/lib/general/clamp.js
function clampNumber(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// node_modules/@minecraft/math/lib/vector3/coreHelpers.js
var Vector3Utils = class _Vector3Utils {
  /**
   * equals
   *
   * Check the equality of two vectors
   */
  static equals(v1, v2) {
    return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
  }
  /**
   * add
   *
   * Add two vectors to produce a new vector
   */
  static add(v1, v2) {
    return { x: v1.x + (v2.x ?? 0), y: v1.y + (v2.y ?? 0), z: v1.z + (v2.z ?? 0) };
  }
  /**
   * subtract
   *
   * Subtract two vectors to produce a new vector (v1-v2)
   */
  static subtract(v1, v2) {
    return { x: v1.x - (v2.x ?? 0), y: v1.y - (v2.y ?? 0), z: v1.z - (v2.z ?? 0) };
  }
  /** scale
   *
   * Multiple all entries in a vector by a single scalar value producing a new vector
   */
  static scale(v1, scale) {
    return { x: v1.x * scale, y: v1.y * scale, z: v1.z * scale };
  }
  /**
   * dot
   *
   * Calculate the dot product of two vectors
   */
  static dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }
  /**
   * cross
   *
   * Calculate the cross product of two vectors. Returns a new vector.
   */
  static cross(a, b) {
    return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
  }
  /**
   * magnitude
   *
   * The magnitude of a vector
   */
  static magnitude(v) {
    return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
  }
  /**
   * distance
   *
   * Calculate the distance between two vectors
   */
  static distance(a, b) {
    return _Vector3Utils.magnitude(_Vector3Utils.subtract(a, b));
  }
  /**
   * normalize
   *
   * Takes a vector 3 and normalizes it to a unit vector
   */
  static normalize(v) {
    const mag = _Vector3Utils.magnitude(v);
    return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
  }
  /**
   * floor
   *
   * Floor the components of a vector to produce a new vector
   */
  static floor(v) {
    return { x: Math.floor(v.x), y: Math.floor(v.y), z: Math.floor(v.z) };
  }
  /**
   * toString
   *
   * Create a string representation of a vector3
   */
  static toString(v, options) {
    const decimals = options?.decimals ?? 2;
    const str = [v.x.toFixed(decimals), v.y.toFixed(decimals), v.z.toFixed(decimals)];
    return str.join(options?.delimiter ?? ", ");
  }
  /**
   * fromString
   *
   * Gets a Vector3 from the string representation produced by {@link Vector3Utils.toString}. If any numeric value is not a number
   * or the format is invalid, undefined is returned.
   * @param str - The string to parse
   * @param delimiter - The delimiter used to separate the components. Defaults to the same as the default for {@link Vector3Utils.toString}
   */
  static fromString(str, delimiter = ",") {
    const parts = str.split(delimiter);
    if (parts.length !== 3) {
      return void 0;
    }
    const output = parts.map((part) => parseFloat(part));
    if (output.some((part) => isNaN(part))) {
      return void 0;
    }
    return { x: output[0], y: output[1], z: output[2] };
  }
  /**
   * clamp
   *
   * Clamps the components of a vector to limits to produce a new vector
   */
  static clamp(v, limits) {
    return {
      x: clampNumber(v.x, limits?.min?.x ?? Number.MIN_SAFE_INTEGER, limits?.max?.x ?? Number.MAX_SAFE_INTEGER),
      y: clampNumber(v.y, limits?.min?.y ?? Number.MIN_SAFE_INTEGER, limits?.max?.y ?? Number.MAX_SAFE_INTEGER),
      z: clampNumber(v.z, limits?.min?.z ?? Number.MIN_SAFE_INTEGER, limits?.max?.z ?? Number.MAX_SAFE_INTEGER)
    };
  }
  /**
   * lerp
   *
   * Constructs a new vector using linear interpolation on each component from two vectors.
   */
  static lerp(a, b, t) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
  }
  /**
   * slerp
   *
   * Constructs a new vector using spherical linear interpolation on each component from two vectors.
   */
  static slerp(a, b, t) {
    const theta = Math.acos(_Vector3Utils.dot(a, b));
    const sinTheta = Math.sin(theta);
    const ta = Math.sin((1 - t) * theta) / sinTheta;
    const tb = Math.sin(t * theta) / sinTheta;
    return _Vector3Utils.add(_Vector3Utils.scale(a, ta), _Vector3Utils.scale(b, tb));
  }
  /**
   * multiply
   *
   * Element-wise multiplication of two vectors together.
   * Not to be confused with {@link Vector3Utils.dot} product or {@link Vector3Utils.cross} product
   */
  static multiply(a, b) {
    return { x: a.x * b.x, y: a.y * b.y, z: a.z * b.z };
  }
  /**
   * rotateX
   *
   * Rotates the vector around the x axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  static rotateX(v, a) {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return { x: v.x, y: v.y * cos - v.z * sin, z: v.z * cos + v.y * sin };
  }
  /**
   * rotateY
   *
   * Rotates the vector around the y axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  static rotateY(v, a) {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return { x: v.x * cos + v.z * sin, y: v.y, z: v.z * cos - v.x * sin };
  }
  /**
   * rotateZ
   *
   * Rotates the vector around the z axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  static rotateZ(v, a) {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return { x: v.x * cos - v.y * sin, y: v.y * cos + v.x * sin, z: v.z };
  }
};

// scripts/utils/shoot.ts
function shoot(player, currentGun) {
  const gun = GUNS.find((g) => g.id === currentGun.id);
  if (!gun) return;
  currentGun.currentAmmo--;
  const arrow = player.dimension.spawnEntity("minecraft:arrow", player.location);
  if (arrow) {
    const projectileComponent = arrow.getComponent("minecraft:projectile");
    if (projectileComponent) {
      const direction = player.getViewDirection();
      projectileComponent.shoot(Vector3Utils.scale(direction, 2));
    }
  }
  playerFireCooldowns.set(player.id, gun.fireRate);
}
function reload(player, currentGun) {
  const gun = GUNS.find((g) => g.id === currentGun.id);
  if (!gun) return false;
  const inventory = player.getComponent("minecraft:inventory");
  if (!inventory) return false;
  const container = inventory.container;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === "minecraft:apple" && item.amount > 0) {
      if (item.amount > 1) {
        item.amount--;
        container.setItem(i, item);
      } else {
        container.setItem(i, void 0);
      }
      currentGun.currentAmmo = gun.maxAmmo;
      return true;
    }
  }
  return false;
}

// scripts/utils/ui.ts
function updateActionBar(player) {
  const inventory = player.getComponent("minecraft:inventory");
  if (!inventory) return;
  const container = inventory.container;
  const heldItem = container.getItem(player.selectedSlotIndex);
  if (heldItem) {
    const gun = GUNS.find((g) => g.id === heldItem.typeId);
    if (gun) {
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
      player.onScreenDisplay.setActionBar(`${currentGun.name} | ${currentGun.currentAmmo}/${gun.maxAmmo}`);
      return;
    }
  }
  player.onScreenDisplay.setActionBar("");
}

// scripts/main.ts
world.afterEvents.itemUse.subscribe((event) => {
  const { source: player, itemStack } = event;
  const gun = GUNS.find((g) => g.id === itemStack.typeId);
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
  if (cooldown > 0) return;
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
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    updateActionBar(player);
    const cooldown = playerFireCooldowns.get(player.id);
    if (cooldown && cooldown > 0) {
      playerFireCooldowns.set(player.id, cooldown - 1);
    }
  }
}, 1);
world.afterEvents.playerLeave.subscribe((event) => {
  const playerId = event.playerId;
  playerGuns.delete(playerId);
  playerFireCooldowns.delete(playerId);
});

//# sourceMappingURL=../debug/main.js.map
