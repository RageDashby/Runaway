//
//Claves para guardar en el navegador
const USERS_KEY = 'runaway_users_db';
const SESSION_KEY = 'runaway_active_session';

export const Auth = {
    //
    //Obtiene la lista de usuarios
    getUsers() {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    },

    
    //Registra de usuario nuevo
    register(userData) {
        const users = this.getUsers();
        
        //Verifica si ya existe el correo
        const exists = users.find(u => u.email === userData.email);
        if (exists) {
            return { success: false, message: "El correo ya esta registrado" };
        }

        
        //Crea el objeto usuario
        const newUser = {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            
            colorPrimary: userData.colorPrimary, 
            
            colorSecondary: userData.colorSecondary, 
            
            history: [] 
        };
        
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return { success: true };
    },

    
    //Inicia la sesión
    login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            //
            //Guarda quién está activo en la sesión
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            return { success: true, user: user };
        }
        return { success: false, message: "Correo o contraseña incorrectos" };
    },

    getCurrentUser() {
        const session = localStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },

    logout() {
        localStorage.removeItem(SESSION_KEY);
    },

    
    //Actualiza la información del perfil del usuario
    updateProfile(updatedData) {
        let currentUser = this.getCurrentUser();
        if (!currentUser) return;

        currentUser.name = updatedData.name || currentUser.name;
        currentUser.colorPrimary = updatedData.colorPrimary || currentUser.colorPrimary;
        currentUser.colorSecondary = updatedData.colorSecondary || currentUser.colorSecondary;
        
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));

        
        //Actualiza la información en la lista general de usuarios
        let users = this.getUsers();
        let index = users.findIndex(u => u.email === currentUser.email);
        if (index !== -1) {
            users[index] = currentUser;
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
        return currentUser;
    },

    
    //Guarda el registro de la partida (incluyendo todas las jugadas)
    saveGameRecord(score, difficulty) {
        let currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const record = {
            
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(), 
            score: score,
            
            difficulty: difficulty, 
            status: "Terminado"
        };

        
        //Inserta el registro de la partida al inicio del historial
        currentUser.history.unshift(record);
        
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
        
        
        //Verifica y actualiza el historial en la lista general de usuarios
        let users = this.getUsers();
        let index = users.findIndex(u => u.email === currentUser.email);
        if (index !== -1) {
            users[index] = currentUser;
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
    }
};