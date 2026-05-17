// TradePulse Chrome Extension Popup

document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  setupEventListeners();
});

function loadStats() {
  chrome.storage.local.get(['tradepulse_sales', 'tradepulse_expenses'], (result) => {
    const sales = result.tradepulse_sales || [];
    const expenses = result.tradepulse_expenses || [];
    
    const today = new Date().toDateString();
    
    const todaySales = sales
      .filter(s => new Date(s.date).toDateString() === today)
      .reduce((sum, s) => sum + parseFloat(s.amount), 0);
    
    const todayExpenses = expenses
      .filter(e => new Date(e.date).toDateString() === today)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    const todayProfit = todaySales - todayExpenses;
    
    document.getElementById('today-sales').textContent = formatCurrency(todaySales);
    document.getElementById('today-expenses').textContent = formatCurrency(todayExpenses);
    document.getElementById('today-profit').textContent = formatCurrency(todayProfit);
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
}

function setupEventListeners() {
  document.getElementById('open-app').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  });
  
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.dataset.action;
      openAppWithAction(action);
    });
  });
}

function openAppWithAction(action) {
  chrome.tabs.create({ 
    url: chrome.runtime.getURL('index.html#' + action)
  });
}
