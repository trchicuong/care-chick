// =================================
// CONSTANTS (Hằng số)
// =================================
const CONSTANTS = {
    MAX_STAT: 100,
    MIN_STAT: 0,
    STAGE_EGG: 'egg',
    STAGE_BABY: 'baby',
    LEVEL_PREFIX: 'lv',
    DEFAULT_BG: 'default',
    HAT_SLOT: 'hat',
    TYPE_MATERIAL: 'material',
    TYPE_FOOD: 'food',
    TYPE_TOOL: 'tool',
    TYPE_ACCESSORY: 'accessory',
    TYPE_BACKGROUND: 'background',
};

const BG_MUSIC_NORMAL_VOLUME = 0.1; // 10%
const BG_MUSIC_DUCKED_VOLUME = 0.01; // 1%
const gameTickInterval = 3000;
const SAD_TICKS_TO_GET_SICK = 100;

// =================================
// BIẾN TRẠNG THÁI GAME
// =================================
let pet;
let isAnimating = false;
let isMuted = false;
let duckingTimeout = null;
let lastUpdateTime = 0;
let lastInteractionTime = 0;
let audioContext;
let bgMusicSource;
let bgMusicGainNode;
let masterGainNode;
const sfxBuffers = {};
let sadAudioSourceNode = null;

// =================================
// TẢI TRƯỚC ẢNH
// =================================
function preloadImages() {
    const imageUrls = [
        '/images/egg.png',
        '/images/baby.png',
        '/images/sad.png',
        '/images/sick.png',
        '/images/sleeping.png',
        '/images/exploring.png',
        '/images/eating.png',
        '/images/playing.png',
        '/images/clean.png',
        '/images/levels/lv1.png',
        '/images/levels/lv2.png',
        '/images/levels/lv3.png',
        '/images/levels/lv4.png',
        '/images/levels/lv5.png',
        '/images/levels/lv6.png',
        '/images/levels/lv7.png',
        '/images/levels/lv8.png',
        '/images/levels/lv9.png',
        '/images/levels/lv10.png',
        '/images/levels/lv11.png',
        '/images/levels/lv12.png',
        '/images/levels/lv13.png',
        '/images/levels/lv14.png',
        '/images/levels/lv15.png'
    ];
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// =================================
// LẤY CÁC THÀNH PHẦN GIAO DIỆN (DOM)
// =================================
const getEl = (id) => document.getElementById(id);

const bgMusic = getEl('bg-music');
const muteButton = getEl('mute-button');
const muteIcon = getEl('mute-icon-fa');
const splashScreen = getEl('splash-screen');
const startGameButton = getEl('start-game-button');
const gameWrapper = getEl('game-wrapper');

const petImage = getEl('pet-image');
const hungerBar = getEl('hunger-bar');
const happinessBar = getEl('happiness-bar');
const cleanlinessBar = getEl('cleanliness-bar');
const energyBar = getEl('energy-bar');
const ageDisplay = getEl('age-display');
const levelDisplay = getEl('level-display');
const statusText = getEl('status-text');
const coinCountDisplay = getEl('coin-count');
const petBackground = getEl('pet-background');
const petHat = getEl('pet-hat');

// Buttons
const feedButton = getEl('feed-button');
const playButton = getEl('play-button');
const cleanButton = getEl('clean-button');
const sleepButton = getEl('sleep-button');
const cureButton = getEl('cure-button');
const openShopButton = getEl('open-shop-button');
const closeShopButton = getEl('close-shop-button');
const openInventoryButton = getEl('open-inventory-button');
const closeInventoryButton = getEl('close-inventory-button');
const infoButton = getEl('info-button');
const exploreButton = getEl('explore-button');
const closeExploreButton = getEl('close-explore-button');

// Modals & Containers
const shopModal = getEl('shop-modal');
const inventoryModal = getEl('inventory-modal');
const exploreModal = getEl('explore-modal');
const shopContent = getEl('shop-content');
const inventoryContent = getEl('inventory-content');

// Lists
const exploreLocationList = getEl('explore-location-list');
const shopFoodList = getEl('shop-food-list');
const shopDecorList = getEl('shop-decor-list');
const shopToolList = getEl('shop-tool-list');
const inventoryHatList = getEl('inventory-hat-list');
const inventoryBgList = getEl('inventory-bg-list');
const inventoryMaterialList = getEl('inventory-material-list');
const craftingRecipeList = getEl('crafting-recipe-list');

// Tabs
const shopTabs = document.querySelector('#shop-content .shop-tabs');
const inventoryTabs = document.querySelector('#inventory-content .shop-tabs');

// =================================
// ÂM THANH
// =================================
const startAudio = new Audio('/audio/start.mp3'); startAudio.volume = 1.0;

// =================================
// DỮ LIỆU GAME
// =================================
const EXPLORE_LOCATIONS = {
    'khu_rung': {
        name: 'Khu Rừng Gần Nhà', duration: 300000, energyCost: 20, levelReq: 1, ageReq: 10,
        description: 'Yêu cầu: Tuổi 10. Tìm kiếm những thứ cơ bản.',
        rewards: [
            { key: 'sau_map', weight: 60 },
            { key: 'hat_giong_than', weight: 35 },
            { key: 'long_ga_vang', weight: 5 }
        ]
    },
    'bai_bien': {
        name: 'Bãi Biển Đầy Nắng', duration: 900000, energyCost: 40, levelReq: 3, ageReq: 50,
        description: 'Yêu cầu: Tuổi 50. Tìm vài thứ lấp lánh dưới cát.',
        rewards: [
            { key: 'vo_so_lap_lanh', weight: 60 },
            { key: 'hat_giong_than', weight: 30 },
            { key: 'long_ga_vang', weight: 10 }
        ]
    },
    'dam_lay': {
        name: 'Đầm Lầy Ma Quái', duration: 1800000, energyCost: 50, levelReq: 5, ageReq: 90,
        description: 'Yêu cầu: Tuổi 90. Nơi ẩm ướt và đầy bí ẩn.',
        rewards: [
            { key: 'reu_co_thu', weight: 50 },
            { key: 'sau_map', weight: 30 },
            { key: 'hat_giong_than', weight: 20 }
        ]
    },
    'nui_tuyet': {
        name: 'Đỉnh Núi Tuyết', duration: 3600000, energyCost: 60, levelReq: 7, ageReq: 130,
        description: 'Yêu cầu: Tuổi 130. Nơi lạnh giá ẩn chứa kho báu.',
        rewards: [
            { key: 'tinh_the_bang', weight: 60 },
            { key: 'vo_so_lap_lanh', weight: 35 },
            { key: 'da_dung_nham', weight: 5 }
        ]
    },
    'dong_bang_phu_sa': {
        name: 'Đồng Bằng Phù Sa', duration: 7200000, energyCost: 80, levelReq: 9, ageReq: 170,
        description: 'Yêu cầu: Tuổi 170. Vùng đất màu mỡ.',
        rewards: [
            { key: 'dat_set_song_hong', weight: 65 },
            { key: 'hat_giong_than', weight: 30 },
            { key: 'tinh_chat_tre_nga', weight: 5 }
        ]
    },
    'rung_tre_nga': {
        name: 'Rừng Tre Ngà', duration: 14400000, energyCost: 85, levelReq: 10, ageReq: 190,
        description: 'Yêu cầu: Tuổi 190. Nơi cây tre vươn mình bất khuất.',
        rewards: [
            { key: 'tinh_chat_tre_nga', weight: 70 },
            { key: 'hat_giong_than', weight: 20 },
            { key: 'long_ga_vang', weight: 10 }
        ]
    },
    'hang_dung_nham': {
        name: 'Hang Động Dung Nham', duration: 21600000, energyCost: 90, levelReq: 12, ageReq: 230,
        description: 'Yêu cầu: Tuổi 230. Cực kỳ nguy hiểm.',
        rewards: [
            { key: 'da_dung_nham', weight: 75 },
            { key: 'long_ga_vang', weight: 22 },
            { key: 'ngoi_sao_hy_vong', weight: 3 }
        ]
    },
    'vuc_tham_co_dai': {
        name: 'Vực Thẳm Cổ Đại', duration: 28800000, energyCost: 95, levelReq: 14, ageReq: 270,
        description: 'Yêu cầu: Tuổi 270. Nơi tận cùng thế giới.',
        rewards: [
            { key: 'dat_set_song_hong', weight: 45 },
            { key: 'tinh_chat_tre_nga', weight: 45 },
            { key: 'ngoi_sao_hy_vong', weight: 10 }
        ]
    }
};
const SHOP_ITEMS = {
    'ngo_thuong': { name: 'Ngô Thường', type: 'food', price: 20, hunger: -30, happiness: 5, description: 'Món ăn cơ bản, phục hồi 30 No bụng và tăng 5 Vui vẻ.', satietyDuration: 0 },
    'sau_map': { name: 'Sâu Mập', type: 'food', price: 50, hunger: -50, happiness: 15, description: 'Món khoái khẩu! Phục hồi 50 No bụng, tăng 15 Vui vẻ và giúp no lâu hơn.', satietyDuration: 60 },
    'vitamin': { name: 'Vitamin Tổng Hợp', type: 'food', price: 150, hunger: -15, happiness: 40, description: 'Bổ sung Vitamin tăng Vui vẻ (+40) và giảm nhẹ cơn đói (-15).', satietyDuration: 120 },
    'trai_cay_vang': { name: 'Trái Cây Vàng', type: 'food', price: 300, hunger: -40, happiness: 60, description: 'Loại quả thần kỳ mang lại niềm Vui vẻ tột độ (+60) và phục hồi 40 No bụng.', satietyDuration: 15 },
    'ga_ran': { name: 'Gà Rán Giòn Tan', type: 'food', price: 350, hunger: -80, happiness: 25, description: 'Một bữa ăn thịnh soạn. Phục hồi đến 80 No bụng, tăng 25 Vui vẻ và no lâu.', satietyDuration: 300 },
    'thach_nang_luong_sieu_cap': { name: 'Thạch Năng Lượng Siêu Cấp', type: 'food', price: 750, description: 'Phục hồi 75% Năng lượng đã mất ngay lập tức.', satietyDuration: 10, energyPercent: 0.75 },
    'keo_gung_may_man': { name: 'Kẹo Gừng May Mắn', type: 'food', price: 900, hunger: -5, happiness: 10, description: 'Một chút ngọt ngào. Tăng 50% Xu nhận được trong 1 giờ tới.', buff: { type: 'coinBoost', multiplier: 1.5, duration: 3600000 } },
    'tinh_chat_hoi_phuc': { name: 'Tinh Chất Hồi Phục', type: 'food', price: 950, description: 'Phục hồi 50% các thanh chỉ số No bụng, Vui vẻ và Sạch sẽ đã mất.', satietyDuration: 10, restorePercent: 0.5 },
    'nuoc_suoi_tinh_lang': { name: 'Nước Suối Tĩnh Lặng', type: 'food', price: 1800, hunger: 0, happiness: 5, description: 'Thanh lọc cơ thể. Giảm 30% tốc độ suy giảm chỉ số trong 2 giờ.', buff: { type: 'decayReducer', multiplier: 0.7, duration: 7200000 } },
    'sieu_pham_ga_tien': { name: 'Siêu Phẩm Gà Tiên', type: 'food', price: 2500, description: 'Tinh hoa ẩm thực, phục hồi 80 điểm cho tất cả chỉ số.', satietyDuration: 1200, multiRestore: { hunger: -80, happiness: 80, cleanliness: 80, energy: 80 } },
    'chen_an_vui_ve': { name: 'Chén Ăn Vui Vẻ', type: 'tool', slot: 'feed', price: 600, description: 'Nâng cấp "Cho Ăn": Tăng thêm No bụng và Vui vẻ.' },
    'bo_chen_dua_tinh_xao': { name: 'Bộ Chén Đũa Tinh Xảo', type: 'tool', slot: 'feed', price: 1500, description: 'Nâng cấp "Cho Ăn": Giúp ăn ngon miệng hơn, hồi nhiều No bụng và Vui vẻ hơn.' },
    'bi_kip_nau_nuong': { name: 'Bí Kíp Nấu Nướng Thượng Hạng', type: 'tool', slot: 'feed', price: 3200, description: 'Nâng cấp "Cho Ăn": Biến thức ăn đơn giản trở nên siêu ngon và 25% cơ hội tạo ra "Món Phụ Bất Ngờ" nhận thêm Xu.' },
    'bong_do_choi': { name: 'Bóng Đồ Chơi', type: 'tool', slot: 'play', price: 750, description: 'Hành động "Chơi" hiệu quả hơn.' },
    'xa_bong_thom': { name: 'Xà Bông Thơm', type: 'tool', slot: 'clean', price: 750, description: 'Hành động "Tắm" hiệu quả hơn.' },
    'sach_tri_tue': { name: 'Sách Trí Tuệ', type: 'tool', slot: 'play', price: 2800, description: 'Nâng cấp "Chơi": Tăng thêm Vui vẻ và nhân 2.5 lần Xu.' },
    'voi_hoa_sen_vang': { name: 'Vòi Hoa Sen Vàng', type: 'tool', slot: 'clean', price: 3200, description: 'Nâng cấp "Tắm" cao cấp. Hồi Năng lượng theo cấp tiến hóa và có cơ hội giúp thư giãn, làm chậm suy giảm chỉ số trong 5 phút.' },
    'mu_rom': { name: 'Mũ Rơm', type: 'accessory', slot: 'hat', price: 350, description: 'Phong cách nhà nông.', image: '/images/accessories/hat-straw.png' },
    'mu_cao_boi': { name: 'Mũ Cao Bồi', type: 'accessory', slot: 'hat', price: 500, description: 'Chất lừ!', image: '/images/accessories/hat-cowboy.png' },
    'mu_thuong_luu': { name: 'Mũ Luxury', type: 'accessory', slot: 'hat', price: 1200, description: 'Có tiền!', image: '/images/accessories/hat-luxury.png' },
    'nen_bien': { name: 'Nền Bãi Biển', type: 'background', price: 1500, description: 'Không gian bãi biển.', image: '/images/accessories/bg-beach.png' },
    'nen_suoi': { name: 'Nền Con Suối', type: 'background', price: 1500, description: 'Không gian trong lành.', image: '/images/accessories/bg-river.png' },
    'nen_hang_dong': { name: 'Nền Hang Động', type: 'background', price: 2500, description: 'Bí ẩn và tĩnh lặng.', image: '/images/accessories/bg-cave.png' },
    'nen_rung': { name: 'Nền Khu Rừng', type: 'background', price: 2500, description: 'Khám phá thế giới hoang dã.', image: '/images/accessories/bg-forest.png' },
    'nen_vu_tru': { name: 'Nền Vũ Trụ', type: 'background', price: 5000, description: 'Ngắm nhìn các vì sao.', image: '/images/accessories/bg-cosmos.png' },
    'vuong_mien_thien_than': { name: 'Vương Miện Thiên Thần', type: 'accessory', slot: 'hat', price: 7500, description: 'Biểu tượng của sự thuần khiết.', image: '/images/accessories/crown-angel.png' },
    'long_ga_vang': { name: 'Lông Gà Vàng', type: 'material', description: 'Một chiếc lông vũ hiếm, lấp lánh.' },
    'vo_so_lap_lanh': { name: 'Vỏ Sò Lấp Lánh', type: 'material', description: 'Chiếc vỏ sò tuyệt đẹp từ biển cả.' },
    'hat_giong_than': { name: 'Hạt Giống Thần', type: 'material', description: 'Loại hạt cây chứa đầy năng lượng.' },
    'tinh_the_bang': { name: 'Tinh Thể Băng', type: 'material', description: 'Một viên pha lê lạnh giá.' },
    'dat_set_song_hong': { name: 'Đất Sét Sông Hồng', type: 'material', description: 'Loại đất sét đỏ phù sa, biểu tượng của sự sống.' },
    'tinh_chat_tre_nga': { name: 'Tinh Chất Tre Ngà', type: 'material', description: 'Kết tinh từ những cây tre kiên cường nhất.' },
    'ngoi_sao_hy_vong': { name: 'Ngôi Sao Hy Vọng', type: 'material', description: 'Vật phẩm cực hiếm, chỉ dành cho người kiên trì.' },
    'reu_co_thu': { name: 'Rêu Cổ Thụ', type: 'material', description: 'Loài rêu phát sáng trong bóng tối.' },
    'da_dung_nham': { name: 'Đá Dung Nham', type: 'material', description: 'Viên đá vẫn còn âm ỉ hơi nóng.' },
    'mu_coi': { name: 'Mũ Cối Việt Nam (God)', type: 'accessory', slot: 'hat', description: 'Sức mạnh vô song, quyền năng bất tận, thống lĩnh thiên hạ.', image: '/images/accessories/tu-hao-viet-nam.png' },
    'mu_vua': { name: 'Mũ Vua (Legendary)', type: 'accessory', slot: 'hat', description: 'Chế tạo từ nguyên liệu hiếm.', image: '/images/accessories/hat-king.png' },
    'non_la': { name: 'Nón Lá (Legendary)', type: 'accessory', slot: 'hat', description: 'Ra chợ đi thấy liền!', image: '/images/accessories/non-la.png' },
    'vuong_mien_bang': { name: 'Vương Miện Băng (Legendary)', type: 'accessory', slot: 'hat', description: 'Quyền năng của giá lạnh.', image: '/images/accessories/crown-ice.png' },
    'vong_hoa_reu': { name: 'Vòng Hoa Rêu Sáng (Legendary)', type: 'accessory', slot: 'hat', description: 'Chế tạo từ Rêu Cổ Thụ.', image: '/images/accessories/wreath-moss.png' },
    'mu_nham_thach': { name: 'Mũ Nham Thạch (Legendary)', type: 'accessory', slot: 'hat', description: 'Sức nóng của núi lửa.', image: '/images/accessories/helmet-magma.png' },
};
const CRAFTING_RECIPES = {
    'non_la': {
        name: 'Nón Lá',
        materials: { 'tinh_chat_tre_nga': 5, 'hat_giong_than': 15 }
    },
    'vong_hoa_reu': {
        name: 'Vòng Hoa Rêu Sáng',
        materials: { 'reu_co_thu': 20, 'vo_so_lap_lanh': 10 }
    },
    'mu_nham_thach': {
        name: 'Mũ Nham Thạch',
        materials: { 'da_dung_nham': 15, 'tinh_the_bang': 10 }
    },
    'mu_vua': {
        name: 'Mũ Vua (Legendary)',
        materials: { 'long_ga_vang': 25, 'vo_so_lap_lanh': 20 }
    },
    'vuong_mien_bang': {
        name: 'Vương Miện Băng (Legendary)',
        materials: { 'tinh_the_bang': 20, 'vo_so_lap_lanh': 15, 'ngoi_sao_hy_vong': 1 }
    },
    'mu_coi': {
        name: 'Mũ Cối Việt Nam (God)',
        materials: { 'dat_set_song_hong': 30, 'tinh_chat_tre_nga': 30, 'ngoi_sao_hy_vong': 3 }
    }
};

// =================================
// CÁC HÀM PHỤ TRỢ (HELPER FUNCTIONS)
// =================================
const getCurrentLevel = () => {
    if (pet.stage.startsWith(CONSTANTS.LEVEL_PREFIX)) {
        return parseInt(pet.stage.replace(CONSTANTS.LEVEL_PREFIX, ''), 10);
    }
    return 0;
};

const updateInventory = (itemKey, quantity) => {
    if (!pet.inventory[itemKey]) {
        pet.inventory[itemKey] = 0;
    }
    pet.inventory[itemKey] += quantity;
    if (pet.inventory[itemKey] <= 0) {
        delete pet.inventory[itemKey];
    }
};

async function loadSoundToBuffer(url) {
    if (!audioContext) return null;
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
    } catch (error) {
        console.error(`Lỗi tải file âm thanh ${url}:`, error);
        return null;
    }
}

function playSfxFromBuffer(key, loop = false) {
    if (sfxBuffers[key] && audioContext) {
        clearTimeout(duckingTimeout);
        bgMusicGainNode.gain.linearRampToValueAtTime(BG_MUSIC_DUCKED_VOLUME, audioContext.currentTime + 0.5);

        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = sfxBuffers[key];
        sourceNode.loop = loop;
        sourceNode.connect(masterGainNode);
        sourceNode.start(0);

        if (!loop) {
            duckingTimeout = setTimeout(() => {
                bgMusicGainNode.gain.linearRampToValueAtTime(BG_MUSIC_NORMAL_VOLUME, audioContext.currentTime + 0.5);
            }, 2000);
        }
        return sourceNode;
    }
    return null;
}

function playSound(key) {
    if (sfxBuffers[key] && audioContext) {
        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = sfxBuffers[key];
        sourceNode.connect(masterGainNode);
        sourceNode.start(0);
    }
}

const playStart = (audio) => {
    audio.currentTime = 0;
    audio.play().catch(e => console.error("Audio play failed:", e));
};

async function setupBgMusicWithWebAudio() {
    if (audioContext) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    masterGainNode = audioContext.createGain();
    masterGainNode.connect(audioContext.destination);

    bgMusicGainNode = audioContext.createGain();
    bgMusicGainNode.connect(masterGainNode);

    bgMusicSource = audioContext.createMediaElementSource(bgMusic);
    bgMusicSource.connect(bgMusicGainNode);

    bgMusicGainNode.gain.value = BG_MUSIC_NORMAL_VOLUME;
    masterGainNode.gain.value = isMuted ? 0 : 1;

    const sfxToLoad = {
        sad: '/audio/sad.mp3',
        wake: '/audio/wake.mp3',
        sleep: '/audio/sleep.mp3',
        heal: '/audio/healing.mp3',
        click: '/audio/click.mp3',
        eat: '/audio/eat.mp3',
        clean: '/audio/clean.mp3',
        pay: '/audio/pay.mp3'
    };
    for (const key in sfxToLoad) {
        sfxBuffers[key] = await loadSoundToBuffer(sfxToLoad[key]);
    }
}

function applyMuteState() {
    muteIcon.className = isMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    localStorage.setItem('isGameMuted', isMuted);

    if (masterGainNode) {
        masterGainNode.gain.value = isMuted ? 0 : 1;
    }
}

function toggleMute() {
    isMuted = !isMuted;
    applyMuteState();
}

// =================================
// CÁC HÀM QUẢN LÝ DỮ LIỆU
// =================================
function savePet() {
    localStorage.setItem('virtualPet', JSON.stringify(pet));
}

function loadPet() {
    const defaultPet = {
        hunger: 50, happiness: 50, cleanliness: 70, age: 0,
        stage: CONSTANTS.STAGE_EGG, ageTicks: 0, sadTicks: 0, isSick: false,
        coins: 100,
        accessories: { hat: null },
        background: CONSTANTS.DEFAULT_BG,
        inventory: {},
        satietyBonus: 0, energy: 100, isSleeping: false,
        isExploring: false, explorationData: null,
        lastUpdateTime: null,
        sickTimestamp: null
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

// =================================
// LOGIC OFFLINE
// =================================
function applyAbandonmentPenalty() {
    Swal.fire({
        title: 'Pet đã quay trở về!',
        text: 'Vì bị bỏ rơi quá lâu, pet của bạn đã rất buồn và bỏ đi. May mắn thay, nó đã quyết định quay trở lại nhưng bị suy yếu và hạ 3 cấp tiến hóa.',
        icon: 'warning',
        allowOutsideClick: false,
        confirmButtonText: 'OK'
    }).then(() => {
        const currentLv = getCurrentLevel();
        const newLv = Math.max(1, currentLv - 3);

        pet.stage = `lv${newLv}`;

        pet.hunger = 50;
        pet.happiness = 50;
        pet.cleanliness = 70;
        pet.energy = 100;

        pet.isSick = false;
        pet.sickTimestamp = null;
        pet.sadTicks = 0;

        updateDisplay();
        savePet();

        Swal.fire('Đã hồi phục!', `Pet của bạn đã trở về cấp tiến hóa ${newLv}. Hãy chăm sóc nó tốt hơn nhé!`, 'success');
    });
}

function calculateOfflineProgression() {
    if (!pet.lastUpdateTime) {
        return;
    }

    const now = Date.now();
    const offlineTime = now - pet.lastUpdateTime;
    const ticksMissed = Math.floor(offlineTime / gameTickInterval);

    if (ticksMissed <= 0) {
        return;
    }

    if (pet.isSleeping) {
        const currentLv = Math.max(1, getCurrentLevel());
        const energyPerTick = Math.max(0.2, 1.0 - ((currentLv - 1) * 0.048));

        const energyNeeded = CONSTANTS.MAX_STAT - pet.energy;
        const ticksToFullEnergy = Math.ceil(energyNeeded / energyPerTick);

        if (ticksMissed <= ticksToFullEnergy) {
            pet.energy += ticksMissed * energyPerTick;
        }
        else {
            pet.energy = CONSTANTS.MAX_STAT;
            pet.isSleeping = false;
        }
    }

    if (pet.isExploring && now >= pet.explorationData.endTime) {
        finishExploration(true);
    }

    const threeDays = 72 * 60 * 60 * 1000;
    if (offlineTime > threeDays && pet.stage !== CONSTANTS.STAGE_EGG) {
        applyAbandonmentPenalty();
    }
}

// =================================
// LOGIC GAME OVER
// =================================
function checkGameOver() {
    if (pet.isSick && pet.sickTimestamp) {
        const sickDuration = Date.now() - pet.sickTimestamp;
        const gameOverTimer = 72 * 60 * 60 * 1000;

        if (sickDuration > gameOverTimer) {
            applyAbandonmentPenalty();
            return true;
        }
    }
    return false;
}

// =================================
// CÁC HÀM HÀNH ĐỘNG
// =================================
function handleAction(actionType) {
    if (isAnimating || pet.isSick || pet.isSleeping || pet.isExploring) return;

    if (pet.energy <= 0) {
        Swal.fire({
            title: 'Pet đã kiệt sức!',
            text: 'Hãy cho pet ngủ để hồi phục năng lượng nhé.',
            icon: 'info'
        });
        return; // Dừng hàm ngay tại đây, không cho thực hiện hành động
    }

    isAnimating = true;

    let animSrc = '';
    switch (actionType) {
        case 'feed_free':
            playSound('eat');

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
                    coinsGainFeed += 25;
                    Swal.fire({ title: 'Món Phụ Bất Ngờ!', text: `Bạn đã nhận thêm ${bonusCoins} Xu từ tài nấu nướng của mình!`, icon: 'info', timer: 2000, showConfirmButton: false });
                }
            }
            pet.hunger = Math.max(CONSTANTS.MIN_STAT, pet.hunger - hungerRestore);
            pet.happiness = Math.min(CONSTANTS.MAX_STAT, pet.happiness + happinessGainFeed);
            pet.coins += coinsGainFeed;
            animSrc = '/images/eating.png';
            break;
        case 'play':
            playSound('click');
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
            pet.happiness = Math.min(CONSTANTS.MAX_STAT, pet.happiness + happinessGain);
            pet.hunger = Math.min(CONSTANTS.MAX_STAT, pet.hunger + 5);
            pet.coins += Math.floor(coinsGainPlay);
            animSrc = '/images/playing.png';
            break;
        case 'clean':
            playSound('clean');
            let cleanlinessGain = 20;
            let coinsGainClean = 5;
            if (pet.inventory['xa_bong_thom']) {
                cleanlinessGain += 10;
                coinsGainClean += 5;
            }

            if (pet.inventory['voi_hoa_sen_vang']) {
                cleanlinessGain += 10;
                pet.energy = Math.min(CONSTANTS.MAX_STAT, pet.energy + getCurrentLevel());

                if (Math.random() < 0.10) {
                    if (!pet.activeBuffs) pet.activeBuffs = {};
                    pet.activeBuffs['decayReducer'] = {
                        multiplier: 0.8,
                        endTime: Date.now() + 300000
                    };
                    Swal.fire({ title: 'Thư Giãn!', text: 'Tắm rửa sạch sẽ giúp pet cảm thấy thư thái và ít bị đói hơn trong 5 phút tới!', icon: 'info', timer: 3000, showConfirmButton: false });
                }
            }

            pet.cleanliness = Math.min(CONSTANTS.MAX_STAT, pet.cleanliness + cleanlinessGain);
            pet.happiness = Math.min(CONSTANTS.MAX_STAT, pet.happiness + 2);
            pet.coins += coinsGainClean;
            animSrc = '/images/clean.png';
            break;
    }
    pet.energy = Math.max(0, pet.energy - 1);
    petImage.src = animSrc;
    setTimeout(() => {
        isAnimating = false;
        updateDisplay();
        savePet();
    }, 800);
}

function toggleSleep() {
    if (pet.isSick || pet.isExploring) return;
    playSound('click');

    if (pet.isSleeping) {
        pet.isSleeping = false;
        playSfxFromBuffer('wake');
        Swal.fire({ text: 'Thức dậy nào!', timer: 1000, showConfirmButton: false });
    } else {
        if (pet.energy < 30) {
            pet.isSleeping = true;
            playSfxFromBuffer('sleep');
            Swal.fire({ text: 'Chúc ngủ ngon...Zzz', timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire({ title: 'Chưa buồn ngủ!', text: 'Pet vẫn còn đầy năng lượng.', icon: 'info', confirmButtonText: 'OK' });
        }
    }
    updateDisplay();
}

function cure() {
    const currentLv = getCurrentLevel();
    const cureCost = 50 + (currentLv * 25);

    if (pet.isSick) {
        if (pet.coins >= cureCost) {
            playSfxFromBuffer('heal');
            pet.coins -= cureCost;
            pet.isSick = false;
            pet.sickTimestamp = null;
            pet.sadTicks = 0;
            pet.hunger = 50; pet.happiness = 50; pet.cleanliness = 70;
            Swal.fire({ title: 'Thành công!', text: `Bạn đã dùng ${cureCost} Xu để chữa bệnh!`, icon: 'success' });
            updateDisplay();
        } else {
            Swal.fire({ title: 'Không đủ tiền', text: `Bạn cần ${cureCost} Xu để chữa bệnh!`, icon: 'error' });
        }
    }
}

function buyItem(itemKey) {
    const item = SHOP_ITEMS[itemKey];
    if (!item) return;

    if (item.type === CONSTANTS.TYPE_FOOD && (pet.isSick || pet.isSleeping || pet.isExploring)) {
        return Swal.fire('Không thể mua', 'Không thể mua thức ăn khi pet ốm, ngủ, hoặc đang thám hiểm!', 'warning');
    }
    if (item.type !== CONSTANTS.TYPE_FOOD && pet.inventory[itemKey]) {
        return Swal.fire('Thông báo', 'Bạn đã sở hữu vật phẩm này!', 'info');
    }

    if (pet.coins >= item.price) {
        playSound('pay');
        pet.coins -= item.price;
        let notificationMessage = { title: 'Mua thành công!', text: `Đã mua ${item.name}!`, icon: 'success', timer: 1500, showConfirmButton: false };

        if (item.type === CONSTANTS.TYPE_FOOD) {
            if (item.hunger !== undefined) pet.hunger = Math.max(CONSTANTS.MIN_STAT, pet.hunger + item.hunger);
            if (item.happiness !== undefined) pet.happiness = Math.min(CONSTANTS.MAX_STAT, pet.happiness + item.happiness);
            if (item.satietyDuration !== undefined) pet.satietyBonus += item.satietyDuration;
            if (item.energyPercent) {
                const energyToRestore = (CONSTANTS.MAX_STAT - pet.energy) * item.energyPercent;
                pet.energy = Math.min(CONSTANTS.MAX_STAT, pet.energy + energyToRestore);
            }
            if (item.multiRestore) {
                pet.hunger = Math.max(CONSTANTS.MIN_STAT, pet.hunger + item.multiRestore.hunger);
                pet.happiness = Math.min(CONSTANTS.MAX_STAT, pet.happiness + item.multiRestore.happiness);
                pet.cleanliness = Math.min(CONSTANTS.MAX_STAT, pet.cleanliness + item.multiRestore.cleanliness);
                pet.energy = Math.min(CONSTANTS.MAX_STAT, pet.energy + item.multiRestore.energy); // Sửa lỗi nhỏ: Gà tiên cũng phải hồi energy
            }

            if (item.restorePercent) {
                const hungerToRestore = pet.hunger * item.restorePercent;
                const happinessToRestore = (CONSTANTS.MAX_STAT - pet.happiness) * item.restorePercent;
                const cleanlinessToRestore = (CONSTANTS.MAX_STAT - pet.cleanliness) * item.restorePercent;

                pet.hunger = Math.max(CONSTANTS.MIN_STAT, pet.hunger - hungerToRestore);
                pet.happiness = Math.min(CONSTANTS.MAX_STAT, pet.happiness + happinessToRestore);
                pet.cleanliness = Math.min(CONSTANTS.MAX_STAT, pet.cleanliness + cleanlinessToRestore);

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
            renderInventory();
        }
        Swal.fire(notificationMessage);
        updateDisplay();
        shopModal.classList.add('hidden');
    } else {
        Swal.fire('Thất bại', 'Không đủ tiền!', 'error');
    }
}

function craftItem(recipeKey) {
    const now = Date.now();
    if (now - lastInteractionTime < 500) return;
    lastInteractionTime = now;

    const recipe = CRAFTING_RECIPES[recipeKey];
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
    playSound('pay');
    Swal.fire({ title: 'Chế tạo thành công!', text: `Bạn đã tạo ra ${SHOP_ITEMS[recipeKey].name}!`, icon: 'success' });
    renderInventory();
}

function equipItem(itemKey) {
    const now = Date.now();
    if (now - lastInteractionTime < 500) return;
    lastInteractionTime = now;
    playSound('click');

    if (itemKey === 'null') {
        pet.accessories.hat = null;
    } else if (itemKey === CONSTANTS.DEFAULT_BG) {
        pet.background = CONSTANTS.DEFAULT_BG;
    } else {
        const item = SHOP_ITEMS[itemKey];
        if (item.type === CONSTANTS.TYPE_ACCESSORY) {
            pet.accessories[item.slot] = itemKey;
        } else if (item.type === CONSTANTS.TYPE_BACKGROUND) {
            pet.background = itemKey;
        }
    }
    updateDisplay();
    inventoryModal.classList.add('hidden');
}

// =================================
// LOGIC THÁM HIỂM
// =================================
function startExploration(locationKey) {
    playSound('click');

    const loc = EXPLORE_LOCATIONS[locationKey];
    const currentLv = getCurrentLevel();

    const cantExplore = (title, text) => Swal.fire({ title, text, icon: 'warning' });

    if (pet.stage === CONSTANTS.STAGE_EGG) return cantExplore('Không thể đi!', 'Trứng không thể tự mình đi thám hiểm được!');
    if (pet.stage === CONSTANTS.STAGE_BABY) return cantExplore('Không thể đi!', 'Pet còn quá nhỏ để đi thám hiểm một mình!');
    if (pet.isSick || pet.isSleeping || pet.isExploring) return cantExplore('Không thể đi', 'Không thể gửi thám hiểm khi pet ốm, ngủ, hoặc đang thám hiểm!');
    if (currentLv < loc.levelReq) return Swal.fire({ title: 'Chưa đủ cấp độ!', text: `Bạn cần pet đạt Level ${loc.levelReq} để vào khu vực này.`, icon: 'error' });
    if (pet.age < loc.ageReq) return Swal.fire({ title: 'Pet chưa đủ tuổi!', text: `Pet của bạn cần đạt Tuổi ${loc.ageReq} để khám phá vùng đất này.`, icon: 'error' });

    if (pet.energy >= loc.energyCost) {
        if (sadAudioSourceNode) {
            sadAudioSourceNode.stop(0);
            sadAudioSourceNode = null;
        }
        pet.energy -= loc.energyCost;
        pet.isExploring = true;
        pet.explorationData = { locationKey, endTime: Date.now() + loc.duration };
        Swal.fire({ title: 'Bắt đầu Thám hiểm!', text: `Pet sẽ trở về sau ${loc.duration / 60000} phút.`, icon: 'success', timer: 2000, showConfirmButton: false });
        updateDisplay();
        exploreModal.classList.add('hidden');
    } else {
        Swal.fire('Không đủ Năng lượng!', 'Hãy cho pet ngủ để hồi phục.', 'warning');
    }
}

function finishExploration(isOffline = false) {
    const loc = EXPLORE_LOCATIONS[pet.explorationData.locationKey];
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

    const rewardItem = SHOP_ITEMS[rewardKey];
    updateInventory(rewardKey, 1);

    pet.isExploring = false;
    pet.explorationData = null;

    if (!isOffline) {
        renderInventory();
        Swal.fire('Thám hiểm Hoàn tất!', `Pet của bạn đã trở về và tìm thấy: ${rewardItem.name}!`, 'success');
        updateDisplay();
    }
}

// =================================
// LOGIC CHUNG CỦA GAME
// =================================
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

    if (pet.stage === CONSTANTS.STAGE_EGG && pet.age >= 1) {
        pet.stage = CONSTANTS.STAGE_BABY;
        renderExploreLocations();
    } else if (pet.stage === CONSTANTS.STAGE_BABY && pet.age >= 10 && isWellCaredFor) {
        pet.stage = 'lv1';
        pet.coins += 100;
        renderExploreLocations();
    } else if (pet.stage.startsWith(CONSTANTS.LEVEL_PREFIX)) {
        if (currentLv < 15 && pet.age >= (10 + currentLv * 20) && isWellCaredFor) {
            const newLv = currentLv + 1;
            pet.stage = `lv${newLv}`;
            pet.coins += 100 * newLv;
            renderExploreLocations();
            if (newLv === 15) {
                updateInventory('ngoi_sao_hy_vong', 1);
                Swal.fire({ title: 'Đạt đến Giới hạn!', text: 'Pet đã đạt cấp tiến hóa tối đa và nhận được Ngôi Sao Hy Vọng!', icon: 'success' });
            }
        }
    }
}

// =================================
// CẬP NHẬT GIAO DIỆN
// =================================
function updateDisplay() {
    if (isAnimating) return;

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

    if (pet.isExploring) {
        const timeLeft = Math.max(0, pet.explorationData.endTime - Date.now());
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        newImageSrc = '/images/exploring.png';
        statusText.textContent = `Thám hiểm... ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        [feedButton, playButton, cleanButton, sleepButton, cureButton].forEach(btn => btn.disabled = true);
    } else if (pet.isSick) {
        newImageSrc = '/images/sick.png';
        statusText.textContent = 'Bị ốm rồi!';
        cureButton.style.display = 'inline-block';
        [feedButton, playButton, cleanButton, sleepButton].forEach(btn => btn.style.display = 'none');
    } else if (pet.isSleeping) {
        newImageSrc = '/images/sleeping.png';
        statusText.textContent = 'Đang ngủ...Zzz';
        [feedButton, playButton, cleanButton].forEach(btn => btn.disabled = true);
        if (sadAudioSourceNode) {
            sadAudioSourceNode.stop(0);
            sadAudioSourceNode = null;
        }
    } else if (pet.stage === CONSTANTS.STAGE_EGG) {
        newImageSrc = '/images/egg.png';
        sleepButton.style.display = 'none';
    } else if (pet.hunger > 80 || pet.happiness < 20 || pet.cleanliness < 20 || pet.energy < 10) {
        newImageSrc = '/images/sad.png';

        if (sfxBuffers['sad'] && !sadAudioSourceNode) {
            sadAudioSourceNode = playSfxFromBuffer('sad', true);
        }
    } else {
        if (sadAudioSourceNode) {
            sadAudioSourceNode.stop(0);
            sadAudioSourceNode = null;
        }
        newImageSrc = pet.stage.startsWith(CONSTANTS.LEVEL_PREFIX) ? `/images/levels/${pet.stage}.png` : `/images/${pet.stage}.png`;
    }

    if (!petImage.src.endsWith(newImageSrc)) {
        petImage.src = newImageSrc;
    }
}

function renderShop() {
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

function renderExploreLocations() {
    let locationsHtml = '';
    const currentLv = getCurrentLevel();

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

function renderInventory() {
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

// =================================
// PRELOADER LOGIC
// =================================
window.onload = function () {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('preloader-hidden');
    }
};

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);

    const deltaTime = currentTime - lastUpdateTime;

    if (deltaTime > gameTickInterval) {
        lastUpdateTime = currentTime - (deltaTime % gameTickInterval);
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
            const isGameOver = checkGameOver();
            if (isGameOver) {
                return;
            }

            updateDisplay();
            savePet();
            return;
        }

        if (pet.isSleeping) {
            const currentLv = Math.max(1, getCurrentLevel());
            const energyPerTick = Math.max(0.2, 1.0 - ((currentLv - 1) * 0.048));
            pet.energy = Math.min(CONSTANTS.MAX_STAT, pet.energy + energyPerTick);

            if (pet.energy >= CONSTANTS.MAX_STAT) {
                pet.isSleeping = false;
                playSfxFromBuffer('wake');
            }
        } else if (!pet.isExploring) {
            pet.energy = Math.max(CONSTANTS.MIN_STAT, pet.energy - (0.5));

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

            pet.hunger = Math.min(CONSTANTS.MAX_STAT, pet.hunger + hungerIncrease);
            pet.happiness = Math.max(CONSTANTS.MIN_STAT, pet.happiness - finalDecayRate);
            pet.cleanliness = Math.max(CONSTANTS.MIN_STAT, pet.cleanliness - finalDecayRate);

            const isSad = pet.hunger > 80 || pet.happiness < 20 || pet.cleanliness < 20 || pet.energy < 10;
            if (isSad && pet.stage !== CONSTANTS.STAGE_EGG) {
                pet.sadTicks++;
            } else {
                pet.sadTicks = 0;
            }
            if (pet.sadTicks >= SAD_TICKS_TO_GET_SICK) {
                pet.isSick = true;
                pet.sickTimestamp = Date.now();
                if (!sadAudio.paused) sadAudio.pause();
            }
            checkEvolution();
        }

        updateDisplay();
        savePet();
    }
}

function startGame() {
    splashScreen.classList.add('hidden');
    gameWrapper.classList.remove('hidden');

    if (bgMusic && bgMusic.paused) {
        bgMusic.muted = false;
        bgMusic.play().catch(e => console.error("Lỗi phát nhạc:", e));
    }

    requestAnimationFrame(gameLoop);

    preloadImages();
}

// =================================
// KHỞI TẠO GAME
// =================================
function init() {
    loadPet();

    renderShop();
    renderInventory();
    renderExploreLocations();

    isMuted = localStorage.getItem('isGameMuted') === 'true';
    applyMuteState();

    const addSmartEventListener = (element, callback) => {
        let touchStarted = false;

        const onPress = (e) => {
            if (e.cancelable) {
                e.preventDefault();
            }
            element.classList.add('button-active');
            touchStarted = e.type === 'touchstart';
        };

        const onRelease = (e) => {
            if (e.cancelable) {
                e.preventDefault();
            }
            element.classList.remove('button-active');
            if (!touchStarted || e.type === 'touchend') {
                callback(e);
            }
        };

        const onCancel = () => {
            element.classList.remove('button-active');
        };

        element.addEventListener('mousedown', onPress);
        element.addEventListener('touchstart', onPress, { passive: false });

        element.addEventListener('mouseup', onRelease);
        element.addEventListener('touchend', onRelease);

        element.addEventListener('mouseleave', onCancel);
    };

    startGameButton.addEventListener('click', () => {
        playStart(startAudio);
        setupBgMusicWithWebAudio();
        startGame();
    });
    addSmartEventListener(muteButton, toggleMute);
    addSmartEventListener(feedButton, () => handleAction('feed_free'));
    addSmartEventListener(playButton, () => handleAction('play'));
    addSmartEventListener(cleanButton, () => handleAction('clean'));
    addSmartEventListener(cureButton, cure);
    addSmartEventListener(sleepButton, toggleSleep);

    addSmartEventListener(openShopButton, () => { playSound('click'); shopModal.classList.remove('hidden'); });
    addSmartEventListener(closeShopButton, () => { playSound('click'); shopModal.classList.add('hidden'); });

    addSmartEventListener(openInventoryButton, () => {
        playSound('click');
        inventoryModal.classList.remove('hidden');
    });
    addSmartEventListener(closeInventoryButton, () => { playSound('click'); inventoryModal.classList.add('hidden'); });

    addSmartEventListener(exploreButton, () => { playSound('click'); exploreModal.classList.remove('hidden'); });
    addSmartEventListener(closeExploreButton, () => { playSound('click'); exploreModal.classList.add('hidden'); });

    addSmartEventListener(infoButton, () => {
        playSound('click');
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
                playSound('click');
                modal.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                modal.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                tabButton.classList.add('active');
                getEl(tabButton.dataset.tab).classList.add('active');
            }
        });
    };
    setupTabListeners(shopTabs, shopModal);
    setupTabListeners(inventoryTabs, inventoryModal);

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
    [shopFoodList, shopDecorList, shopToolList, inventoryHatList, inventoryBgList, craftingRecipeList, exploreLocationList].forEach(setupListListeners);

    updateDisplay();
}

// Bắt đầu game!
init();