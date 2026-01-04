/********************************
 AUTH MINI-ERP (JSON + localStorage)
*********************************/

const USERS_KEY = "erp_users";
const SESSION_KEY = "erp_logged_user";

/* ===== Utils ===== */
function hash(p) {
    return btoa(p); // démo uniquement
}

function getAccounts() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveAccounts(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
}

function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }));
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
}

/* ===== Initialisation depuis JSON ===== */
async function initializeAccounts(force = false) {
    const existing = getAccounts();

    if (!force && existing.length > 0) {
        console.info("Utilisateurs déjà initialisés");
        return;
    }

    try {
        const resp = await fetch("utilisateurs.json", { cache: "no-store" });
        const data = await resp.json();

        const users = data.map(u => ({
            id: u.id,
            name: `${u.prenom} ${u.nom}`,
            email: u.email.toLowerCase(),
            password: hash(u.password),
            role: u.role || "utilisateur"
        }));

        // 🔥 ÉCRASE au lieu d’ajouter
        localStorage.setItem("erp_users", JSON.stringify(users));

        console.info("Utilisateurs importés proprement depuis JSON");
    } catch (e) {
        console.error(e);
        alert("Impossible de charger utilisateurs.json");
    }
}




/* ===== LOGIN ===== */
function handleLogin() {
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const users = JSON.parse(localStorage.getItem("erp_users")) || [];

    const user = users.find(
        u => u.email === email && u.password === btoa(password)
    );

    if (!user) {
        const box = document.getElementById("loginNoticeContainer");
        if (box) {
            box.innerHTML = `<div class="alert alert-danger">
                Email ou mot de passe incorrect
            </div>`;
        }
        return false;
    }

    // ✅ créer la session
    localStorage.setItem("erp_logged_user", JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
    }));

    // ✅ REDIRECTION (OBLIGATOIRE)
    window.location.href = "Dashboard.html";
    return false;
}


/* ===== REGISTER ===== */
function handleRegister() {
    const name = regName.value.trim();
    const email = regEmail.value.trim().toLowerCase();
    const password = regPassword.value;

    if (!name || !email || !password) {
        alert("Tous les champs sont obligatoires");
        return false;
    }

    const users = getAccounts();
    if (users.find(u => u.email === email)) {
        alert("Email déjà utilisé");
        return false;
    }

    const user = {
        id: Date.now(),
        name,
        email,
        password: hash(password),
        role: "utilisateur"
    };

    users.push(user);
    saveAccounts(users);
    setSession(user);

    window.location.href = "Dashboard.html";
    return false;
}

/* ===== PROTECTION ===== */
function requireAuth() {
    const raw = localStorage.getItem("erp_logged_user");

    //  aucune session → login
    if (!raw) {
        window.location.replace("login.html");
        return;
    }

    try {
        const user = JSON.parse(raw);

        //  session invalide → login
        if (!user || !user.email) {
            localStorage.removeItem("erp_logged_user");
            window.location.replace("login.html");
        }
    } catch (e) {
        //  JSON corrompu → login
        localStorage.removeItem("erp_logged_user");
        window.location.replace("login.html");
    }
}


/* ===== Exports ===== */
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.requireAuth = requireAuth;
window.logout = logout;

