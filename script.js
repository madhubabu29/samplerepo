let allData = [];
let allCategories = [];
let currentCategory = 'All';

document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      allData = cleanData(results.data);
      allCategories = getCategories(allData);
      currentCategory = 'All';
      renderSummary(allData);
      renderCategoryList(allCategories);
      renderCharts(allData, currentCategory);
      renderTable(allData, currentCategory);
    }
  });
});

// Clean data: remove empty rows, trim strings
function cleanData(data) {
  return data
    .filter(row => row['Amount'] && row['Posted Date'])
    .map(row => {
      // Trim all fields
      Object.keys(row).forEach(k => { row[k] = (row[k] || '').trim(); });
      return row;
    });
}

// Get list of unique categories from Payee (can be improved to use regex or custom mapping)
function getCategories(data) {
  const categories = {};
  data.forEach(row => {
    // For demo, infer category from Payee field (improve with better mapping if needed)
    let payee = (row['Payee'] || '').toLowerCase();
    let cat = 'Other';
    if (payee.includes('grocery') || payee.includes('market') || payee.includes('fresh') || payee.includes('tom thumb') || payee.includes('walmart') || payee.includes('supercenter')) cat = 'Grocery';
    else if (payee.includes('medical') || payee.includes('clinic') || payee.includes('dental') || payee.includes('bswhealth') || payee.includes('hospital')) cat = 'Medical';
    else if (payee.includes('cafe') || payee.includes('restaurant') || payee.includes('potbelly') || payee.includes('bagel') || payee.includes('beans') || payee.includes('jersey mikes') || payee.includes('taco bell')) cat = 'Dining';
    else if (payee.includes('clip') || payee.includes('beauty') || payee.includes('salon')) cat = 'Personal Care';
    else if (payee.includes('payment') || payee.includes('salary')) cat = 'Income';
    else if (payee.includes('mobile') || payee.includes('spectrum') || payee.includes('electricity') || payee.includes('utilities')) cat = 'Utilities';
    else if (payee.includes('gofundme') || payee.includes('heifer')) cat = 'Charity';
    row['Category'] = cat;
    if (cat !== 'Income') categories[cat] = true;
  });
  // Always include 'All' at the top
  return ['All', ...Object.keys(categories)];
}

// Render the summary boxes (total debits, total credits)
function renderSummary(data) {
  let debits = 0, credits = 0;
  data.forEach(row => {
    let amt = parseFloat(row['Amount']);
    if (!isNaN(amt)) {
      if (amt > 0) credits += amt;
      else debits += amt;
    }
  });
  document.getElementById('totalDebits').textContent = `Total Debits: $${Math.abs(debits).toFixed(2)}`;
  document.getElementById('totalCredits').textContent = `Total Credits: $${credits.toFixed(2)}`;
}

// Render the sidebar category list
function renderCategoryList(categories) {
  const ul = document.getElementById('categoryList');
  ul.innerHTML = '';
  categories.forEach(cat => {
    const li = document.createElement('li');
    li.textContent = cat;
    if (cat === currentCategory) li.classList.add('active');
    li.addEventListener('click', function() {
      currentCategory = cat;
      renderCategoryList(categories);
      renderCharts(allData, currentCategory);
      renderTable(allData, currentCategory);
    });
    ul.appendChild(li);
  });
}

// Render both charts based on category
function renderCharts(data, category) {
  // Filter for selected category (except 'All')
  let filtered = (category === 'All') ? data : data.filter(row => row['Category'] === category);

  // Pie Chart: Expenses by Category (for All) or by Payee (for a category)
  if (category === 'All') {
    // Sum by categories (excluding Income)
    let sums = {};
    filtered.forEach(row => {
      if (row['Category'] !== 'Income') {
        let amt = parseFloat(row['Amount']);
        if (amt < 0) {
          sums[row['Category']] = (sums[row['Category']] || 0) + Math.abs(amt);
        }
      }
    });
    renderPieChart(Object.keys(sums), Object.values(sums), 'Expenses by Category');
  } else {
    // Sum by Payee for selected category
    let sums = {};
    filtered.forEach(row => {
      let amt = parseFloat(row['Amount']);
      if (amt < 0) {
        let payee = row['Payee'] || 'Other';
        sums[payee] = (sums[payee] || 0) + Math.abs(amt);
      }
    });
    renderPieChart(Object.keys(sums), Object.values(sums), `Expenses by Payee in "${category}"`);
  }

  // Bar Chart: Expenses by Day of the Month
  let daySums = {};
  filtered.forEach(row => {
    let amt = parseFloat(row['Amount']);
    if (amt < 0 && row['Posted Date']) {
      let day = row['Posted Date'].split('/')[1] || ''; // MM/DD/YYYY -> DD
      if (day) {
        daySums[day] = (daySums[day] || 0) + Math.abs(amt);
      }
    }
  });
  // Sort days numerically
  let dayLabels = Object.keys(daySums).sort((a,b) => parseInt(a)-parseInt(b));
  let dayValues = dayLabels.map(d => daySums[d]);
  renderBarChart(dayLabels, dayValues, `Expenses by Day of the Month (${category})`);
}

// Pie Chart renderer
function renderPieChart(labels, data, title) {
  document.getElementById('pieChartTitle').textContent = title;
  const ctx = document.getElementById('pieChart').getContext('2d');
  if (window.pieChartInstance) window.pieChartInstance.destroy();
  window.pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FFC107', '#00BCD4', '#E91E63', '#9C27B0', '#607D8B', '#795548'
        ]
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: title
        },
        legend: {
          position: 'right'
        }
      }
    }
  });
}

// Bar Chart renderer
function renderBarChart(labels, data, title) {
  document.getElementById('barChartTitle').textContent = title;
  const ctx = document.getElementById('barChart').getContext('2d');
  if (window.barChartInstance) window.barChartInstance.destroy();
  window.barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Expense',
        data: data,
        backgroundColor: '#36A2EB'
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: title
        }
      },
      scales: {
        x: { title: { display: true, text: 'Day of Month' }},
        y: { title: { display: true, text: 'Amount ($)' }}
      }
    }
  });
}

// Render transaction table
function renderTable(data, category) {
  let filtered = (category === 'All') ? data : data.filter(row => row['Category'] === category);
  let html = '<table><thead><tr>';
  // Table headers
  let headers = ['Posted Date', 'Reference Number', 'Payee', 'Address', 'Amount', 'Category'];
  headers.forEach(key => { html += `<th>${key}</th>`; });
  html += '</tr></thead><tbody>';
  filtered.forEach(row => {
    html += '<tr>';
    headers.forEach(key => {
      html += `<td>${row[key] || ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  document.getElementById('tableDiv').innerHTML = html;
}
