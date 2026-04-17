// State Management
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
let chartInstance = null;
let monthlySummaryVisible = false;

// Theme Toggle
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  
  // Cek apakah sekarang sedang dark mode
  if (document.body.classList.contains('dark-theme')) {
    themeBtn.innerHTML = '<i id="theme-icon" class="fas fa-sun"></i> Light Mode';
  } else {
    themeBtn.innerHTML = '<i id="theme-icon" class="fas fa-moon"></i> Dark Mode';
  }
});

const getCategories = () => ['Food', 'Transport', 'Fun', ...customCategories];

function renderAll() {
  saveData();
  renderBalance();
  renderList();
  renderChart();
  renderCategoryManager();
  renderMonthlySummary();
}

function saveData() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  localStorage.setItem('customCategories', JSON.stringify(customCategories));
}

function renderBalance() {
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  document.getElementById('total-balance').textContent = '$' + total.toFixed(2);
}

function renderList() {
  const list = document.getElementById('transaction-list');
  list.innerHTML = '';
  // Tampilkan dari yang terbaru
  [...transactions].reverse().forEach((tx) => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.innerHTML = `
      <div class="transaction-info">
        <span class="transaction-name">${tx.name}</span>
        <span class="transaction-amount">$${tx.amount.toFixed(2)}</span>
        <span class="category-badge">${tx.category}</span>
      </div>
      <button class="delete-btn" onclick="deleteTransaction(${tx.id})">Delete</button>
    `;
    list.appendChild(li);
  });
}

window.deleteTransaction = (id) => {
  transactions = transactions.filter(t => t.id !== id);
  renderAll();
};

function renderChart() {
  const canvas = document.getElementById('spending-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (chartInstance) chartInstance.destroy();

  const cats = getCategories();
  const totals = cats.map(c => 
    transactions.filter(tx => tx.category === c).reduce((s, t) => s + t.amount, 0)
  );

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: cats,
      datasets: [{
        data: totals,
        backgroundColor: ['#2ecc71', '#3498db', '#e67e22', '#9b59b6', '#f1c40f', '#1abc9c']
      }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });
}

function renderMonthlySummary() {
  const body = document.getElementById('monthly-summary-body');
  const content = document.getElementById('monthly-summary-content');
  const selectedMonth = document.getElementById('month-picker').value;

  if (!monthlySummaryVisible) {
    body.setAttribute('hidden', '');
    return;
  }

  body.removeAttribute('hidden');
  const filtered = transactions.filter(tx => {
    const d = new Date(tx.id);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return monthKey === selectedMonth;
  });

  const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);
  content.innerHTML = `
    <div class="summary-info-grid">
      <div><p>Total Bulan</p><p class="summary-val">$${total.toFixed(2)}</p></div>
      <div><p>Transaksi</p><p class="summary-val">${filtered.length}</p></div>
    </div>
  `;
}

// Form Submission
document.getElementById('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('item-name').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;

  if (name && amount > 0 && category) {
    transactions.push({ id: Date.now(), name, amount, category });
    e.target.reset();
    renderAll();
  }
});

// Custom Category
document.getElementById('add-category-btn').addEventListener('click', () => {
  const input = document.getElementById('category-name-input');
  const val = input.value.trim();
  if (val && !getCategories().includes(val)) {
    customCategories.push(val);
    input.value = '';
    renderAll();
    updateCategorySelect();
  }
});

function updateCategorySelect() {
  const select = document.getElementById('category');
  const current = select.value;
  select.innerHTML = '<option value="">Select...</option>';
  getCategories().forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
  select.value = current;
}

function renderCategoryManager() {
  const list = document.getElementById('category-tag-list');
  list.innerHTML = '';
  customCategories.forEach(c => {
    const span = document.createElement('span');
    span.className = 'category-tag';
    span.textContent = c;
    list.appendChild(span);
  });
}

// Summary Controls
document.getElementById('summary-toggle-btn').addEventListener('click', function() {
  monthlySummaryVisible = !monthlySummaryVisible;
  this.textContent = monthlySummaryVisible ? 'Hide' : 'Show';
  renderMonthlySummary();
});

document.getElementById('month-picker').addEventListener('change', renderMonthlySummary);

// Initialization
document.getElementById('month-picker').value = new Date().toISOString().slice(0, 7);
updateCategorySelect();
renderAll();