import { GUNS, playerGuns } from "../data/guns";
export function updateActionBar(player) {
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory)
        return;
    const container = inventory.container;
    const heldItem = container.getItem(player.selectedSlotIndex);
    if (heldItem) {
        const gun = GUNS.find(g => g.id === heldItem.typeId);
        if (gun) {
            let currentGun = playerGuns.get(player.id);
            if (!currentGun) {
                // Initialize if not present
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
    // No gun equipped
    player.onScreenDisplay.setActionBar("");
}
//# sourceMappingURL=ui.js.map