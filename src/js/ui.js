import { CONSTANTS, SHOP_ITEMS, ALL_ITEMS, EXPLORE_LOCATIONS, CRAFTING_RECIPES } from './data.js';
import * as Data from './data.js';

export const getEl = (id) => document.getElementById(id);

export const bgMusic = getEl('bg-music');
export const muteButton = getEl('mute-button');
export const muteIcon = getEl('mute-icon-fa');
export const splashScreen = getEl('splash-screen');
export const startGameButton = getEl('start-game-button');
export const gameWrapper = getEl('game-wrapper');
export const petImage = getEl('pet-image');
export const hungerBar = getEl('hunger-bar');
export const happinessBar = getEl('happiness-bar');
export const cleanlinessBar = getEl('cleanliness-bar');
export const energyBar = getEl('energy-bar');
export const ageDisplay = getEl('age-display');
export const levelDisplay = getEl('level-display');
export const statusText = getEl('status-text');
export const coinCountDisplay = getEl('coin-count');
export const petBackground = getEl('pet-background');
export const petHat = getEl('pet-hat');
export const feedButton = getEl('feed-button');
export const playButton = getEl('play-button');
export const cleanButton = getEl('clean-button');
export const sleepButton = getEl('sleep-button');
export const cureButton = getEl('cure-button');
export const openShopButton = getEl('open-shop-button');
export const closeShopButton = getEl('close-shop-button');
export const openInventoryButton = getEl('open-inventory-button');
export const closeInventoryButton = getEl('close-inventory-button');
export const infoButton = getEl('info-button');
export const exploreButton = getEl('explore-button');
export const closeExploreButton = getEl('close-explore-button');
export const shopModal = getEl('shop-modal');
export const inventoryModal = getEl('inventory-modal');
export const exploreModal = getEl('explore-modal');
export const shopContent = getEl('shop-content');
export const inventoryContent = getEl('inventory-content');
export const exploreLocationList = getEl('explore-location-list');
export const shopFoodList = getEl('shop-food-list');
export const shopDecorList = getEl('shop-decor-list');
export const shopToolList = getEl('shop-tool-list');
export const inventoryHatList = getEl('inventory-hat-list');
export const inventoryBgList = getEl('inventory-bg-list');
export const inventoryMaterialList = getEl('inventory-material-list');
export const craftingRecipeList = getEl('crafting-recipe-list');
export const shopTabs = document.querySelector('#shop-content .shop-tabs');
export const inventoryTabs = document.querySelector('#inventory-content .shop-tabs');
export const shareButton = getEl('share-profile-button');

export function preloadImages() {
    const imageUrls = [
        '/images/egg.png', '/images/baby.png', '/images/sad.png',
        '/images/sick.png', '/images/sleeping.png', '/images/exploring.png',
        '/images/eating.png', '/images/playing.png', '/images/clean.png',
        '/images/levels/lv1.png', '/images/levels/lv2.png', '/images/levels/lv3.png',
        '/images/levels/lv4.png', '/images/levels/lv5.png', '/images/levels/lv6.png',
        '/images/levels/lv7.png', '/images/levels/lv8.png', '/images/levels/lv9.png',
        '/images/levels/lv10.png', '/images/levels/lv11.png', '/images/levels/lv12.png',
        '/images/levels/lv13.png', '/images/levels/lv14.png', '/images/levels/lv15.png'
    ];

    for (const key in Data.SHOP_ITEMS.decorations) {
        const item = Data.SHOP_ITEMS.decorations[key];
        if (item.type === 'background' && item.image) {
            imageUrls.push(item.image);
        }
    }

    for (const key in Data.SHOP_ITEMS.decorations) {
        const item = Data.SHOP_ITEMS.decorations[key];
        if (item.type === 'accessory' && item.slot === 'hat' && item.image) {
            imageUrls.push(item.image);
        }
    }

    for (const key in Data.SHOP_ITEMS.craftables) {
        const item = Data.SHOP_ITEMS.craftables[key];
        if (item.type === 'accessory' && item.slot === 'hat' && item.image) {
            imageUrls.push(item.image);
        }
    }

    imageUrls.push('/images/background_night.png');
    imageUrls.push('/images/cover_night.png');

    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

export function preloadProfileImages(profileData) {
    const imagesToLoad = [];

    if (profileData.stage) {
        const stageImage = profileData.stage.startsWith(CONSTANTS.LEVEL_PREFIX)
            ? `/images/levels/${profileData.stage}.png`
            : `/images/${profileData.stage}.png`;
        imagesToLoad.push(stageImage);
    }

    if (profileData.hat && ALL_ITEMS[profileData.hat]) {
        imagesToLoad.push(ALL_ITEMS[profileData.hat].image);
    }

    if (profileData.background && ALL_ITEMS[profileData.background]) {
        imagesToLoad.push(ALL_ITEMS[profileData.background].image);
    }

    imagesToLoad.forEach(url => {
        if (url) {
            const img = new Image();
            img.src = url;
        }
    });
}

function updateStatBars(pet) {
    hungerBar.style.width = `${100 - pet.hunger}%`;
    happinessBar.style.width = `${pet.happiness}%`;
    cleanlinessBar.style.width = `${pet.cleanliness}%`;
    energyBar.style.width = `${pet.energy}%`;
}

function updateMainInfo(pet) {
    if (coinCountDisplay.textContent != pet.coins) {
        coinCountDisplay.textContent = pet.coins;
    }
    if (ageDisplay.textContent != pet.age) {
        ageDisplay.textContent = pet.age;
    }

    let levelText = '';
    if (pet.stage === CONSTANTS.STAGE_EGG) levelText = 'Trứng';
    else if (pet.stage === CONSTANTS.STAGE_BABY) levelText = 'Gà Con';
    else if (pet.stage.startsWith(CONSTANTS.LEVEL_PREFIX)) levelText = pet.stage.replace(CONSTANTS.LEVEL_PREFIX, '');
    levelDisplay.textContent = levelText;
}

function updatePetVisuals(pet, isAnimating) {
    if (isAnimating) return;

    document.body.classList.toggle('night', pet.isSleeping);
    petBackground.style.backgroundImage = pet.background === CONSTANTS.DEFAULT_BG ? '' : `url('${ALL_ITEMS[pet.background].image}')`;
    petHat.style.display = pet.accessories.hat ? 'block' : 'none';
    if (pet.accessories.hat) petHat.src = ALL_ITEMS[pet.accessories.hat].image;

    let newImageSrc = '';
    if (pet.isExploring) newImageSrc = '/images/exploring.png';
    else if (pet.isSick) newImageSrc = '/images/sick.png';
    else if (pet.isSleeping) newImageSrc = '/images/sleeping.png';
    else if (pet.stage === CONSTANTS.STAGE_EGG) newImageSrc = '/images/egg.png';
    else if (pet.hunger > 80 || pet.happiness < 20 || pet.cleanliness < 20 || pet.energy < 10) newImageSrc = '/images/sad.png';
    else newImageSrc = pet.stage.startsWith(CONSTANTS.LEVEL_PREFIX) ? `/images/levels/${pet.stage}.png` : `/images/${pet.stage}.png`;

    if (!petImage.src.endsWith(newImageSrc)) petImage.src = newImageSrc;
}

function updateUIState(pet) {
    const disableActions = pet.isExploring || pet.isSick || pet.isSleeping;
    [feedButton, playButton, cleanButton].forEach(btn => btn.disabled = disableActions);

    const disableSleep = pet.isExploring || pet.isSick;
    sleepButton.disabled = disableSleep;

    cureButton.style.display = pet.isSick ? 'inline-block' : 'none';
    [feedButton, playButton, cleanButton, sleepButton].forEach(btn => btn.style.display = pet.isSick ? 'none' : 'inline-block');
    if (pet.stage === CONSTANTS.STAGE_EGG) {
        sleepButton.style.display = 'none';
    }

    statusText.textContent = '';
    if (pet.isExploring) {
        const timeLeft = Math.max(0, pet.explorationData.endTime - Date.now());
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        statusText.textContent = `Thám hiểm... ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else if (pet.isSick) {
        statusText.textContent = 'Bị ốm rồi!';
    } else if (pet.isSleeping) {
        statusText.textContent = 'Đang ngủ...Zzz';
    }
}

export function updateDisplay(pet, isAnimating, sadAudioSourceNode, playSfxFromBuffer) {
    updateStatBars(pet);
    updateMainInfo(pet);
    updatePetVisuals(pet, isAnimating);
    updateUIState(pet);

    const isSad = !isAnimating && !pet.isExploring && !pet.isSick && !pet.isSleeping && pet.stage !== CONSTANTS.STAGE_EGG && (pet.hunger > 80 || pet.happiness < 20 || pet.cleanliness < 20 || pet.energy < 10);
    if (isSad && !sadAudioSourceNode) return playSfxFromBuffer('sad', true);
    if (!isSad && sadAudioSourceNode) {
        sadAudioSourceNode.stop(0);
        return null;
    }
    return sadAudioSourceNode;
}

export function renderShop(pet) {
    const createItemHTML = (item, key, category) => {
        const isOwned = pet.inventory[key];
        let buySectionHtml = '';

        if (category !== 'food' && isOwned) {
            buySectionHtml = `<div class="item-buy-section"><button class="owned-button" disabled>Có</button></div>`;
        } else {
            buySectionHtml = `
            <div class="item-buy-section">
                <span class="item-price">${item.price}<img src="/images/icons/coin-icon.png" class="coin-icon"></span>
                    <button class="buy-button" data-item-key="${key}">Mua</button>
            </div>`;
        }

        return `
            <li>
                <div class="item-info">
                    <strong style="font-size: 16px;">${item.name}</strong>
                    <p style="font-size: 10px; font-style: italic;">${item.description}</p>
                </div>
                ${buySectionHtml}
            </li>`;
    };

    shopFoodList.innerHTML = Object.entries(SHOP_ITEMS.food)
        .map(([key, item]) => createItemHTML(item, key, 'food')).join('');

    shopDecorList.innerHTML = Object.entries(SHOP_ITEMS.decorations)
        .map(([key, item]) => createItemHTML(item, key, 'decorations')).join('');

    shopToolList.innerHTML = Object.entries(SHOP_ITEMS.tools)
        .map(([key, item]) => createItemHTML(item, key, 'tools')).join('');
}

export function renderExploreLocations(pet) {
    let locationsHtml = '';
    const getCurrentLevel = (p) => {
        if (p.stage.startsWith(CONSTANTS.LEVEL_PREFIX)) {
            return parseInt(p.stage.replace(CONSTANTS.LEVEL_PREFIX, ''), 10);
        }
        return 0;
    };
    const currentLv = getCurrentLevel(pet);

    for (const key in EXPLORE_LOCATIONS) {
        const loc = EXPLORE_LOCATIONS[key];
        const isUnlocked = currentLv >= loc.levelReq && pet.age >= loc.ageReq;
        const isExploringThisLocation = pet.isExploring && pet.explorationData.locationKey === key;

        let buttonText = 'Đi';
        let buttonClass = 'start-explore-button';

        if (isExploringThisLocation) {
            buttonText = '<span>.</span><span>.</span><span>.</span>';
            buttonClass = 'exploring-button';
        } else if (!isUnlocked) {
            buttonText = 'Khóa';
        }

        locationsHtml += `
            <li style="opacity: ${isUnlocked ? '1' : '0.6'};">
                <div class="item-info">
                    <strong>${loc.name}</strong>
                    <p style="font-size: 10px; color: green;">Thời gian: ${loc.duration / 60000} phút, Năng lượng: ${loc.energyCost}</p>
                    <p style="font-size: 10px; font-style: italic;">${loc.description}</p>
                </div>
                <button 
                    class="${buttonClass}" 
                    data-location-key="${key}" 
                    ${!isUnlocked || pet.isExploring ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </li>`;
    }
    exploreLocationList.innerHTML = locationsHtml;
}

export function renderInventory(pet) {
    let hatHtml = `<li><div class="item-info"><strong>Không đội mũ</strong></div><button class="equip-button" data-item-key="null">Gỡ</button></li>`;
    let bgHtml = `<li><div class="item-info"><strong>Nền Mặc định (Có ngày đêm)</strong></div><button class="equip-button" data-item-key="${CONSTANTS.DEFAULT_BG}">Dùng</button></li>`;
    let materialHtml = '';
    let craftHtml = '';

    for (const itemKey in pet.inventory) {
        const item = ALL_ITEMS[itemKey];
        if (!item) continue;

        const count = pet.inventory[itemKey];
        let liHtml = `<li><div class="item-info"><strong>${item.name}</strong></div>`;

        if (item.type === 'accessory' || item.type === 'background') {
            liHtml += `<button class="equip-button" data-item-key="${itemKey}">Dùng</button></li>`;
            if (item.slot === CONSTANTS.HAT_SLOT) hatHtml += liHtml;
            else bgHtml += liHtml;
        } else if (item.type === 'material') {
            materialHtml += `<li><div class="item-info"><p>${item.name}</p><p style="font-size: 10px; font-style: italic;">${item.description}</p></div><span class="item-price">x${count}</span></li>`;
        }
    }

    for (const recipeKey in CRAFTING_RECIPES) {
        const recipe = CRAFTING_RECIPES[recipeKey];
        let materialsHtml = '';
        let canCraft = !pet.inventory[recipeKey];

        for (const matKey in recipe.materials) {
            const requiredCount = recipe.materials[matKey];
            const currentCount = pet.inventory[matKey] || 0;
            const hasEnough = currentCount >= requiredCount;
            if (!hasEnough) canCraft = false;
            materialsHtml += `<span style="color: ${hasEnough ? 'green' : 'red'};">${ALL_ITEMS[matKey].name} (${currentCount}/${requiredCount})</span><br>`;
        }

        craftHtml += `
            <li>
                <div class="item-info">
                    <strong>${ALL_ITEMS[recipeKey]?.name || recipe.name}</strong> <p style="font-size: 10px; font-style: italic;">${materialsHtml}</p>
                </div>
                <button class="craft-button" data-recipe-key="${recipeKey}" ${canCraft ? '' : 'disabled'}>
                    ${pet.inventory[recipeKey] ? 'Có' : 'Ghép'}
                </button>
            </li>`;
    }

    inventoryHatList.innerHTML = hatHtml;
    inventoryBgList.innerHTML = bgHtml;
    inventoryMaterialList.innerHTML = materialHtml;
    craftingRecipeList.innerHTML = craftHtml;
}