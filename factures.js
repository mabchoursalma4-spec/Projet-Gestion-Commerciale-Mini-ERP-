const STORAGE_KEY = "erp_factures";
let factureModalInstance = null;

document.addEventListener("DOMContentLoaded", () => {

    loadFactures();

    const modalEl = document.getElementById("factureModal");
    if (modalEl && window.bootstrap) {
        factureModalInstance = new bootstrap.Modal(modalEl);
    }

    const form = document.getElementById("factureForm");
    if (form) {
        form.addEventListener("submit", onSubmitFactureForm);
    }
});

/* =====================
   STORAGE
===================== */
function getFactures() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveFactures(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* =====================
   LISTE
===================== */
function loadFactures() {
    const tbody = document.getElementById("factureTableBody");
    if (!tbody) return;

    const factures = getFactures();
    tbody.innerHTML = "";

    if (factures.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Aucune facture</td>
            </tr>
        `;
        return;
    }

    factures.forEach((f, i) => {
        tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${f.commande}</td>
                <td>${f.date}</td>
                <td>${f.montant} DH</td>
                <td>${f.statut}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editFacture(${f.id})">Modifier</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteFacture(${f.id})">Supprimer</button>
                </td>
            </tr>
        `;
    });
}

/* =====================
   OUVRIR AJOUT
===================== */
function openAddFacture() {
    document.getElementById("factureForm").reset();
    document.getElementById("factureId").value = "";
    document.getElementById("modalTitle").innerText = "Ajouter facture";

    if (factureModalInstance) factureModalInstance.show();
}

/* =====================
   SUBMIT
===================== */
function onSubmitFactureForm(e) {
    e.preventDefault();

    const id = document.getElementById("factureId").value;
    const commande = document.getElementById("commande").value;
    const date = document.getElementById("date").value;
    const montant = document.getElementById("montant").value;
    const statut = document.getElementById("statut").value;

    let factures = getFactures();

    if (id) {
        factures = factures.map(f =>
            f.id == id ? { ...f, commande, date, montant, statut } : f
        );
    } else {
        factures.push({
            id: Date.now(),
            commande,
            date,
            montant,
            statut
        });
    }

    saveFactures(factures);
    factureModalInstance.hide();
    loadFactures();
}

/* =====================
   EDIT
===================== */
function editFacture(id) {
    const f = getFactures().find(x => x.id === id);
    if (!f) return;

    document.getElementById("modalTitle").innerText = "Modifier facture";
    document.getElementById("factureId").value = f.id;
    document.getElementById("commande").value = f.commande;
    document.getElementById("date").value = f.date;
    document.getElementById("montant").value = f.montant;
    document.getElementById("statut").value = f.statut;

    factureModalInstance.show();
}

/* =====================
   DELETE
===================== */
function deleteFacture(id) {
    if (!confirm("Supprimer cette facture ?")) return;

    saveFactures(getFactures().filter(f => f.id !== id));
    loadFactures();
}
