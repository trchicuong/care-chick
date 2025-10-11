export const CONSTANTS = {
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

export const BG_MUSIC_NORMAL_VOLUME = 0.1;
export const BG_MUSIC_DUCKED_VOLUME = 0.01;
export const gameTickInterval = 3000;
export const SAD_TICKS_TO_GET_SICK = 100;

export const EVOLUTION_STAGES = [
    { from: CONSTANTS.STAGE_EGG, to: CONSTANTS.STAGE_BABY, requiredAge: 1 },
    { from: CONSTANTS.STAGE_BABY, to: 'lv1', requiredAge: 10, coins: 100 },
    { from: 'lv1', to: 'lv2', requiredAge: 30, coins: 200 },
    { from: 'lv2', to: 'lv3', requiredAge: 50, coins: 300 },
    { from: 'lv3', to: 'lv4', requiredAge: 70, coins: 400 },
    { from: 'lv4', to: 'lv5', requiredAge: 90, coins: 500 },
    { from: 'lv5', to: 'lv6', requiredAge: 110, coins: 600 },
    { from: 'lv6', to: 'lv7', requiredAge: 130, coins: 700 },
    { from: 'lv7', to: 'lv8', requiredAge: 150, coins: 800 },
    { from: 'lv8', to: 'lv9', requiredAge: 170, coins: 900 },
    { from: 'lv9', to: 'lv10', requiredAge: 190, coins: 1000 },
    { from: 'lv10', to: 'lv11', requiredAge: 210, coins: 1100 },
    { from: 'lv11', to: 'lv12', requiredAge: 230, coins: 1200 },
    { from: 'lv12', to: 'lv13', requiredAge: 250, coins: 1300 },
    { from: 'lv13', to: 'lv14', requiredAge: 270, coins: 1400 },
    { from: 'lv14', to: 'lv15', requiredAge: 290, coins: 1500, specialReward: { 'ngoi_sao_hy_vong': 1 } },
];

export const EXPLORE_LOCATIONS = {
    'khu_rung': { name: 'Khu Rừng Gần Nhà', duration: 300000, energyCost: 20, levelReq: 1, ageReq: 10, description: 'Yêu cầu: Tuổi 10. Tìm kiếm những thứ cơ bản.', rewards: [{ key: 'sau_map', weight: 60 }, { key: 'hat_giong_than', weight: 35 }, { key: 'long_ga_vang', weight: 5 }] },
    'bai_bien': { name: 'Bãi Biển Đầy Nắng', duration: 900000, energyCost: 40, levelReq: 3, ageReq: 50, description: 'Yêu cầu: Tuổi 50. Tìm vài thứ lấp lánh dưới cát.', rewards: [{ key: 'vo_so_lap_lanh', weight: 60 }, { key: 'hat_giong_than', weight: 30 }, { key: 'long_ga_vang', weight: 10 }] },
    'dam_lay': { name: 'Đầm Lầy Ma Quái', duration: 1800000, energyCost: 50, levelReq: 5, ageReq: 90, description: 'Yêu cầu: Tuổi 90. Nơi ẩm ướt và đầy bí ẩn.', rewards: [{ key: 'reu_co_thu', weight: 50 }, { key: 'sau_map', weight: 30 }, { key: 'hat_giong_than', weight: 20 }] },
    'nui_tuyet': { name: 'Đỉnh Núi Tuyết', duration: 3600000, energyCost: 60, levelReq: 7, ageReq: 130, description: 'Yêu cầu: Tuổi 130. Nơi lạnh giá ẩn chứa kho báu.', rewards: [{ key: 'tinh_the_bang', weight: 60 }, { key: 'vo_so_lap_lanh', weight: 35 }, { key: 'da_dung_nham', weight: 5 }] },
    'dong_bang_phu_sa': { name: 'Đồng Bằng Phù Sa', duration: 7200000, energyCost: 80, levelReq: 9, ageReq: 170, description: 'Yêu cầu: Tuổi 170. Vùng đất màu mỡ.', rewards: [{ key: 'dat_set_song_hong', weight: 65 }, { key: 'hat_giong_than', weight: 30 }, { key: 'tinh_chat_tre_nga', weight: 5 }] },
    'rung_tre_nga': { name: 'Rừng Tre Ngà', duration: 14400000, energyCost: 85, levelReq: 10, ageReq: 190, description: 'Yêu cầu: Tuổi 190. Nơi cây tre vươn mình bất khuất.', rewards: [{ key: 'tinh_chat_tre_nga', weight: 70 }, { key: 'hat_giong_than', weight: 20 }, { key: 'long_ga_vang', weight: 10 }] },
    'hang_dung_nham': { name: 'Hang Động Dung Nham', duration: 21600000, energyCost: 90, levelReq: 12, ageReq: 230, description: 'Yêu cầu: Tuổi 230. Cực kỳ nguy hiểm.', rewards: [{ key: 'da_dung_nham', weight: 75 }, { key: 'long_ga_vang', weight: 22 }, { key: 'ngoi_sao_hy_vong', weight: 3 }] },
    'vuc_tham_co_dai': { name: 'Vực Thẳm Cổ Đại', duration: 28800000, energyCost: 95, levelReq: 14, ageReq: 270, description: 'Yêu cầu: Tuổi 270. Nơi tận cùng thế giới.', rewards: [{ key: 'dat_set_song_hong', weight: 45 }, { key: 'tinh_chat_tre_nga', weight: 45 }, { key: 'ngoi_sao_hy_vong', weight: 10 }] }
};

export const SHOP_ITEMS = {
    food: {
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
        'tra_tang_toc_thoi_gian': { name: 'Trà Tăng Tốc Thời Gian', type: 'food', price: 2000, hunger: -5, happiness: 10, description: 'Tăng tốc lên cấp: x2 tốc độ lớn lên trong 1 giờ.', buff: { type: 'ageBoost', multiplier: 2.0, duration: 3600000 } },
    },
    tools: {
        'chen_an_vui_ve': { name: 'Chén Ăn Vui Vẻ', type: 'tool', slot: 'feed', price: 600, description: 'Nâng cấp "Cho Ăn": Tăng thêm No bụng và Vui vẻ.', bonuses: { feed_free: { hunger: -5, happiness: 3 } } },
        'bo_chen_dua_tinh_xao': { name: 'Bộ Chén Đũa Tinh Xảo', type: 'tool', slot: 'feed', price: 1500, description: 'Nâng cấp "Cho Ăn": Giúp ăn ngon miệng hơn, hồi nhiều No bụng và Vui vẻ hơn.', bonuses: { feed_free: { hunger: -7, happiness: 5 } } },
        'bi_kip_nau_nuong': { name: 'Bí Kíp Nấu Nướng Thượng Hạng', type: 'tool', slot: 'feed', price: 3200, description: 'Nâng cấp "Cho Ăn": Biến thức ăn đơn giản trở nên siêu ngon và 25% cơ hội tạo ra "Món Phụ Bất Ngờ" nhận thêm Xu.', bonuses: { feed_free: { hunger: -8, happiness: 5, bonusCoinChance: 0.25, bonusCoinAmount: 25 } } },
        'bong_do_choi': { name: 'Bóng Đồ Chơi', type: 'tool', slot: 'play', price: 750, description: 'Hành động "Chơi" hiệu quả hơn.', bonuses: { play: { happiness: 10, coins: 5 } } },
        'xa_bong_thom': { name: 'Xà Bông Thơm', type: 'tool', slot: 'clean', price: 750, description: 'Hành động "Tắm" hiệu quả hơn.', bonuses: { clean: { cleanliness: 10, coins: 5 } } },
        'sach_tri_tue': { name: 'Sách Trí Tuệ', type: 'tool', slot: 'play', price: 2800, description: 'Nâng cấp "Chơi": Tăng thêm Vui vẻ và nhân 2.5 lần Xu.', bonuses: { play: { happiness: 10, coinMultiplier: 2.5 } } },
        'voi_hoa_sen_vang': { name: 'Vòi Hoa Sen Vàng', type: 'tool', slot: 'clean', price: 3200, description: 'Nâng cấp "Tắm" cao cấp. Hồi Năng lượng theo cấp tiến hóa và có cơ hội giúp thư giãn, làm chậm suy giảm chỉ số trong 5 phút.', bonuses: { clean: { cleanliness: 10, energyPerLevel: 1, buffChance: 0.10 } } },
    },
    decorations: {
        'mu_rom': { name: 'Mũ Rơm', type: 'accessory', slot: 'hat', price: 350, description: 'Phong cách nhà nông.', image: '/images/accessories/hat-straw.png' },
        'mu_cao_boi': { name: 'Mũ Cao Bồi', type: 'accessory', slot: 'hat', price: 500, description: 'Chất lừ!', image: '/images/accessories/hat-cowboy.png' },
        'mu_thuong_luu': { name: 'Mũ Luxury', type: 'accessory', slot: 'hat', price: 1200, description: 'Có tiền!', image: '/images/accessories/hat-luxury.png' },
        'nen_bien': { name: 'Nền Bãi Biển', type: 'background', price: 1500, description: 'Không gian bãi biển.', image: '/images/accessories/bg-beach.png' },
        'nen_suoi': { name: 'Nền Con Suối', type: 'background', price: 1500, description: 'Không gian trong lành.', image: '/images/accessories/bg-river.png' },
        'nen_hang_dong': { name: 'Nền Hang Động', type: 'background', price: 2500, description: 'Bí ẩn và tĩnh lặng.', image: '/images/accessories/bg-cave.png' },
        'nen_rung': { name: 'Nền Khu Rừng', type: 'background', price: 2500, description: 'Khám phá thế giới hoang dã.', image: '/images/accessories/bg-forest.png' },
        'nen_vu_tru': { name: 'Nền Vũ Trụ', type: 'background', price: 5000, description: 'Ngắm nhìn các vì sao.', image: '/images/accessories/bg-cosmos.png' },
        'vuong_mien_thien_than': { name: 'Vương Miện Thiên Thần', type: 'accessory', slot: 'hat', price: 7500, description: 'Biểu tượng của sự thuần khiết.', image: '/images/accessories/crown-angel.png' },
    },
    materials: {
        'long_ga_vang': { name: 'Lông Gà Vàng', type: 'material', description: 'Một chiếc lông vũ hiếm, lấp lánh.' },
        'vo_so_lap_lanh': { name: 'Vỏ Sò Lấp Lánh', type: 'material', description: 'Chiếc vỏ sò tuyệt đẹp từ biển cả.' },
        'hat_giong_than': { name: 'Hạt Giống Thần', type: 'material', description: 'Loại hạt cây chứa đầy năng lượng.' },
        'tinh_the_bang': { name: 'Tinh Thể Băng', type: 'material', description: 'Một viên pha lê lạnh giá.' },
        'dat_set_song_hong': { name: 'Đất Sét Sông Hồng', type: 'material', description: 'Loại đất sét đỏ phù sa, biểu tượng của sự sống.' },
        'tinh_chat_tre_nga': { name: 'Tinh Chất Tre Ngà', type: 'material', description: 'Kết tinh từ những cây tre kiên cường nhất.' },
        'ngoi_sao_hy_vong': { name: 'Ngôi Sao Hy Vọng', type: 'material', description: 'Vật phẩm cực hiếm, chỉ dành cho người kiên trì.' },
        'reu_co_thu': { name: 'Rêu Cổ Thụ', type: 'material', description: 'Loài rêu phát sáng trong bóng tối.' },
        'da_dung_nham': { name: 'Đá Dung Nham', type: 'material', description: 'Viên đá vẫn còn âm ỉ hơi nóng.' },
    },
    craftables: {
        'mu_coi': { name: 'Mũ Cối Việt Nam (God)', type: 'accessory', slot: 'hat', description: 'Sức mạnh vô song, quyền năng bất tận, thống lĩnh thiên hạ.', image: '/images/accessories/tu-hao-viet-nam.png' },
        'mu_vua': { name: 'Mũ Vua (Legendary)', type: 'accessory', slot: 'hat', description: 'Chế tạo từ nguyên liệu hiếm.', image: '/images/accessories/hat-king.png' },
        'non_la': { name: 'Nón Lá (Legendary)', type: 'accessory', slot: 'hat', description: 'Ra chợ đi thấy liền!', image: '/images/accessories/non-la.png' },
        'vuong_mien_bang': { name: 'Vương Miện Băng (Legendary)', type: 'accessory', slot: 'hat', description: 'Quyền năng của giá lạnh.', image: '/images/accessories/crown-ice.png' },
        'vong_hoa_reu': { name: 'Vòng Hoa Rêu Sáng (Legendary)', type: 'accessory', slot: 'hat', description: 'Chế tạo từ Rêu Cổ Thụ.', image: '/images/accessories/wreath-moss.png' },
        'mu_nham_thach': { name: 'Mũ Nham Thạch (Legendary)', type: 'accessory', slot: 'hat', description: 'Sức nóng của núi lửa.', image: '/images/accessories/helmet-magma.png' },
    }
};

function flattenItems(itemsByCategory) {
    const flatItems = {};
    for (const category in itemsByCategory) {
        Object.assign(flatItems, itemsByCategory[category]);
    }
    return flatItems;
}
export const ALL_ITEMS = flattenItems(SHOP_ITEMS);

export const CRAFTING_RECIPES = {
    'non_la': { name: 'Nón Lá', materials: { 'tinh_chat_tre_nga': 5, 'hat_giong_than': 15 } },
    'vong_hoa_reu': { name: 'Vòng Hoa Rêu Sáng', materials: { 'reu_co_thu': 20, 'vo_so_lap_lanh': 10 } },
    'mu_nham_thach': { name: 'Mũ Nham Thạch', materials: { 'da_dung_nham': 15, 'tinh_the_bang': 10 } },
    'mu_vua': { name: 'Mũ Vua (Legendary)', materials: { 'long_ga_vang': 25, 'vo_so_lap_lanh': 20 } },
    'vuong_mien_bang': { name: 'Vương Miện Băng (Legendary)', materials: { 'tinh_the_bang': 20, 'vo_so_lap_lanh': 15, 'ngoi_sao_hy_vong': 1 } },
    'mu_coi': { name: 'Mũ Cối Việt Nam (God)', materials: { 'dat_set_song_hong': 30, 'tinh_chat_tre_nga': 30, 'ngoi_sao_hy_vong': 3 } }
};