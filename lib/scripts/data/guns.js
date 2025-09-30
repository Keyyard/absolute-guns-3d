export const GUNS = [
    { id: "minecraft:iron_hoe", name: "Iron Hoe Gun", type: "rifle", maxAmmo: 10, fireRate: 10 } // Placeholder for iron_hoe
];
export const playerGuns = new Map(); // player.id -> CurrentGun
export const playerFireCooldowns = new Map(); // player.id -> ticks until next shot
//# sourceMappingURL=guns.js.map