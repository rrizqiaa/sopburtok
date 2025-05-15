// ========= LOGIN LOGIC ===========
document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function () {
      // Contoh validasi sederhana
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      if (username === "admin" && password === "admin") {
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

  // Bersihkan form setelah submit
  document.getElementById('stockName').value = '';
  document.getElementById('stockCategory').value = '';
  document.getElementById('stockExpiry').value = '';
  document.getElementById('stockQuantity').value = '';

  hideAddForm();
}

// ========= MENU NAVIGATION HIGHLIGHT ===========
document.querySelectorAll('.menu-btn').forEach(button => {
  button.addEventListener('click', function () {
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
  });
});
