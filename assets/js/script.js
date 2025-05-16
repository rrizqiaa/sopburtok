// ========= LOGIN LOGIC ===========
document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function () {
      // Contoh validasi sederhana
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

// ========= STOCK PAGE LOGIC ===========
function showAddForm() {
  const form = document.getElementById('addStockForm');
  if (form) form.classList.remove('hidden');
}

function hideAddForm() {
  const form = document.getElementById('addStockForm');
  if (form) form.classList.add('hidden');
}

function addStock() {
  const name = document.getElementById('stockName').value.trim();
  const category = document.getElementById('stockCategory').value.trim();
  const expiry = document.getElementById('stockExpiry').value;
  const quantity = document.getElementById('stockQuantity').value.trim();

  if (!name || !category || !expiry || !quantity) {
    alert("Mohon lengkapi semua data!");
    return;
  }

  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  stocks.push({ name, category, expiry, quantity: parseInt(quantity) });
  localStorage.setItem('stocks', JSON.stringify(stocks));

  const tableBody = document.getElementById('stockTableBody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${name}</td>
    <td>${category}</td>
    <td>${expiry}</td>
    <td>${quantity}</td>
    <td><button onclick="this.parentElement.parentElement.remove()">Hapus</button></td>
  `;
  tableBody.appendChild(row);

  document.getElementById('stockName').value = '';
  document.getElementById('stockCategory').value = '';
  document.getElementById('stockExpiry').value = '';
  document.getElementById('stockQuantity').value = '';

  hideAddForm();
}


  // ========= STOCK IN PAGE LOGIC ===========
function loadStockTable() {
  const tableBody = document.getElementById('stockTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';
  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];

  stocks.forEach(stock => {
    const expiryDate = new Date(stock.expiry);
    const currentDate = new Date();
    const timeDiff = expiryDate - currentDate;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let warningClass = '';
    let warningText = '';

    if (parseInt(stock.quantity) <= 10) {
      warningClass = 'low-stock-warning';
      warningText += '⚠️ Stok Menipis! ';
    }

    if (daysLeft <= 7 && daysLeft >= 0) {
      warningClass = 'low-stock-warning';
      warningText += `⚠️ Kedaluwarsa dalam ${daysLeft} hari!`;
    }

    const row = document.createElement('tr');
    row.className = warningClass;
    row.innerHTML = `
      <td>${stock.name}</td>
      <td>${stock.category}</td>
      <td>${stock.expiry}</td>
      <td>${stock.quantity}</td>
      <td>${warningText}</td>
    `;
    tableBody.appendChild(row);
  });
}


function addStockIn() {
  const name = document.getElementById('stockInName').value.trim();
  const quantityToAdd = parseInt(document.getElementById('stockInQuantity').value.trim());

  if (!name || isNaN(quantityToAdd) || quantityToAdd <= 0) {
    alert("Nama dan Jumlah harus diisi dengan benar!");
    return;
  }

  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  const stockIndex = stocks.findIndex(stock => stock.name.toLowerCase() === name.toLowerCase());

  if (stockIndex === -1) {
    alert("Bahan baku tidak ditemukan di stok!");
    return;
  }

  stocks[stockIndex].quantity = parseInt(stocks[stockIndex].quantity) + quantityToAdd;
  localStorage.setItem('stocks', JSON.stringify(stocks));

  loadStockTable();
  alert("Jumlah stok berhasil ditambahkan.");
  saveLog('Stock In', name, quantityToAdd);
}

// Auto load table when page is loaded
document.addEventListener("DOMContentLoaded", loadStockTable);


  // Bersihkan form setelah submit
  document.getElementById('stockName').value = '';
  document.getElementById('stockCategory').value = '';
  document.getElementById('stockExpiry').value = '';
  document.getElementById('stockQuantity').value = '';

  hideAddForm();

// ========= STOCK OUT PAGE LOGIC ===========
function loadStockOutTable() {
  const tableBody = document.getElementById('stockOutTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];

  stocks.forEach(stock => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${stock.name}</td>
      <td>${stock.category}</td>
      <td>${stock.expiry}</td>
      <td>${stock.quantity}</td>
    `;
    tableBody.appendChild(row);
  });
}

function subtractStockOut() {
  const name = document.getElementById('stockOutName').value.trim();
  const quantityToSubtract = parseInt(document.getElementById('stockOutQuantity').value.trim());

  if (!name || isNaN(quantityToSubtract) || quantityToSubtract <= 0) {
    alert("Nama dan Jumlah harus diisi dengan benar!");
    return;
  }

  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  const stockIndex = stocks.findIndex(stock => stock.name.toLowerCase() === name.toLowerCase());

  if (stockIndex === -1) {
    alert("Bahan baku tidak ditemukan di stok!");
    return;
  }

  const currentQuantity = parseInt(stocks[stockIndex].quantity);

  if (quantityToSubtract > currentQuantity) {
    alert("Jumlah yang dikurangi melebihi stok yang tersedia!");
    return;
  }

  stocks[stockIndex].quantity = currentQuantity - quantityToSubtract;
  localStorage.setItem('stocks', JSON.stringify(stocks));

  loadStockOutTable();
  alert("Jumlah stok berhasil dikurangi.");
  saveLog('Stock Out', name, quantityToSubtract);

}


// ========= PRODUCTION PAGE LOGIC ===========
function loadProductionTable() {
  const tableBody = document.getElementById('productionTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];

  stocks.forEach(stock => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${stock.name}</td>
      <td>${stock.category}</td>
      <td>${stock.expiry}</td>
      <td>${stock.quantity}</td>
    `;
    tableBody.appendChild(row);
  });
}

function processProduction() {
  const name = document.getElementById('productionName').value.trim();
  const quantityToUse = parseInt(document.getElementById('productionQuantity').value.trim());

  if (!name || isNaN(quantityToUse) || quantityToUse <= 0) {
    alert("Nama dan Jumlah harus diisi dengan benar!");
    return;
  }

  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  const stockIndex = stocks.findIndex(stock => stock.name.toLowerCase() === name.toLowerCase());

  if (stockIndex === -1) {
    alert("Bahan baku tidak ditemukan di stok!");
    return;
  }

  const currentQuantity = parseInt(stocks[stockIndex].quantity);

  if (quantityToUse > currentQuantity) {
    alert("Jumlah yang digunakan melebihi stok yang tersedia!");
    return;
  }

  stocks[stockIndex].quantity = currentQuantity - quantityToUse;
  localStorage.setItem('stocks', JSON.stringify(stocks));

  loadProductionTable();
  alert("Bahan baku berhasil digunakan dalam produksi.");
  saveLog('Production', name, quantityToUse);

}


// ========= REPORTING PAGE LOGIC ===========
function loadReportingTable() {
  const tableBody = document.getElementById('reportingTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';
  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];

  stocks.forEach(stock => {
    const expiryDate = new Date(stock.expiry);
    const currentDate = new Date();
    const timeDiff = expiryDate - currentDate;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let warningClass = '';
    let warningText = '';

    if (parseInt(stock.quantity) <= 10) {
      warningClass = 'low-stock-warning';
      warningText += '⚠️ Stok Menipis! ';
    }

    if (daysLeft <= 7 && daysLeft >= 0) {
      warningClass = 'low-stock-warning';
      warningText += `⚠️ Kedaluwarsa dalam ${daysLeft} hari!`;
    }

    const row = document.createElement('tr');
    row.className = warningClass;
    row.innerHTML = `
      <td>${stock.name}</td>
      <td>${stock.category}</td>
      <td>${stock.expiry}</td>
      <td>${stock.quantity}</td>
      <td>${warningText}</td>
    `;
    tableBody.appendChild(row);
  });
}


function saveLog(action, stockName, quantity) {
  const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
  const timestamp = new Date().toLocaleString('id-ID');
  logs.push({ timestamp, action, stockName, quantity });
  localStorage.setItem('activityLogs', JSON.stringify(logs));
}

function loadActivityLog() {
  const tableBody = document.getElementById('logTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';
  const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];

  logs.forEach(log => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${log.timestamp}</td>
      <td>${log.action}</td>
      <td>${log.stockName}</td>
      <td>${log.quantity}</td>
    `;
    tableBody.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", loadActivityLog);

// ========= PREDICTION PAGE LOGIC ===========
function loadProductionPrediction() {
  const resultContainer = document.getElementById('predictionResult');
  if (!resultContainer) return;

  const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
  const productionLogs = logs.filter(log => log.action === 'Production');

  if (productionLogs.length === 0) {
    resultContainer.innerHTML = "<p>Belum ada data produksi untuk dianalisis.</p>";
    return;
  }

  // Hitung total dan rata-rata penggunaan
  const usageSummary = {};

  productionLogs.forEach(log => {
    const name = log.stockName;
    const quantity = parseInt(log.quantity);
    if (!usageSummary[name]) {
      usageSummary[name] = { total: 0, count: 0 };
    }
    usageSummary[name].total += quantity;
    usageSummary[name].count += 1;
  });

  // Buat hasil prediksi
  let html = "<table class='stock-table'><thead><tr><th>Nama Bahan Baku</th><th>Total Penggunaan</th><th>Rata-Rata Penggunaan</th><th>Saran Stok</th></tr></thead><tbody>";

  for (const name in usageSummary) {
    const total = usageSummary[name].total;
    const count = usageSummary[name].count;
    const average = Math.ceil(total / count);
    const suggestedStock = average * 5; // Saran stok 5x rata-rata produksi

    html += `<tr>
      <td>${name}</td>
      <td>${total}</td>
      <td>${average}</td>
      <td>${suggestedStock}</td>
    </tr>`;
  }

  html += "</tbody></table>";
  resultContainer.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", loadProductionPrediction);


// ========= EXPORT DUMMY LOGIC ===========
function exportToPDF() {
  alert("Fitur Export to PDF berhasil dipanggil (simulasi).");
}

function exportToExcel() {
  alert("Fitur Export to Excel berhasil dipanggil (simulasi).");
}

/// Role Fungsion ///
document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function () {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      const role = document.getElementById('userRole').value;

      if (username === "admin" && password === "admin") {
        localStorage.setItem('currentRole', role);
        window.location.href = "dashboard.html";
      } else {
        alert("Username atau Password salah!");
      }
    });
  }
});

function applyRoleAccess() {
  const role = localStorage.getItem('currentRole');

  document.querySelectorAll('.menu-btn, .inventory-circle').forEach(button => {
    const text = button.textContent.toLowerCase();

    if (role === 'staf' && (text.includes('profile') || text.includes('reporting') || text.includes('log') || text.includes('prediksi'))) {
      button.style.display = 'none';
    }

    if (role === 'kasir' && (text.includes('inventory') || text.includes('stock') || text.includes('production') || text.includes('log') || text.includes('prediksi'))) {
      button.style.display = 'none';
    }
  });
}

document.addEventListener("DOMContentLoaded", applyRoleAccess);

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('currentRole');
    window.location.href = "index.html";
  });
}
/// Dashboard ///
function loadDashboardSummary() {
  const summaryContainer = document.getElementById('dashboardSummary');
  if (!summaryContainer) return;

  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];

  const lowStockCount = stocks.filter(s => parseInt(s.quantity) <= 10).length;
  const nearExpiryCount = stocks.filter(s => {
    const expiryDate = new Date(s.expiry);
    const currentDate = new Date();
    const daysLeft = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft >= 0;
  }).length;

  const latestLogs = logs.slice(-5).reverse();

  let html = `
    <h2>Ringkasan Stok</h2>
    <p>Total Bahan Baku: ${stocks.length}</p>
    <p>Stok Menipis: ${lowStockCount}</p>
    <p>Kedaluwarsa Dekat: ${nearExpiryCount}</p>

    <h2>Aktivitas Terakhir</h2>
    <ul>
      ${latestLogs.map(log => `<li>${log.timestamp} - ${log.action} - ${log.stockName} (${log.quantity})</li>`).join('')}
    </ul>
  `;

  summaryContainer.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", loadDashboardSummary);



// Auto load table when page is loaded
document.addEventListener("DOMContentLoaded", loadStockOutTable);


// ========= MENU NAVIGATION HIGHLIGHT ===========
document.querySelectorAll('.menu-btn').forEach(button => {
  button.addEventListener('click', function () {
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
  });
});


function loadStockTable() {
  const tableBody = document.getElementById('stockTableBody');
  if (!tableBody) return;

  let stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  tableBody.innerHTML = '';

  stocks.forEach((stock, index) => {
    const expiryDate = new Date(stock.expiry);
    const currentDate = new Date();
    const daysLeft = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

    let warningClass = '';
    let warningText = '';

    if (parseInt(stock.quantity) <= 10) {
      warningClass = 'low-stock-warning';
      warningText += '⚠️ Stok Menipis! ';
    }

    if (daysLeft <= 7 && daysLeft >= 0) {
      warningClass = 'low-stock-warning';
      warningText += `⚠️ Kedaluwarsa dalam ${daysLeft} hari!`;
    }

    const row = document.createElement('tr');
    row.className = warningClass;
    row.innerHTML = `
      <td>${stock.name}</td>
      <td>${stock.category}</td>
      <td>${stock.expiry}</td>
      <td>${stock.quantity}</td>
      <td>
        ${warningText}
        <button onclick="deleteStockByName('${stock.name}')" style="margin-left:10px;color:white;background:red;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;">Hapus</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function deleteStockByName(stockName) {
  let stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  stocks = stocks.filter(stock => stock.name !== stockName);
  localStorage.setItem('stocks', JSON.stringify(stocks));
  loadStockTable();
}

