import { EquipmentSlot } from "@minecraft/server";

// Armor protection/toughness table (ported from the reference implementation).
export const ARMOR_PROTECTION_VALUES: Record<string, any> = {
  "minecraft:netherite_helmet": { toughness: 3, protection: 4, knockback_resistance: 1 },
  "minecraft:netherite_chestplate": { toughness: 8, protection: 4, knockback_resistance: 1 },
  "minecraft:netherite_leggings": { toughness: 6, protection: 4, knockback_resistance: 1 },
  "minecraft:netherite_boots": { toughness: 3, protection: 4, knockback_resistance: 1 },
  "minecraft:diamond_helmet": { toughness: 2, protection: 3 },
  "minecraft:diamond_chestplate": { toughness: 2, protection: 8 },
  "minecraft:diamond_leggings": { toughness: 2, protection: 6 },
  "minecraft:diamond_boots": { toughness: 2, protection: 3 },
  "minecraft:iron_helmet": { toughness: 0, protection: 2 },
  "minecraft:iron_chestplate": { toughness: 0, protection: 6 },
  "minecraft:iron_leggings": { toughness: 0, protection: 5 },
  "minecraft:iron_boots": { toughness: 0, protection: 2 },
  "minecraft:chainmail_helmet": { toughness: 0, protection: 2 },
  "minecraft:chainmail_chestplate": { toughness: 0, protection: 5 },
  "minecraft:chainmail_leggings": { toughness: 0, protection: 4 },
  "minecraft:chainmail_boots": { toughness: 0, protection: 1 },
  "minecraft:golden_helmet": { toughness: 0, protection: 2 },
  "minecraft:golden_chestplate": { toughness: 0, protection: 5 },
  "minecraft:golden_leggings": { toughness: 0, protection: 3 },
  "minecraft:golden_boots": { toughness: 0, protection: 1 },
  "minecraft:leather_helmet": { toughness: 0, protection: 1 },
  "minecraft:leather_chestplate": { toughness: 0, protection: 3 },
  "minecraft:leather_leggings": { toughness: 0, protection: 2 },
  "minecraft:leather_boots": { toughness: 0, protection: 1 },
  "minecraft:turtle_helemt": { toughness: 0, protection: 1 },
};

function distanceBetween(a: any, b: any) {
  if (!a || !b) return 0;
  const dx = (a.x || 0) - (b.x || 0);
  const dy = (a.y || 0) - (b.y || 0);
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export class DamageHandler {
  static getDamageTakenWithProtection(
    armorProtection: number,
    ArmorToughness: number,
    damage: number,
    enchantLevel: number
  ) {
    try {
      const safeEnchant = Math.max(1, enchantLevel || 1);
      const safeToughness = Math.max(1, ArmorToughness || 1);
      const top = Math.max(
        armorProtection / 5,
        armorProtection - ((4 * damage * (1 / safeEnchant)) / safeToughness + 8)
      );
      let res = 1 - top / 25;
      if (!Number.isFinite(res)) res = 1;
      return Math.min(Math.max(res, 0), 1);
    } catch {
      return 1;
    }
  }

  static handleArmorDurability(entity: any, damage: number) {
    try {
      const equipment =
        entity.getComponent("equippable") ??
        entity.getComponent("equipment") ??
        entity.getComponent("minecraft:equipment");
      if (!equipment) return;
      const damageInHeart = damage * 2;
      const durabilityDamage = damageInHeart / 4;
      const slots = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet];
      for (const s of slots) {
        try {
          const item = equipment.getEquipment(s as any);
          if (!item) continue;
          const comp: any = item.getComponent("minecraft:durability") ?? item.getComponent("durability");
          if (!comp) continue;
          comp.damage = (comp.damage ?? 0) + durabilityDamage;
          equipment.setEquipment(s as any, item);
        } catch {}
      }
    } catch {}
  }

  static getKnockbackResistance(hit: any) {
    try {
      const equipment =
        hit.getComponent("equippable") ?? hit.getComponent("equipment") ?? hit.getComponent("minecraft:equipment");
      if (!equipment) return 1;
      const head = equipment.getEquipment(EquipmentSlot.Head);
      const chest = equipment.getEquipment(EquipmentSlot.Chest);
      const legs = equipment.getEquipment(EquipmentSlot.Legs);
      const feet = equipment.getEquipment(EquipmentSlot.Feet);
      const helmet = ARMOR_PROTECTION_VALUES[head?.typeId]?.knockback_resistance || 0;
      const chestR = ARMOR_PROTECTION_VALUES[chest?.typeId]?.knockback_resistance || 0;
      const legsR = ARMOR_PROTECTION_VALUES[legs?.typeId]?.knockback_resistance || 0;
      const feetR = ARMOR_PROTECTION_VALUES[feet?.typeId]?.knockback_resistance || 0;
      const total = helmet + chestR + legsR + feetR;
      return Math.max(0, 1 - total * 0.07);
    } catch {
      return 1;
    }
  }

  static handleArmorMultiplier(hit: any, damage: number) {
    try {
      const equipment =
        hit.getComponent("equippable") ?? hit.getComponent("equipment") ?? hit.getComponent("minecraft:equipment");
      if (!equipment) return 1;
      const head = equipment.getEquipment(EquipmentSlot.Head);
      const chest = equipment.getEquipment(EquipmentSlot.Chest);
      const legs = equipment.getEquipment(EquipmentSlot.Legs);
      const feet = equipment.getEquipment(EquipmentSlot.Feet);

      const helmetProtection = ARMOR_PROTECTION_VALUES[head?.typeId]?.protection || 0;
      const chestProtection = ARMOR_PROTECTION_VALUES[chest?.typeId]?.protection || 0;
      const legsProtection = ARMOR_PROTECTION_VALUES[legs?.typeId]?.protection || 0;
      const feetProtection = ARMOR_PROTECTION_VALUES[feet?.typeId]?.protection || 0;
      const maxProtection = helmetProtection + chestProtection + legsProtection + feetProtection;

      const helmetToughness = ARMOR_PROTECTION_VALUES[head?.typeId]?.toughness || 0;
      const chestToughness = ARMOR_PROTECTION_VALUES[chest?.typeId]?.toughness || 0;
      const legsToughness = ARMOR_PROTECTION_VALUES[legs?.typeId]?.toughness || 0;
      const feetToughness = ARMOR_PROTECTION_VALUES[feet?.typeId]?.toughness || 0;
      const maxToughness = helmetToughness + chestToughness + legsToughness + feetToughness;

      const helmetEnchant = head?.getComponent("enchantable")?.getEnchantment("protection")?.level || 0;
      const chestEnchant = chest?.getComponent("enchantable")?.getEnchantment("protection")?.level || 0;
      const legsEnchant = legs?.getComponent("enchantable")?.getEnchantment("protection")?.level || 0;
      const feetEnchant = feet?.getComponent("enchantable")?.getEnchantment("protection")?.level || 0;
      const totalEnchants = helmetEnchant + chestEnchant + legsEnchant + feetEnchant;

      return DamageHandler.getDamageTakenWithProtection(maxProtection, maxToughness, damage, totalEnchants) || 1;
    } catch {
      return 1;
    }
  }

  static getDamages(weapon: any, hit: any, bullet: any) {
    try {
      const spawn = (bullet as any).spawnLocation || bullet.location || { x: 0, y: 0, z: 0 };
      const dist = Math.floor(distanceBetween(spawn, hit.location));
      const raw = (weapon.damage || 0) - (weapon.damageDropOff || 0) * dist;
      if (raw <= 0) return 0;
      const m = DamageHandler.handleArmorMultiplier(hit, raw);
      const pen = weapon.armorPenetration ?? 0;
      const final = raw * (m * (1 - pen) + pen);
      return Math.max(0, final);
    } catch {
      return 0;
    }
  }
}
