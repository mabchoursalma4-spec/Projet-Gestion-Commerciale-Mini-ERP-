/*********************************
 * CRUD UTILISATEURS – FETCH JSON
 * Mini-ERP (Projet scolaire)
 *********************************/

let utilisateurs = [];
let utilisateurModalInstance = null;
// Liste des utilisateurs chargée depuis `utilisateurs.json` (modifications en mémoire)
let utilisateurs = []; 

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
<<<<<<< Updated upstream
    // Si la page contient la table, charger depuis le fichier JSON
    const tbody = document.getElementById("utilisateurTableBody");
    if (tbody) {
        fetch("utilisateurs.json")
            .then(res => res.json())
            .then(data => {
                utilisateurs = data;
                loadUtilisateurs();
            })
            .catch(err => {
                console.error("Erreur chargement utilisateurs.json :", err);
                utilisateurs = [];
                loadUtilisateurs();
            });
    }
=======
    fetchUtilisateurs();
>>>>>>> Stashed changes

    const modalEl = document.getElementById("utilisateurModal");
    if (modalEl && window.bootstrap) {
        utilisateurModalInstance = new bootstrap.Modal(modalEl);
    }

    const form = document.getElementById("utilisateurForm");
    if (form) {
        form.addEventListener("submit", onSubmitUtilisateurForm);
    }

    if (document.getElementById("detailNom")) {
        loadUtilisateurDetails();
    }
});

/* =========================
   FETCH
========================= */
async function fetchUtilisateurs() {
    try {
        const res = await fetch("utilisateurs.json");
        if (!res.ok) throw new Error("Erreur chargement JSON");

        utilisateurs = await res.json();
        loadUtilisateurs();
    } catch (e) {
        console.error("Erreur fetch utilisateurs :", e);
    }
}

/* =========================
   LISTE
========================= */
function loadUtilisateurs() {
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

<<<<<<< Updated upstream
    if (!utilisateurs) utilisateurs = [];

=======
>>>>>>> Stashed changes
    if (id) {
        // MODIFIER en mémoire
        utilisateurs = utilisateurs.map(u =>
            u.id == id ? { ...u, nom, email, role } : u
        );
    } else {
        // AJOUTER en mémoire
        utilisateurs.push({
            id: Date.now(),
            nom,
            email,
            role
        });
    }

<<<<<<< Updated upstream
    // fermer modal bootstrap
    if (utilisateurModalInstance) utilisateurModalInstance.hide();

    // refresh table
=======
    utilisateurModalInstance?.hide();
>>>>>>> Stashed changes
    loadUtilisateurs();
} 

/* =========================
   EDIT
========================= */
function editUtilisateur(id) {
<<<<<<< Updated upstream
    if (!utilisateurs) utilisateurs = [];
=======
>>>>>>> Stashed changes
    const u = utilisateurs.find(x => x.id === id);
    if (!u) return;

    document.getElementById("modalTitle").innerText = "Modifier utilisateur";
    document.getElementById("utilisateurId").value = u.id;
    document.getElementById("nom").value = u.nom;
    document.getElementById("email").value = u.email;
    document.getElementById("role").value = u.role;

<<<<<<< Updated upstream
    if (utilisateurModalInstance) utilisateurModalInstance.show();
} 
=======
    utilisateurModalInstance?.show();
}
>>>>>>> Stashed changes

/* =========================
   DELETE
========================= */
function deleteUtilisateur(id) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
<<<<<<< Updated upstream

    if (!utilisateurs) utilisateurs = [];
=======
>>>>>>> Stashed changes
    utilisateurs = utilisateurs.filter(u => u.id !== id);
    loadUtilisateurs();
} 

/* =========================
   DETAILS PAGE
========================= */
function loadUtilisateurDetails() {
    const params = new URLSearchParams(window.location.search);
<<<<<<< Updated upstream
    const rawId = params.get("id");
    if (!rawId) return;

    const id = Number(rawId);
    if (Number.isNaN(id)) return;

    const show = (u) => {
        if (!u) return;
        const roleLabel = (u.role === "admin") ? "Admin" : "Utilisateur";

        const nomEl = document.getElementById("detailNom");
        const emailEl = document.getElementById("detailEmail");
        const roleEl = document.getElementById("detailRole");

        if (nomEl) nomEl.innerText = u.nom;
        if (emailEl) emailEl.innerText = u.email;
        if (roleEl) roleEl.innerText = roleLabel;
    };

    // Chercher en mémoire
    if (utilisateurs && utilisateurs.length > 0) {
        const u = utilisateurs.find(x => Number(x.id) === Number(id));
        if (u) { show(u); return; }
    }

    // fallback JSON
    fetch("utilisateurs.json")
        .then(res => res.json())
        .then(data => {
            utilisateurs = data;
            const u = utilisateurs.find(x => Number(x.id) === Number(id));
            show(u);
        })
        .catch(err => console.error("Erreur chargement utilisateurs.json :", err));
=======
    const id = Number(params.get("id"));

    const u = utilisateurs.find(x => x.id === id);
    if (!u) return;

    document.getElementById("detailNom").innerText = u.nom;
    document.getElementById("detailEmail").innerText = u.email;
    document.getElementById("detailRole").innerText =
        u.role === "admin" ? "Admin" : "Utilisateur";
>>>>>>> Stashed changes
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

