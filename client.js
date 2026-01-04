/*********************************
 * CRUD CLIENTS – FETCH JSON
 * Mini-ERP (Projet scolaire)
 *********************************/

let clients = [];
let clientModalInstance = null;
// Liste des clients chargée depuis `clients.json` (modifications en mémoire/volatiles)
let clients = []; 

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
<<<<<<< Updated upstream
    // Si on est sur la page de liste, charger depuis clients.json
    const tbody = document.getElementById("clientTableBody");
    if (tbody) {
        fetch("clients.json")
            .then(res => res.json())
            .then(data => {
                clients = data;
                loadClients();
            })
            .catch(err => {
                console.error("Erreur chargement clients.json :", err);
                clients = [];
                loadClients();
            });
    }
=======
    fetchClients();
>>>>>>> Stashed changes

    const modalEl = document.getElementById("clientModal");
    if (modalEl && window.bootstrap) {
        clientModalInstance = new bootstrap.Modal(modalEl);
    }

    const form = document.getElementById("clientForm");
    if (form) {
        form.addEventListener("submit", onSubmitClientForm);
    }

    if (document.getElementById("detailNom")) {
        loadClientDetails();
    }
});

/* =========================
   FETCH
========================= */
async function fetchClients() {
    try {
        const res = await fetch("clients.json");
        if (!res.ok) throw new Error("Erreur chargement clients");

        clients = await res.json();
        loadClients();
    } catch (e) {
        console.error("Erreur fetch clients :", e);
    }
}

/* =========================
   LISTE
========================= */
function loadClients() {
    const tbody = document.getElementById("clientTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

<<<<<<< Updated upstream
    if (!clients || clients.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">Aucun client</td></tr>`;
=======
    if (clients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Aucun client</td>
            </tr>`;
>>>>>>> Stashed changes
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
                       href="client-details.html?id=${c.id}">Voir</a>
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

<<<<<<< Updated upstream
    if (!clients) clients = [];
=======
    if (!nom || !email) return;
>>>>>>> Stashed changes

    if (id) {
        // MODIFIER
        clients = clients.map(c =>
<<<<<<< Updated upstream
            String(c.id) === String(id) ? { ...c, nom, email, telephone, adresse } : c
        );
    } else {
        clients.unshift({
=======
            c.id == id ? { ...c, nom, email, telephone, ville } : c
        );
    } else {
        // AJOUTER
        clients.push({
>>>>>>> Stashed changes
            id: Date.now(),
            nom,
            email,
            telephone,
            ville
        });
    }

<<<<<<< Updated upstream
    // Modifications en mémoire uniquement (volatiles)
    clientModalInstance.hide();
=======
    clientModalInstance?.hide();
>>>>>>> Stashed changes
    loadClients();
} 

/* =========================
   EDIT
========================= */
function editClient(id) {
<<<<<<< Updated upstream
    if (!clients) clients = [];
=======
>>>>>>> Stashed changes
    const c = clients.find(x => x.id === id);
    if (!c) return;

    document.getElementById("modalTitle").innerText = "Modifier client";
    document.getElementById("clientId").value = c.id;
    document.getElementById("nom").value = c.nom;
    document.getElementById("email").value = c.email;
    document.getElementById("telephone").value = c.telephone;
    document.getElementById("ville").value = c.ville;

<<<<<<< Updated upstream
    clientModalInstance.show();
} 
=======
    clientModalInstance?.show();
}
>>>>>>> Stashed changes

/* =========================
   DELETE
========================= */
function deleteClient(id) {
    if (!confirm("Supprimer ce client ?")) return;
<<<<<<< Updated upstream
    if (!clients) clients = [];
=======
>>>>>>> Stashed changes
    clients = clients.filter(c => c.id !== id);
    loadClients();
} 

/* =========================
   DETAILS PAGE
========================= */
function loadClientDetails() {
    const params = new URLSearchParams(window.location.search);
<<<<<<< Updated upstream
    const rawId = params.get("id");
    if (!rawId) return;
    const id = Number(rawId);
    if (Number.isNaN(id)) return;

    const show = (c) => {
        if (!c) return;
        document.getElementById("detailNom").innerText = c.nom;
        document.getElementById("detailEmail").innerText = c.email;
        document.getElementById("detailTelephone").innerText = c.telephone;
        document.getElementById("detailAdresse").innerText = c.adresse;
    };

    if (clients && clients.length > 0) {
        const c = clients.find(x => Number(x.id) === Number(id));
        if (c) { show(c); return; }
    }

    fetch("clients.json")
        .then(res => res.json())
        .then(data => {
            clients = data;
            const c = clients.find(x => Number(x.id) === Number(id));
            show(c);
        })
        .catch(err => console.error("Erreur chargement clients.json :", err));
=======
    const id = Number(params.get("id"));

    const c = clients.find(x => x.id === id);
    if (!c) return;

    document.getElementById("detailNom").innerText = c.nom;
    document.getElementById("detailEmail").innerText = c.email;
    document.getElementById("detailTelephone").innerText = c.telephone;
    document.getElementById("detailVille").innerText = c.ville;
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
