import { CONSTANTS, SHOP_ITEMS, EXPLORE_LOCATIONS, CRAFTING_RECIPES } from './data.js';

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
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

export function updateDisplay(pet, isAnimating, sadAudioSourceNode, playSfxFromBuffer) {
    if (isAnimating) {
        return sadAudioSourceNode;
    }

    hungerBar.style.width = `${100 - pet.hunger}%`;
    happinessBar.style.width = `${pet.happiness}%`;
    cleanlinessBar.style.width = `${pet.cleanliness}%`;
    energyBar.style.width = `${pet.energy}%`;
    if (coinCountDisplay.textContent != pet.coins) {
        coinCountDisplay.textContent = pet.coins;
    }
    if (ageDisplay.textContent != pet.age) {
        ageDisplay.textContent = pet.age;
    }

    let levelText = '';
    if (pet.stage === CONSTANTS.STAGE_EGG) {
        levelText = 'Trứng';
    } else if (pet.stage === CONSTANTS.STAGE_BABY) {
        levelText = 'Gà Con';
    } else if (pet.stage.startsWith(CONSTANTS.LEVEL_PREFIX)) {
        const levelNumber = pet.stage.replace(CONSTANTS.LEVEL_PREFIX, '');
        levelText = `${levelNumber}`;
    }
    levelDisplay.textContent = levelText;

    document.body.classList.toggle('night', pet.isSleeping);

    petBackground.style.backgroundImage = pet.background === CONSTANTS.DEFAULT_BG
        ? ''
        : `url('${SHOP_ITEMS[pet.background].image}')`;

    if (pet.accessories.hat) {
        petHat.src = SHOP_ITEMS[pet.accessories.hat].image;
        petHat.style.display = 'block';
    } else {
        petHat.style.display = 'none';
    }

    const allActionButtons = [feedButton, playButton, cleanButton, sleepButton, cureButton, openShopButton, openInventoryButton, exploreButton];
    allActionButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.display = 'inline-block';
    });

    cureButton.style.display = 'none';
    statusText.textContent = '';
    let newImageSrc = '';
    let newSadAudioNode = sadAudioSourceNode;

    if (pet.isExploring) {
        const timeLeft = Math.max(0, pet.explorationData.endTime - Date.now());
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        newImageSrc = '/images/exploring.png';
        statusText.textContent = `Thám hiểm... ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        [feedButton, playButton, cleanButton, sleepButton, cureButton].forEach(btn => btn.disabled = true);
        if (sadAudioSourceNode) {
            sadAudioSourceNode.stop(0);
            newSadAudioNode = null;
        }
    } else if (pet.isSick) {
        newImageSrc = '/images/sick.png';
        statusText.textContent = 'Bị ốm rồi!';
        cureButton.style.display = 'inline-block';
        [feedButton, playButton, cleanButton, sleepButton].forEach(btn => btn.style.display = 'none');
        if (sadAudioSourceNode) {
            sadAudioSourceNode.stop(0);
            newSadAudioNode = null;
        }
    } else if (pet.isSleeping) {
        newImageSrc = '/images/sleeping.png';
        statusText.textContent = 'Đang ngủ...Zzz';
        [feedButton, playButton, cleanButton].forEach(btn => btn.disabled = true);
        if (sadAudioSourceNode) {
            sadAudioSourceNode.stop(0);
            newSadAudioNode = null;
        }
    } else if (pet.stage === CONSTANTS.STAGE_EGG) {
        newImageSrc = '/images/egg.png';
        sleepButton.style.display = 'none';
    } else if (pet.hunger > 80 || pet.happiness < 20 || pet.cleanliness < 20 || pet.energy < 10) {
        newImageSrc = '/images/sad.png';
        if (!sadAudioSourceNode) {
            newSadAudioNode = playSfxFromBuffer('sad', true);
        }
    } else {
        if (sadAudioSourceNode) {
            sadAudioSourceNode.stop(0);
            newSadAudioNode = null;
        }
        newImageSrc = pet.stage.startsWith(CONSTANTS.LEVEL_PREFIX) ? `/images/levels/${pet.stage}.png` : `/images/${pet.stage}.png`;
    }

    if (!petImage.src.endsWith(newImageSrc)) {
        petImage.src = newImageSrc;
    }

    return newSadAudioNode;
}

export function renderShop() {
    let foodHtml = '', decorHtml = '', toolHtml = '';

    for (const key in SHOP_ITEMS) {
        const item = SHOP_ITEMS[key];
        if (item.type === CONSTANTS.TYPE_MATERIAL) continue;

        const buySectionHtml = item.price
            ? `<div class="item-buy-section">
                   <span class="item-price">${item.price}<img src="/images/icons/coin-icon.png" class="coin-icon"></span>
                   <button class="buy-button" data-item-key="${key}">Mua</button>
               </div>`
            : `<div class="item-buy-section">
                   <span class="item-price" style="font-size: 3em;">∞<img src="/images/icons/coin-icon.png" class="coin-icon"></span>
                   <button disabled style="background-color: #ccc; cursor: not-allowed;">Ghép</button>
               </div>`;

        const liHtml = `
            <li>
                <div class="item-info">
                    <strong style="font-size: 16px;">${item.name}</strong>
                    <p style="font-size: 10px; font-style: italic;">${item.description}</p>
                </div>
                ${buySectionHtml}
            </li>`;

        if (item.type === CONSTANTS.TYPE_FOOD) foodHtml += liHtml;
        else if (item.type === CONSTANTS.TYPE_TOOL) toolHtml += liHtml;
        else decorHtml += liHtml;
    }

    shopFoodList.innerHTML = foodHtml;
    shopDecorList.innerHTML = decorHtml;
    shopToolList.innerHTML = toolHtml;
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
        locationsHtml += `
            <li style="opacity: ${isUnlocked ? '1' : '0.6'};">
                <div class="item-info">
                    <strong>${loc.name}</strong>
                    <p style="font-size: 10px; color: green;">Thời gian: ${loc.duration / 60000} phút, Năng lượng: ${loc.energyCost}</p>
                    <p style="font-size: 10px; font-style: italic;">${loc.description}</p>
                </div>
                <button class="start-explore-button" data-location-key="${key}" ${isUnlocked ? '' : 'disabled'}>
                    ${isUnlocked ? 'Đi' : `Khóa`}
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
        const item = SHOP_ITEMS[itemKey];
        if (!item) continue;

        const count = pet.inventory[itemKey];
        let liHtml = `<li><div class="item-info"><strong>${item.name}</strong></div>`;

        if (item.type === CONSTANTS.TYPE_ACCESSORY || item.type === CONSTANTS.TYPE_BACKGROUND) {
            liHtml += `<button class="equip-button" data-item-key="${itemKey}">Dùng</button></li>`;
            if (item.slot === CONSTANTS.HAT_SLOT) hatHtml += liHtml;
            else bgHtml += liHtml;
        } else if (item.type === CONSTANTS.TYPE_MATERIAL) {
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
            materialsHtml += `<span style="color: ${hasEnough ? 'green' : 'red'};">${SHOP_ITEMS[matKey].name} (${currentCount}/${requiredCount})</span><br>`;
        }

        craftHtml += `
            <li>
                <div class="item-info">
                    <strong>${SHOP_ITEMS[recipeKey]?.name || recipe.name}</strong>
                    <p style="font-size: 10px; font-style: italic;">${materialsHtml}</p>
                </div>
                <button class="craft-button" data-recipe-key="${recipeKey}" ${canCraft ? '' : 'disabled'}>
                    ${pet.inventory[recipeKey] ? 'Đã có' : 'Ghép'}
                </button>
            </li>`;
    }

    inventoryHatList.innerHTML = hatHtml;
    inventoryBgList.innerHTML = bgHtml;
    inventoryMaterialList.innerHTML = materialHtml;
    craftingRecipeList.innerHTML = craftHtml;
}