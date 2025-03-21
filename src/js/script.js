// 获取数据区域元素
const dataArea = document.getElementById("dataArea");

// 创建各个子区域元素
const dateArea = createDivElement();
const platformArea = createDivElement();
const genreIdArea = createDivElement();
const countryArea = createDivElement();
const typeArea = createDivElement();
const dataListArea = createDivElement();

// 将子区域元素添加到数据区域
[dataArea, dateArea, platformArea, genreIdArea, countryArea, typeArea, dataListArea].forEach((area) => {
    if (area!== dataArea) {
        dataArea.appendChild(area);
    }
});

// 图表目录路径
const chartsDirs = "./simple/charts";

// 存储原始数据
let originData = {};
// 存储数据信息
let dataInfo = {
    date: "",
    platform: "",
    genreId: "",
    country: "",
    type: "",
};

// 更新 UI 函数
function updateUI(uiArea, key) {
    Array.from(uiArea.getElementsByTagName("button")).forEach((button) => {
        button.classList.toggle("btn-selected", button.textContent === key);
    });
}

// 加载平台数据
function loadPlatformData(platform) {
    dataInfo.platform = platform;
    updateUI(platformArea, platform);
    const genreIdList = Object.keys(originData[platform] || {});
    genreIdArea.innerHTML = "";
    genreIdList.forEach((genreId) => {
        const button = createButton(genreId, () => loadGenreIdData(genreId));
        genreIdArea.appendChild(button);
    });
    if (genreIdList.length > 0) {
        const selectedGenreId = dataInfo.genreId in genreIdList? dataInfo.genreId : genreIdList[0];
        loadGenreIdData(selectedGenreId);
    }
}

// 加载 genreId 数据
function loadGenreIdData(genreId) {
    dataInfo.genreId = genreId;
    updateUI(genreIdArea, genreId);
    const countryList = Object.keys(originData[dataInfo.platform]?.[genreId] || {});
    countryArea.innerHTML = "";
    countryList.forEach((country) => {
        const button = createButton(country, () => loadCountryData(country));
        countryArea.appendChild(button);
    });
    if (countryList.length > 0) {
        const selectedCountry = dataInfo.country in countryList? dataInfo.country : countryList[0];
        loadCountryData(selectedCountry);
    }
}

// 加载国家数据
function loadCountryData(country) {
    dataInfo.country = country;
    updateUI(countryArea, country);
    const typeList = Object.keys(originData[dataInfo.platform]?.[dataInfo.genreId]?.[country] || {});
    typeArea.innerHTML = "";
    typeList.forEach((type) => {
        const button = createButton(type, () => loadTypeData(type));
        typeArea.appendChild(button);
    });
    if (typeList.length > 0) {
        const selectedType = dataInfo.type in typeList? dataInfo.type : typeList[0];
        loadTypeData(selectedType);
    }
}

// 加载类型数据
function loadTypeData(type) {
    dataInfo.type = type;
    updateUI(typeArea, type);
    const dataList = originData[dataInfo.platform]?.[dataInfo.genreId]?.[dataInfo.country]?.[type] || [];
    dataListArea.innerHTML = "";
    dataList.forEach((item) => {
        const div = document.createElement("div");
        div.textContent = JSON.stringify(item);
        dataListArea.appendChild(div);
    });
}

// 加载日期数据
function loadDateData(date) {
    fetch(`${chartsDirs}/${date}.json`)
      .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
      .then((jsonData) => {
            dataInfo.date = date;
            originData = jsonData;
            const platformList = Object.keys(jsonData);
            platformArea.innerHTML = "";
            platformList.forEach((platform) => {
                const button = createButton(platform, () => loadPlatformData(platform));
                platformArea.appendChild(button);
            });
            if (platformList.length > 0) {
                const selectedPlatform = dataInfo.platform in platformList? dataInfo.platform : platformList[0];
                loadPlatformData(selectedPlatform);
            }
        })
      .catch((error) => {
            console.error("Error loading date data:", error);
        });
}

// 创建按钮函数
function createButton(text, clickHandler) {
    const button = document.createElement("button");
    button.textContent = text;
    button.classList.add("bg-blue-600", "text-white", "px-4", "py-2", "rounded-md", "hover:bg-blue-700", "m-2");
    button.addEventListener("click", clickHandler);
    return button;
}

// 创建 div 元素函数
function createDivElement() {
    return document.createElement("div");
}

// 加载日期列表
function loadDateList(dateListPath) {
    fetch(dateListPath)
      .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
      .then((dateList) => {
            console.log(dateList);
            dateArea.innerHTML = "";
            dateList.forEach((date) => {
                const button = createButton(date, () => loadDateData(date));
                dateArea.appendChild(button);
            });
            if (dateList.length > 0) {
                const selectedDate = dataInfo.date in dateList? dataInfo.date : dateList[dateList.length - 1];
                loadDateData(selectedDate);
            }
        })
      .catch((error) => {
            console.error("Error loading date list:", error);
        });
}

// 启动加载日期列表
loadDateList(`${chartsDirs}/dateList.json`);
