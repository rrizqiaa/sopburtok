// ========================================
// 1. LOGIN LOGIC
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      if (username === "a" && password === "a") {
        window.location.href = "dashboard.html";
      } else {
        alert("Username atau Password salah!");
      }
    });
  }
});

// ========================================
// 2. FORM TOGGLE
// ========================================
const showAddForm = () => document.getElementById('addStockForm')?.classList.remove('hidden');
const hideAddForm = () => document.getElementById('addStockForm')?.classList.add('hidden');

// ========================================
// 3. STOCK MANAGEMENT
// ========================================
const addStock = () => {
  const name = document.getElementById('stockName').value.trim();
  const category = document.getElementById('stockCategory').value.trim();
  const expiry = document.getElementById('stockExpiry').value;
  const quantity = parseInt(document.getElementById('stockQuantity').value.trim());

  if (!name || !category || !expiry || isNaN(quantity)) return alert("Mohon lengkapi semua data!");

  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  stocks.push({ id: Date.now(), name, category, expiry, quantity });
  localStorage.setItem('stocks', JSON.stringify(stocks));
  clearForm();
  hideAddForm();
  loadStockTable();
};

const clearForm = () => {
  ['stockName', 'stockCategory', 'stockExpiry', 'stockQuantity'].forEach(id => document.getElementById(id).value = '');
};

const loadStockTable = () => {
  const tableBody = document.getElementById('stockTableBody');
  if (!tableBody) return;

  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  tableBody.innerHTML = stocks.map(stock => `
    <tr>
      <td>${stock.name}</td>
      <td>${stock.category}</td>
      <td>${stock.expiry}</td>
      <td>${stock.quantity}</td>
      <td><button onclick="deleteStockById(${stock.id})">Hapus</button></td>
    </tr>
  `).join('');
};

const deleteStockById = (id) => {
  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  localStorage.setItem('stocks', JSON.stringify(stocks.filter(stock => stock.id !== id)));
  loadStockTable();
};

// ========================================
// 4. STOCK IN / OUT
// ========================================
const modifyStockQuantity = (nameId, qtyId, isAddition = true) => {
  const name = document.getElementById(nameId).value.trim().toLowerCase();
  const quantity = parseInt(document.getElementById(qtyId).value.trim());
  if (!name || isNaN(quantity) || quantity <= 0) return alert("Nama dan Jumlah harus diisi dengan benar!");

  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  const stock = stocks.find(s => s.name.toLowerCase() === name);

  if (!stock) return alert("Bahan baku tidak ditemukan di stok!");

  if (!isAddition && quantity > stock.quantity) return alert("Jumlah melebihi stok!");

  stock.quantity += isAddition ? quantity : -quantity;
  localStorage.setItem('stocks', JSON.stringify(stocks));
  loadStockTable();
  alert(`Stok ${isAddition ? 'ditambahkan' : 'dikurangi'}.`);
};

const addStockIn = () => modifyStockQuantity('stockInName', 'stockInQuantity', true);
const subtractStockOut = () => modifyStockQuantity('stockOutName', 'stockOutQuantity', false);

// ========================================
// 5. PRODUCTION LOGIC (FIFO)
// ========================================
const processProduction = () => {
  const nameInput = document.getElementById('productionName').value.trim().toLowerCase();
  let qtyToUse = parseInt(document.getElementById('productionQuantity').value.trim());
  if (!nameInput || isNaN(qtyToUse) || qtyToUse <= 0) return alert("Nama dan Jumlah harus diisi dengan benar!");

  let stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  const matchingStocks = stocks.filter(s => s.name.toLowerCase() === nameInput).sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

  if (!matchingStocks.length) return alert("Bahan baku tidak ditemukan di stok!");
  const totalAvailable = matchingStocks.reduce((sum, s) => sum + s.quantity, 0);
  if (qtyToUse > totalAvailable) return alert("Jumlah melebihi stok!");

  stocks = stocks.map(s => {
    if (s.name.toLowerCase() === nameInput && qtyToUse > 0) {
      const used = Math.min(s.quantity, qtyToUse);
      s.quantity -= used;
      qtyToUse -= used;
    }
    return s;
  });

  localStorage.setItem('stocks', JSON.stringify(stocks));
  loadProductionTable();
  alert("Produksi berhasil dilakukan.");
};
// ========================================
// 5B. LOAD PRODUCTION TABLE ONLY IF STOCK > 0
// ========================================
const loadProductionTable = () => {
  const tableBody = document.getElementById('productionTableBody');
  if (!tableBody) return;

  let stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  const availableStocks = stocks.filter(stock => stock.quantity > 0);

  if (availableStocks.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada stok tersedia</td></tr>`;
    return;
  }

  tableBody.innerHTML = availableStocks.map(stock => `
    <tr>
      <td>${stock.name}</td>
      <td>${stock.category}</td>
      <td>${stock.expiry}</td>
      <td>${stock.quantity}</td>
    </tr>
  `).join('');
};

// ========================================
// LOAD 10 AKTIVITAS TERBARU
// ========================================
const loadActivityLog = () => {
  const tableBody = document.getElementById('logTableBody');
  if (!tableBody) return;

  const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
  const latestLogs = logs.slice(-10).reverse();  // Ambil 10 terakhir dan balik urutan

  tableBody.innerHTML = latestLogs.map(log => `
    <tr>
      <td>${log.timestamp}</td>
      <td>${log.action}</td>
      <td>${log.stockName}</td>
      <td>${log.quantity}</td>
    </tr>
  `).join('');
};


// ========================================
// 7. EXPORT DUMMY FUNCTION
// ========================================
const exportToPDF = () => alert("Export ke PDF berhasil dipanggil (simulasi).");
const exportToExcel = () => alert("Export ke Excel berhasil dipanggil (simulasi).");

// ========================================
// 8. ROLE MANAGEMENT
// ========================================
const applyRoleAccess = () => {
  const role = localStorage.getItem('currentRole');
  document.querySelectorAll('.menu-btn, .inventory-circle').forEach(btn => {
    const text = btn.textContent.toLowerCase();
    if ((role === 'staf' && /profile|reporting|log|prediksi/.test(text)) ||
        (role === 'kasir' && /inventory|stock|production|log|prediksi/.test(text))) {
      btn.style.display = 'none';
    }
  });
};

document.addEventListener("DOMContentLoaded", applyRoleAccess);

// ========================================
// 9. DASHBOARD SUMMARY
// ========================================
const loadDashboardSummary = () => {
  const container = document.getElementById('dashboardSummary');
  if (!container) return;

  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];

  const lowStockCount = stocks.filter(s => s.quantity <= 10).length;
  const nearExpiryCount = stocks.filter(s => {
    const daysLeft = (new Date(s.expiry) - new Date()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 7 && daysLeft >= 0;
  }).length;

  const latestLogs = logs.slice(-5).reverse().map(log => `<li>${log.timestamp} - ${log.action} - ${log.stockName} (${log.quantity})</li>`).join('');

  container.innerHTML = `
    <h2>Ringkasan Stok</h2>
    <p>Total: ${stocks.length}</p>
    <p>Menipis: ${lowStockCount}</p>
    <p>Kedaluwarsa Dekat: ${nearExpiryCount}</p>
    <h2>Aktivitas Terakhir</h2>
    <ul>${latestLogs}</ul>
  `;
};

document.addEventListener("DOMContentLoaded", loadDashboardSummary);

// ========================================
// 10. MENU NAVIGATION HIGHLIGHT
// ========================================
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

// ========================================
// AUTOLOAD LOG DAN STOCK TABLE SAAT DIBUKA
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  loadStockTable();
  loadActivityLog();
});
