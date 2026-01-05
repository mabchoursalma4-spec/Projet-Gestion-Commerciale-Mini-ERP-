/*********************************
 * CRUD UTILISATEURS
 * Pattern IDENTIQUE à commandes.js
 *********************************/

let utilisateurs = [];
let utilisateurModalInstance = null;

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

    // ✅ EXACTEMENT comme commandes.js
    loadUtilisateurs();

    // Page détails
    if (document.getElementById("detailNom")) {
        loadUtilisateurDetails();
    }
});

/* =========================
   LOAD (comme loadCommandes)
========================= */
function loadUtilisateurs() {
    const tbody = document.getElementById("utilisateurTableBody");
    if (!tbody) return;

    fetch("utilisateurs.json")
        .then(res => res.json())
        .then(data => {
            utilisateurs = data;
            renderUtilisateurs();
        })
        .catch(err => {
            console.error("Erreur chargement utilisateurs.json :", err);
            utilisateurs = [];
            renderUtilisateurs();
        });
}

/* =========================
   RENDER
========================= */
function renderUtilisateurs() {
    const tbody = document.getElementById("utilisateurTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!utilisateurs || utilisateurs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Aucun utilisateur</td>
            </tr>`;
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
            </tr>`;
    });
}

/* =========================
   CRUD EN MÉMOIRE (comme commandes)
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
            String(u.id) === String(id) ? { ...u, nom, email, role } : u
        );
    } else {
        utilisateurs.unshift({
            id: Date.now(),
            nom,
            email,
            role
        });
    }

    utilisateurModalInstance?.hide();
    renderUtilisateurs();
}

function editUtilisateur(id) {
    const u = utilisateurs.find(x => x.id === id);
    if (!u) return;

    document.getElementById("utilisateurId").value = u.id;
    document.getElementById("nom").value = u.nom;
    document.getElementById("email").value = u.email;
    document.getElementById("role").value = u.role;

    utilisateurModalInstance?.show();
}

function deleteUtilisateur(id) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    utilisateurs = utilisateurs.filter(u => u.id !== id);
    renderUtilisateurs();
}

/* =========================
   DETAILS
========================= */
function loadUtilisateurDetails() {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    if (!id) return;

    fetch("utilisateurs.json")
        .then(res => res.json())
        .then(data => {
            const u = data.find(x => Number(x.id) === id);
            if (!u) return;

            document.getElementById("detailNom").innerText = u.nom;
            document.getElementById("detailEmail").innerText = u.email;
            document.getElementById("detailRole").innerText =
                u.role === "admin" ? "Admin" : "Utilisateur";
        });
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
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    if (!id) return;

    const u = JSON.parse(localStorage.getItem("erp_users"))
        ?.find(x => Number(x.id) === id);

    if (!u) {
        alert("Utilisateur introuvable");
        return;
    }

    document.getElementById("detailNom").innerText = u.name;
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
