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
        return;
      }
      // Display table
      document.getElementById('tableDiv').innerHTML = createTable(data);

      // Calculate summary
      let totalIncome = 0, totalExpense = 0;
      data.forEach(row => {
        // Amount column may have spaces, so we trim and parse
        let amt = parseFloat((row['Amount'] || "0").replace(/,/g, '').trim());
        if (!isNaN(amt)) {
          if (amt > 0) totalIncome += amt;
          else totalExpense += amt;
        }
      });
      let balance = totalIncome + totalExpense;

      // Display summary
      document.getElementById('income').textContent = `Total Income: $${totalIncome.toFixed(2)}`;
      document.getElementById('expense').textContent = `Total Expenses: $${Math.abs(totalExpense).toFixed(2)}`;
      document.getElementById('balance').textContent = `Balance: $${balance.toFixed(2)}`;
      document.getElementById('summary').style.display = 'block';
    }
  });
});

function createTable(data) {
  let html = '<table><thead><tr>';
  // Table headers
  Object.keys(data[0]).forEach(key => {
    html += `<th>${key}</th>`;
  });
  html += '</tr></thead><tbody>';
  // Table rows
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
