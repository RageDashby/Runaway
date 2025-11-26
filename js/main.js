// --- NOTIFICACIONES TOAST ---
//
//Esta funcion muestra notificaciones temporales en la parte superior
export function showToast(message, color) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'neon-toast';
    toast.textContent = message;
    if (color) toast.style.color = color;
    container.appendChild(toast);
    //El toast se elimina automaticamente despues de 3 segundos
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

//Modal = Pop Ups personalizados
//Esta funcion crea un modal de dialogo completo (reemplazando los "alert" del navegador)
export function showModal(title, message, actions) {
    const modal = document.getElementById('custom-modal');
    const mTitle = document.getElementById('modal-title');
    const mMsg = document.getElementById('modal-message');
    const mActions = document.getElementById('modal-actions');

    mTitle.textContent = title;
    //Permite saltos de linea en el mensaje reemplazando \n por <br>
    mMsg.innerHTML = message.replace(/\n/g, '<br>');
    //Limpia los botones de acciones anteriores
    mActions.innerHTML = '';

    //Crea los botones de accion que el modal necesite (ej: Reiniciar, Ver Perfil)
    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.textContent = action.text;
        //Aplica el estilo neon a los botones del modal
        btn.className = 'neon-accent'; 
        btn.style.margin = '0 5px';
        btn.onclick = () => {
            modal.classList.add('hidden');
            //Ejecuta la funcion que se le asigno a ese boton (callback)
            if (action.callback) action.callback();
        };
        mActions.appendChild(btn);
    });
    //Muestra el modal
    modal.classList.remove('hidden');
}
//Importa la autenticación y la clase del juego
import { Auth } from './auth.js';
import { Game } from './game.js';

//REFERENCIAS DOM
const authScreen = document.getElementById('auth-screen');
const gameScreen = document.getElementById('game-ui');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const profileModal = document.getElementById('profile-modal');
const btnRestart = document.getElementById('btn-restart-game');
const btnProfile = document.getElementById('btn-profile');
const btnLogout = document.getElementById('btn-logout');
const btnCloseProfile = document.getElementById('close-profile');
const diffSelect = document.getElementById('difficulty-select');

let currentGame = null;

function setThemeColor(color) {
    //Cambia la variable css global (--neon-color) al color primario del usuario
    document.documentElement.style.setProperty('--neon-color', color);
}

function showScreen(screenName) {
    //Funcion que controla que pantalla esta visible (Login o Juego)
    if (screenName === 'game') {
        authScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
    } else {
        gameScreen.classList.add('hidden');
        authScreen.classList.remove('hidden');
    }
}

//TABLA DE HISTORIAL (3 COLUMNAS: DIFICULTAD, TIEMPO/PUNTAJE, FECHA) 
function updateHistoryUI() {
    const user = Auth.getCurrentUser();
    const tbody = document.getElementById('history-body');
    
    //Limpia la tabla antes de volver a llenar
    tbody.innerHTML = '';
    
    if(user && user.history) {
        //Recorre todos los registros guardados en el historial del usuario
        user.history.forEach(game => {
            const tr = document.createElement('tr');
            //Traduce la dificultad de codigo a texto para que se vea bien en la tabla
            let diffLabel = 'Normal';
            if(game.difficulty === 'easy') diffLabel = 'Fácil';
            if(game.difficulty === 'hard') diffLabel = 'Difícil';
            
            tr.innerHTML = `
                <td>${diffLabel}</td>
                <td>${game.score}</td>
                <td>${game.date}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

//Logica de autenticación
document.getElementById('go-to-register').addEventListener('click', () => {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

document.getElementById('go-to-login').addEventListener('click', () => {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    const colorP = document.getElementById('reg-color-primary').value;
    const colorS = document.getElementById('reg-color-secondary').value;

    const result = Auth.register({ 
        name, email, password: pass, 
        colorPrimary: colorP, 
        colorSecondary: colorS 
    });
    
    if (result.success) {
        showToast("Registro exitoso. Ahora inicia sesión.");
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    } else {
        showToast(result.message, '#ff6b6b');
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    const result = Auth.login(email, pass);
    
    if (result.success) {
        initializeGameSession(result.user);
    } else {
        showToast(result.message, '#ff6b6b');
    }
});

btnLogout.addEventListener('click', () => {
    Auth.logout();
    if (currentGame) currentGame.stop();
    location.reload(); 
});

//Inicio de juego
function initializeGameSession(user) {
    setThemeColor(user.colorPrimary); 
    showScreen('game');

    //Carga los inputs del perfil con los colores guardados
    document.getElementById('edit-name').value = user.name;
    document.getElementById('edit-color-primary').value = user.colorPrimary;
    document.getElementById('edit-color-secondary').value = user.colorSecondary;
    
    //Inicia el juego por primera vez en dificultad 'normal'
    startGame(user.colorPrimary, user.colorSecondary, 'normal');
}

export function handleGameOver(score, difficulty) {
    //Guarda la partida en el LocalStorage
    Auth.saveGameRecord(score, difficulty);
    
    //Muestra el modal de Game Over con opciones de reinicio y perfil
    showModal('¡JUEGO TERMINADO!', `Puntaje: ${score}\nDificultad: ${difficulty}`, [
        { 
            text: 'Intentar de Nuevo', 
            callback: () => {
                const user = Auth.getCurrentUser();
                //Toma la dificultad seleccionada en el selector
                const selectedDiff = document.getElementById('difficulty-select').value;
                startGame(user.colorPrimary, user.colorSecondary, selectedDiff);
            }
        },
        {
            text: 'Ver Perfil',
            callback: () => {
                profileModal.classList.remove('hidden');
                updateHistoryUI();
            }
        }
    ]);
}

function startGame(primaryColor, secondaryColor, difficulty) {
    if(currentGame) {
        //Detiene el juego actual si es que ya existe antes de iniciar uno nuevo
        currentGame.isRunning = false; 
    }
    //Crea una nueva instancia de la clase Game
    currentGame = new Game('game-canvas', { primary: primaryColor, secondary: secondaryColor }, difficulty);
    currentGame.start();
}
//Listener de teclado para la pausa con la tecla ESC
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (gameScreen.classList.contains('hidden')) return; 
        //Simula el click en el perfil para pausar el juego
        btnProfile.click();
    }
});
//Botones de l ainterfaz
btnProfile.addEventListener('click', () => {
    profileModal.classList.remove('hidden');
    updateHistoryUI(); //actualiza la tabla de historial al abrir el perfil
    if(currentGame && currentGame.isRunning) {
        //Pausa el juego al abrir el perfil
        currentGame.isRunning = false; 
    }
});

btnRestart.addEventListener('click', () => {
    //Muestra el modal de confirmacion para reiniciar
    showModal('¿Reiniciar?', 'Perderás el progreso actual.', [
        { 
            text: 'Sí, Reiniciar', 
            callback: () => {
                const user = Auth.getCurrentUser();
                //Toma la dificultad del selector para el nuevo juego
                const diff = diffSelect.value;
                startGame(user.colorPrimary, user.colorSecondary, diff);
            }
        },
        { text: 'Cancelar', callback: () => {} }
    ]);
});

document.getElementById('save-profile').addEventListener('click', () => {
    const newName = document.getElementById('edit-name').value;
    const newColorP = document.getElementById('edit-color-primary').value;
    const newColorS = document.getElementById('edit-color-secondary').value;
    
    //Actualiza los datos y colores en LocalStorage
    const updatedUser = Auth.updateProfile({ 
        name: newName, 
        colorPrimary: newColorP, 
        colorSecondary: newColorS 
    });
    //Aplica el nuevo color a la interfaz
    setThemeColor(updatedUser.colorPrimary);
    showToast("Perfil actualizado.");
    
    //Pregunta si reiniciar para aplicar los cambios de color al juego
    showModal('Cambios Guardados', '¿Reiniciar para aplicar colores?', [
        {
            text: 'Reiniciar',
            callback: () => {
                const diff = diffSelect.value;
                startGame(updatedUser.colorPrimary, updatedUser.colorSecondary, diff);
                profileModal.classList.add('hidden');
            }
        },
        {
            text: 'Seguir Jugando',
            callback: () => {
                profileModal.classList.add('hidden');
                //
                //Reanuda el juego
                if(currentGame) {
                    currentGame.isRunning = true;
                    currentGame.gameLoop();
                }
            }
        }
    ]);
});

if (btnCloseProfile) {
    btnCloseProfile.addEventListener('click', () => {
        profileModal.classList.add('hidden');
        //Reanuda el juego si estaba pausado al cerrar el modal
        if(currentGame && !currentGame.isRunning) {
            currentGame.isRunning = true;
            currentGame.gameLoop();
        }
    });
}

const btnEndManual = document.getElementById('btn-end-attempt');
if(btnEndManual) {
    btnEndManual.addEventListener('click', () => {
        if(currentGame && currentGame.isRunning) {
            //Detiene el juego y ejecuta la secuencia de Game Over
            currentGame.stop(); 
        }
    });
}

window.addEventListener('load', () => {
    //Verifica si hay un usuario activo al cargar la pagina para saltar el login
    const user = Auth.getCurrentUser();
    if (user) {
        initializeGameSession(user);
    }
});