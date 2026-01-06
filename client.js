/*********************************
 * CRUD CLIENTS
 *********************************/

let clients = [];
let clientModalInstance = null;

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

    // Modal Bootstrap
    const modalEl = document.getElementById("clientModal");
    if (modalEl && window.bootstrap) {
        clientModalInstance = new bootstrap.Modal(modalEl);
    }

    // Form submit
    const form = document.getElementById("clientForm");
    if (form) {
        form.addEventListener("submit", onSubmitClientForm);
    }

    //  EXACTEMENT
    loadClients();

    // Page détails
    if (document.getElementById("detailNom")) {
        loadClientDetails();
    }
});
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
   LOAD
========================= */
function loadClients() {
    const tbody = document.getElementById("clientTableBody");
    if (!tbody) return;

    fetch("clients.json")
        .then(res => res.json())
        .then(data => {
            clients = data;
            renderClients();
        })
        .catch(err => {
            console.error("Erreur chargement clients.json :", err);
            clients = [];
            renderClients();
        });
}

/* =========================
   RENDER
========================= */
function renderClients() {
    const tbody = document.getElementById("clientTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!clients || clients.length === 0) {
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
   CRUD EN MÉMOIRE
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
        clients = clients.map(c =>
            String(c.id) === String(id)
                ? { ...c, nom, email, telephone, ville }
                : c
        );
    } else {
        clients.unshift({
            id: Date.now(),
            nom,
            email,
            telephone,
            ville
        });
    }

    clientModalInstance?.hide();
    renderClients();
}

function editClient(id) {
    const c = clients.find(x => x.id === id);
    if (!c) return;

    document.getElementById("clientId").value = c.id;
    document.getElementById("nom").value = c.nom;
    document.getElementById("email").value = c.email;
    document.getElementById("telephone").value = c.telephone;
    document.getElementById("ville").value = c.ville;

    clientModalInstance?.show();
}

function deleteClient(id) {
    if (!confirm("Supprimer ce client ?")) return;
    clients = clients.filter(c => c.id !== id);
    renderClients();
}

/* =========================
   DETAILS
========================= */
function loadClientDetails() {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    if (!id) return;

    fetch("clients.json")
        .then(res => res.json())
        .then(data => {
            const c = data.find(x => Number(x.id) === id);
            if (!c) return;

            document.getElementById("detailNom").innerText = c.nom;
            document.getElementById("detailEmail").innerText = c.email;
            document.getElementById("detailTelephone").innerText = c.telephone;
            document.getElementById("detailVille").innerText = c.ville;
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

