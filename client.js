/*********************************
 * CRUD CLIENTS – FETCH + localStorage
 * Mini-ERP (Projet scolaire)
 *********************************/

let clients = [];
let clientModalInstance = null;

const STORAGE_KEY_CLIENTS = "erp_clients";

/* =========================
   STORAGE
========================= */
function saveClients(data) {
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(data));
}

function getClients() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CLIENTS)) || [];
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

    // 🔁 Initialisation intelligente
    if (getClients().length === 0) {
        // Première fois → seed depuis API
        fetchInitialClients();
    } else {
        // Déjà initialisé → lecture locale
        fetchClients();
    }

    // Bootstrap modal
    const modalEl = document.getElementById("clientModal");
    if (modalEl && window.bootstrap) {
        clientModalInstance = new bootstrap.Modal(modalEl);
    }

    // Form submit
    const form = document.getElementById("clientForm");
    if (form) {
        form.addEventListener("submit", onSubmitClientForm);
    }

    // Page détails
    if (document.getElementById("detailNom")) {
        loadClientDetails();
    }
});

/* =========================
   FETCH LOCAL
========================= */
function fetchClients() {
    clients = getClients();
    loadClients();
}

/* =========================
   FETCH INITIAL (API)
========================= */
function fetchInitialClients() {
    return fetch("https://dummyjson.com/users")
        .then(res => res.json())
        .then(data => {
            const seed = data.users.map((user, index) => ({
                id: Date.now() + user.id,
                nom: user.company?.name || user.firstName + " " + user.lastName,
                email: user.email,
                telephone: user.phone,
                ville: user.address?.city || "—"
            }));

            saveClients(seed);
            clients = seed;
            loadClients();
        })
        .catch(err => {
            console.error("Erreur fetchInitialClients :", err);
        });
}

/* =========================
   LISTE
========================= */
function loadClients() {
    const tbody = document.getElementById("clientTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (clients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Aucun client</td>
            </tr>`;
        return;
    }

    clients.forEach((c, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(c.nom)}</td>
                <td>${escapeHtml(c.email)}</td>
                <td>${escapeHtml(c.telephone)}</td>
                <td>${escapeHtml(c.ville)}</td>
                <td class="d-flex gap-2">
                    <a class="btn btn-sm btn-info"
                       href="clients-details.html?id=${c.id}">Voir</a>
                    <button class="btn btn-sm btn-warning"
                            onclick="editClient(${c.id})">Modifier</button>
                    <button class="btn btn-sm btn-danger"
                            onclick="deleteClient(${c.id})">Supprimer</button>
                </td>
            </tr>`;
    });
}

/* =========================
   MODAL AJOUT
========================= */
function openAddClient() {
    document.getElementById("clientForm").reset();
    document.getElementById("clientId").value = "";
    document.getElementById("modalTitle").innerText = "Ajouter client";
    clientModalInstance?.show();
}

/* =========================
   SUBMIT (AJOUT / MODIF)
========================= */
function onSubmitClientForm(e) {
    e.preventDefault();

    const id = document.getElementById("clientId").value;
    const nom = document.getElementById("nom").value.trim();
    const email = document.getElementById("email").value.trim();
    const telephone = document.getElementById("telephone").value.trim();
    const ville = document.getElementById("ville").value.trim();

    if (!nom || !email) return;

    if (id) {
        // MODIFIER
        clients = clients.map(c =>
            c.id == id ? { ...c, nom, email, telephone, ville } : c
        );
    } else {
        // AJOUTER
        clients.push({
            id: Date.now(),
            nom,
            email,
            telephone,
            ville
        });
    }

    saveClients(clients);
    clientModalInstance?.hide();
    loadClients();
}

/* =========================
   EDIT
========================= */
function editClient(id) {
    const c = clients.find(x => x.id === id);
    if (!c) return;

    document.getElementById("modalTitle").innerText = "Modifier client";
    document.getElementById("clientId").value = c.id;
    document.getElementById("nom").value = c.nom;
    document.getElementById("email").value = c.email;
    document.getElementById("telephone").value = c.telephone;
    document.getElementById("ville").value = c.ville;

    clientModalInstance?.show();
}

/* =========================
   DELETE
========================= */
function deleteClient(id) {
    if (!confirm("Supprimer ce client ?")) return;

    clients = clients.filter(c => c.id !== id);
    saveClients(clients);
    loadClients();
}

/* =========================
   DETAILS PAGE
========================= */
function loadClientDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    const c = getClients().find(x => x.id === id);
    if (!c) return;

    document.getElementById("detailNom").innerText = c.nom;
    document.getElementById("detailEmail").innerText = c.email;
    document.getElementById("detailTelephone").innerText = c.telephone;
    document.getElementById("detailVille").innerText = c.ville;
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
