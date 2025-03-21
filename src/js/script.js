// 获取数据区域元素
const dataListArea = document.getElementById("dataListArea");
const dateArea = document.getElementById("dateArea");
const platformArea = document.getElementById("platformArea");
const genreIdArea = document.getElementById("genreIdArea");
const countryArea = document.getElementById("countryArea");
const typeArea = document.getElementById("typeArea");

// 图表目录路径
const chartsDirs = "./simple/charts";
const itemDirs = "./simple/appInfo";
const STORAGE_KEYS = {
  PLATFORM: 'AppStoreDataSet_platform',
  GENRE_ID: 'AppStoreDataSet_genreId',
  COUNTRY: 'AppStoreDataSet_country',
  TYPE: 'AppStoreDataSet_type',
};

// 存储原始数据
let originData = {};
// 存储数据信息
let dataInfo = {
  date: "",
  platform: localStorage.getItem(STORAGE_KEYS.PLATFORM) || "",
  genreId: localStorage.getItem(STORAGE_KEYS.GENRE_ID) || "",
  country: localStorage.getItem(STORAGE_KEYS.COUNTRY) || "",
  type: localStorage.getItem(STORAGE_KEYS.TYPE) || "",
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
  localStorage.setItem(STORAGE_KEYS.PLATFORM, platform);
  updateUI(platformArea, platform);
  const genreIdList = Object.keys(originData[platform] || {});
  genreIdArea.innerHTML = "";
  genreIdList.forEach((genreId) => {
    const button = createButton(genreId, () => loadGenreIdData(genreId));
    genreIdArea.appendChild(button);
  });
  if (genreIdList.length > 0) {
    const selectedGenreId = genreIdList.includes(dataInfo.genreId) ? dataInfo.genreId : genreIdList[0];
    loadGenreIdData(selectedGenreId);
  }
}

// 加载 genreId 数据
function loadGenreIdData(genreId) {
  dataInfo.genreId = genreId;
  localStorage.setItem(STORAGE_KEYS.GENRE_ID, genreId);
  updateUI(genreIdArea, genreId);
  const countryList = Object.keys(
    originData[dataInfo.platform]?.[genreId] || {}
  );
  countryArea.innerHTML = "";
  countryList.forEach((country) => {
    const button = createButton(country, () => loadCountryData(country));
    countryArea.appendChild(button);
  });
  if (countryList.length > 0) {
    const selectedCountry = countryList.includes(dataInfo.country) ? dataInfo.country : countryList[0];
    loadCountryData(selectedCountry);
  }
}

// 加载国家数据
function loadCountryData(country) {
  dataInfo.country = country;
  localStorage.setItem(STORAGE_KEYS.COUNTRY, country);
  updateUI(countryArea, country);
  const typeList = Object.keys(
    originData[dataInfo.platform]?.[dataInfo.genreId]?.[country] || {}
  );
  typeArea.innerHTML = "";
  typeList.forEach((type) => {
    const button = createButton(type, () => loadTypeData(type));
    typeArea.appendChild(button);
  });
  if (typeList.length > 0) {
    const selectedType = typeList.includes(dataInfo.type) ? dataInfo.type : typeList[0];
    loadTypeData(selectedType);
  }
}

// 加载类型数据
function loadTypeData(type) {
  dataInfo.type = type;
  localStorage.setItem(STORAGE_KEYS.TYPE, type);
  updateUI(typeArea, type);
  const dataList =
    originData[dataInfo.platform]?.[dataInfo.genreId]?.[dataInfo.country]?.[
      type
    ] || [];
  dataListArea.innerHTML = "";
  dataList.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("bg-gray-200", "p-4", "rounded-md", "flex", "gap-4");
    loadItemData(div, item);
    dataListArea.appendChild(div);
  });
}

function createItem(div, json) {
  div.innerHTML = "";

  let imageUrl = json["platformAttributes.ios.artwork.url"]?.[0]?.["k"] || "";
  let name = json["name"]?.[0]?.["k"] || "";
  let subtitle = json["platformAttributes.ios.subtitle"]?.[0]?.["k"] || "";

  let shrink = document.createElement("div");
  shrink.classList.add("shrink-0");
  shrink.innerHTML = `<img class="size-12" src="${imageUrl.replace(
    "{w}x{h}{c}.{f}",
    "1024x0w.webp"
  )}" alt="Logo">`;
  div.appendChild(shrink);

  let textListDiv = document.createElement("div");
  textListDiv.innerHTML = `
  <div class="text-xl font-medium text-black">${name}</div>
  <p class="text-slate-500">${subtitle}</p>
  `;
  div.appendChild(textListDiv);
}

function loadItemData(div, item) {
  div.textContent = JSON.stringify(item);
  fetch(`${itemDirs}/${item[0]}/${item}.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((jsonData) => {
      createItem(div, jsonData);
    })
    .catch((error) => {
      console.error("Error loading date data:", error);
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
        const selectedPlatform = platformList.includes(dataInfo.platform) ? dataInfo.platform : platformList[0];
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
  button.classList.add(
    "bg-blue-600",
    "text-white",
    "px-4",
    "py-2",
    "rounded-md",
    "hover:bg-blue-700",
    "m-2"
  );
  button.addEventListener("click", clickHandler);
  return button;
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
      dateArea.innerHTML = "";
      dateList.forEach((date) => {
        const button = createButton(date, () => loadDateData(date));
        dateArea.appendChild(button);
      });
      if (dateList.length > 0) {
        const selectedDate =
          dataInfo.date in dateList
            ? dataInfo.date
            : dateList[dateList.length - 1];
        loadDateData(selectedDate);
      }
    })
    .catch((error) => {
      console.error("Error loading date list:", error);
    });
}

// 启动加载日期列表
loadDateList(`${chartsDirs}/dateList.json`);
