export const saveState = (data, storage = localStorage) => {
  if (!storage || typeof storage !== 'object') return null;
  
  const version = 1;
  const safeData = {
    version,
    heroPos: data.heroPos,
    xp: data.xp,
    quests: data.quests,
    inventory: data.inventory
  };
  
  try {
    const json = JSON.stringify(safeData);
    storage.setItem('game_save', json);
    return safeData;
  } catch {
    return null;
  }
};

export const loadState = (storage = localStorage) => {
  if (!storage || typeof storage !== 'object') return null;
  
  try {
    const json = storage.getItem('game_save');
    if (!json) return null;
    
    const data = JSON.parse(json);
    if (data.version !== 1) return null;
    
    // Clear sensitive fields if any
    delete data.password;
    delete data.secretKey;
    delete data.token;
    delete data.apiKey;
    delete data.sessionId;
    
    return data;
  } catch {
    return null;
  }
};

export const clearSave = (storage = localStorage) => {
  if (!storage || typeof storage !== 'object') return false;
  try {
    storage.removeItem('game_save');
    return true;
  } catch {
    return false;
  }
};

export const getSaveVersion = () => 1;
