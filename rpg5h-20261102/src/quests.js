export function createQuests() {
  const questData = {
    quests: [
      { id: 'defeat_enemies', name: 'Defeat Enemies', type: 'progress', target: 5, current: 0 },
      { id: 'collect_gold', name: 'Collect Gold', type: 'progress', target: 100, current: 0 },
      { id: 'reach_ruins', name: 'Reach Ruins', type: 'location', target: 'ruins', current: null },
      { id: 'enter_portal', name: 'Enter Portal', type: 'location', target: 'portal', current: null }
    ],
    activeQuestId: 'defeat_enemies',
    completed: [],
    stateVersion: 1
  };

  function list() { return questData.quests; }

  function event(name, payload) {
    switch (name) {
      case 'enemy_defeated':
        const enemyQuest = questData.quests.find(q => q.id === 'defeat_enemies');
        if (enemyQuest.current < enemyQuest.target) {
          enemyQuest.current++;
          if (enemyQuest.current >= enemyQuest.target) {
            completeQuest('defeat_enemies');
          }
        }
        break;
      case 'gold_collected':
        const goldQuest = questData.quests.find(q => q.id === 'collect_gold');
        if (goldQuest.current < goldQuest.target) {
          goldQuest.current += payload.amount || 1;
          if (goldQuest.current >= goldQuest.target) {
            completeQuest('collect_gold');
          }
        }
        break;
      case 'location_reached':
        const locQuest = questData.quests.find(q => q.id === payload.location);
        if (locQuest && locQuest.current !== payload.location) {
          locQuest.current = payload.location;
          completeQuest(payload.location);
        }
        break;
      case 'portal_entered':
        const portalQuest = questData.quests.find(q => q.id === 'enter_portal');
        if (portalQuest.current !== 'portal') {
          portalQuest.current = 'portal';
          completeQuest('enter_portal');
        }
        break;
    }
  }

  function completeQuest(id) {
    const idx = questData.quests.findIndex(q => q.id === id);
    if (idx !== -1) {
      questData.completed.push(id);
      if (questData.activeQuestId === id && questData.quests[idx + 1]) {
        questData.activeQuestId = questData.quests[idx + 1].id;
      }
    }
  }

  function active() {
    return questData.quests.find(q => q.id === questData.activeQuestId) || null;
  }

  function serialize() {
    return JSON.stringify(questData);
  }

  function restore(data) {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    Object.assign(questData, parsed);
  }

  return { list, event, active, serialize, restore };
}
