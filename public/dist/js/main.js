document.addEventListener('DOMContentLoaded', () => {
    cambiarTema();
    menubar();
    buscadorMobile();
    activarUbicacion();
});

// Variables globales
let timeout = null;
const resultadoBusqueda = document.getElementById('resultados-busqueda');
const listaResultados = resultadoBusqueda.querySelector('ul');

// Función para manejar el menú desplegable del perfil de usuario
function menubar() {
    const buttonMenu = document.getElementById('btn-perfil');
    const menuUsuario = document.getElementById('menu-desplegable');
    const icon = document.getElementById('arrow');
    let menuVisible = false;

    buttonMenu.addEventListener('click', () => {
        if (!menuVisible) {
            // Mostrar menú con animación
            buttonMenu.classList.add('bg-gray-100', 'dark:bg-zinc-800');
            menuUsuario.classList.remove('opacity-0', 'invisible', '-translate-y-4', 'pointer-events-none');
            menuUsuario.classList.add('opacity-100', 'visible', 'translate-y-0', 'pointer-events-auto');
            icon.classList.add('rotate-180');
            menuVisible = true;
        } else {
            // Ocultar menú con animación
            menuUsuario.classList.remove('opacity-100', 'visible', 'translate-y-0', 'pointer-events-auto');
            menuUsuario.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
            icon.classList.remove('rotate-180');
            buttonMenu.classList.remove('bg-gray-100', 'dark:bg-zinc-800');
            // Esperar la duración de la animación antes de ocultar completamente
            setTimeout(() => {
                menuUsuario.classList.add('invisible');
            }, 300);
            menuVisible = false;
        }
    });

    document.addEventListener('click', (e) => {
        if(!menuUsuario.contains(e.target) && !buttonMenu.contains(e.target) && menuVisible) {
            // Ocultar menú con animación
            menuUsuario.classList.remove('opacity-100', 'visible', 'translate-y-0', 'pointer-events-auto');
            menuUsuario.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
            icon.classList.remove('rotate-180');
            buttonMenu.classList.remove('bg-gray-100', 'dark:bg-zinc-800');
            menuVisible = false;
        }
    });
}

// Funcion para manejar la barra de búsqueda en dispositivos móviles
function buscadorMobile() {
    const btnAbrirBuscador = document.getElementById('btn-abrir-buscador');
    const btnCerrarBuscador = document.getElementById('btn-cerrar-buscador');
    const inputBuscador = document.getElementById('input-buscador');
    const input = document.getElementById('input-busqueda');

    btnAbrirBuscador.addEventListener('click', () => {
        // Mostrar menú con animación
        inputBuscador.classList.remove('opacity-0', 'invisible', '-translate-y-4', 'pointer-events-none');
        inputBuscador.classList.add('opacity-100', 'visible', 'translate-y-0', 'pointer-events-auto');
        resultadoBusqueda.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
        resultadoBusqueda.classList.add('opacity-100', 'visible', 'pointer-events-auto');
        listaResultados.innerHTML = '';
    });

    btnCerrarBuscador.addEventListener('click', () => {
        input.value = '';
        cerrarBuscador();
    });
    
    function cerrarBuscador() {
        // Quitar estado visible
        inputBuscador.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        inputBuscador.classList.add('opacity-0', '-translate-y-4');

        resultadoBusqueda.classList.remove('opacity-100', 'pointer-events-auto');
        resultadoBusqueda.classList.add('opacity-0');

        // Después de la animación (300ms según tu Tailwind duration-300)
        setTimeout(() => {
            inputBuscador.classList.add('invisible', 'pointer-events-none');
            resultadoBusqueda.classList.add('invisible', 'pointer-events-none');
            listaResultados.innerHTML = '';
            input.blur();
        }, 300); // mismo tiempo que tu `duration-300`
    }

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        const clickDentroBuscador = inputBuscador.contains(e.target);
        const clickDentroResultados = resultadoBusqueda.contains(e.target);
        const clickEnBotonAbrir = btnAbrirBuscador.contains(e.target);

        if (!clickDentroBuscador && !clickDentroResultados && !clickEnBotonAbrir) {
            cerrarBuscador();
        }
    });
    
    // Buscar ciudad dependiendo lo que escriba el usuario
    input.addEventListener('input', () => {
        const query = input.value.trim();
        // limpiar timeout anterior para evitar demasiadas peticiones
        clearTimeout(timeout);
        
        // Esperarnos 500ms antes de realizar la consulta 
        timeout = setTimeout(() => {
            if(query.length < 2) { // Si hay menos de dos caracteres mostrar alerta
                resultadoBusqueda.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
                resultadoBusqueda.classList.add('opacity-100', 'visible', 'pointer-events-auto');
                listaResultados.innerHTML = '<li class="text-base font-medium px-4 py-2 text-zinc-500">No se encontraron resultados...</li>';
                return;
            } 
            // Mostrar el menú de resultados y buscar la ciudad
            listaResultados.innerHTML = '';
            resultadoBusqueda.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
            resultadoBusqueda.classList.add('opacity-100', 'visible', 'pointer-events-auto');
            const loader = document.createElement('DIV'); // Loader
            loader.className = 'fixed inset-0 flex items-center justify-end mr-5 transition-opacity duration-200 ease-in-out';
            loader.id = 'loader';
            loader.innerHTML = `
                <div class="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            `;
            inputBuscador.appendChild(loader);
            buscarCiudad(query);
        }, 500);
    });

    // Mostrar resultados si el input tiene texto al hacer focus
    input.addEventListener('focus', () => {
        const query = input.value.trim();
        // limpiar timeout anterior para evitar demasiadas peticiones
        clearTimeout(timeout);
        
        // Esperarnos 500ms antes de realizar la consulta 
        timeout = setTimeout(() => {
            if(query.length < 2) { // Si hay menos de dos caracteres mostrar alerta
                resultadoBusqueda.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
                resultadoBusqueda.classList.add('opacity-100', 'visible', 'pointer-events-auto');
                listaResultados.innerHTML = '<li class="text-base font-medium px-4 py-2 text-zinc-500">No se encontraron resultados...</li>';
                return;
            } 
            // Mostrar el menú de resultados y buscar la ciudad
            listaResultados.innerHTML = '';
            resultadoBusqueda.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
            resultadoBusqueda.classList.add('opacity-100', 'visible', 'pointer-events-auto');
            const loader = document.createElement('DIV'); // Loader
            loader.className = 'fixed inset-0 flex items-center justify-end mr-5 transition-opacity duration-200 ease-in-out';
            loader.id = 'loader';
            loader.innerHTML = `
                <div class="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            `;
            listaResultados.appendChild(loader);
            buscarCiudad(query);
        }, 500);
    });
}

// Funcion para buscar la ciudad que esta ingresando el usuario 
function buscarCiudad(nombre) {
    const apiKey = "19fd8a3d47d7d26de5374ecaed11f53d";
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${nombre}&limit=5&appid=${apiKey}`;
    // Hacemos el fecth o consulta
    fetch(url)
        .then(respuesta => respuesta.json())
        .then(datos => {
            // Quitar el loader
            const loader = document.getElementById('loader');
            loader.classList.add('opacity-0');
            setTimeout(() => loader.remove(), 500);
            mostrarResultados(datos);
        })
        .catch(error => {
            listaResultados.innerHTML = `<li class="px-4 py-2 text-red-500">Error al buscar: ${error}</li>`;
            resultadoBusqueda.classList.remove('opacity-0', 'invisible');
        })
}

// Funcion para mostrar las ciudades en la lista 
function mostrarResultados(ciudades) {
    listaResultados.innerHTML = '';
    if(ciudades.length === 0) {
        listaResultados.innerHTML = '<li class="text-base font-medium px-4 py-2 text-zinc-500">No se encontraron resultados...</li>';
    } else {
        ciudades.forEach(ciudad => {
            const item = document.createElement('li');
            item.className = 'px-4 py-2 rounded-lg cursor-pointer hover:bg-zinc-200/30 dark:hover:bg-zinc-700';
            item.innerHTML = 
            `
            <div class="flex items-center gap-3">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-gray-500 dark:text-zinc-400">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                </div>
                <div class="flex flex-col">
                    <p class="font-bold dark:text-gray-200">${ciudad.name}</p>
                    <p class="text-sm text-gray-500 dark:text-zinc-400">${ciudad.state ? ciudad.state + ', ' : ''} ${ciudad.country}</p>
                </div>
            </div>
            `;
            // Evento click para actualizar el clima y ocultar resultados
            item.addEventListener('click', () => {
                resultadoBusqueda.classList.add('opacity-0', 'invisible', 'pointer-events-none');
                resultadoBusqueda.classList.remove('opacity-100', 'visible', 'pointer-events-auto');
                listaResultados.innerHTML = '';
                document.getElementById('resultados-busqueda').value = `${ciudad.name}, ${ciudad.country}`;
                // Llama a la función global de openWeatherAPI.js
                actualizarClimaPorCoords(ciudad.lat, ciudad.lon);
                const input = document.getElementById('input-busqueda');
                input.value = '';
            });
            listaResultados.appendChild(item);
        });
    }
}

// Funcion para acticvar la ubicación del usuario
function activarUbicacion() {
    const btnUbicacion = document.getElementById('mi-ubicacion');
    btnUbicacion.addEventListener('click', () => {
        geolocalizacion();
    }); 
}

// Funcion para cambiar el tema de la página
function cambiarTema() {
    const btnSwitchTheme = document.getElementById('switch-theme');
    const texto = document.getElementById('texto-tema');
    const icono = document.getElementById('icono-tema'); 

    // Obtenemos el valor del tema guardado en localStorage
    const temaGuardado = localStorage.getItem("tema-oscuro") === "true";    
    btnSwitchTheme.checked = temaGuardado;

    // Aplicamos el tema guardado al cargar la página
    actualizarTema(temaGuardado);

    // Escuchar cambios en el checkbox
    btnSwitchTheme.addEventListener('change', () => {
        // Variable para el modo oscuro 
        const modoOscuroActivo = btnSwitchTheme.checked;
        // Guardar el nuevo estado en localStorage
        localStorage.setItem('tema-oscuro', modoOscuroActivo);
        // Esperar a que el cambio de estado del checkbox se refleje en el DOM
        setTimeout(() => {
            // Actualizar la variable
            actualizarTema(modoOscuroActivo); 
        }, 100);
    });

    // Función interna para cambiar el texto e ícono según el tema
    function actualizarTema(activo) {
        // Cambiar el contenido 
        if(activo) {
            texto.textContent = 'Modo oscuro';
            document.documentElement.classList.add("dark");
            icono.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 dark:text-gray-200">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
            `;
        } else {
            texto.textContent = 'Modo claro';
            document.documentElement.classList.remove("dark");
            icono.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
            `;
        }
    }
}
    