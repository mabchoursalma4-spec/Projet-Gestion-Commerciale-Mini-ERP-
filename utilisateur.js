/*********************************
 * CRUD UTILISATEURS
 * Pattern IDENTIQUE à commandes.js
 *********************************/

const UTILISATEURS_KEY = "erp_utilisateurs";
let utilisateurs = [];
let utilisateurModalInstance = null;

/* =========================
   STORAGE
========================= */
function getUtilisateurs() {
    return JSON.parse(localStorage.getItem(UTILISATEURS_KEY)) || [];
}

function saveUtilisateurs(data) {
    localStorage.setItem(UTILISATEURS_KEY, JSON.stringify(data));
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

    // Modal Bootstrap
    const modalEl = document.getElementById("utilisateurModal");
    if (modalEl && window.bootstrap) {
        utilisateurModalInstance = new bootstrap.Modal(modalEl);
    }

    // Form submit
    const form = document.getElementById("utilisateurForm");
    if (form) {
        form.addEventListener("submit", onSubmitUtilisateurForm);
    }

    // Charger la liste (comme loadCommandes)
    loadUtilisateurs();

    // Page détails
    if (document.getElementById("detailNom")) {
        loadUtilisateurDetails();
    }
});

/* =========================
   INIT FROM API (OPTIONNEL)
   (IDENTIQUE à fetchInitialCommandes)
========================= */
function fetchInitialUtilisateurs() {
    return fetch("https://dummyjson.com/users")
        .then(res => res.json())
        .then(data => {
            const seed = data.users.slice(0, 20).map((user, index) => ({
                id: Date.now() + user.id,
                nom: user.firstName + " " + user.lastName,
                email: user.email,
                role: index === 0 ? "admin" : "utilisateur"
            }));

            saveUtilisateurs(seed);
            utilisateurs = seed;
        });
}

/* =========================
   LOAD (comme loadCommandes)
========================= */
function loadUtilisateurs() {
    const tbody = document.getElementById("utilisateurTableBody");
    if (!tbody) return;

    utilisateurs = getUtilisateurs();

    // Si vide → optionnellement initialiser
    if (utilisateurs.length === 0) {
        fetchInitialUtilisateurs().then(renderUtilisateurs);
    } else {
        renderUtilisateurs();
    }
}

/* =========================
   RENDER (comme renderCommandes)
========================= */
function renderUtilisateurs() {
    const tbody = document.getElementById("utilisateurTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!utilisateurs || utilisateurs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Aucun utilisateur</td>
            </tr>
        `;
        return;
    }

    utilisateurs.forEach((u, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(u.nom)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td>${u.role === "admin" ? "Admin" : "Utilisateur"}</td>
                <td class="d-flex gap-2">
                    <a class="btn btn-sm btn-info"
                       href="utilisateur-details.html?id=${u.id}">Voir</a>
                    <button class="btn btn-sm btn-warning"
                            onclick="editUtilisateur(${u.id})">Modifier</button>
                    <button class="btn btn-sm btn-danger"
                            onclick="deleteUtilisateur(${u.id})">Supprimer</button>
                </td>
            </tr>
        `;
    });
}

/* =========================
   MODAL AJOUT
========================= */
function openAddUtilisateur() {
    document.getElementById("utilisateurForm").reset();
    document.getElementById("utilisateurId").value = "";
    document.getElementById("modalTitle").innerText = "Ajouter utilisateur";
    utilisateurModalInstance?.show();
}

/* =========================
   SUBMIT (EN MÉMOIRE)
========================= */
function onSubmitUtilisateurForm(e) {
    e.preventDefault();

    const id = document.getElementById("utilisateurId").value;
    const nom = document.getElementById("nom").value.trim();
    const email = document.getElementById("email").value.trim();
    const role = document.getElementById("role").value;

    if (!nom || !email) return;

    if (id) {
        utilisateurs = utilisateurs.map(u =>
            String(u.id) === String(id)
                ? { ...u, nom, email, role }
                : u
        );
    } else {
        utilisateurs.unshift({
            id: Date.now(),
            nom,
            email,
            role
        });
    }

    saveUtilisateurs(utilisateurs);
    utilisateurModalInstance?.hide();
    renderUtilisateurs();
}

/* =========================
   EDIT
========================= */
function editUtilisateur(id) {
    const u = utilisateurs.find(x => x.id === id);
    if (!u) return;

    document.getElementById("modalTitle").innerText = "Modifier utilisateur";
    document.getElementById("utilisateurId").value = u.id;
    document.getElementById("nom").value = u.nom;
    document.getElementById("email").value = u.email;
    document.getElementById("role").value = u.role;

    utilisateurModalInstance?.show();
}

/* =========================
   DELETE (EN MÉMOIRE)
========================= */
function deleteUtilisateur(id) {
    const u = utilisateurs.find(x => x.id === id);
    if (u?.role === "admin") {
        alert("Impossible de supprimer un administrateur");
        return;
    }

    if (!confirm("Supprimer cet utilisateur ?")) return;

    utilisateurs = utilisateurs.filter(u => u.id !== id);
    saveUtilisateurs(utilisateurs);
    renderUtilisateurs();
}

/* =========================
   DETAILS PAGE
========================= */
function loadUtilisateurDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    const u = getUtilisateurs().find(x => Number(x.id) === id);
    if (!u) return;

    document.getElementById("detailNom").innerText = u.nom;
    document.getElementById("detailEmail").innerText = u.email;
    document.getElementById("detailRole").innerText =
        u.role === "admin" ? "Admin" : "Utilisateur";
}

/* =========================
   UTILS
========================= */
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
