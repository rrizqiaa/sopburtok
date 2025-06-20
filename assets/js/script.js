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
// 3. INVENTORY MANAGEMENT
// ========================================
const addInventory = () => {
  const name = document.getElementById('stockName').value.trim();
  const category = document.getElementById('stockCategory').value.trim();
  const expiry = document.getElementById('stockExpiry').value;
  const quantity = parseInt(document.getElementById('stockQuantity').value.trim());

  if (!name || !category || !expiry || isNaN(quantity)) {
    alert("Mohon lengkapi semua data!");
    return;
  }

  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  inventory.push({ id: Date.now(), name, category, expiry, quantity });
  localStorage.setItem('inventory', JSON.stringify(inventory));

  clearForm();
  hideAddForm();
  loadInventoryTable();

  saveLog('Add Inventory', name, quantity);
  loadActivityLog();
};

const clearForm = () => {
  ['stockName', 'stockCategory', 'stockExpiry', 'stockQuantity'].forEach(id => document.getElementById(id).value = '');
};

const loadInventoryTable = () => {
  const tableBody = document.getElementById('stockTableBody');
  if (!tableBody) return;

  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  tableBody.innerHTML = inventory.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.expiry}</td>
      <td>${item.quantity}</td>
      <td><button onclick="deleteInventoryById(${item.id})">Hapus</button></td>
    </tr>
  `).join('');
};

const deleteInventoryById = (id) => {
  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  localStorage.setItem('inventory', JSON.stringify(inventory.filter(item => item.id !== id)));
  loadInventoryTable();
};

// ========================================
// 4. INVENTORY IN / OUT
// ========================================
const modifyInventoryQuantity = (nameId, qtyId, isAddition = true) => {
  const name = document.getElementById(nameId).value.trim().toLowerCase();
  const quantity = parseInt(document.getElementById(qtyId).value.trim());
  if (!name || isNaN(quantity) || quantity <= 0) return alert("Nama dan Jumlah harus diisi dengan benar!");

  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  const item = inventory.find(s => s.name.toLowerCase() === name);

  if (!item) return alert("Bahan baku tidak ditemukan!");

  if (!isAddition && quantity > item.quantity) return alert("Jumlah melebihi stok!");

  item.quantity += isAddition ? quantity : -quantity;
  localStorage.setItem('inventory', JSON.stringify(inventory));

  loadInventoryTable();
  saveLog(isAddition ? 'Inventory Masuk' : 'Inventory Keluar', name, quantity);
  loadActivityLog();
  alert(`Inventory berhasil ${isAddition ? 'ditambahkan' : 'dikurangi'}.`);
};

// ========================================
// 5. PRODUCTION LOGIC (FIFO)
// ========================================
const processProduction = () => {
  const nameInput = document.getElementById('productionName').value.trim().toLowerCase();
  let qtyToUse = parseInt(document.getElementById('productionQuantity').value.trim());
  if (!nameInput || isNaN(qtyToUse) || qtyToUse <= 0) return alert("Nama dan Jumlah harus diisi dengan benar!");

  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  const matchingItems = inventory.filter(s => s.name.toLowerCase() === nameInput).sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

  if (!matchingItems.length) return alert("Bahan baku tidak ditemukan di inventory!");
  const totalAvailable = matchingItems.reduce((sum, s) => sum + s.quantity, 0);
  if (qtyToUse > totalAvailable) return alert("Jumlah melebihi inventory!");

  inventory = inventory.map(s => {
    if (s.name.toLowerCase() === nameInput && qtyToUse > 0) {
      const used = Math.min(s.quantity, qtyToUse);
      s.quantity -= used;
      qtyToUse -= used;
    }
    return s;
  });

  localStorage.setItem('inventory', JSON.stringify(inventory));
  loadProductionTable();
  saveLog('Production', nameInput, parseInt(document.getElementById('productionQuantity').value.trim()));
  loadActivityLog();
  alert("Produksi berhasil dilakukan.");
};

const loadProductionTable = () => {
  const tableBody = document.getElementById('productionTableBody');
  if (!tableBody) return;

  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  const availableInventory = inventory.filter(item => item.quantity > 0);

  if (availableInventory.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada inventory tersedia</td></tr>`;
    return;
  }

  tableBody.innerHTML = availableInventory.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.expiry}</td>
      <td>${item.quantity}</td>
    </tr>
  `).join('');
};

// ========================================
// 6. ACTIVITY LOG - SHOW 10 LATEST
// ========================================
const saveLog = (action, itemName, quantity) => {
  const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
  logs.push({ timestamp: new Date().toLocaleString('id-ID'), action, itemName, quantity });
  localStorage.setItem('activityLogs', JSON.stringify(logs));
};

const loadActivityLog = () => {
  const tableBody = document.getElementById('logTableBody');
  if (!tableBody) return;

  const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
  const latestLogs = logs.slice(-10).reverse();

  tableBody.innerHTML = latestLogs.map(log => `
    <tr>
      <td>${log.timestamp}</td>
      <td>${log.action}</td>
      <td>${log.itemName}</td>
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
        (role === 'kasir' && /inventory|production|log|prediksi/.test(text))) {
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

  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];

  const lowInventoryCount = inventory.filter(s => s.quantity <= 10).length;
  const nearExpiryCount = inventory.filter(s => {
    const daysLeft = (new Date(s.expiry) - new Date()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 7 && daysLeft >= 0;
  }).length;

  const latestLogs = logs.slice(-10).reverse().map(log => `<li>${log.timestamp} - ${log.action} - ${log.itemName} (${log.quantity})</li>`).join('');

  container.innerHTML = `
    <h2>Ringkasan Inventory</h2>
    <p>Total: ${inventory.length}</p>
    <p>Menipis: ${lowInventoryCount}</p>
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
// 11. LOG INVENTORY & PRODUCTION (API)
// ========================================
const inventoryLogBody = document.getElementById("inventoryLogBody");
const productionLogBody = document.getElementById("productionLogBody");

async function fetchLogsFromAPI() {
  try {
    const [inventoryRes, productionRes] = await Promise.all([
      fetch("https://api.sopburtok.giize.com/api/inventory", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      }),
      fetch("https://api.sopburtok.giize.com/api/production", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      })
    ]);

    const inventoryData = await inventoryRes.json();
    const productionData = await productionRes.json();

    // Inventory logs
    const inventoryLogBody = document.getElementById("inventoryLogBody");
    inventoryData.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(item.created_at).toLocaleString('id-ID')}</td>
        <td>Penambahan Stok</td>
        <td>${item.name}</td>
        <td>${item.stock}</td>
      `;
      inventoryLogBody.appendChild(row);
    });

    // Production logs
    const productionLogBody = document.getElementById("productionLogBody");
    productionData.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(item.created_at).toLocaleString('id-ID')}</td>
        <td>Produksi</td>
        <td>${item.product_name || '-'}</td>
        <td>${item.quantity_produced || 0}</td>
      `;
      productionLogBody.appendChild(row);
    });

  } catch (error) {
    console.error("Gagal memuat log:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchLogsFromAPI();
});


// ========================================
// AUTOLOAD TABLES AND LOGS
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  applyRoleAccess();
  loadInventoryTable();
  loadActivityLog();
  loadDashboardSummary();
  fetchLogsFromAPI();
  loadReportingTable();
});



const loadReportingTable = () => {
  const tableBody = document.getElementById('reportingTableBody');
  if (!tableBody) return;

  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  if (inventory.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Tidak ada data inventory</td></tr>`;
    return;
  }

  tableBody.innerHTML = inventory.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.expiry}</td>
      <td>${item.quantity}</td>
    </tr>
  `).join('');
};

function exportReportingToPDF() {
  const printWindow = window.open('', '', 'width=800,height=600');
  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];

  if (inventory.length === 0) {
    printWindow.document.write('<p>Tidak ada data untuk dicetak.</p>');
  } else {
    let tableHTML = `
      <h2>Laporan Inventory</h2>
      <table border="1" cellspacing="0" cellpadding="5">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Kategori</th>
            <th>Kedaluwarsa</th>
            <th>Jumlah</th>
          </tr>
        </thead>
        <tbody>
    `;

    inventory.forEach(item => {
      tableHTML += `
        <tr>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>${item.expiry}</td>
          <td>${item.quantity}</td>
        </tr>
      `;
    });

    tableHTML += `
        </tbody>
      </table>
    `;
    printWindow.document.write(tableHTML);
  }

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}


function exportReportingToCSV() {
  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  if (inventory.length === 0) {
    alert("Tidak ada data untuk diexport.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Nama,Kategori,Kedaluwarsa,Jumlah\n"; // Header CSV

  inventory.forEach(item => {
    csvContent += `${item.name},${item.category},${item.expiry},${item.quantity}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "laporan_inventory.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


document.addEventListener("DOMContentLoaded", loadReportingTable);

function createUser() {
  const data = {
    name: document.getElementById('new_name').value,
    email: document.getElementById('new_email').value,
    password: document.getElementById('new_password').value,
    phone: document.getElementById('new_hp').value,
    address: document.getElementById('new_alamat').value,
    role: document.getElementById('new_role').value
  };

  fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(response => {
    if (response.message) {
      alert(response.message);
    } else {
      alert("Akun berhasil dibuat.");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Gagal membuat user.");
  });
}



function loadUsers() {
  fetch(`${API_BASE}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';
    data.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td><button onclick="deleteUser(${user.id})">Hapus</button></td>
      `;
      tbody.appendChild(tr);
    });
    document.getElementById('user-list-section').style.display = 'block';
  })
  .catch(err => console.error("Gagal memuat user:", err));
}

function deleteUser(id) {
  if (!confirm("Yakin ingin menghapus user ini?")) return;

  fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  })
  .then(res => res.json())
  .then(response => {
    alert(response.message);
    loadUsers(); // refresh daftar
  })
  .catch(err => {
    console.error(err);
    alert("Gagal menghapus user");
  });
}