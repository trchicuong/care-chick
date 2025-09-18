import * as Data from './data.js';
import * as UI from './ui.js';
import * as Audio from './audio.js';

let pet;
let isAnimating = false;
let lastUpdateTime = 0;
let lastInteractionTime = 0;
let sadAudioSourceNode = null;

function savePet() {
    localStorage.setItem('virtualPet', JSON.stringify(pet));
}

function updateInventory(itemKey, quantity) {
    if (!pet.inventory[itemKey]) {
        pet.inventory[itemKey] = 0;
    }
    pet.inventory[itemKey] += quantity;
    if (pet.inventory[itemKey] <= 0) {
        delete pet.inventory[itemKey];
    }
}

function getCurrentLevel() {
    if (pet.stage.startsWith(Data.CONSTANTS.LEVEL_PREFIX)) {
        return parseInt(pet.stage.replace(Data.CONSTANTS.LEVEL_PREFIX, ''), 10);
    }
    return 0;
};

function applyAbandonmentPenalty() {
    const currentLv = getCurrentLevel();
    const newLv = Math.max(1, currentLv - 3);

    pet.pendingNotifications.push({
        title: 'Pet đã quay trở về!',
        text: `Vì bị bỏ rơi quá lâu, pet đã quay về nhưng bị suy yếu và hạ cấp từ ${currentLv} xuống ${newLv}. Hãy chăm sóc nó tốt hơn nhé!`,
        icon: 'warning'
    });

    pet.stage = `lv${newLv}`;
    pet.hunger = 50;
    pet.happiness = 50;
    pet.cleanliness = 70;
    pet.energy = 100;
    pet.isSick = false;
    pet.sickTimestamp = null;
    pet.sadTicks = 0;
}

function calculateOfflineProgression() {
    if (!pet.lastUpdateTime) return;
    const now = Date.now();
    const offlineTime = now - pet.lastUpdateTime;
    const ticksMissed = Math.floor(offlineTime / Data.gameTickInterval);

    if (ticksMissed <= 0) return;

    if (pet.isSleeping) {
        const currentLv = Math.max(1, getCurrentLevel());
        const energyPerTick = Math.max(0.2, 1.0 - ((currentLv - 1) * 0.048));
        const energyGained = ticksMissed * energyPerTick;
        if (pet.energy + energyGained >= Data.CONSTANTS.MAX_STAT) {
            pet.energy = Data.CONSTANTS.MAX_STAT;
            pet.isSleeping = false;
        } else {
            pet.energy += energyGained;
        }
    }

    if (pet.isExploring && now >= pet.explorationData.endTime) {
        finishExploration(true);
    }

    const threeDays = 3 * 24 * 60 * 60 * 1000;
    if (offlineTime > threeDays && pet.stage !== Data.CONSTANTS.STAGE_EGG) {
        applyAbandonmentPenalty();
    }
}


function loadPet() {
    const defaultPet = {
        hunger: 50, happiness: 50, cleanliness: 70, age: 0,
        stage: Data.CONSTANTS.STAGE_EGG, ageTicks: 0, sadTicks: 0, isSick: false,
        coins: 100,
        accessories: { hat: null },
        background: Data.CONSTANTS.DEFAULT_BG,
        inventory: {},
        satietyBonus: 0, energy: 100, isSleeping: false,
        isExploring: false, explorationData: null,
        lastUpdateTime: null,
        sickTimestamp: null,
        pendingNotifications: []
    };
    const petData = localStorage.getItem('virtualPet');
    if (petData) {
        const savedPet = JSON.parse(petData);
        pet = { ...defaultPet, ...savedPet };

        if (savedPet.ownedItems && !savedPet.inventory) {
            pet.inventory = {};
            savedPet.ownedItems.forEach(itemKey => {
                updateInventory(itemKey, 1);
            });
            delete pet.ownedItems;
        }

        calculateOfflineProgression();
    } else {
        pet = defaultPet;
    }
}

function checkGameOver() {
    if (pet.isSick && pet.sickTimestamp) {
        const sickDuration = Date.now() - pet.sickTimestamp;
        const gameOverTimer = 3 * 24 * 60 * 60 * 1000;
        if (sickDuration > gameOverTimer) {
            applyAbandonmentPenalty();
            return true;
        }
    }
    return false;
}

function handleAction(actionType) {
    if (isAnimating || pet.isSick || pet.isSleeping || pet.isExploring) return;

    if (pet.energy <= 0) {
        Swal.fire({
            title: 'Pet đã kiệt sức!',
            text: 'Hãy cho pet ngủ để hồi phục năng lượng nhé.',
            icon: 'info'
        });
        return;
    }

    isAnimating = true;
    let animSrc = '';

    switch (actionType) {
        case 'feed_free':
            Audio.playSound('eat');
            let hungerRestore = 10;
            let happinessGainFeed = 2;
            let coinsGainFeed = 0;
            if (pet.inventory['chen_an_vui_ve']) {
                hungerRestore += 5;
                happinessGainFeed += 3;
            }
            if (pet.inventory['bo_chen_dua_tinh_xao']) {
                hungerRestore += 7;
                happinessGainFeed += 5;
            }
            if (pet.inventory['bi_kip_nau_nuong']) {
                hungerRestore += 8;
                happinessGainFeed += 5;
                if (Math.random() < 0.25) {
                    const bonusCoins = 25;
                    coinsGainFeed += bonusCoins;
                    Swal.fire({ title: 'Món Phụ Bất Ngờ!', text: `Bạn đã nhận thêm ${bonusCoins} Xu!`, icon: 'info', timer: 2000, showConfirmButton: false });
                }
            }
            pet.hunger = Math.max(Data.CONSTANTS.MIN_STAT, pet.hunger - hungerRestore);
            pet.happiness = Math.min(Data.CONSTANTS.MAX_STAT, pet.happiness + happinessGainFeed);
            pet.coins += coinsGainFeed;
            animSrc = '/images/eating.png';
            break;
        case 'play':
            Audio.playSound('click');
            let happinessGain = 15;
            let coinsGainPlay = 10;
            if (pet.inventory['bong_do_choi']) {
                happinessGain += 10;
                coinsGainPlay += 5;
            }
            if (pet.inventory['sach_tri_tue']) {
                happinessGain += 10;
                coinsGainPlay *= 2.5;
            }
            pet.happiness = Math.min(Data.CONSTANTS.MAX_STAT, pet.happiness + happinessGain);
            pet.hunger = Math.min(Data.CONSTANTS.MAX_STAT, pet.hunger + 5);
            pet.coins += Math.floor(coinsGainPlay);
            animSrc = '/images/playing.png';
            break;
        case 'clean':
            Audio.playSound('clean');
            let cleanlinessGain = 20;
            let coinsGainClean = 5;
            if (pet.inventory['xa_bong_thom']) {
                cleanlinessGain += 10;
                coinsGainClean += 5;
            }
            if (pet.inventory['voi_hoa_sen_vang']) {
                cleanlinessGain += 10;
                pet.energy = Math.min(Data.CONSTANTS.MAX_STAT, pet.energy + getCurrentLevel());
                if (Math.random() < 0.10) {
                    if (!pet.activeBuffs) pet.activeBuffs = {};
                    pet.activeBuffs['decayReducer'] = {
                        multiplier: 0.8,
                        endTime: Date.now() + 300000
                    };
                    Swal.fire({ title: 'Thư Giãn!', text: 'Pet cảm thấy thư thái và ít bị đói hơn trong 5 phút tới!', icon: 'info', timer: 3000, showConfirmButton: false });
                }
            }
            pet.cleanliness = Math.min(Data.CONSTANTS.MAX_STAT, pet.cleanliness + cleanlinessGain);
            pet.happiness = Math.min(Data.CONSTANTS.MAX_STAT, pet.happiness + 2);
            pet.coins += coinsGainClean;
            animSrc = '/images/clean.png';
            break;
    }

    pet.energy = Math.max(0, pet.energy - 1);
    UI.petImage.src = animSrc;
    setTimeout(() => {
        isAnimating = false;
        sadAudioSourceNode = UI.updateDisplay(pet, isAnimating, sadAudioSourceNode, Audio.playSfxFromBuffer);
        savePet();
    }, 800);
}

function toggleSleep() {
    if (pet.isSick || pet.isExploring) return;
    Audio.playSound('click');

    if (pet.isSleeping) {
        pet.isSleeping = false;
        Audio.playSfxFromBuffer('wake');
        Swal.fire({ text: 'Thức dậy nào!', timer: 1000, showConfirmButton: false });
    } else {
        if (pet.energy < 30) {
            pet.isSleeping = true;
            Audio.playSfxFromBuffer('sleep');
            Swal.fire({ text: 'Chúc ngủ ngon...Zzz', timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire({ title: 'Chưa buồn ngủ!', text: 'Pet vẫn còn đầy năng lượng.', icon: 'info', confirmButtonText: 'OK' });
        }
    }
    sadAudioSourceNode = UI.updateDisplay(pet, isAnimating, sadAudioSourceNode, Audio.playSfxFromBuffer);
}

function cure() {
    const currentLv = getCurrentLevel();
    const cureCost = 50 + (currentLv * 25);

    if (pet.isSick) {
        if (pet.coins >= cureCost) {
            Audio.playSfxFromBuffer('heal');
            pet.coins -= cureCost;
            pet.isSick = false;
            pet.sickTimestamp = null;
            pet.sadTicks = 0;
            pet.hunger = 50; pet.happiness = 50; pet.cleanliness = 70;
            Swal.fire({ title: 'Thành công!', text: `Bạn đã dùng ${cureCost} Xu để chữa bệnh!`, icon: 'success' });
            sadAudioSourceNode = UI.updateDisplay(pet, isAnimating, sadAudioSourceNode, Audio.playSfxFromBuffer);
        } else {
            Swal.fire({ title: 'Không đủ tiền', text: `Bạn cần ${cureCost} Xu để chữa bệnh!`, icon: 'error' });
        }
    }
}

function buyItem(itemKey) {
    const item = Data.SHOP_ITEMS[itemKey];
    if (!item) return;

    if (item.type === Data.CONSTANTS.TYPE_FOOD && (pet.isSick || pet.isSleeping || pet.isExploring)) {
        return Swal.fire('Không thể mua', 'Không thể mua thức ăn khi pet ốm, ngủ, hoặc đang thám hiểm!', 'warning');
    }
    if (item.type !== Data.CONSTANTS.TYPE_FOOD && pet.inventory[itemKey]) {
        return Swal.fire('Thông báo', 'Bạn đã sở hữu vật phẩm này!', 'info');
    }

    if (pet.coins >= item.price) {
        Audio.playSound('pay');
        pet.coins -= item.price;
        let notificationMessage = { title: 'Mua thành công!', text: `Đã mua ${item.name}!`, icon: 'success', timer: 1500, showConfirmButton: false };

        if (item.type === Data.CONSTANTS.TYPE_FOOD) {
            if (item.hunger !== undefined) pet.hunger = Math.max(Data.CONSTANTS.MIN_STAT, pet.hunger + item.hunger);
            if (item.happiness !== undefined) pet.happiness = Math.min(Data.CONSTANTS.MAX_STAT, pet.happiness + item.happiness);
            if (item.satietyDuration !== undefined) pet.satietyBonus += item.satietyDuration;
            if (item.energyPercent) {
                const energyToRestore = (Data.CONSTANTS.MAX_STAT - pet.energy) * item.energyPercent;
                pet.energy = Math.min(Data.CONSTANTS.MAX_STAT, pet.energy + energyToRestore);
            }
            if (item.multiRestore) {
                pet.hunger = Math.max(Data.CONSTANTS.MIN_STAT, pet.hunger + item.multiRestore.hunger);
                pet.happiness = Math.min(Data.CONSTANTS.MAX_STAT, pet.happiness + item.multiRestore.happiness);
                pet.cleanliness = Math.min(Data.CONSTANTS.MAX_STAT, pet.cleanliness + item.multiRestore.cleanliness);
                pet.energy = Math.min(Data.CONSTANTS.MAX_STAT, pet.energy + item.multiRestore.energy);
            }
            if (item.restorePercent) {
                const hungerToRestore = pet.hunger * item.restorePercent;
                const happinessToRestore = (Data.CONSTANTS.MAX_STAT - pet.happiness) * item.restorePercent;
                const cleanlinessToRestore = (Data.CONSTANTS.MAX_STAT - pet.cleanliness) * item.restorePercent;
                pet.hunger = Math.max(Data.CONSTANTS.MIN_STAT, pet.hunger - hungerToRestore);
                pet.happiness = Math.min(Data.CONSTANTS.MAX_STAT, pet.happiness + happinessToRestore);
                pet.cleanliness = Math.min(Data.CONSTANTS.MAX_STAT, pet.cleanliness + cleanlinessToRestore);
                notificationMessage = { title: 'Hồi Phục!', text: `${item.name} đã phục hồi 50% các chỉ số đã mất!`, icon: 'success' };
            }
            if (item.buff) {
                if (!pet.activeBuffs) pet.activeBuffs = {};
                pet.activeBuffs[item.buff.type] = {
                    multiplier: item.buff.multiplier,
                    endTime: Date.now() + item.buff.duration
                };
                notificationMessage = { title: 'Nhận Buff!', text: `Hiệu ứng "${item.name}" đã được kích hoạt!`, icon: 'success' };
            }
        } else {
            updateInventory(itemKey, 1);
            UI.renderInventory(pet);
            isShopViewDirty = true;
        }
        Swal.fire(notificationMessage);
        sadAudioSourceNode = UI.updateDisplay(pet, isAnimating, sadAudioSourceNode, Audio.playSfxFromBuffer);
        UI.shopModal.classList.add('hidden');
    } else {
        Swal.fire('Thất bại', 'Không đủ tiền!', 'error');
    }
}

function craftItem(recipeKey) {
    const now = Date.now();
    if (now - lastInteractionTime < 500) return;
    lastInteractionTime = now;

    const recipe = Data.CRAFTING_RECIPES[recipeKey];
    for (const matKey in recipe.materials) {
        const requiredCount = recipe.materials[matKey];
        const currentCount = pet.inventory[matKey] || 0;
        if (currentCount < requiredCount) {
            return Swal.fire('Lỗi!', 'Không đủ nguyên liệu.', 'error');
        }
    }

    for (const matKey in recipe.materials) {
        updateInventory(matKey, -recipe.materials[matKey]);
    }

    updateInventory(recipeKey, 1);
    Audio.playSound('pay');
    Swal.fire({ title: 'Chế tạo thành công!', text: `Bạn đã tạo ra ${Data.SHOP_ITEMS[recipeKey].name}!`, icon: 'success' });
    UI.renderInventory(pet);
}

function equipItem(itemKey) {
    const now = Date.now();
    if (now - lastInteractionTime < 500) return;
    lastInteractionTime = now;
    Audio.playSound('click');

    if (itemKey === 'null') {
        pet.accessories.hat = null;
    } else if (itemKey === Data.CONSTANTS.DEFAULT_BG) {
        pet.background = Data.CONSTANTS.DEFAULT_BG;
    } else {
        const item = Data.SHOP_ITEMS[itemKey];
        if (item.type === Data.CONSTANTS.TYPE_ACCESSORY) {
            pet.accessories[item.slot] = itemKey;
        } else if (item.type === Data.CONSTANTS.TYPE_BACKGROUND) {
            pet.background = itemKey;
        }
    }
    sadAudioSourceNode = UI.updateDisplay(pet, isAnimating, sadAudioSourceNode, Audio.playSfxFromBuffer);
    UI.inventoryModal.classList.add('hidden');
}

function startExploration(locationKey) {
    Audio.playSound('click');
    const loc = Data.EXPLORE_LOCATIONS[locationKey];
    const currentLv = getCurrentLevel();

    if (pet.stage === Data.CONSTANTS.STAGE_EGG || pet.stage === Data.CONSTANTS.STAGE_BABY) return Swal.fire({ title: 'Không thể đi!', text: 'Pet còn quá nhỏ để đi thám hiểm một mình!', icon: 'warning' });
    if (pet.isSick || pet.isSleeping || pet.isExploring) return Swal.fire({ title: 'Không thể đi', text: 'Không thể gửi thám hiểm khi pet ốm, ngủ, hoặc đang thám hiểm!', icon: 'warning' });
    if (currentLv < loc.levelReq) return Swal.fire({ title: 'Chưa đủ cấp độ!', text: `Bạn cần pet đạt Level ${loc.levelReq} để vào khu vực này.`, icon: 'error' });
    if (pet.age < loc.ageReq) return Swal.fire({ title: 'Pet chưa đủ tuổi!', text: `Pet của bạn cần đạt Tuổi ${loc.ageReq} để khám phá vùng đất này.`, icon: 'error' });

    if (pet.energy >= loc.energyCost) {
        pet.energy -= loc.energyCost;
        pet.isExploring = true;
        pet.explorationData = { locationKey, endTime: Date.now() + loc.duration };
        Swal.fire({ title: 'Bắt đầu Thám hiểm!', text: `Pet sẽ trở về sau ${loc.duration / 60000} phút.`, icon: 'success', timer: 2000, showConfirmButton: false });
        sadAudioSourceNode = UI.updateDisplay(pet, isAnimating, sadAudioSourceNode, Audio.playSfxFromBuffer);
        UI.exploreModal.classList.add('hidden');
        isExploreViewDirty = true;
    } else {
        Swal.fire('Không đủ Năng lượng!', 'Hãy cho pet ngủ để hồi phục.', 'warning');
    }
}

function finishExploration(isOffline = false) {
    const loc = Data.EXPLORE_LOCATIONS[pet.explorationData.locationKey];
    const totalWeight = loc.rewards.reduce((sum, reward) => sum + reward.weight, 0);
    let randomNum = Math.random() * totalWeight;
    let rewardKey;
    for (const reward of loc.rewards) {
        if (randomNum < reward.weight) {
            rewardKey = reward.key;
            break;
        }
        randomNum -= reward.weight;
    }

    const rewardItem = Data.SHOP_ITEMS[rewardKey];
    updateInventory(rewardKey, 1);

    pet.isExploring = false;
    pet.explorationData = null;
    isExploreViewDirty = true;

    const notification = {
        title: 'Thám hiểm Hoàn tất!',
        text: `Pet của bạn đã trở về và tìm thấy: ${rewardItem.name}!`,
        icon: 'success'
    };

    if (isOffline) {
        pet.pendingNotifications.push(notification);
    } else {
        UI.renderInventory(pet);
        UI.renderExploreLocations(pet);
        Swal.fire(notification);
        sadAudioSourceNode = UI.updateDisplay(pet, isAnimating, sadAudioSourceNode, Audio.playSfxFromBuffer);
    }
}

function checkEvolution() {
    if (pet.isSick || pet.isSleeping || pet.isExploring) return;

    const isPerfectlyCaredFor = pet.happiness > 90 && pet.cleanliness > 90 && pet.hunger < 10 && pet.energy > 90;
    pet.ageTicks += isPerfectlyCaredFor ? 2 : 1;

    if (pet.ageTicks >= 60) {
        pet.age++;
        pet.ageTicks = 0;
    }

    const isWellCaredFor = pet.happiness > 50 && pet.cleanliness > 50 && pet.hunger < 50;
    const currentLv = getCurrentLevel();

    if (pet.stage === Data.CONSTANTS.STAGE_EGG && pet.age >= 1) {
        pet.stage = Data.CONSTANTS.STAGE_BABY;
    } else if (pet.stage === Data.CONSTANTS.STAGE_BABY && pet.age >= 10 && isWellCaredFor) {
        pet.stage = 'lv1';
        pet.coins += 100;
        isExploreViewDirty = true;
    } else if (pet.stage.startsWith(Data.CONSTANTS.LEVEL_PREFIX)) {
        if (currentLv < 15 && pet.age >= (10 + currentLv * 20) && isWellCaredFor) {
            const newLv = currentLv + 1;
            pet.stage = `lv${newLv}`;
            pet.coins += 100 * newLv;
            isExploreViewDirty = true;
            if (newLv === 15) {
                updateInventory('ngoi_sao_hy_vong', 1);
                Swal.fire({ title: 'Đạt đến Giới hạn!', text: 'Pet đã đạt cấp tiến hóa tối đa và nhận được Ngôi Sao Hy Vọng!', icon: 'success' });
            }
        }
    }
}

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);
    const deltaTime = currentTime - lastUpdateTime;

    if (deltaTime > Data.gameTickInterval) {
        lastUpdateTime = currentTime - (deltaTime % Data.gameTickInterval);
        pet.lastUpdateTime = Date.now();

        if (pet.isExploring && Date.now() >= pet.explorationData.endTime) {
            finishExploration();
        }

        if (pet.activeBuffs) {
            for (const buffType in pet.activeBuffs) {
                if (Date.now() > pet.activeBuffs[buffType].endTime) {
                    delete pet.activeBuffs[buffType];
                }
            }
        }

        if (pet.isSick) {
            if (checkGameOver()) return;
        }
        else if (pet.isSleeping) {
            const currentLv = getCurrentLevel();
            const energyPerTick = Math.max(0.2, 1.0 - ((currentLv - 1) * 0.048));
            pet.energy = Math.min(Data.CONSTANTS.MAX_STAT, pet.energy + energyPerTick);

            if (pet.energy >= Data.CONSTANTS.MAX_STAT) {
                pet.isSleeping = false;
                Audio.playSfxFromBuffer('wake');
            }
        }
        else if (!pet.isExploring) {
            pet.energy = Math.max(Data.CONSTANTS.MIN_STAT, pet.energy - 0.5);

            let decayMultiplier = 1;
            if (pet.activeBuffs?.decayReducer) {
                decayMultiplier = pet.activeBuffs.decayReducer.multiplier;
            }

            const baseDecayRate = 1 + Math.floor(getCurrentLevel() / 4);
            const finalDecayRate = baseDecayRate * decayMultiplier;

            let hungerIncrease = finalDecayRate;
            if (pet.satietyBonus > 0) {
                hungerIncrease *= 0.5;
                pet.satietyBonus--;
            }

            pet.hunger = Math.min(Data.CONSTANTS.MAX_STAT, pet.hunger + hungerIncrease);
            pet.happiness = Math.max(Data.CONSTANTS.MIN_STAT, pet.happiness - finalDecayRate);
            pet.cleanliness = Math.max(Data.CONSTANTS.MIN_STAT, pet.cleanliness - finalDecayRate);

            const isSad = pet.hunger > 80 || pet.happiness < 20 || pet.cleanliness < 20 || pet.energy < 10;
            if (isSad && pet.stage !== Data.CONSTANTS.STAGE_EGG) {
                pet.sadTicks++;
            } else {
                pet.sadTicks = 0;
            }
            if (pet.sadTicks >= Data.SAD_TICKS_TO_GET_SICK) {
                pet.isSick = true;
                pet.sickTimestamp = Date.now();
            }
            checkEvolution();
        }

        sadAudioSourceNode = UI.updateDisplay(pet, isAnimating, sadAudioSourceNode, Audio.playSfxFromBuffer);
        savePet();
    }
}

let isShopViewDirty = true;
let isExploreViewDirty = true;

function startGame() {
    UI.splashScreen.classList.add('hidden');
    UI.gameWrapper.classList.remove('hidden');

    UI.bgMusic.play().catch(e => console.error("Lỗi phát nhạc:", e));

    requestAnimationFrame(gameLoop);
    UI.preloadImages();
    setTimeout(displayPendingNotifications, 1000);
}

async function displayPendingNotifications() {
    if (pet.pendingNotifications && pet.pendingNotifications.length > 0) {
        for (const notification of pet.pendingNotifications) {
            await Swal.fire({
                title: notification.title,
                text: notification.text,
                icon: notification.icon,
                allowOutsideClick: false
            });
        }
        pet.pendingNotifications = [];
        UI.renderInventory(pet);
        sadAudioSourceNode = UI.updateDisplay(pet, isAnimating, sadAudioSourceNode, Audio.playSfxFromBuffer);
    }
}

export function init() {
    loadPet();
    UI.renderInventory(pet);
    Audio.loadMuteState();

    const addSmartEventListener = (element, callback) => {
        let touchStarted = false;
        const onPress = (e) => {
            if (e.cancelable) e.preventDefault();
            element.classList.add('button-active');
            touchStarted = e.type === 'touchstart';
        };
        const onRelease = (e) => {
            if (e.cancelable) e.preventDefault();
            element.classList.remove('button-active');
            if (!touchStarted || e.type === 'touchend') {
                callback(e);
            }
        };
        const onCancel = () => element.classList.remove('button-active');
        element.addEventListener('mousedown', onPress);
        element.addEventListener('touchstart', onPress, { passive: false });
        element.addEventListener('mouseup', onRelease);
        element.addEventListener('touchend', onRelease);
        element.addEventListener('mouseleave', onCancel);
    };

    UI.startGameButton.addEventListener('click', () => {
        Audio.playStart(Audio.startAudio);
        Audio.setupBgMusicWithWebAudio();
        startGame();
    });

    addSmartEventListener(UI.muteButton, Audio.toggleMute);
    addSmartEventListener(UI.feedButton, () => handleAction('feed_free'));
    addSmartEventListener(UI.playButton, () => handleAction('play'));
    addSmartEventListener(UI.cleanButton, () => handleAction('clean'));
    addSmartEventListener(UI.cureButton, cure);
    addSmartEventListener(UI.sleepButton, toggleSleep);

    addSmartEventListener(UI.openShopButton, () => {
        Audio.playSound('click');
        if (isShopViewDirty) {
            UI.renderShop(pet);
            isShopViewDirty = false;
        }
        UI.shopModal.classList.remove('hidden');
    });

    addSmartEventListener(UI.openInventoryButton, () => {
        Audio.playSound('click');
        UI.inventoryModal.classList.remove('hidden');
    });

    addSmartEventListener(UI.exploreButton, () => {
        Audio.playSound('click');
        if (isExploreViewDirty) {
            UI.renderExploreLocations(pet);
            isExploreViewDirty = false;
        }
        UI.exploreModal.classList.remove('hidden');
    });

    addSmartEventListener(UI.closeShopButton, () => { Audio.playSound('click'); UI.shopModal.classList.add('hidden'); });
    addSmartEventListener(UI.closeInventoryButton, () => { Audio.playSound('click'); UI.inventoryModal.classList.add('hidden'); });
    addSmartEventListener(UI.closeExploreButton, () => { Audio.playSound('click'); UI.exploreModal.classList.add('hidden'); });

    addSmartEventListener(UI.infoButton, () => {
        Audio.playSound('click');
        Swal.fire({
            title: 'Về Game',
            html: `
            <div style="text-align: left; font-size: 14px; font-family: monospace; line-height: 1.6;">
                <p>Chào mừng bạn đến với <strong>Nuôi Gà Tiên</strong>! Đây là phiên bản Beta, vẫn đang trong quá trình phát triển.</p> <hr>
                <h3 style="font-size: 16px; color: #75c683; margin-bottom: 5px;">📜 CƠ CHẾ TRÒ CHƠI</h3>
                <ul>
                    <li><strong>Mục tiêu:</strong> Giữ các chỉ số No bụng, Vui vẻ, Sạch sẽ và Năng lượng ở mức cao để pet lớn lên và tiến hóa.</li>
                    <li><strong>Tiến hóa:</strong> Pet chỉ tiến hóa khi <strong>đủ tuổi VÀ được chăm sóc tốt</strong> (các chỉ số trên 50%).</li>
                    <li><strong>Chăm sóc Hoàn hảo:</strong> Nếu giữ tất cả chỉ số trên 90%, pet sẽ <strong>lớn nhanh gấp đôi</strong>!</li>
                    <li><strong>Giấc ngủ:</strong> Khi năng lượng thấp (dưới 30%), hãy cho pet ngủ để hồi phục (Trứng không cần ngủ). Pet sẽ được an toàn khi ngủ.</li>
                    <li><strong style="color: red;">Trạng thái xấu:</strong> Nếu các chỉ số ở mức quá thấp, pet sẽ ngã bệnh. Chi phí chữa bệnh sẽ <strong>tăng theo cấp tiến hóa</strong>.</li>
                    <li><strong style="color: red;">Hình phạt:</strong> Nếu pet bị bỏ rơi trong hơn <strong>3 ngày</strong> (kể cả khi bạn treo game), nó sẽ bị suy yếu và <strong>hạ 3 cấp tiến hóa</strong>!</li>
                </ul>
                <hr>
                <h3 style="font-size: 16px; color: #a2d2ff; margin-bottom: 5px;">🗺️ THÁM HIỂM & GHÉP ĐỒ</h3>
                <ul>
                    <li><strong>Thám hiểm:</strong> Gửi pet đến các vùng đất mới để tìm nguyên liệu hiếm. Các khu vực sẽ mở khóa khi pet đạt đủ <strong>Tuổi</strong> yêu cầu.</li>
                    <li><strong>Ghép đồ (Crafting):</strong> Sử dụng nguyên liệu thu thập được trong <strong>Túi đồ</strong> để chế tạo ra những vật phẩm huyền thoại!</li>
                </ul>
                <hr>
                <h3 style="font-size: 16px; color: #f7d87b; margin-bottom: 5px;">🏪 CỬA HÀNG & VẬT PHẨM</h3>
                <ul>
                    <li><strong>Các loại vật phẩm:</strong> Mua sắm thức ăn, công cụ nâng cấp (giúp các hành động hiệu quả hơn), và đồ trang trí (mũ, nền).</li>
                    <li><strong>Hiệu ứng đặc biệt:</strong> Một số vật phẩm cao cấp không chỉ hồi phục chỉ số mà còn mang lại các <strong>buff tạm thời</strong> như tăng xu nhận được hoặc làm chậm suy giảm chỉ số.</li>
                </ul>
                <hr>
                <p style="color: #ffc107; font-weight: bold;">⚠️ LƯU Ý QUAN TRỌNG:</p>
                <p>Dữ liệu game được lưu trực tiếp trên trình duyệt này. Vui lòng <strong style="color: red;">KHÔNG XÓA CACHE</strong>. Việc xóa cache hoặc dữ liệu trang web sẽ làm <strong style="color: red;">mất toàn bộ tiến trình chơi</strong> của bạn.</p>
            </div>`,
            icon: 'info',
            confirmButtonText: 'Tôi đã hiểu'
        });
    });

    const setupTabListeners = (tabContainer, modal) => {
        tabContainer.addEventListener('click', (event) => {
            const tabButton = event.target.closest('.tab-button');
            if (tabButton) {
                Audio.playSound('click');
                modal.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                modal.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                tabButton.classList.add('active');
                UI.getEl(tabButton.dataset.tab).classList.add('active');
            }
        });
    };
    setupTabListeners(UI.shopTabs, UI.shopModal);
    setupTabListeners(UI.inventoryTabs, UI.inventoryModal);

    const setupListListeners = (listElement) => {
        listElement.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            const { itemKey, recipeKey, locationKey } = button.dataset;
            if (itemKey) {
                if (button.classList.contains('buy-button')) buyItem(itemKey);
                else if (button.classList.contains('equip-button')) equipItem(itemKey);
            }
            if (recipeKey && button.classList.contains('craft-button')) craftItem(recipeKey);
            if (locationKey && button.classList.contains('start-explore-button')) startExploration(locationKey);
        });
    };
    [UI.shopFoodList, UI.shopDecorList, UI.shopToolList, UI.inventoryHatList, UI.inventoryBgList, UI.craftingRecipeList, UI.exploreLocationList].forEach(setupListListeners);

    sadAudioSourceNode = UI.updateDisplay(pet, isAnimating, sadAudioSourceNode, Audio.playSfxFromBuffer);
}