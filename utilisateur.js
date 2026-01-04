/*********************************
 * CRUD UTILISATEURS – FETCH + localStorage
 * Mini-ERP (Projet scolaire)
 *********************************/

let utilisateurs = [];
let utilisateurModalInstance = null;

const STORAGE_KEY = "erp_utilisateurs";

/* =========================
   STORAGE
========================= */
function saveUtilisateurs(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getUtilisateurs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

    // 🔁 Initialisation intelligente
    if (getUtilisateurs().length === 0) {
        // Première fois → seed depuis API
        fetchInitialUtilisateurs();
    } else {
        // Déjà initialisé → lecture locale
        fetchUtilisateurs();
    }

    // Bootstrap modal
    const modalEl = document.getElementById("utilisateurModal");
    if (modalEl && window.bootstrap) {
        utilisateurModalInstance = new bootstrap.Modal(modalEl);
    }

    // Form submit
    const form = document.getElementById("utilisateurForm");
    if (form) {
        form.addEventListener("submit", onSubmitUtilisateurForm);
    }

    // Page détails
    if (document.getElementById("detailNom")) {
        loadUtilisateurDetails();
    }
});

/* =========================
   FETCH LOCAL
========================= */
function fetchUtilisateurs() {
    utilisateurs = getUtilisateurs();
    loadUtilisateurs();
}

/* =========================
   FETCH INITIAL (API)
========================= */
function fetchInitialUtilisateurs() {
    return fetch("https://dummyjson.com/users")
        .then(res => res.json())
        .then(data => {
            const seed = data.users.map(user => ({
                id: Date.now() + user.id,
                nom: user.firstName + " " + user.lastName,
                email: user.email,
                role: "utilisateur"
            }));

            saveUtilisateurs(seed);
            utilisateurs = seed;
            loadUtilisateurs();
        })
        .catch(err => {
            console.error("Erreur fetchInitialUtilisateurs :", err);
        });
}

/* =========================
   LISTE
========================= */
function loadUtilisateurs() {
    const tbody = document.getElementById("utilisateurTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (utilisateurs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Aucun utilisateur</td>
            </tr>`;
        return;
    }

    utilisateurs.forEach((u, index) => {
        const roleLabel = u.role === "admin" ? "Admin" : "Utilisateur";

        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(u.nom)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td>${roleLabel}</td>
                <td class="d-flex gap-2">
                    <a class="btn btn-sm btn-info"
                       href="utilisateur-details.html?id=${u.id}">Voir</a>
                    <button class="btn btn-sm btn-warning"
                            onclick="editUtilisateur(${u.id})">Modifier</button>
                    <button class="btn btn-sm btn-danger"
                            onclick="deleteUtilisateur(${u.id})">Supprimer</button>
                </td>
            </tr>`;
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
   SUBMIT (AJOUT / MODIF)
========================= */
function onSubmitUtilisateurForm(e) {
    e.preventDefault();

    const id = document.getElementById("utilisateurId").value;
    const nom = document.getElementById("nom").value.trim();
    const email = document.getElementById("email").value.trim();
    const role = document.getElementById("role").value;

    if (!nom || !email) return;

    if (id) {
        // MODIFIER
        utilisateurs = utilisateurs.map(u =>
            u.id == id ? { ...u, nom, email, role } : u
        );
    } else {
        // AJOUTER
        utilisateurs.push({
            id: Date.now(),
            nom,
            email,
            role
        });
    }

    saveUtilisateurs(utilisateurs);
    utilisateurModalInstance?.hide();
    loadUtilisateurs();
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
   DELETE
========================= */
function deleteUtilisateur(id) {
    if (!confirm("Supprimer cet utilisateur ?")) return;

    utilisateurs = utilisateurs.filter(u => u.id !== id);
    saveUtilisateurs(utilisateurs);
    loadUtilisateurs();
}

/* =========================
   DETAILS PAGE
========================= */
function loadUtilisateurDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    const u = getUtilisateurs().find(x => x.id === id);
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
