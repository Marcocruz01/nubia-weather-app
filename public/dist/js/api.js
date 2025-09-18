document.addEventListener('DOMContentLoaded', () => {
    geolocalizacion();
});

// Variable global con la APIKey del clima de nuestro proyecto
const apiKey = "19fd8a3d47d7d26de5374ecaed11f53d";
let calidadAire;

// Nueva función para actualizar el clima por coordenadas
async function actualizarClimaPorCoords(lat, lon) {
    // Loader
    const loader = document.createElement('DIV');
    loader.className = 'fixed bg-white dark:bg-zinc-900 inset-0 flex justify-center items-center z-10 transition-opacity duration-200 ease-in-out';
    loader.id = 'loader';
    loader.innerHTML = `
        <div class="w-14 h-14 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
    `;
    document.getElementById('contenedor-principal').appendChild(loader);

    // Llamar a la API del clima con las coordenadas obtenidas
    const urlClima = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
    const urlPronostico = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
    const urlCalidadAire = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

    try {
        // Fetch en paralelo 
        const [climaResponse, pronosticoResponse, calidadAireResponse] = await Promise.all([
            fetch(urlClima),
            fetch(urlPronostico),
            fetch(urlCalidadAire),
        ]);

        // Validar respuestas
        const climaData = await climaResponse.json();
        const pronosticoData = await pronosticoResponse.json();
        const calidadAireData = await calidadAireResponse.json();

        // Validaciones de errores en las respuestas
        if(climaData.cod === '404' || pronosticoData.cod === '404' || calidadAireData.cod === '404') {
            mensajeToast('Algo salió mal', 'No pudimos obtener los datos del clima o pronóstico.');
            return;
        }

        // Mostrar el clima actual en el DOM
        calidadAire = calidadAireData;    
        climaActual(climaData);
        pronosticoDias(pronosticoData);
        mensajeToast('Ubicación encontrada', 'Se muestran los datos de la ciudad elegida.');
    } catch (error) {
        mensajeToast('Error', `No pudimos obtener los datos. <br> ${error}`);
    } finally {
        loader.classList.add('opacity-0');
        setTimeout(() => loader.remove(), 200);
    }
}

// Funcion para activar la geolocalización con las coordenadas del usuario
async function geolocalizacion() {
    // Loader
    const loader = document.createElement('DIV');
    loader.className = 'fixed bg-white dark:bg-zinc-900 inset-0 flex justify-center items-center z-10 transition-opacity duration-200 ease-in-out';
    loader.id = 'loader';
    loader.innerHTML = `
        <div class="w-14 h-14 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
    `;
    document.getElementById('contenedor-principal').appendChild(loader);

    // Geolocalización
    if (!('geolocation' in navigator)) {
        mensajeToast('Error', 'La geolocalización no está disponible en tu navegador.');
        loader.remove();
        return;
    }

    // Obtener la ubicación actual del usuario 
    navigator.geolocation.getCurrentPosition(async posicion => {
        const lat = posicion.coords.latitude;
        const lon = posicion.coords.longitude;
        // Llamar a la API del clima con las coordenadas obtenidas
        const urlClima = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
        const urlPronostico = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
        const urlCalidadAire = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

        // Fetch a la API del clima
        try {
            // Fetch en paralelo 
            const [climaResponse, pronosticoResponse, calidadAireResponse] = await Promise.all([
                fetch(urlClima),
                fetch(urlPronostico),
                fetch(urlCalidadAire),
            ]);

            // Validar respuestas
            const climaData = await climaResponse.json();
            const pronosticoData = await pronosticoResponse.json();
            const calidadAireData = await calidadAireResponse.json();

            // Validaciones de errores en las respuestas
            if(climaData.cod === '404' || pronosticoData.cod === '404' || calidadAireData.cod === '404') {
                mensajeToast('Algo salió mal', 'No pudimos obtener los datos del clima o pronóstico.');
                return;
            }

            // Mostrar el clima actual en el DOM
            calidadAire = calidadAireData;    
            climaActual(climaData);
            pronosticoDias(pronosticoData);
        } catch (error) {
            mensajeToast('Error', `No pudimos obtener los datos. <br> ${error}`);
        } finally {
            loader.classList.add('opacity-0');
            setTimeout(() => loader.remove(), 200);
        }
    });
}

// funcion que muestra el clima actual en el DOM
function climaActual(data) {
    // Limpiar el contenido previo 
    limpiarHTML('contenedor-clima');
    limpiarHTML('contenedor-informacion');
    // Destructuring de la data obtenida
    const { name, sys: { country, sunrise, sunset }, main: { temp, feels_like, humidity, pressure }, weather: [ { description, icon } ], wind: { speed }, visibility } = data;
    // Destructuring de la data obtenida de calidad aire 
    let pm2_5 = "-", so2 = "-", no2 = "-", o3 = "-";
    if (calidadAire && calidadAire.list && calidadAire.list[0] && calidadAire.list[0].components) {
        pm2_5 = calidadAire.list[0].components.pm2_5 !== undefined ? calidadAire.list[0].components.pm2_5.toFixed(1) : "-";
        so2 = calidadAire.list[0].components.so2 !== undefined ? calidadAire.list[0].components.so2.toFixed(1) : "-";
        no2 = calidadAire.list[0].components.no2 !== undefined ? calidadAire.list[0].components.no2.toFixed(1) : "-";
        o3 = calidadAire.list[0].components.o3 !== undefined ? calidadAire.list[0].components.o3.toFixed(1) : "-";
    }

    // Trabajamos las variables necesarias
    const temperatura = Math.round(temp);
    const sensacionTermica = feels_like.toFixed(1);
    const visibilidad = (visibility / 1000).toFixed(1);
    const amanecer = unixToHour(sunrise);
    const atardecer = unixToHour(sunset);
    const descripcion = description.charAt(0).toUpperCase() + description.slice(1);

    // Obtener la fecha del dia actual
    const hoy = new Date(); // Obtencion de fecha
    const formato = { weekday: 'long', day: 'numeric', month: 'long' }; // Formatos
    const fechaFormateada = hoy.toLocaleDateString('es-ES', formato); // Formato español
    const fecha = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

    // Crear el contenedor del clima actual 
    const contenedorClima = document.createElement('DIV');
    contenedorClima.className = 'w-full h-auto flex flex-col gap-2 opacity-0 invisible cursor-pointer-none transition-all duration-300 ease';
    contenedorClima.innerHTML = 
    `
    <h2 class="text-2xl md:text-xl font-bold dark:text-white">Clima actual</h2>
    <div class="flex flex-col gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md rounded-xl transition-colors duration-300 ease p-6">
        <div class="flex flex-col border-b border-gray-200 dark:border-zinc-700 pb-4 transition-colors duration-300 ease">
            <h3 class="text-blue-600 dark:text-blue-500 animate-pulse font-semibold text-xs lg:text-sm transition-colors duration-300 ease">Justo ahora</h3>
            <div class="flex items-center justify-center">
                <h4 id="grados" class="text-7xl md:text-4xl lg:text-5xl font-bold dark:text-white transition-colors duration-300 ease">${temperatura}°C</h4>
                <img src="https://openweathermap.org/img/wn/${icon}@4x.png" class="w-40 h-40 md:w-20 md:h-20 lg:w-32 lg:h-32" alt="${description}">
            </div>
            <p class="text-xs lg:text-base text-gray-800 font-medium dark:text-zinc-300 transition-colors duration-300 ease">${descripcion}</p>
        </div>
        <div class="flex flex-col gap-2 mt-4">
            <p class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-red-600 dark:text-red-500 transition-colors duration-200 ease-in-out">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span class="text-sm dark:text-white  font-bold transition-colors duration-300 ease">${name}, ${country}</span>
            </p>
            <p class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="lg:size-6 md:size-5 size-6 text-gray-700 dark:text-zinc-300 transition-colors duration-300 ease">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                </svg>
                <span class="flex flex-nowrap w-full truncate overflow-hidden text-gray-700 dark:text-zinc-300 md:text-sm lg:text-base font-normal transition-colors duration-300 ease">${fecha}</span>
            </p>
        </div>
    </div>
    `;
    // Insertamos todo en el contenedor 
    document.getElementById('contenedor-clima').appendChild(contenedorClima);

    // Crear el contenedor del pronostico
    const contenedorPronostico = document.createElement('DIV');
    contenedorPronostico.className = 'w-full h-full flex flex-col gap-3 opacity-0 invisible cursor-pointer-none transition-all duration-300 ease';
    contenedorPronostico.innerHTML =
    `
    <!-- Titulo del contenedor -->
    <div class="flex items-center gap-2 md:flex-col lg:flex-row lg:items-center md:items-start lg:gap-2 md:gap-0">
        <h3 class="font-bold text-base dark:text-zinc-200">Pronóstico por 5 días</h3>
        <span class="text-sm text-gray-500 dark:text-zinc-400 font-normal">(Al medio día)</span>
    </div>
    <!-- Contenedor hijo -->
    <ul id="pronostico-dias" class="flex flex-col gap-4"></ul>
    `;
    // Insertat todo en el contenedor
    document.getElementById('contenedor-clima').appendChild(contenedorPronostico);

    // Creación del contenedor resumen 
    const contenedorResumen = document.createElement('DIV');
    contenedorResumen.className = 'w-full h-full flex flex-col opacity-0 invisible gap-2 cursor-pointer-none transition-all duration-300 ease';
    contenedorResumen.innerHTML = 
    `
    <h1 class="text-xl font-bold dark:text-white m-0">Resumen actual</h1>
    <div class="w-full grid grid-cols-1 lg:grid-cols-2 gap-3">
        <!-- Contenedor uno -->
        <div class="grid grid-cols-2 gap-3">
            <!-- Contenedor de calidad de aire -->
            <div class="h-48 w-full flex flex-col justify-between bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md rounded-xl transition-colors duration-300 ease p-6 col-span-2">
                <!-- Header del contenedor -->
                <div class="flex items-center justify-between gap-2">
                    <p class="text-gray-800 dark:text-zinc-300 flex items-center gap-2 transition-all duration-300 ease">
                        Calidad del aire
                        <span>
                            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" width="24" height="24" class="size-5 text-gray-800 dark:text-zinc-300 transition-all duration-300 ease" color="#000000">
                                <defs>
                                    <style>.cls-637b8b31f95e86b59c57a29e-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style>
                                </defs>
                                <path class="cls-637b8b31f95e86b59c57a29e-1" d="M13.78,7a4.11,4.11,0,1,1,4.11,4.11H1"></path>
                                <path class="cls-637b8b31f95e86b59c57a29e-1" d="M2.83,7.43H8.3A2.74,2.74,0,1,0,5.57,4.7"></path>
                                <path class="cls-637b8b31f95e86b59c57a29e-1" d="M4.65,14.74h11A3.65,3.65,0,1,1,12,18.39"></path>
                                <line class="cls-637b8b31f95e86b59c57a28a-1" x1="1.91" y1="18.39" x2="9.22" y2="18.39"></line>
                                <line class="cls-637b8b31f95e86b59c57a28a-1" x1="1" y1="14.74" x2="2.83" y2="14.74"></line>
                            </svg>
                        </span>
                    </p>
                    <span id="calidad" class="px-3 py-1 text-xs font-bold rounded-full animate-bounce transition-all duration-300 ease"></span>
                </div>
                <!-- Valores de los contaminantes-->
                <div id="contenedor-contaminantes" class="flex items-center justify-between gap-2">
                    <div class="flex flex-col items-center justify-center gap-3">
                        <span class="text-sm font-semibold text-gray-500 dark:text-zinc-500 transition-all duration-300 ease">PM2.5</span>
                        <p class="text-4xl font-bold dark:text-white transition-all duration-300 ease">${pm2_5}</p>
                    </div>
                    <div class="flex flex-col items-center justify-center gap-3">
                        <span class="text-sm font-semibold text-gray-500 dark:text-zinc-500 transition-all duration-300 ease">SO2</span>
                        <p class="text-4xl font-bold dark:text-white transition-all duration-300 ease">${so2}</p>
                    </div>
                    <div class="flex flex-col items-center justify-center gap-3">
                        <span class="text-sm font-semibold text-gray-500 dark:text-zinc-500 transition-all duration-300 ease">NO2</span>
                        <p class="text-4xl font-bold dark:text-white transition-all duration-300 ease">${no2}</p>
                    </div>
                    <div class="flex flex-col items-center justify-center gap-3">
                        <span class="text-sm font-semibold text-gray-500 dark:text-zinc-500 transition-all duration-300 ease">O3</span>
                        <p class="text-4xl font-bold dark:text-white transition-all duration-300 ease">${o3}</p>
                    </div>
                </div>
            </div>

            <!-- Contenedor de humedad -->
            <div class="h-32 w-full flex flex-col justify-between bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md rounded-xl transition-colors duration-300 ease p-6">
                <!-- Header del contenedor -->
                <div class="flex items-center justify-between gap-2">
                    <p class="w-full flex items-center justify-between gap-2 text-gray-800 dark:text-zinc-300 transition-all duration-300 ease">
                        Humedad
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-miterlimit="10">
                                <circle cx="17.72" cy="17.74" r="0.96"/>
                                <path d="M21.54 14.9V5.3a3.83 3.83 0 0 0-7.65 0v9.6a4.74 4.74 0 0 0-1 2.84 4.79 4.79 0 0 0 9.57 0 4.67 4.67 0 0 0-0.92-2.84Z"/>
                                <line x1="17.72" y1="5.3" x2="17.72" y2="16.78"/>
                                <line x1="11.98" y1="0.52" x2="11.98" y2="2.43"/>
                                <line x1="11.98" y1="21.57" x2="11.98" y2="23.48"/>
                                <line x1="2.41" y1="12" x2="0.5" y2="12"/>
                                <line x1="5.21" y1="18.76" x2="3.86" y2="20.12"/>
                                <line x1="5.21" y1="5.24" x2="3.86" y2="3.88"/>
                                <path d="M13 18.61a5.92 5.92 0 0 1-1 .09A6.7 6.7 0 0 1 12 5.3a6.63 6.63 0 0 1 1.91.28"/>
                            </svg>
                        </span>
                    </p>
                </div>
                <!-- Valore de humedad -->
                <p class="text-4xl text-center font-bold dark:text-white transition-all duration-300 ease">${humidity}<span class="text-xl font-semibold text-gray-500 dark:text-zinc-500 transition-all duration-300 ease">%</span></p>
            </div>
                        
            <!-- Contenedor de presión -->
            <div class="h-32 w-full flex flex-col justify-between bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md rounded-xl transition-colors duration-300 ease p-6">
                <!-- Header del contenedor -->
                <div class="flex items-center justify-between gap-2">
                    <p class="w-full flex items-center justify-between gap-2 text-gray-800 dark:text-zinc-300 transition-all duration-300 ease">
                        Presión
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  width="24" height="24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-miterlimit="10">
                            <path d="M0.5 14.87h11a2.39 2.39 0 1 0-2.39-2.39"/>
                            <path d="M0.5 18.7h8.61A1.91 1.91 0 1 1 7.2 20.61"/>
                            <path d="M14.85 16.78h3.35a4.31 4.31 0 0 0 0-8.61h-0.57a6 6 0 0 0 0.09-1 5.74 5.74 0 1 0-11.48 0A4.78 4.78 0 0 0 1.46 12"/>
                            </svg>
                        </span>
                    </p>
                </div>
                <!-- Valor de la presión -->
                <p class="text-4xl text-center font-bold dark:text-white transition-all duration-300 ease">${pressure}<span class="text-xl font-semibold text-gray-500 dark:text-zinc-500 transition-all duration-300 ease">hPa</span></p>
            </div>
        </div>
        <!-- Contenedor dos -->
        <div class="grid grid-cols-2 gap-3">
            <!-- Contenedor de amanecer y atardecer -->
            <div class="h-48 w-full flex flex-col justify-between bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md rounded-xl transition-colors duration-300 ease p-6 col-span-2">
                <!-- Header del contenedor -->
                <div class="flex items-center justify-between gap-2">
                    <p class="text-gray-800 dark:text-zinc-300 flex items-center gap-2 transition-all duration-300 ease">Amanecer y atardecer</p>
                </div>
                <div class="flex flex-row items-center justify-around gap-3">
                    <!-- Amanecer -->
                    <div class="flex items-center gap-4">
                        <span>
                            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" width="24" height="24" class="size-10 text-amber-500 dark:text-amber-600 animate-pulse" color="#000000">
                                <defs>
                                    <style>.cls-637b8b31f95e86b59c57a2a1-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style>
                                </defs>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="12" y1="0.5" x2="12" y2="2.42"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="12" y1="21.58" x2="12" y2="23.5"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="23.5" y1="12" x2="21.58" y2="12"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="2.42" y1="12" x2="0.5" y2="12"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="12" y1="0.5" x2="12" y2="2.42"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="12" y1="21.58" x2="12" y2="23.5"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="23.5" y1="12" x2="21.58" y2="12"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="2.42" y1="12" x2="0.5" y2="12"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="20.13" y1="3.87" x2="18.78" y2="5.22"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="5.22" y1="18.78" x2="3.87" y2="20.13"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="20.13" y1="20.13" x2="18.78" y2="18.78"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="5.22" y1="5.22" x2="3.87" y2="3.87"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="20.13" y1="3.87" x2="18.78" y2="5.22"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="5.22" y1="18.78" x2="3.87" y2="20.13"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="20.13" y1="20.13" x2="18.78" y2="18.78"></line>
                                <line class="cls-637b8b31f95e86b59c57a2a1-1" x1="5.22" y1="5.22" x2="3.87" y2="3.87"></line>
                                <circle class="cls-637b8b31f95e86b59c57a2a1-1" cx="12" cy="12" r="6.71"></circle>
                            </svg>
                        </span>
                        <div class="flex flex-col gap-3">
                            <span class="text-sm font-semibold text-gray-500 dark:text-zinc-500 transition-all duration-300 ease">Amanecer</span>
                            <p class="text-4xl font-bold dark:text-white transition-all duration-300 ease">${amanecer}</p>
                        </div>
                    </div>
                    <!-- Atardecer -->
                    <div class="flex items-center gap-4">
                        <span>
                            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" width="24" height="24" class="size-8 text-purple-500 dark:text-purple-600 animate-pulse" color="#000000">
                                <defs>
                                    <style>.cls-637b8b31f95e86b59c57a285-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style>
                                </defs>
                                <path class="cls-637b8b31f95e86b59c57a285-1" d="M21.46,16.54A10.51,10.51,0,1,1,12,1.49a10.34,10.34,0,0,1,2.8.38,8.12,8.12,0,0,0,2.45,15.86A8,8,0,0,0,21.46,16.54Z"></path>
                            </svg>
                        </span>
                        <div class="flex flex-col gap-3">
                            <span class="text-sm font-semibold text-gray-500 dark:text-zinc-500 transition-all duration-300 ease">Atardecer</span>
                            <p class="text-4xl font-bold dark:text-white transition-all duration-300 ease">${atardecer}</p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Contenedor de visibilidad -->
            <div class="h-32 w-full flex flex-col justify-between bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md rounded-xl transition-colors duration-300 ease p-6">
                <!-- Header del contenedor -->
                <div class="flex items-center justify-between gap-2">
                    <p class="w-full flex items-center justify-between gap-2 text-gray-800 dark:text-zinc-300 transition-all duration-300 ease">
                        Visibilidad
                         <span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor"  stroke-width="1.5" fill="none" stroke-miterlimit="10">
                                <line x1="1.5" y1="0.55" x2="1.5" y2="23.45"/>
                                <polygon points="22.5 12.96 8.18 14.86 7.23 14.86 7.23 3.41 8.18 3.41 22.5 5.32 22.5 12.96"/>                                        
                                <line x1="18.68" y1="5.32" x2="18.68" y2="12.95"/>
                                <line x1="14.86" y1="4.36" x2="14.86" y2="13.91"/>
                                <line x1="11.05" y1="4.36" x2="11.05" y2="13.91"/>                                        
                                <polyline points="7.23 3.41 2.46 9.14 7.23 14.86"/>
                            </svg>
                        </span>
                    </p>
                </div>
                <!-- Valor de la visibilidad -->
                <p class="text-4xl text-center font-bold dark:text-white transition-all duration-300 ease">${visibilidad}<span class="text-xl font-semibold text-gray-500 dark:text-zinc-500 transition-all duration-300 ease">km</span></p>
            </div>
            
            <!-- Contenedor de se siente como -->
            <div class="h-32 w-full flex flex-col justify-between bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md rounded-xl transition-colors duration-300 ease p-6">
                <!-- Header del contenedor -->
                <div class="flex items-center justify-between gap-2">
                    <p class="w-full flex items-center justify-between gap-2 text-gray-800 dark:text-zinc-300 transition-all duration-300 ease">
                        Sensación
                         <span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-miterlimit="10">
                                <circle cx="16.3" cy="3.89" r="0.48"/>
                                <circle cx="6.27" cy="17.73" r="0.95"/>                                        
                                <path d="M10.09 14.89V5.32a3.82 3.82 0 0 0-7.64 0v9.57a4.77 4.77 0 1 0 8.6 2.84 4.74 4.74 0 0 0-0.96-2.84Z"/>                                        
                                <line x1="6.27" y1="10.09" x2="6.27" y2="16.77"/>
                                <line x1="10.09" y1="6.27" x2="12.95" y2="6.27"/>
                                <line x1="10.09" y1="10.09" x2="12.95" y2="10.09"/>
                                <line x1="10.09" y1="13.91" x2="12.95" y2="13.91"/>
                                <path d="M22.5 10.09A1.9 1.9 0 0 1 20.59 12h0a1.91 1.91 0 0 1-1.91-1.91V7.23a1.91 1.91 0 0 1 1.91-1.91h0A1.9 1.9 0 0 1 22.5 7.23"/>
                            </svg>
                        </span>
                    </p>
                </div>
                <!-- Valor de la sensación terminca -->
                <p class="text-4xl text-center font-bold dark:text-white transition-all duration-300 ease">${sensacionTermica}<span class="text-xl font-semibold text-gray-500 dark:text-zinc-500 transition-all duration-300 ease">°c</span></p>
            </div>
        </div>
    </div>
    `;
    // Seleccionamos el span de la calidad
    const span = contenedorResumen.querySelector('#calidad');
    // Obtenemos el indicador de la calidad de aire 
    const apiAqi = calidadAire.list[0].main.aqi;
    if(apiAqi === 1) {
        span.classList.add('bg-emerald-600/10', 'text-emerald-600');
        span.textContent = 'Buena';
    } else if (apiAqi === 2) {
        span.classList.add('bg-green-500/10', 'text-green-500');
        span.textContent = 'Aceptable';
    } else if (apiAqi === 3) {
        span.classList.add('bg-amber-500/10', 'text-amber-500');
        span.textContent = 'Moderada';
    } else if (apiAqi === 4) {
        span.classList.add('bg-orange-500/10', 'text-orange-500');
        span.textContent = 'Mala';
    } else if (apiAqi === 5) {
        span.classList.add('bg-red-500/10', 'text-red-500');
        span.textContent = 'Muy mala';
    }
    // Insertar todo en el contenedor
    document.getElementById('contenedor-informacion').appendChild(contenedorResumen);

    // Creamos el contenedor para el pronostico hoy a las 
    const contenedorClimaHoy = document.createElement('DIV');
    contenedorClimaHoy.className = 'w-full h-full flex flex-col gap-3 opacity-0 invisible cursor-pointer-none transition-all duration-300 ease';
    contenedorClimaHoy.innerHTML = 
    `
    <h3 class="font-bold text-base dark:text-zinc-200 transition-all duration-300 ease">Hoy a las</h3>
    <div class="w-full max-w-full h-auto overflow-x-auto scrollbar-custom pb-4">
        <div id="pronostico-horas" class="w-96 h-full flex flex-crow gap-3"></div>
    </div>
    `;
    // Insertat todo en el contenedor
    document.getElementById('contenedor-informacion').appendChild(contenedorClimaHoy);

    const footer = document.createElement('FOOTER');
    footer.className = 'opacity-0 invisible cursor-pointer-none';
    footer.innerHTML = 
    `
    <p class="text-center text-gray-500 dark:text-zinc-400 text-sm">Datos proporcionados por <a href="https://openweathermap.org/" target="_blank" class="text-blue-500 hover:underline">OpenWeather</a>. Derechos reservados Marco Cruz 2025®</p>
    `;
    document.getElementById('contenedor-informacion').appendChild(footer);

    // Animación al entraren todos los contenedores
    setTimeout(() => {
        // Transición del contenedor del clima
        contenedorClima.classList.remove('opacity-0', 'invisible', 'cursor-pointer-none');
        contenedorClima.classList.add('opacity-100', 'visible', 'cursor-pointer-auto');
        // Transición del contenedor del pronostico
        contenedorPronostico.classList.remove('opacity-0', 'invisible', 'cursor-pointer-none');
        contenedorPronostico.classList.add('opacity-100', 'visible', 'cursor-pointer-auto');
        // Transición del contenedor del pronostico
        contenedorResumen.classList.remove('opacity-0', 'invisible', 'cursor-pointer-none');
        contenedorResumen.classList.add('opacity-100', 'visible', 'cursor-pointer-auto');
        // Transicion del contenedor climaHoy }
        contenedorClimaHoy.classList.remove('opacity-0', 'invisible', 'cursor-pointer-none');
        contenedorClimaHoy.classList.add('opacity-100', 'visible', 'cursor-pointer-auto');
        // Transición del footer 
        footer.classList.remove('opacity-0', 'invisible', 'cursor-pointer-none');
        footer.classList.add('opacity-100', 'visible', 'cursor-pointer-auto');
    }, 300);
}

// Funcion para pronostico de 5 dias
function pronosticoDias(data) {
    // Agrupamos los pronósticos por día (ejemplo: 12:00 de cada día)
    const diasPronostico = {};
    data.list.forEach( item => {
        const fecha = new Date(item.dt * 1000);
        const dia = fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric"});
        const hora = fecha.getHours();

        // Escogemos las 12:00 (mediodía) como representativa de cada día
        if (hora === 12 && !diasPronostico[dia]) {
            diasPronostico[dia] = {
                temp: Math.round(item.main.temp),
                desc: item.weather[0].description,
                icon: item.weather[0].icon,
            };
        }
    });
    
    // Renderizar los dias en el DOM
    const lista = document.getElementById('pronostico-dias');
    Object.entries(diasPronostico).slice(0, 5).forEach(([dia, info]) => {
        const li = document.createElement("li");
        li.className = 'min-w-full h-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 py-1.5 px-6 rounded-xl shadow-md flex items-center justify-between transition-colors duration-300 ease';
        li.innerHTML = 
        `
            <div class="flex items-center space-x-2">
                <span class="text-lg font-bold dark:text-white transition-all duration-300 ease">${info.temp}°C</span>
                <img src="https://openweathermap.org/img/wn/${info.icon}.png" alt="icon">
            </div>
            <div class="flex gap-2 md:flex-col xl:flex-row md:items-end xl:items-center space-x-2">
                <p class="text-xs text-gray-700 dark:text-zinc-400 capitalize">${info.desc}</p>
                <p class="dark:text-white capitalize font-semibold">${dia}</p>
            </div>
        `;
        lista.appendChild(li);
    });
    
    // LOGICA PARA OBTENER EL CLIMA DE HOY
    const hoy = new Date().toISOString().split('T')[0];    
    // Filtrar solo los registros de HOY
    let pronosticoHoras = data.list.filter( item => item.dt_txt.startsWith(hoy));
    // Limpiar el contenedor antes de renderizar
    const contenedorHoras = document.getElementById('pronostico-horas');    
    if(contenedorHoras) {
        limpiarHTML('pronostico-horas');
        // Recorremos el arreglo para crear las cards
        pronosticoHoras.forEach(item => {
            const hora = new Date(item.dt_txt).toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit', hour12: false });
            const temp = Math.round(item.main.temp);
            const clima = item.weather[0].description;
            const icono = item.weather[0].icon;
            const velocidadKmh = (item.wind.speed * 3.6).toFixed(1); // m/s → km/h
            const direccion = item.wind.deg; // grados (0=Norte, 90=Este, etc.)
            const card =
            `
            <div class="flex flex-col items-center gap-3">
                <div class="min-w-28 min-h-36 shrink-0 flex flex-col justify-center items-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md rounded-xl transition-colors duration-300 ease p-3">
                    <h3 class="text-sm font-bold text-gray-500 dark:text-zinc-300 transition-all duration-300 ease">${hora}</h3>
                    <img src="https://openweathermap.org/img/wn/${icono}@4x.png" alt="${clima}" class="w-12 h-12">
                    <p class="text-xl font-bold dark:text-white transition-all duration-300 ease">${temp}°c</p>
                    <p class="capitalize text-gray-600 dark:text-zinc-400 text-xs font-medium text-center transition-all duration-300 ease">${clima}</p>
                </div>
                <div class="min-w-28 min-h-36 shrink-0 flex flex-col justify-center items-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md rounded-xl transition-colors duration-300 ease p-3">
                    <h3 class="text-sm font-bold text-gray-500 dark:text-zinc-300 transition-all duration-300 ease">${hora}</h3>
                    <img src="/public/dist/img/direccion-viento.webp" style="transform: rotate(${direccion}deg);" alt="${velocidadKmh}" class="size-5 m-2">
                    <p class="text-xl font-bold dark:text-white transition-all duration-300 ease">${velocidadKmh}<span class="text-base">km/h</span></p>
                    <p class="capitalize text-gray-600 dark:text-zinc-400 text-xs font-medium transition-all duration-300 ease">${direccion}°</p>
                </div>
            </div>
            `;
            contenedorHoras.innerHTML += card;
        });
    }
}

// Limpiara el contenido previo de un contenedor HTML
function limpiarHTML(idContenedor) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return; // Si no existe el contenedor, termina la función
    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild); // Elimina todos los hijos uno por uno
    }
}

// Convierte a hora local (formato HH:MM)
function unixToHour(unix) {
    const date = new Date(unix * 1000);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// Funcion de mensaje
function mensajeToast(titulo, mensaje) {
    // Verificar si ya existe un toast visible
    const toastExistente = document.querySelector('.toast-visible');
    
    // Si ya existe un toast, no crear uno nuevo
    if (toastExistente) {
        return; // No se crea un nuevo toast si ya existe uno visible
    }

    // Crear el contenedor del toast
    const toast = document.createElement('div');
    toast.classList.add(
        'fixed', 
        'toast-visible',
        'top-4', 
        'z-50',
        'left-0',
        'right-0',
        'mx-2',
        'md:mx-0',
        'md:right-7', 
        'md:left-auto',
        'px-5',
        'py-4', 
        'rounded-lg',  
        'opacity-0', 
        'transition-all', 
        'duration-300', 
        'ease-in-out',
        'border',
        'border-gray-200',
        'shadow-md',
        'transform',
        'bg-white',
        'dark:bg-zinc-800',
        'dark:border-zinc-700'

    );

    // Crear el contenido del toast 
    const contenidoToast = document.createElement('DIV');
    contenidoToast.innerHTML = `
        <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-5">
                ${titulo === 'Ubicación encontrada' ?
                    `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6 text-emerald-400 rounded-full p-1 border-2 border-emerald-400">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    ` 
                    : 

                    `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7 text-red-600 rounded-full p-1 border-2 border-red-600">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    ` 
                }
                <div>
                    <p class="font-semibold text-base dark:text-zinc-200">${titulo}</p>
                    <p class="font-normal text-sm text-zinc-500 dark:text-zinc-400 pt-1">${mensaje}</p>
                </div>
            </div>
            <button type="button" id="cerrar-toast" class="text-gray-400 rounded-full p-1 hover:text-gray-600 hover:transition-colors duration-300 ease-in-out">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    `;

    // Agregar el contenido al toast
    toast.appendChild(contenidoToast);
    // Agregar el toast al body
    document.body.appendChild(toast);

    // Hacer que el toast aparezca con una animación
    setTimeout(() => {
        toast.classList.remove('opacity-0');
        toast.classList.add('opacity-100');
    }, 10);
    
    // accion para cerrar el toast desde la "x"
    const cerrarToast = document.querySelector('#cerrar-toast');
    cerrarToast.addEventListener('click', () => {
        // Iniciar la animacion de salida 
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');

        // Esperar que termine la animacion antes de eliminar el elemento
        setTimeout(() => {
            toast.remove();
        }, 300);
    });

    // Si el usuario no lo cierra cerrarlo automaticamente
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.classList.remove('opacity-100');
            toast.classList.add('opacity-0');
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
    
}