// 配置和常量
const CONFIG = {
    DIRS: {
        CHARTS: "./simple/charts",
        APP_INFO: "./simple/appInfo"
    },
    STORAGE_KEYS: {
        PLATFORM: 'AppStoreDataSet_platform',
        GENRE_ID: 'AppStoreDataSet_genreId',
        COUNTRY: 'AppStoreDataSet_country',
        TYPE: 'AppStoreDataSet_type',
    }
};

// 状态管理
class AppState {
    constructor() {
        this.originData = {};
        this.dataInfo = {
            date: "",
            platform: localStorage.getItem(CONFIG.STORAGE_KEYS.PLATFORM) || "",
            genreId: localStorage.getItem(CONFIG.STORAGE_KEYS.GENRE_ID) || "",
            country: localStorage.getItem(CONFIG.STORAGE_KEYS.COUNTRY) || "",
            type: localStorage.getItem(CONFIG.STORAGE_KEYS.TYPE) || "",
        };
        this.abortController = new AbortController();
    }

    updateDataInfo(key, value) {
        this.dataInfo[key] = value;
        switch (key) {
            case 'platform':
                localStorage.setItem(CONFIG.STORAGE_KEYS.PLATFORM, value);
                break;
            case 'genreId':
                localStorage.setItem(CONFIG.STORAGE_KEYS.GENRE_ID, value);
                break;
            case 'country':
                localStorage.setItem(CONFIG.STORAGE_KEYS.COUNTRY, value);
                break;
            case 'type':
                localStorage.setItem(CONFIG.STORAGE_KEYS.TYPE, value);
                break;
            default:
                break;
        }
    }

    abortRequests() {
        this.abortController.abort();
        this.abortController = new AbortController();
    }
}

class AppInfo {
    constructor(jsonData) {
        this.jsonData = jsonData;
        this.appInfo = {
          iconUrl: jsonData['artworkUrl512'],
          name: jsonData['trackName'],
          description: jsonData['description'],
          developerName: jsonData['artistName'],
          price: jsonData['price'],
          currency: jsonData['currency'],
          averageUserRating: jsonData['averageUserRating'],
        };
    }
}

// UI 组件
class UI {
    constructor() {
        this.selectors = {
            date: document.getElementById("dateSelect"),
            platform: document.getElementById("platformSelect"),
            genre: document.getElementById("genreSelect"),
            country: document.getElementById("countrySelect"),
            type: document.getElementById("typeSelect"),
        };
        this.dataList = document.getElementById("dataListArea");
    }

    initializeSelects() {
        Object.values(this.selectors).forEach(select => {
            $(select).select2({
                width: '100%',
                placeholder: '请选择',
                allowClear: true
            }).on('select2:select', function (e) {
                this.dispatchEvent(new Event('change'));
            });
        });
    }

    updateSelect(element, options, selectedValue) {
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

    createAppCard(appInfo) {
        const imageUrl = appInfo.appInfo.iconUrl;
        const name = appInfo.appInfo.name;
        const developerName = appInfo.appInfo.developerName;
        const price = appInfo.appInfo.price;
        const currency = appInfo.appInfo.currency;
        const userRating = appInfo.appInfo.averageUserRating;
        return `
            <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div class="p-6 flex items-start space-x-4">
                    <img class="h-16 w-16 rounded-lg object-cover" 
                         src="${imageUrl}" 
                         alt="${name}">
                    <div class="space-y-1">
                        <h3 class="font-semibold leading-none tracking-tight">${name}</h3>
                        <p class="text-sm text-muted-foreground">${developerName}</p>
                        <p class="text-sm text-muted-foreground">${price}${currency}</p>
                        <p class="text-sm text-muted-foreground">${userRating}</p>
                    </div>
                </div>
            </div>
        `;
    }

    showLoading() {
        this.dataList.innerHTML = '<div class="col-span-full text-center">加载中...</div>';
    }

    updateDataList(cards) {
        this.dataList.innerHTML = cards.join('');
    }
}

// 数据服务
class DataService {
    constructor(appState) {
        this.appState = appState;
    }

    async fetchWithAbort(url) {
        try {
            const response = await fetch(url, {
                signal: this.appState.abortController.signal
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request aborted');
                return null;
            }
            throw error;
        }
    }

    async loadAppData(appId) {
        try {
            const country = app.appState.dataInfo.country;
            const jsonData = await this.fetchWithAbort(`https://itunes.apple.com/lookup?id=${appId}&entity=software&country=${country}`);
            return jsonData && jsonData['results'] ? app.ui.createAppCard(new AppInfo(jsonData['results'][0])) : '';
        } catch (error) {
            console.error("Error loading app data:", error);
            return '';
        }
    }

    async updateDataList() {
        app.ui.showLoading();
        this.appState.abortRequests();

        const dataList = this.appState.originData[this.appState.dataInfo.platform]?.[
            this.appState.dataInfo.genreId]?.[this.appState.dataInfo.country]?.[
            this.appState.dataInfo.type] || [];

        const cardPromises = dataList.map(item => this.loadAppData(item));
        const cards = await Promise.all(cardPromises);
        app.ui.updateDataList(cards);
    }
}

// 应用主类
class App {
    constructor() {
        this.appState = new AppState();
        this.ui = new UI();
        this.dataService = new DataService(this.appState);
        this.dataService.ui = this.ui;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.ui.selectors.date.addEventListener('change', this.handleDateChange.bind(this));
        this.ui.selectors.platform.addEventListener('change', this.handlePlatformChange.bind(this));
        this.ui.selectors.genre.addEventListener('change', this.handleGenreChange.bind(this));
        this.ui.selectors.country.addEventListener('change', this.handleCountryChange.bind(this));
        this.ui.selectors.type.addEventListener('change', this.handleTypeChange.bind(this));
    }

    async handleDateChange(e) {
        const date = e.target.value;
        if (!date) return;

        this.appState.updateDataInfo('date', date);
        this.appState.abortRequests();

        try {
            this.appState.originData = await this.dataService.fetchWithAbort(`${CONFIG.DIRS.CHARTS}/${date}.json`);
            const platforms = Object.keys(this.appState.originData);
            this.ui.updateSelect(this.ui.selectors.platform, platforms, this.appState.dataInfo.platform);

            if (platforms.length > 0) {
                const selectedPlatform = platforms.includes(this.appState.dataInfo.platform)
                    ? this.appState.dataInfo.platform
                    : platforms[0];
                this.ui.selectors.platform.value = selectedPlatform;
                this.ui.selectors.platform.dispatchEvent(new Event('change'));
            }
        } catch (error) {
            console.error("Error loading date data:", error);
        }
    }

    handlePlatformChange(e) {
        const platform = e.target.value;
        if (!platform) return;

        this.appState.updateDataInfo('platform', platform);
        this.appState.abortRequests();

        const genres = Object.keys(this.appState.originData[platform] || {});
        this.ui.updateSelect(this.ui.selectors.genre, genres, this.appState.dataInfo.genreId);

        if (genres.length > 0) {
            const selectedGenre = genres.includes(this.appState.dataInfo.genreId)
                ? this.appState.dataInfo.genreId
                : genres[0];
            this.ui.selectors.genre.value = selectedGenre;
            this.ui.selectors.genre.dispatchEvent(new Event('change'));
        }
    }

    handleGenreChange(e) {
        const genre = e.target.value;
        if (!genre) return;

        this.appState.updateDataInfo('genreId', genre);
        this.appState.abortRequests();

        const countries = Object.keys(this.appState.originData[this.appState.dataInfo.platform]?.[genre] || {});
        this.ui.updateSelect(this.ui.selectors.country, countries, this.appState.dataInfo.country);

        if (countries.length > 0) {
            const selectedCountry = countries.includes(this.appState.dataInfo.country)
                ? this.appState.dataInfo.country
                : countries[0];
            this.ui.selectors.country.value = selectedCountry;
            this.ui.selectors.country.dispatchEvent(new Event('change'));
        }
    }

    handleCountryChange(e) {
        const country = e.target.value;
        if (!country) return;

        this.appState.updateDataInfo('country', country);
        this.appState.abortRequests();

        const types = Object.keys(this.appState.originData[this.appState.dataInfo.platform]?.[
            this.appState.dataInfo.genreId]?.[country] || {});
        this.ui.updateSelect(this.ui.selectors.type, types, this.appState.dataInfo.type);

        if (types.length > 0) {
            const selectedType = types.includes(this.appState.dataInfo.type)
                ? this.appState.dataInfo.type
                : types[0];
            this.ui.selectors.type.value = selectedType;
            this.ui.selectors.type.dispatchEvent(new Event('change'));
        }
    }

    handleTypeChange(e) {
        const type = e.target.value;
        if (!type) return;

        this.appState.updateDataInfo('type', type);
        this.appState.abortRequests();

        this.dataService.updateDataList();
    }

    async initialize() {
        this.ui.initializeSelects();
        try {
            const dateList = await this.dataService.fetchWithAbort(`${CONFIG.DIRS.CHARTS}/dateList.json`);
            const latestDate = dateList[dateList.length - 1];
            this.ui.updateSelect(this.ui.selectors.date, dateList, latestDate);
            this.ui.selectors.date.value = latestDate;
            this.ui.selectors.date.dispatchEvent(new Event('change'));
        } catch (error) {
            console.error("Error initializing:", error);
        }
    }
}

// 启动应用
const app = new App();
app.initialize();
