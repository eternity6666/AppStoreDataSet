// 获取选择器元素
const dateSelect = document.getElementById("dateSelect");
const platformSelect = document.getElementById("platformSelect");
const genreSelect = document.getElementById("genreSelect");
const countrySelect = document.getElementById("countrySelect");
const typeSelect = document.getElementById("typeSelect");
const dataListArea = document.getElementById("dataListArea");

// 配置
const chartsDirs = "./simple/charts";
const itemDirs = "./simple/appInfo";
const STORAGE_KEYS = {
    PLATFORM: 'AppStoreDataSet_platform',
    GENRE_ID: 'AppStoreDataSet_genreId',
    COUNTRY: 'AppStoreDataSet_country',
    TYPE: 'AppStoreDataSet_type',
};

// 存储状态
let originData = {};
let dataInfo = {
    date: "",
    platform: localStorage.getItem(STORAGE_KEYS.PLATFORM) || "",
    genreId: localStorage.getItem(STORAGE_KEYS.GENRE_ID) || "",
    country: localStorage.getItem(STORAGE_KEYS.COUNTRY) || "",
    type: localStorage.getItem(STORAGE_KEYS.TYPE) || "",
};

// 初始化选择器
function initializeSelect(element) {
    $(element).select2({
        width: '100%',
        placeholder: '请选择',
        allowClear: true
    }).on('select2:select', function(e) {
        // 触发原生 change 事件
        this.dispatchEvent(new Event('change'));
    });
}

// 更新选择器选项
function updateSelect(element, options, selectedValue) {
    element.innerHTML = '<option value="">请选择</option>';
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        optionElement.selected = option === selectedValue;
        element.appendChild(optionElement);
    });
    $(element).trigger('change');
}

// 创建应用卡片
function createAppCard(appData) {
    const imageUrl = appData["platformAttributes.ios.artwork.url"]?.[0]?.["k"] || "";
    const name = appData["name"]?.[0]?.["k"] || "";
    const subtitle = appData["platformAttributes.ios.subtitle"]?.[0]?.["k"] || "";
    
    return `
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="p-6 flex items-start space-x-4">
                <img class="h-16 w-16 rounded-lg object-cover" 
                     src="${imageUrl.replace("{w}x{h}{c}.{f}", "1024x0w.webp")}" 
                     alt="${name}">
                <div class="space-y-1">
                    <h3 class="font-semibold leading-none tracking-tight">${name}</h3>
                    <p class="text-sm text-muted-foreground">${subtitle}</p>
                </div>
            </div>
        </div>
    `;
}

// 加载应用数据
async function loadAppData(item) {
    try {
        const response = await fetch(`${itemDirs}/${item[0]}/${item}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const jsonData = await response.json();
        return createAppCard(jsonData);
    } catch (error) {
        console.error("Error loading app data:", error);
        return '';
    }
}

// 更新数据展示区域
async function updateDataList() {
    const dataList = originData[dataInfo.platform]?.[dataInfo.genreId]?.[dataInfo.country]?.[dataInfo.type] || [];
    dataListArea.innerHTML = '<div class="col-span-full text-center">加载中...</div>';
    
    const cardPromises = dataList.map(item => loadAppData(item));
    const cards = await Promise.all(cardPromises);
    dataListArea.innerHTML = cards.join('');
}

// 事件处理器
dateSelect.addEventListener('change', async (e) => {
    const date = e.target.value;
    if (!date) return;
    
    dataInfo.date = date;
    localStorage.setItem(STORAGE_KEYS.DATE, date);
    
    try {
        const response = await fetch(`${chartsDirs}/${date}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        originData = await response.json();
        
        const platforms = Object.keys(originData);
        updateSelect(platformSelect, platforms, dataInfo.platform);
        
        if (platforms.length > 0) {
            const selectedPlatform = platforms.includes(dataInfo.platform) ? dataInfo.platform : platforms[0];
            platformSelect.value = selectedPlatform;
            platformSelect.dispatchEvent(new Event('change'));
        }
        
        // 更新数据列表
        updateDataList();
    } catch (error) {
        console.error("Error loading date data:", error);
    }
});

platformSelect.addEventListener('change', (e) => {
    const platform = e.target.value;
    if (!platform) return;
    
    dataInfo.platform = platform;
    localStorage.setItem(STORAGE_KEYS.PLATFORM, platform);
    
    const genres = Object.keys(originData[platform] || {});
    updateSelect(genreSelect, genres, dataInfo.genreId);
    
    if (genres.length > 0) {
        const selectedGenre = genres.includes(dataInfo.genreId) ? dataInfo.genreId : genres[0];
        genreSelect.value = selectedGenre;
        genreSelect.dispatchEvent(new Event('change'));
    }
    
    // 更新数据列表
    updateDataList();
});

genreSelect.addEventListener('change', (e) => {
    const genre = e.target.value;
    if (!genre) return;
    
    dataInfo.genreId = genre;
    localStorage.setItem(STORAGE_KEYS.GENRE_ID, genre);
    
    const countries = Object.keys(originData[dataInfo.platform]?.[genre] || {});
    updateSelect(countrySelect, countries, dataInfo.country);
    
    if (countries.length > 0) {
        const selectedCountry = countries.includes(dataInfo.country) ? dataInfo.country : countries[0];
        countrySelect.value = selectedCountry;
        countrySelect.dispatchEvent(new Event('change'));
    }
    
    // 更新数据列表
    updateDataList();
});

countrySelect.addEventListener('change', (e) => {
    const country = e.target.value;
    if (!country) return;
    
    dataInfo.country = country;
    localStorage.setItem(STORAGE_KEYS.COUNTRY, country);
    
    const types = Object.keys(originData[dataInfo.platform]?.[dataInfo.genreId]?.[country] || {});
    updateSelect(typeSelect, types, dataInfo.type);
    
    if (types.length > 0) {
        const selectedType = types.includes(dataInfo.type) ? dataInfo.type : types[0];
        typeSelect.value = selectedType;
        typeSelect.dispatchEvent(new Event('change'));
    }
    
    // 更新数据列表
    updateDataList();
});

typeSelect.addEventListener('change', (e) => {
    const type = e.target.value;
    if (!type) return;
    
    dataInfo.type = type;
    localStorage.setItem(STORAGE_KEYS.TYPE, type);
    
    updateDataList();
});

// 初始化
async function initialize() {
    // 初始化所有选择器
    [dateSelect, platformSelect, genreSelect, countrySelect, typeSelect].forEach(initializeSelect);
    
    try {
        // 加载日期列表
        const response = await fetch(`${chartsDirs}/dateList.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const dateList = await response.json();
        
        // 设置日期选择器，但使用最新的日期
        const latestDate = dateList[dateList.length - 1];
        updateSelect(dateSelect, dateList, latestDate);
        
        // 触发日期选择以加载后续数据
        dateSelect.value = latestDate;
        dateSelect.dispatchEvent(new Event('change'));
    } catch (error) {
        console.error("Error initializing:", error);
    }
}

// 启动应用
initialize();
