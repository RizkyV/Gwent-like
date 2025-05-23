function createCardInstance(def) {
    return {
        instanceId: crypto.randomUUID(), // or your UUID generator
        baseCard: def,
        currentPower: def.power
    };
}
console.log(cardDefinitions);
console.log(createCardInstance(cardDefinitions[0]));
