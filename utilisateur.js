/*****************************************
 * CRUD UTILISATEUR - localStorage
 * + Bootstrap Modal
 *****************************************/

const STORAGE_KEY = "erp_utilisateurs";

// Bootstrap modal instance (créée quand la page contient la modal)
let utilisateurModalInstance = null;
// Liste des utilisateurs chargée depuis `utilisateurs.json` (modifications en mémoire)
let utilisateurs = []; 

document.addEventListener("DOMContentLoaded", () => {
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

    // Si la page contient la modal, on prépare l'instance Bootstrap
    const modalEl = document.getElementById("utilisateurModal");
    if (modalEl && window.bootstrap) {
        utilisateurModalInstance = new bootstrap.Modal(modalEl);
    }

    // Brancher le submit si le formulaire existe
    const form = document.getElementById("utilisateurForm");
    if (form) {
        form.addEventListener("submit", onSubmitUtilisateurForm);
    }
});

/* =======================
   STORAGE
======================= */
function getUtilisateurs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveUtilisateurs(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* =======================
   LISTE
======================= */
function loadUtilisateurs() {
    const tbody = document.getElementById("utilisateurTableBody");
    if (!tbody) return; // si on est sur details.html, pas de table

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
        const roleLabel = (u.role === "admin") ? "Admin" : "Utilisateur";

        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(u.nom)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td>${roleLabel}</td>
                <td class="d-flex gap-2">
                    <a class="btn btn-sm btn-info" href="utilisateur-details.html?id=${u.id}">Voir</a>
                    <button class="btn btn-sm btn-warning" type="button" onclick="editUtilisateur(${u.id})">Modifier</button>
                    <button class="btn btn-sm btn-danger" type="button" onclick="deleteUtilisateur(${u.id})">Supprimer</button>
                </td>
            </tr>
        `;
    });
} 

/* =======================
   MODAL - OUVRIR AJOUT
======================= */
function openAddUtilisateur() {
    // reset form
    const form = document.getElementById("utilisateurForm");
    if (!form) return;

    form.reset();
    document.getElementById("utilisateurId").value = "";
    document.getElementById("modalTitle").innerText = "Ajouter utilisateur";

    // ouvrir modal bootstrap
    if (utilisateurModalInstance) utilisateurModalInstance.show();
}

/* =======================
   SUBMIT FORM (AJOUT/MODIF)
======================= */
function onSubmitUtilisateurForm(e) {
    e.preventDefault();

    const id = document.getElementById("utilisateurId").value;
    const nom = document.getElementById("nom").value.trim();
    const email = document.getElementById("email").value.trim();
    const role = document.getElementById("role").value; // admin / utilisateur

    if (!nom || !email) return;

    if (!utilisateurs) utilisateurs = [];

    if (id) {
        // MODIFIER en mémoire
        utilisateurs = utilisateurs.map(u =>
            String(u.id) === String(id) ? { ...u, nom, email, role } : u
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

    // fermer modal bootstrap
    if (utilisateurModalInstance) utilisateurModalInstance.hide();

    // refresh table
    loadUtilisateurs();
} 

/* =======================
   EDIT
======================= */
function editUtilisateur(id) {
    if (!utilisateurs) utilisateurs = [];
    const u = utilisateurs.find(x => x.id === id);
    if (!u) return;

    document.getElementById("modalTitle").innerText = "Modifier utilisateur";
    document.getElementById("utilisateurId").value = u.id;
    document.getElementById("nom").value = u.nom;
    document.getElementById("email").value = u.email;
    document.getElementById("role").value = u.role;

    if (utilisateurModalInstance) utilisateurModalInstance.show();
} 

/* =======================
   DELETE
======================= */
function deleteUtilisateur(id) {
    if (!confirm("Supprimer cet utilisateur ?")) return;

    if (!utilisateurs) utilisateurs = [];
    utilisateurs = utilisateurs.filter(u => u.id !== id);
    loadUtilisateurs();
} 

/* =======================
   DETAILS PAGE
======================= */
function loadUtilisateurDetails() {
    const params = new URLSearchParams(window.location.search);
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
}

/* =======================
   UTILS (sécurité affichage)
======================= */
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
