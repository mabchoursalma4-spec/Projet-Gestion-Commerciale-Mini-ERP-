// Variables globales pour stocker les instances de graphiques
let produitsChart = null;
let commandesChart = null;
let facturesChart = null;

// Fonction pour charger les données JSON
async function loadData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur de chargement:', error);
        showError(`Erreur de chargement des données: ${error.message}`);
        return [];
    }
}

// Fonction pour afficher les erreurs
function showError(message) {
    const statsCards = document.getElementById('statsCards');
    statsCards.innerHTML = `
        <div class="stat-card col-12">
            <h5>Erreur</h5>
            <div class="stat-value" style="color: #e74c3c; font-size: 1rem;">${message}</div>
        </div>
    `;
}

// Initialisation des graphiques
document.addEventListener('DOMContentLoaded', async function() {
    await loadAllCharts();
    
    // Ajouter l'événement au bouton d'actualisation
    document.getElementById('refreshBtn').addEventListener('click', refreshCharts);
});

// Charger tous les graphiques
async function loadAllCharts() {
    try {
        // Afficher un état de chargement
        document.getElementById('statsCards').innerHTML = `
            <div class="stat-card">
                <h5>Chargement...</h5>
                <div class="stat-value">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            </div>
        `;

        // Charger toutes les données
        const [produits, commandes, factures] = await Promise.all([
            loadData('produits.json'),
            loadData('commandes.json'),
            loadData('factures.json')
        ]);

        // Mettre à jour les statistiques
        updateStats(produits, commandes, factures);
        
        // Détruire les anciens graphiques s'ils existent
        destroyCharts();
        
        // Créer les nouveaux graphiques
        createProduitsChart(produits);
        createCommandesChart(commandes);
        createFacturesChart(factures);

    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showError('Impossible de charger les données');
    }
}

// Détruire tous les graphiques existants
function destroyCharts() {
    if (produitsChart) produitsChart.destroy();
    if (commandesChart) commandesChart.destroy();
    if (facturesChart) facturesChart.destroy();
}

// Rafraîchir les graphiques
function refreshCharts() {
    // Désactiver le bouton pendant le chargement
    const refreshBtn = document.getElementById('refreshBtn');
    const originalHTML = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Chargement...';
    refreshBtn.disabled = true;
    
    loadAllCharts().finally(() => {
        // Réactiver le bouton après 1 seconde
        setTimeout(() => {
            refreshBtn.innerHTML = originalHTML;
            refreshBtn.disabled = false;
            
            // Afficher une notification
            showNotification('Données actualisées avec succès!', 'success');
        }, 1000);
    });
}

// Afficher une notification
function showNotification(message, type = 'info') {
    // Créer une div pour la notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer automatiquement après 3 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Mettre à jour les statistiques
function updateStats(produits, commandes, factures) {
    const statsCards = document.getElementById('statsCards');
    
    // Calculer les statistiques
    const totalProducts = produits.length;
    const totalOrders = commandes.length;
    const totalInvoices = factures.length;
    
    // Calculer le revenu total (factures payées)
    const totalRevenue = factures
        .filter(f => f.statut === 'Payée')
        .reduce((sum, f) => sum + f.montant, 0);
    
    // Calculer le montant total en attente
    const pendingRevenue = factures
        .filter(f => f.statut === 'En attente')
        .reduce((sum, f) => sum + f.montant, 0);
    
    // Commandes en attente
    const pendingOrders = commandes.filter(c => c.statut === 'En attente').length;
    
    // Valeur totale du stock
    const stockValue = produits.reduce((sum, p) => sum + (p.prix * p.stock), 0);
    
    // Produits par catégorie
    const categories = {};
    produits.forEach(p => {
        categories[p.categorie] = (categories[p.categorie] || 0) + 1;
    });
    const topCategory = Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b);

    statsCards.innerHTML = `
        <div class="stat-card">
            <h5>Total Produits</h5>
            <div class="stat-value" style="color: #3498db;">${totalProducts}</div>
            <div class="stat-detail">${Object.keys(categories).length} catégories</div>
        </div>
        <div class="stat-card">
            <h5>Total Commandes</h5>
            <div class="stat-value" style="color: #2ecc71;">${totalOrders}</div>
            <div class="stat-detail">${pendingOrders} en attente</div>
        </div>
        <div class="stat-card">
            <h5>Total Factures</h5>
            <div class="stat-value" style="color: #e74c3c;">${totalInvoices}</div>
            <div class="stat-detail">${factures.filter(f => f.statut === 'En attente').length} en attente</div>
        </div>
        <div class="stat-card">
            <h5>Revenu Total</h5>
            <div class="stat-value" style="color: #f39c12;">${totalRevenue.toFixed(2)} DH</div>
            <div class="stat-detail">${pendingRevenue.toFixed(2)} DH en attente</div>
        </div>
    `;
}

// 1. Graphique Produits par Catégorie
function createProduitsChart(data) {
    const ctx = document.getElementById('produitsChart').getContext('2d');
    
    // Grouper par catégorie
    const categories = {};
    data.forEach(produit => {
        categories[produit.categorie] = (categories[produit.categorie] || 0) + 1;
    });
    
    const categoryLabels = Object.keys(categories);
    const categoryCounts = Object.values(categories);
    
    // Mettre à jour le footer
    document.getElementById('totalProduits').textContent = data.length;
    
    produitsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryLabels,
            datasets: [{
                data: categoryCounts,
                backgroundColor: [
                    '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
                    '#9b59b6', '#1abc9c', '#34495e', '#f1c40f'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} produits (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 2. Graphique Commandes par Statut
function createCommandesChart(data) {
    const ctx = document.getElementById('commandesChart').getContext('2d');
    
    // Grouper par statut
    const statuts = {};
    data.forEach(commande => {
        statuts[commande.statut] = (statuts[commande.statut] || 0) + 1;
    });
    
    const statutLabels = Object.keys(statuts);
    const statutCounts = Object.values(statuts);
    
    // Mettre à jour le footer
    document.getElementById('totalCommandes').textContent = data.length;
    
    // Définir les couleurs pour chaque statut
    const backgroundColors = statutLabels.map(statut => {
        switch(statut) {
            case 'Validée': return '#2ecc71';
            case 'En attente': return '#f39c12';
            case 'Livrée': return '#3498db';
            case 'Annulée': return '#e74c3c';
            default: return '#95a5a6';
        }
    });
    
    commandesChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: statutLabels,
            datasets: [{
                data: statutCounts,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            const montantTotal = data
                                .filter(c => c.statut === context.label)
                                .reduce((sum, c) => sum + c.total, 0);
                            return `${context.label}: ${context.raw} cmd (${percentage}%) - ${montantTotal.toFixed(2)} DH`;
                        }
                    }
                }
            }
        }
    });
}

// 3. Graphique Factures par Statut
function createFacturesChart(data) {
    const ctx = document.getElementById('facturesChart').getContext('2d');
    
    // Grouper par statut avec montants
    const statuts = {};
    data.forEach(facture => {
        if (!statuts[facture.statut]) {
            statuts[facture.statut] = {
                count: 0,
                montant: 0
            };
        }
        statuts[facture.statut].count++;
        statuts[facture.statut].montant += facture.montant;
    });
    
    const statutLabels = Object.keys(statuts);
    const statutCounts = statutLabels.map(statut => statuts[statut].count);
    const statutMontants = statutLabels.map(statut => statuts[statut].montant);
    
    // Calculer le revenu total
    const revenuTotal = statutMontants.reduce((a, b) => a + b, 0);
    document.getElementById('revenuTotal').textContent = revenuTotal.toFixed(2);
    
    // Définir les couleurs pour chaque statut
    const backgroundColors = statutLabels.map(statut => {
        switch(statut) {
            case 'Payée': return 'rgba(46, 204, 113, 0.8)';
            case 'En attente': return 'rgba(243, 156, 18, 0.8)';
            case 'Annulée': return 'rgba(231, 76, 60, 0.8)';
            default: return 'rgba(149, 165, 166, 0.8)';
        }
    });
    
    facturesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: statutLabels,
            datasets: [
                {
                    label: 'Nombre de factures',
                    data: statutCounts,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Montant total (DH)',
                    data: statutMontants,
                    backgroundColor: backgroundColors.map(color => color.replace('0.8', '0.4')),
                    borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                    borderWidth: 1,
                    yAxisID: 'y1',
                    type: 'line'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Nombre de factures'
                    },
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Montant (DH)'
                    },
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                const percentage = ((context.raw / data.length) * 100).toFixed(1);
                                return `Factures: ${context.raw} (${percentage}%)`;
                            } else {
                                return `Montant: ${context.raw.toFixed(2)} DH`;
                            }
                        }
                    }
                }
            }
        }
    });
}