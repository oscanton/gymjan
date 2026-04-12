const ShoppingApplicationService = (() => {
    const FALLBACK_CATEGORY = 'other_processed';
    const resolvePersistenceApi = () => (
        typeof PersistenceAdapter !== 'undefined' ? PersistenceAdapter : null
    );
    const getCustomItems = () => resolvePersistenceApi()?.getShoppingCustomItems() || [];
    const isItemChecked = (itemId, fallback = false) => resolvePersistenceApi()?.getShoppingItemChecked(itemId, fallback) ?? fallback;
    const setItemChecked = (itemId, checked) => { resolvePersistenceApi()?.setShoppingItemChecked(itemId, checked); };
    const setCustomItemChecked = (customId, checked) => { resolvePersistenceApi()?.setShoppingCustomItemChecked(customId, checked); };
    const addCustomItem = (text) => resolvePersistenceApi()?.addShoppingCustomItem(text) || [];
    const clearAll = () => { resolvePersistenceApi()?.clearShoppingAll(); };

    const normalizeFoodsPayload = (foodsData = null) => {
        if (foodsData && typeof foodsData === 'object' && foodsData.foods && typeof foodsData.foods === 'object') return foodsData;
        return foodsData && typeof foodsData === 'object'
            ? { foods: foodsData, categories: [], fallbackCategory: FALLBACK_CATEGORY }
            : null;
    };
    const getSelectedMenuFile = ({ availableMenus = [] } = {}) => (
        typeof MenuApplicationService !== 'undefined' && typeof MenuApplicationService.getSelectedMenuFile === 'function'
            ? MenuApplicationService.getSelectedMenuFile({ availableMenus })
            : (resolvePersistenceApi()?.getSelectedMenuFile() || availableMenus[0]?.file || null)
    );
    const getMenuLabel = ({ menuFile = '', availableMenus = [] } = {}) => (
        (Array.isArray(availableMenus) ? availableMenus : []).find((option) => option.file === menuFile)?.label
        || String(menuFile || '').replace('.js', '')
    );
    const getCategoryMeta = (categories = []) => {
        const labels = {};
        const order = {};
        (Array.isArray(categories) ? categories : []).forEach((category, index) => {
            if (!category?.id) return;
            labels[category.id] = category.label || category.id;
            order[category.id] = index;
        });
        return { labels, order };
    };
    const getFoodCategoryId = (food = null, fallbackCategory = FALLBACK_CATEGORY) => (
        food?.categoryId || food?.category || fallbackCategory
    );
    const buildCategoryBuckets = ({ totals = {}, foodsData = null } = {}) => {
        const normalizedFoodsData = normalizeFoodsPayload(foodsData);
        const foodsCatalog = normalizedFoodsData?.foods || {};
        const { labels, order } = getCategoryMeta(normalizedFoodsData?.categories);
        const buckets = {};
        Object.entries(totals && typeof totals === 'object' ? totals : {}).forEach(([foodId, amount]) => {
            const food = foodsCatalog[foodId];
            if (!food || amount <= 0) return;
            const category = getFoodCategoryId(food, normalizedFoodsData?.fallbackCategory || FALLBACK_CATEGORY);
            (buckets[category] ||= []).push({ id: foodId, name: food.name, amount, unit: food.unit });
        });
        return Object.keys(buckets)
            .sort((a, b) => (order[a] ?? 999) - (order[b] ?? 999) || a.localeCompare(b))
            .map((category) => ({ id: category, label: labels[category] || category, items: buckets[category] }));
    };
    const buildSections = ({ totals = {}, foodsData = null } = {}) => buildCategoryBuckets({ totals, foodsData }).map((section) => ({
        ...section,
        items: section.items.map((item) => ({ ...item, checked: isItemChecked(item.id, false) }))
    }));
    const buildBaseModel = ({ menuFile = '', availableMenus = [], isReady = false, sections = [] } = {}) => ({
        menuFile,
        menuLabel: getMenuLabel({ menuFile, availableMenus }),
        sections,
        customItems: getCustomItems(),
        isReady
    });
    const buildShoppingPageModel = ({
        availableMenus = [],
        menuFile = null,
        menuData = null,
        foodsData = null,
        formulas = null,
        mealKeys = null
    } = {}) => {
        const resolvedMenuFile = menuFile || getSelectedMenuFile({ availableMenus });
        const normalizedFoodsData = normalizeFoodsPayload(foodsData);
        if (!Array.isArray(menuData) || !normalizedFoodsData?.foods || !formulas || typeof formulas.calculateShoppingTotals !== 'function') {
            return buildBaseModel({ menuFile: resolvedMenuFile, availableMenus, isReady: false });
        }
        return buildBaseModel({
            menuFile: resolvedMenuFile,
            availableMenus,
            isReady: true,
            sections: buildSections({ totals: formulas.calculateShoppingTotals(menuData, mealKeys), foodsData: normalizedFoodsData })
        });
    };

    return {
        getSelectedMenuFile,
        getMenuLabel,
        getCategoryMeta,
        getCustomItems,
        isItemChecked,
        setItemChecked,
        setCustomItemChecked,
        addCustomItem,
        clearAll,
        buildShoppingPageModel
    };
})();

window.ShoppingApplicationService = ShoppingApplicationService;
