export function createInventory() {
  const inventory = new Map();
  
  return {
    add(type, qty) {
      if (qty < 0) throw new Error('Quantity cannot be negative');
      inventory.set(type, (inventory.get(type) || 0) + qty);
    },
    remove(type, qty) {
      if (qty < 0) throw new Error('Quantity cannot be negative');
      const current = inventory.get(type) || 0;
      const remaining = current - qty;
      if (remaining < 0) throw new Error('Insufficient quantity');
      inventory.set(type, remaining);
    },
    count(type) {
      return inventory.get(type) || 0;
    },
    list() {
      return Array.from(inventory.entries()).map(([type, qty]) => ({ type, qty }));
    },
    serialize() {
      const data = {};
      for (const [type, qty] of inventory.entries()) {
        if (qty > 0) data[type] = qty;
      }
      return data;
    },
    restore(data) {
      inventory.clear();
      for (const [type, qty] of Object.entries(data)) {
        inventory.set(type, qty);
      }
    }
  };
}
