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

function cleanData(data) {
  return data
    .filter(row => row['Amount'] && row['Posted Date'])
    .map(row => {
      Object.keys(row).forEach(k => { row[k] = (row[k] || '').trim(); });
      return row;
    });
}

function getCategories(data) {
  const categories = {};
  data.forEach(row => {
    let payee = (row['Payee'] || '').toLowerCase();
    let cat = 'Other';
    if (payee.includes('grocery') || payee.includes('market') || payee.includes('fresh') || payee.includes('tom thumb') || payee.includes('walmart') || payee.includes('supercenter')) cat = 'Grocery';
    else if (payee.includes('medical') || payee.includes('clinic') || payee.includes('dental') || payee.includes('bswhealth') || payee.includes('hospital')) cat = 'Medical';
    else if (payee.includes('cafe') || payee.includes('restaurant') || payee.includes('potbelly') || payee.includes('bagel') || payee.includes('beans') || payee.includes('jersey mikes') || payee.includes('taco bell')) cat = 'Dining';
    else if (payee.includes('clip') || payee.includes('beauty') || payee.includes('salon')) cat = 'Personal Care';
    else if (payee.includes('payment') || payee.includes('salary')) cat = 'Income';
    else if (payee.includes('mobile') || payee.includes('spectrum') || payee.includes('electricity') || payee.includes('utilities')) cat = 'Utilities';
    else if (payee.includes('gofundme') || payee.includes('heifer'))
