document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      const data = results.data;
      if (!data || data.length === 0) {
        document.getElementById('tableDiv').innerText = 'No data found!';
        document.getElementById('summary').style.display = 'none';
        document.getElementById('charts').style.display = 'none';
        return;
      }
      // Display table
      document.getElementById('tableDiv').innerHTML = createTable(data);

      // Calculate summary
      let totalIncome = 0, totalExpense = 0;
      let expensesByPayee = {};
      let monthlyExpenses = {};

      data.forEach(row => {
        let amt = parseFloat((row['Amount'] || "0").replace(/,/g, '').trim());
        if (!isNaN(amt)) {
          if (amt > 0) totalIncome += amt;
          else totalExpense += amt;

          // Pie chart: expenses by Payee
          if (amt < 0) {
            let payee = row['Payee'] || "Other";
            expensesByPayee[payee] = (expensesByPayee[payee] || 0) + Math.abs(amt);
          }
          // Bar chart: monthly expenses
          if (row['Posted Date']) {
            let monthYear = row['Posted Date'].slice(0, 7); // "MM/DD/YYYY" -> "MM/YYYY"
            if (amt < 0) {
              monthlyExpenses[monthYear] = (monthlyExpenses[monthYear] || 0) + Math.abs(amt);
            }
          }
        }
      });
      let balance = totalIncome + totalExpense;

      // Show summary
      document.getElementById('income').textContent = `Total Income: $${totalIncome.toFixed(2)}`;
      document.getElementById('expense').textContent = `Total Expenses: $${Math.abs(totalExpense).toFixed(2)}`;
      document.getElementById('balance').textContent = `Balance: $${balance.toFixed(2)}`;
      document.getElementById('summary').style.display = 'block';

      // Show charts
      document.getElementById('charts').style.display = 'block';
      renderPieChart(expensesByPayee);
      renderBarChart(monthlyExpenses);
    }
  });
});

function createTable(data) {
  let html = '<table><thead><tr>';
  Object.keys(data[0]).forEach(key => {
    html += `<th>${key}</th>`;
  });
  html += '</tr></thead><tbody>';
  data.forEach(row => {
    html += '<tr>';
    Object.values(row).forEach(value => {
      html += `<td>${value}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function renderPieChart(expensesByPayee) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  if (window.pieChartInstance) window.pieChartInstance.destroy();
  window.pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(expensesByPayee),
      datasets: [{
        data: Object.values(expensesByPayee),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FFC107', '#00BCD4', '#E91E63', '#9C27B0'
        ]
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Expenses by Payee'
        }
      }
    }
  });
}

function renderBarChart(monthlyExpenses) {
  const ctx = document.getElementById('barChart').getContext('2d');
  if (window.barChartInstance) window.barChartInstance.destroy();
  const labels = Object.keys(monthlyExpenses);
  const values = Object.values(monthlyExpenses);
  window.barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monthly Expenses',
        data: values,
        backgroundColor: '#36A2EB'
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Monthly Expenses'
        }
      }
    }
  });
}
