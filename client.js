let clients = JSON.parse(localStorage.getItem("clients")) || [];

const form = document.getElementById("clientForm");
const table = document.getElementById("clientTable");

/* =========================
   AFFICHAGE DES CLIENTS
========================= */
function afficherClients() {
  if (!table) return;

  table.innerHTML = "";

  if (clients.length === 0) {
    table.innerHTML = `<tr><td colspan="5">Aucun client</td></tr>`;
    return;
  }

  clients.forEach((c, index) => {
    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${c.nom}</td>
        <td>${c.prenom}</td>
        <td>${c.email}</td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-primary" onclick="voirClient(${index})">👁</button>
          <button type="button" class="btn btn-sm btn-outline-danger" onclick="supprimerClient(${index})">🗑</button>
        </td>
      </tr>
    `;
  });
}

/* =========================
   AJOUT CLIENT
========================= */
if (form) {
  const nom = document.getElementById("nom");
  const prenom = document.getElementById("prenom");
  const email = document.getElementById("email");
  const telephone = document.getElementById("telephone");
  const adresse = document.getElementById("adresse");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const client = {
      nom: nom.value.trim(),
      prenom: prenom.value.trim(),
      email: email.value.trim(),
      telephone: telephone.value.trim(),
      adresse: adresse.value.trim(),
      dateCreation: new Date().toLocaleDateString()
    };

    clients.push(client);
    localStorage.setItem("clients", JSON.stringify(clients));

    form.reset();
    afficherClients();
  });
}

/* =========================
   SUPPRESSION
========================= */
function supprimerClient(index) {
  if (!clients[index]) return;

  if (confirm("Supprimer ce client ?")) {
    clients.splice(index, 1);
    localStorage.setItem("clients", JSON.stringify(clients));
    afficherClients();
  }
}

/* =========================
   VOIR DÉTAILS
========================= */
function voirClient(index) {
  if (!clients[index]) return;

  localStorage.setItem("clientIndex", index);
  window.location.href = "clients-details.html";
}

afficherClients();

window.supprimerClient = supprimerClient;
window.voirClient = voirClient;
