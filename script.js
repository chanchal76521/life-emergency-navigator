/* =====================================================
   LIFE EMERGENCY NAVIGATOR
   BILINGUAL + MAP + SERVICES + WEATHER
===================================================== */


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let currentLatitude = null;

let currentLongitude = null;

let selectedEmergency = "";

let currentFilter = "all";

let allServices = [];

let map = null;

let userMarker = null;

let serviceMarkers = [];

let currentLanguage =
    localStorage.getItem("language") || "en";



/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeMap();

        setupLanguage();

        setupDarkMode();

        setupLocation();

        setupEmergency();

        setupServices();

        setupWeather();

        setupContacts();

        setupHistory();

        updateLanguage();

    }
);



/* =====================================================
   BILINGUAL LANGUAGE
===================================================== */

function setupLanguage() {

    const button =
        document.getElementById(
            "languageBtn"
        );


    button.addEventListener(
        "click",
        function () {

            if (
                currentLanguage === "en"
            ) {

                currentLanguage = "hi";

            }

            else {

                currentLanguage = "en";

            }


            localStorage.setItem(
                "language",
                currentLanguage
            );


            updateLanguage();

        }
    );

}



function updateLanguage() {

    const elements =
        document.querySelectorAll(
            "[data-en]"
        );


    elements.forEach(
        function (element) {

            if (
                currentLanguage === "hi"
            ) {

                element.textContent =
                    element.dataset.hi;

            }

            else {

                element.textContent =
                    element.dataset.en;

            }

        }
    );


    const languageButton =
        document.getElementById(
            "languageBtn"
        );


    if (
        currentLanguage === "hi"
    ) {

        languageButton.textContent =
            "English";

    }

    else {

        languageButton.textContent =
            "हिन्दी";

    }

}



/* =====================================================
   DARK MODE
===================================================== */

function setupDarkMode() {

    const button =
        document.getElementById(
            "darkModeBtn"
        );


    const saved =
        localStorage.getItem(
            "theme"
        );


    if (saved === "dark") {

        document.body.classList.add(
            "dark"
        );

        button.textContent = "☀️";

    }


    button.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "dark"
            );


            if (
                document.body.classList.contains(
                    "dark"
                )
            ) {

                localStorage.setItem(
                    "theme",
                    "dark"
                );

                button.textContent =
                    "☀️";

            }

            else {

                localStorage.setItem(
                    "theme",
                    "light"
                );

                button.textContent =
                    "🌙";

            }

        }
    );

}



/* =====================================================
   LOCATION
===================================================== */

function setupLocation() {

    const button =
        document.getElementById(
            "locationBtn"
        );


    button.addEventListener(
        "click",
        function () {

            const text =
                document.getElementById(
                    "locationText"
                );


            text.textContent =
                currentLanguage === "hi"
                    ? "लोकेशन पता की जा रही है..."
                    : "Detecting location...";


            getUserLocation(

                function (
                    latitude,
                    longitude
                ) {

                    currentLatitude =
                        latitude;

                    currentLongitude =
                        longitude;


                    text.textContent =
                        latitude.toFixed(5)
                        +
                        ", "
                        +
                        longitude.toFixed(5);


                    updateMapLocation(
                        latitude,
                        longitude
                    );


                    loadWeather(
                        latitude,
                        longitude
                    );

                },


                function (error) {

                    text.textContent =
                        error;

                }

            );

        }
    );

}



/* =====================================================
   GEOLOCATION API
===================================================== */

function getUserLocation(
    success,
    error
) {

    if (
        !navigator.geolocation
    ) {

        error(
            "Geolocation supported nahi hai."
        );

        return;

    }


    navigator.geolocation.getCurrentPosition(

        function (position) {

            success(

                position.coords.latitude,

                position.coords.longitude

            );

        },


        function (err) {

            if (
                err.code === 1
            ) {

                error(
                    currentLanguage === "hi"
                        ? "Location permission denied. Browser me Allow karein."
                        : "Location permission denied. Please allow location access."
                );

            }

            else if (
                err.code === 2
            ) {

                error(
                    currentLanguage === "hi"
                        ? "Location available nahi hai."
                        : "Location is unavailable."
                );

            }

            else {

                error(
                    currentLanguage === "hi"
                        ? "Location detect nahi ho paayi."
                        : "Could not detect your location."
                );

            }

        },


        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 30000

        }

    );

}



/* =====================================================
   MAP INITIALIZATION
===================================================== */

function initializeMap() {

    map =
        L.map("map").setView(

            [
                22.9734,
                78.6569
            ],

            5

        );


    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }

    ).addTo(map);

}



/* =====================================================
   UPDATE MAP
===================================================== */

function updateMapLocation(
    latitude,
    longitude
) {

    map.setView(

        [
            latitude,
            longitude
        ],

        14

    );


    if (userMarker) {

        map.removeLayer(
            userMarker
        );

    }


    userMarker =
        L.marker(
            [
                latitude,
                longitude
            ]
        )
        .addTo(map)
        .bindPopup(
            "📍 Your Location"
        )
        .openPopup();

}



/* =====================================================
   EMERGENCY
===================================================== */

function setupEmergency() {

    const buttons =
        document.querySelectorAll(
            ".emergency-type"
        );


    const panel =
        document.getElementById(
            "emergencyPanel"
        );


    const selected =
        document.getElementById(
            "selectedEmergency"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    selectedEmergency =
                        button.dataset.type;


                    selected.textContent =
                        currentLanguage === "hi"
                            ? "चयनित: "
                                + selectedEmergency
                            : "Selected: "
                                + selectedEmergency;


                    panel.classList.remove(
                        "hidden"
                    );

                }
            );

        }
    );


    document
        .getElementById(
            "saveEmergencyBtn"
        )
        .addEventListener(
            "click",
            saveEmergency
        );

}



function saveEmergency() {

    if (!selectedEmergency) {

        alert(
            currentLanguage === "hi"
                ? "पहले इमरजेंसी प्रकार चुनें।"
                : "Please select an emergency type."
        );

        return;

    }


    const details =
        document.getElementById(
            "emergencyDetails"
        ).value;


    const record = {

        id: Date.now(),

        type:
            selectedEmergency,

        details:
            details ||
            "No details provided.",

        latitude:
            currentLatitude,

        longitude:
            currentLongitude,

        date:
            new Date().toLocaleString()

    };


    const history =
        JSON.parse(
            localStorage.getItem(
                "emergencyHistory"
            )
        ) || [];


    history.unshift(
        record
    );


    localStorage.setItem(

        "emergencyHistory",

        JSON.stringify(
            history.slice(0, 50)
        )

    );


    alert(
        currentLanguage === "hi"
            ? "इमरजेंसी रिकॉर्ड सेव हो गया।"
            : "Emergency record saved."
    );


    document.getElementById(
        "emergencyDetails"
    ).value = "";


    loadHistory();

}



/* =====================================================
   SERVICES
===================================================== */

function setupServices() {

    document
        .getElementById(
            "findServicesBtn"
        )
        .addEventListener(
            "click",
            findNearbyServices
        );


    document
        .getElementById(
            "serviceSearch"
        )
        .addEventListener(
            "input",
            displayServices
        );


    document
        .querySelectorAll(
            ".filter"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        document
                            .querySelectorAll(
                                ".filter"
                            )
                            .forEach(
                                function (item) {

                                    item.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        button.classList.add(
                            "active"
                        );


                        currentFilter =
                            button.dataset.filter;


                        displayServices();

                    }
                );

            }
        );

}



/* =====================================================
   FIND NEARBY SERVICES
===================================================== */

function findNearbyServices() {

    const status =
        document.getElementById(
            "serviceStatus"
        );


    status.textContent =
        currentLanguage === "hi"
            ? "लोकेशन पता की जा रही है..."
            : "Detecting location...";


    getUserLocation(

        function (
            latitude,
            longitude
        ) {

            currentLatitude =
                latitude;

            currentLongitude =
                longitude;


            updateMapLocation(
                latitude,
                longitude
            );


            getNearbyServices(
                latitude,
                longitude
            );

        },


        function (error) {

            status.textContent =
                error;

        }

    );

}



/* =====================================================
   OVERPASS API
===================================================== */

async function getNearbyServices(
    latitude,
    longitude
) {

    const status =
        document.getElementById(
            "serviceStatus"
        );


    status.textContent =
        currentLanguage === "hi"
            ? "नजदीकी सेवाएं खोजी जा रही हैं..."
            : "Searching nearby services...";


    const query = `

        [out:json][timeout:25];

        (

            nwr[
                "amenity"="hospital"
            ](
                around:5000,
                ${latitude},
                ${longitude}
            );

            nwr[
                "amenity"="police"
            ](
                around:5000,
                ${latitude},
                ${longitude}
            );

            nwr[
                "amenity"="fire_station"
            ](
                around:5000,
                ${latitude},
                ${longitude}
            );

            nwr[
                "amenity"="pharmacy"
            ](
                around:5000,
                ${latitude},
                ${longitude}
            );

        );

        out center tags;

    `;


    const endpoints = [

        "https://overpass-api.de/api/interpreter",

        "https://overpass.kumi.systems/api/interpreter"

    ];


    let data = null;


    for (
        const endpoint of endpoints
    ) {

        try {

            const response =
                await fetch(
                    endpoint,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/x-www-form-urlencoded"

                        },

                        body:
                            "data=" +
                            encodeURIComponent(
                                query
                            )

                    }
                );


            if (!response.ok) {

                throw new Error(
                    "API failed"
                );

            }


            data =
                await response.json();


            break;

        }

        catch (error) {

            console.log(
                "Trying next endpoint..."
            );

        }

    }


    if (!data) {

        status.textContent =
            currentLanguage === "hi"
                ? "Service API connect nahi ho paayi."
                : "Could not connect to services API.";

        return;

    }


    allServices =
        data.elements
        .map(
            function (item) {

                const tags =
                    item.tags || {};


                const latitude =
                    item.lat ??
                    item.center?.lat;


                const longitude =
                    item.lon ??
                    item.center?.lon;


                const type =
                    tags.amenity;


                let icon = "📍";


                if (
                    type === "hospital"
                ) {

                    icon = "🏥";

                }

                if (
                    type === "police"
                ) {

                    icon = "👮";

                }

                if (
                    type === "fire_station"
                ) {

                    icon = "🔥";

                }

                if (
                    type === "pharmacy"
                ) {

                    icon = "💊";

                }


                return {

                    name:
                        tags.name ||
                        (
                            type ===
                            "hospital"
                                ? "Hospital"
                                : type ===
                                  "police"
                                    ? "Police Station"
                                    : type ===
                                      "fire_station"
                                        ? "Fire Station"
                                        : "Pharmacy"
                        ),

                    type:
                        type,

                    icon:
                        icon,

                    latitude:
                        latitude,

                    longitude:
                        longitude

                };

            }
        )
        .filter(
            service =>
                Number.isFinite(
                    service.latitude
                ) &&
                Number.isFinite(
                    service.longitude
                )
        );


    status.textContent =
        currentLanguage === "hi"
            ? allServices.length +
              " नजदीकी सेवाएं मिलीं।"
            : allServices.length +
              " nearby services found.";


    displayServices();

}



/* =====================================================
   DISPLAY SERVICES
===================================================== */

function displayServices() {

    const list =
        document.getElementById(
            "serviceList"
        );


    const searchValue =
        document
            .getElementById(
                "serviceSearch"
            )
            .value
            .trim()
            .toLowerCase();


    let filtered =
        allServices.filter(

            function (service) {

                const filterMatch =
                    currentFilter ===
                    "all" ||
                    service.type ===
                    currentFilter;


                const searchMatch =
                    !searchValue ||

                    service.name
                        .toLowerCase()
                        .includes(
                            searchValue
                        );


                return (
                    filterMatch &&
                    searchMatch
                );

            }

        );


    list.innerHTML = "";


    serviceMarkers.forEach(
        function (marker) {

            map.removeLayer(
                marker
            );

        }
    );


    serviceMarkers = [];


    if (!filtered.length) {

        list.innerHTML = `

            <div class="service-card">

                <h3>
                    ${currentLanguage === "hi"
                        ? "कोई service नहीं मिली"
                        : "No services found"}
                </h3>

                <p>
                    ${currentLanguage === "hi"
                        ? "Search या filter बदलकर देखें।"
                        : "Try another search or filter."}
                </p>

            </div>

        `;

        return;

    }


    filtered.forEach(

        function (
            service,
            index
        ) {


            const marker =
                L.marker(

                    [
                        service.latitude,
                        service.longitude
                    ]

                )
                .addTo(map);


            marker.bindPopup(`

                <strong>
                    ${service.icon}
                    ${escapeHTML(
                        service.name
                    )}
                </strong>

                <br>

                ${service.type}

            `);


            serviceMarkers.push(
                marker
            );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "service-card";


            card.innerHTML = `

                <h3>

                    ${service.icon}

                    ${escapeHTML(
                        service.name
                    )}

                </h3>


                <p>

                    ${service.type}

                </p>


                <div
                    class="service-actions"
                >

                    <button

                        class="small-btn show-btn"

                        data-index="${index}"

                    >

                        📍 Show

                    </button>


                    <a

                        class="small-btn direction-btn"

                        target="_blank"

                        href="https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}"

                    >

                        🧭 Directions

                    </a>

                </div>

            `;


            list.appendChild(
                card
            );

        }
    );


    document
        .querySelectorAll(
            ".show-btn"
        )
        .forEach(

            function (button) {

                button.addEventListener(

                    "click",

                    function () {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        const service =
                            filtered[
                                index
                            ];


                        map.setView(

                            [
                                service.latitude,
                                service.longitude
                            ],

                            16

                        );


                        serviceMarkers[
                            index
                        ].openPopup();

                    }

                );

            }

        );

}



/* =====================================================
   WEATHER
===================================================== */

function setupWeather() {

    document
        .getElementById(
            "weatherBtn"
        )
        .addEventListener(
            "click",
            function () {

                if (
                    currentLatitude === null
                ) {

                    getUserLocation(

                        function (
                            latitude,
                            longitude
                        ) {

                            currentLatitude =
                                latitude;

                            currentLongitude =
                                longitude;


                            updateMapLocation(
                                latitude,
                                longitude
                            );


                            loadWeather(
                                latitude,
                                longitude
                            );

                        },

                        function (error) {

                            alert(error);

                        }

                    );

                }

                else {

                    loadWeather(
                        currentLatitude,
                        currentLongitude
                    );

                }

            }
        );

}



/* =====================================================
   OPEN-METEO WEATHER API
===================================================== */

async function loadWeather(
    latitude,
    longitude
) {

    const current =
        document.getElementById(
            "currentWeather"
        );


    current.innerHTML = `

        <div class="empty">

            🌤️

            <p>

                ${currentLanguage === "hi"
                    ? "मौसम लोड हो रहा है..."
                    : "Loading weather..."}

            </p>

        </div>

    `;


    const url =

        "https://api.open-meteo.com/v1/forecast"

        +

        "?latitude=" +
        latitude

        +

        "&longitude=" +
        longitude

        +

        "&current=" +

        "temperature_2m," +

        "relative_humidity_2m," +

        "apparent_temperature," +

        "precipitation," +

        "weather_code," +

        "wind_speed_10m"

        +

        "&hourly=" +

        "precipitation_probability," +

        "rain," +

        "wind_speed_10m," +

        "temperature_2m"

        +

        "&daily=" +

        "weather_code," +

        "temperature_2m_max," +

        "temperature_2m_min," +

        "precipitation_probability_max"

        +

        "&forecast_days=3"

        +

        "&timezone=auto";


    try {

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Weather API failed"
            );

        }


        const data =
            await response.json();


        displayCurrentWeather(
            data
        );


        displayForecast(
            data
        );


        createWeatherAlerts(
            data
        );

    }


    catch (error) {

        current.innerHTML = `

            <div class="empty">

                ❌

                <p>

                    ${currentLanguage === "hi"
                        ? "Weather data load nahi ho saka."
                        : "Could not load weather data."}

                </p>

            </div>

        `;

    }

}



/* =====================================================
   WEATHER DESCRIPTION
===================================================== */

function getWeatherInfo(
    code
) {

    const weather = {

        0:
            ["☀️", "Clear Sky"],

        1:
            ["🌤️", "Mainly Clear"],

        2:
            ["⛅", "Partly Cloudy"],

        3:
            ["☁️", "Cloudy"],

        45:
            ["🌫️", "Fog"],

        48:
            ["🌫️", "Depositing Fog"],

        51:
            ["🌦️", "Light Drizzle"],

        53:
            ["🌦️", "Drizzle"],

        55:
            ["🌧️", "Heavy Drizzle"],

        61:
            ["🌧️", "Light Rain"],

        63:
            ["🌧️", "Rain"],

        65:
            ["🌧️", "Heavy Rain"],

        71:
            ["🌨️", "Light Snow"],

        73:
            ["🌨️", "Snow"],

        75:
            ["❄️", "Heavy Snow"],

        80:
            ["🌦️", "Rain Showers"],

        81:
            ["🌧️", "Rain Showers"],

        82:
            ["⛈️", "Heavy Rain Showers"],

        95:
            ["⛈️", "Thunderstorm"],

        96:
            ["⛈️", "Thunderstorm + Hail"],

        99:
            ["⛈️", "Severe Thunderstorm"]

    };


    return (
        weather[code] ||
        ["🌤️", "Unknown"]
    );

}



/* =====================================================
   CURRENT WEATHER
===================================================== */

function displayCurrentWeather(
    data
) {

    const current =
        document.getElementById(
            "currentWeather"
        );


    const weather =
        getWeatherInfo(
            data.current.weather_code
        );


    current.innerHTML = `

        <div class="weather-main">

            <div class="weather-icon">

                ${weather[0]}

            </div>


            <div>

                <div class="temperature">

                    ${Math.round(
                        data.current.temperature_2m
                    )}°C

                </div>


                <strong>

                    ${
                        currentLanguage === "hi"
                            ? translateWeather(
                                weather[1]
                              )
                            : weather[1]
                    }

                </strong>

            </div>

        </div>


        <div class="weather-meta">

            <div class="weather-stat">

                <strong>

                    ${Math.round(
                        data.current.apparent_temperature
                    )}°C

                </strong>

                <span>

                    ${currentLanguage === "hi"
                        ? "महसूस होने वाला तापमान"
                        : "Feels Like"}

                </span>

            </div>


            <div class="weather-stat">

                <strong>

                    ${data.current.relative_humidity_2m}%

                </strong>

                <span>

                    ${currentLanguage === "hi"
                        ? "नमी"
                        : "Humidity"}

                </span>

            </div>


            <div class="weather-stat">

                <strong>

                    ${Math.round(
                        data.current.wind_speed_10m
                    )} km/h

                </strong>

                <span>

                    ${currentLanguage === "hi"
                        ? "हवा"
                        : "Wind"}

                </span>

            </div>

        </div>

    `;

}



/* =====================================================
   WEATHER TRANSLATION
===================================================== */

function translateWeather(
    text
) {

    const translations = {

        "Clear Sky":
            "साफ आसमान",

        "Mainly Clear":
            "मुख्य रूप से साफ",

        "Partly Cloudy":
            "आंशिक बादल",

        "Cloudy":
            "बादल",

        "Fog":
            "कोहरा",

        "Light Drizzle":
            "हल्की बूंदाबांदी",

        "Drizzle":
            "बूंदाबांदी",

        "Heavy Drizzle":
            "तेज बूंदाबांदी",

        "Light Rain":
            "हल्की बारिश",

        "Rain":
            "बारिश",

        "Heavy Rain":
            "तेज बारिश",

        "Rain Showers":
            "बारिश की बौछार",

        "Heavy Rain Showers":
            "तेज बारिश की बौछार",

        "Thunderstorm":
            "आंधी-तूफान",

        "Severe Thunderstorm":
            "तेज आंधी-तूफान"

    };


    return (
        translations[text] ||
        text
    );

}



/* =====================================================
   3 DAY FORECAST
===================================================== */

function displayForecast(
    data
) {

    const container =
        document.getElementById(
            "forecast"
        );


    container.innerHTML = "";


    data.daily.time.forEach(

        function (
            date,
            index
        ) {

            const weather =
                getWeatherInfo(
                    data.daily.weather_code[
                        index
                    ]
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "forecast-card";


            const day =
                new Date(
                    date
                ).toLocaleDateString(
                    currentLanguage === "hi"
                        ? "hi-IN"
                        : "en-IN",
                    {
                        weekday:
                            "short",
                        day:
                            "numeric",
                        month:
                            "short"
                    }
                );


            card.innerHTML = `

                <strong>

                    ${day}

                </strong>


                <div class="icon">

                    ${weather[0]}

                </div>


                <div class="forecast-temp">

                    ${Math.round(
                        data.daily.temperature_2m_max[
                            index
                        ]
                    )}°

                    /

                    ${Math.round(
                        data.daily.temperature_2m_min[
                            index
                        ]
                    )}°

                </div>


                <p>

                    ${
                        currentLanguage === "hi"
                            ? translateWeather(
                                weather[1]
                              )
                            : weather[1]
                    }

                </p>


                <small>

                    🌧️

                    ${
                        data.daily
                            .precipitation_probability_max[
                                index
                            ]
                    }%

                </small>

            `;


            container.appendChild(
                card
            );

        }

    );

}



/* =====================================================
   WEATHER / RISK ALERTS
===================================================== */

function createWeatherAlerts(
    data
) {

    const container =
        document.getElementById(
            "alertBox"
        );


    container.innerHTML = "";


    const alerts = [];


    const code =
        data.current.weather_code;


    const wind =
        data.current.wind_speed_10m;


    const rain =
        data.daily
            .precipitation_probability_max[0];


    const temperature =
        data.current.temperature_2m;


    /* THUNDERSTORM */

    if (
        code >= 95
    ) {

        alerts.push({

            type:
                "danger",

            icon:
                "⛈️",

            en:
                "Thunderstorm conditions detected. Stay indoors if possible.",

            hi:
                "आंधी-तूफान की स्थिति है। संभव हो तो घर के अंदर रहें।"

        });

    }


    /* HEAVY RAIN */

    else if (
        code === 65 ||
        code === 82 ||
        rain >= 70
    ) {

        alerts.push({

            type:
                "warning",

            icon:
                "🌧️",

            en:
                "High rain risk. Be careful near flooded or low-lying areas.",

            hi:
                "बारिश का जोखिम अधिक है। बाढ़ वाले या निचले इलाकों से सावधान रहें।"

        });

    }


    /* STRONG WIND */

    if (
        wind >= 50
    ) {

        alerts.push({

            type:
                "danger",

            icon:
                "💨",

            en:
                "Strong wind risk detected. Avoid unsafe outdoor areas.",

            hi:
                "तेज हवा का जोखिम है। असुरक्षित खुले क्षेत्रों से बचें।"

        });

    }


    /* HIGH TEMPERATURE */

    if (
        temperature >= 40
    ) {

        alerts.push({

            type:
                "warning",

            icon:
                "🌡️",

            en:
                "High temperature detected. Stay hydrated and avoid prolonged heat exposure.",

            hi:
                "तापमान बहुत अधिक है। पानी पिएं और लंबे समय तक गर्मी में रहने से बचें।"

        });

    }


    /* NO RISK */

    if (
        alerts.length === 0
    ) {

        alerts.push({

            type:
                "info",

            icon:
                "✅",

            en:
                "No automatic weather risk rule was triggered for the current conditions.",

            hi:
                "वर्तमान मौसम के आधार पर कोई automatic risk rule trigger नहीं हुआ।"

        });

    }


    alerts.forEach(

        function (alert) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "alert " +
                alert.type;


            div.innerHTML = `

                <strong>

                    ${alert.icon}

                    ${
                        currentLanguage === "hi"
                            ? alert.hi
                            : alert.en
                    }

                </strong>

            `;


            container.appendChild(
                div
            );

        }

    );

}



/* =====================================================
   CONTACTS
===================================================== */

function setupContacts() {

    document
        .getElementById(
            "addContactBtn"
        )
        .addEventListener(
            "click",
            addContact
        );


    displayContacts();

}



function addContact() {

    const name =
        document
            .getElementById(
                "contactName"
            )
            .value
            .trim();


    const relation =
        document
            .getElementById(
                "contactRelation"
            )
            .value
            .trim();


    const phone =
        document
            .getElementById(
                "contactPhone"
            )
            .value
            .trim();


    if (
        !name ||
        !phone
    ) {

        alert(
            currentLanguage === "hi"
                ? "Name और phone number जरूरी है।"
                : "Name and phone number are required."
        );

        return;

    }


    const contacts =
        JSON.parse(
            localStorage.getItem(
                "emergencyContacts"
            )
        ) || [];


    contacts.push({

        id:
            Date.now(),

        name:
            name,

        relation:
            relation ||
            "Trusted Contact",

        phone:
            phone

    });


    localStorage.setItem(

        "emergencyContacts",

        JSON.stringify(
            contacts
        )

    );


    document.getElementById(
        "contactName"
    ).value = "";


    document.getElementById(
        "contactRelation"
    ).value = "";


    document.getElementById(
        "contactPhone"
    ).value = "";


    displayContacts();

}



function displayContacts() {

    const list =
        document.getElementById(
            "contactList"
        );


    const contacts =
        JSON.parse(
            localStorage.getItem(
                "emergencyContacts"
            )
        ) || [];


    list.innerHTML = "";


    if (
        contacts.length === 0
    ) {

        list.innerHTML = `

            <div class="contact-card">

                <p>

                    ${
                        currentLanguage === "hi"
                            ? "अभी कोई contact save नहीं है।"
                            : "No contacts saved yet."
                    }

                </p>

            </div>

        `;

        return;

    }


    contacts.forEach(

        function (contact) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "contact-card";


            card.innerHTML = `

                <div class="avatar">

                    ${escapeHTML(
                        contact.name
                            .charAt(0)
                            .toUpperCase()
                    )}

                </div>


                <div class="contact-info">

                    <strong>

                        ${escapeHTML(
                            contact.name
                        )}

                    </strong>


                    <p>

                        ${escapeHTML(
                            contact.relation
                        )}

                        •

                        ${escapeHTML(
                            contact.phone
                        )}

                    </p>

                </div>


                <a

                    class="small-btn direction-btn"

                    href="tel:${encodeURIComponent(
                        contact.phone
                    )}"

                >

                    📞

                </a>


                <button

                    class="small-btn"

                    onclick="
                        deleteContact(${contact.id})
                    "

                >

                    🗑️

                </button>

            `;


            list.appendChild(
                card
            );

        }

    );

}



function deleteContact(
    id
) {

    let contacts =
        JSON.parse(
            localStorage.getItem(
                "emergencyContacts"
            )
        ) || [];


    contacts =
        contacts.filter(

            contact =>
                contact.id !== id

        );


    localStorage.setItem(

        "emergencyContacts",

        JSON.stringify(
            contacts
        )

    );


    displayContacts();

}



/* =====================================================
   HISTORY
===================================================== */

function setupHistory() {

    document
        .getElementById(
            "clearHistoryBtn"
        )
        .addEventListener(

            "click",

            function () {

                if (
                    confirm(
                        currentLanguage === "hi"
                            ? "क्या पूरी history delete करें?"
                            : "Clear complete history?"
                    )
                ) {

                    localStorage.removeItem(
                        "emergencyHistory"
                    );


                    loadHistory();

                }

            }

        );


    loadHistory();

}



function loadHistory() {

    const list =
        document.getElementById(
            "historyList"
        );


    const history =
        JSON.parse(
            localStorage.getItem(
                "emergencyHistory"
            )
        ) || [];


    list.innerHTML = "";


    if (
        history.length === 0
    ) {

        list.innerHTML = `

            <div class="history-card">

                <h3>

                    ${
                        currentLanguage === "hi"
                            ? "कोई history नहीं"
                            : "No history"
                    }

                </h3>


                <p>

                    ${
                        currentLanguage === "hi"
                            ? "अभी कोई emergency record save नहीं हुआ।"
                            : "No emergency record has been saved."
                    }

                </p>

            </div>

        `;

        return;

    }


    history.forEach(

        function (item) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "history-card";


            let location =
                "Not available";


            if (
                item.latitude !== null &&
                item.longitude !== null
            ) {

                location =
                    item.latitude.toFixed(5)
                    +
                    ", "
                    +
                    item.longitude.toFixed(5);

            }


            card.innerHTML = `

                <h3>

                    🚨

                    ${escapeHTML(
                        item.type
                    )}

                </h3>


                <p>

                    <strong>
                        Details:
                    </strong>

                    ${escapeHTML(
                        item.details
                    )}

                </p>


                <p>

                    📍
                    ${location}

                </p>


                <p>

                    🕒
                    ${escapeHTML(
                        item.date
                    )}

                </p>

            `;


            list.appendChild(
                card
            );

        }

    );

}



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    text
) {

    return String(text)

        .replace(
            /[&<>"']/g,

            function (character) {

                const entities = {

                    "&":
                        "&amp;",

                    "<":
                        "&lt;",

                    ">":
                        "&gt;",

                    '"':
                        "&quot;",

                    "'":
                        "&#039;"

                };


                return entities[
                    character
                ];

            }

        );

}