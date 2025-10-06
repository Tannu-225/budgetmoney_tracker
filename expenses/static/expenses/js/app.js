 document.addEventListener('DOMContentLoaded', function() {
      // DOM Elements
      const transactionForm = document.getElementById('transaction-form');
      const descriptionInput = document.getElementById('description');
      const amountInput = document.getElementById('amount');
      const categoryInput = document.getElementById('category');
      const transactionTypeToggle = document.getElementById('transaction-type');
      const transactionTypeText = document.getElementById('transaction-type-text');
      const transactionList = document.getElementById('transaction-list');
      const emptyState = document.getElementById('empty-state');
      const loadingPlaceholder = document.getElementById('loading-placeholder');
      const totalBalance = document.getElementById('total-balance');
      const totalCredits = document.getElementById('total-credits');
      const totalDebits = document.getElementById('total-debits');
      const filterType = document.getElementById('filter-type');
      const filterCategory = document.getElementById('filter-category');
      const filterPeriod = document.getElementById('filter-period');
      
      // Default transaction type (debit)
      let isCredit = false;
      
      // Initialize the app
      initApp();
      
      // Toggle transaction type
      transactionTypeToggle.addEventListener('change', function() {
        isCredit = this.checked;
        transactionTypeText.textContent = isCredit ? 'Credit' : 'Debit';
        transactionTypeText.className = isCredit ? 'text-emerald-600' : 'text-red-600';
      });
      
      // Form submit handler
      transactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const category = categoryInput.value;
        const type = isCredit ? 'credit' : 'debit';
        const date = new Date();
        
        // Create transaction object
        let transactions = getTransactions();

// If editing existing transaction
        if (transactionForm.dataset.editingId) {
          const editId = transactionForm.dataset.editingId;
          transactions = transactions.map(t =>
            t.id === editId
              ? { ...t, description, amount, category, type, date: date.toISOString(),
                  formattedDate: formatDate(date), formattedTime: formatTime(date) }
              : t
          );
          localStorage.setItem('transactions', JSON.stringify(transactions));
          delete transactionForm.dataset.editingId; // clear edit mode
        } else {
          // Otherwise add new transaction
          const transaction = {
            id: Date.now().toString(),
            description,
            amount,
            category,
            type,
            date: date.toISOString(),
            formattedDate: formatDate(date),
            formattedTime: formatTime(date)
          };
          saveTransaction(transaction);
        }

        
        // Reset form
        transactionForm.reset();
        transactionTypeToggle.checked = false;
        isCredit = false;
        transactionTypeText.textContent = 'Debit';
        transactionTypeText.className = 'text-red-600';
        
        // Update UI
        updateUI();
      });
      
      // Filter change handlers
      filterType.addEventListener('change', updateUI);
      filterCategory.addEventListener('change', updateUI);
      filterPeriod.addEventListener('change', updateUI);
      
      // Initialize the app
      function initApp() {
        // Show loading state
        showLoading();
        
        // Simulate API loading delay
        setTimeout(() => {
          // Initialize localStorage if needed
          if (!localStorage.getItem('transactions')) {
            localStorage.setItem('transactions', JSON.stringify([]));
          }
          
          // Update UI
          updateUI();
          
          // Hide loading
          hideLoading();
        }, 800);
      }
      
      // Show loading state
      function showLoading() {
        loadingPlaceholder.classList.remove('hidden');
        transactionList.classList.add('hidden');
        emptyState.classList.add('hidden');
      }
      
      // Hide loading state
      function hideLoading() {
        loadingPlaceholder.classList.add('hidden');
      }
      
      // Get transactions from localStorage
      function getTransactions() {
        return JSON.parse(localStorage.getItem('transactions')) || [];
      }
      
      // Save transaction to localStorage
      function saveTransaction(transaction) {
        const transactions = getTransactions();
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
      }
      
      // Delete transaction from localStorage
      function deleteTransaction(id) {
        let transactions = getTransactions();
        transactions = transactions.filter(transaction => transaction.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateUI();
      }
      
      // Update UI based on current transactions and filters
      function updateUI() {
        // Get transactions
        let transactions = getTransactions();
        
        // Apply filters
        const typeFilter = filterType.value;
        const categoryFilter = filterCategory.value;
        const periodFilter = filterPeriod.value;
        
        if (typeFilter !== 'all') {
          transactions = transactions.filter(t => t.type === typeFilter);
        }
        
        if (categoryFilter !== 'all') {
          transactions = transactions.filter(t => t.category === categoryFilter);
        }
        
        // Apply time period filter
        if (periodFilter !== 'all') {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          if (periodFilter === 'weekly') {
            // Last 7 days
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            transactions = transactions.filter(t => new Date(t.date) >= weekAgo);
          } else if (periodFilter === 'monthly') {
            // Current month
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            transactions = transactions.filter(t => new Date(t.date) >= startOfMonth);
          } else if (periodFilter === 'yearly') {
            // Current year
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            transactions = transactions.filter(t => new Date(t.date) >= startOfYear);
          }
        }
        
        // Sort transactions by date (newest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Update transaction list
        renderTransactions(transactions);
        
        // Update summary
        updateSummary();
      }
      
      // Render transactions to the DOM
      function renderTransactions(transactions) {
        if (transactions.length === 0) {
          transactionList.classList.add('hidden');
          emptyState.classList.remove('hidden');
        } else {
          emptyState.classList.add('hidden');
          transactionList.classList.remove('hidden');
          
          // Clear previous transactions
          transactionList.innerHTML = '';
          
          // Add each transaction to the list
          transactions.forEach(transaction => {
            const transactionElement = createTransactionElement(transaction);
            transactionList.appendChild(transactionElement);
          });
        }
      }
      
      // Create a transaction element
      function createTransactionElement(transaction) {
        const { id, description, amount, category, type, formattedDate, formattedTime } = transaction;
        
        const isCredit = type === 'credit';
        const amountClass = isCredit ? 'credit-amount' : 'debit-amount';
        const amountPrefix = isCredit ? '+' : '-';
        
        // Create category badge color
        let categoryColor;
        switch (category) {
          case 'Food': categoryColor = 'bg-orange-100 text-orange-800'; break;
          case 'Shopping': categoryColor = 'bg-blue-100 text-blue-800'; break;
          case 'Housing': categoryColor = 'bg-indigo-100 text-indigo-800'; break;
          case 'Transportation': categoryColor = 'bg-purple-100 text-purple-800'; break;
          case 'Entertainment': categoryColor = 'bg-pink-100 text-pink-800'; break;
          case 'Utilities': categoryColor = 'bg-yellow-100 text-yellow-800'; break;
          case 'Healthcare': categoryColor = 'bg-red-100 text-red-800'; break;
          case 'Salary': categoryColor = 'bg-green-100 text-green-800'; break;
          case 'Investment': categoryColor = 'bg-teal-100 text-teal-800'; break;
          default: categoryColor = 'bg-gray-100 text-gray-800';
        }
        
        // Create transaction element
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item bg-white rounded-lg border border-gray-200 p-4 slide-in';
        transactionElement.dataset.id = id;
        
        transactionElement.innerHTML = `
          <div class="flex flex-wrap justify-between items-center">
            <div class="flex flex-col mb-2 sm:mb-0">
              <h3 class="font-medium text-gray-900">${description}</h3>
              <div class="flex items-center text-sm text-gray-500 mt-1">
                <i class="far fa-calendar-alt mr-1"></i> ${formattedDate}
                <i class="far fa-clock ml-3 mr-1"></i> ${formattedTime}
              </div>
            </div>
            <div class="flex items-center">
              <span class="category-badge ${categoryColor} mr-4">${category}</span>
              <span class="text-lg font-bold ${amountClass}">${amountPrefix}$${amount.toFixed(2)}</span>
            </div>
          </div>
          <div class="flex justify-end mt-3">
            <button class="text-gray-400 hover:text-indigo-600 mr-3" data-action="edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="text-gray-400 hover:text-red-600" data-action="delete">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `;
        
        // Add delete action
        const deleteButton = transactionElement.querySelector('[data-action="delete"]');
        deleteButton.addEventListener('click', () => deleteTransaction(id));
        
        // Add edit action (placeholder for now)
       // Add edit action
          const editButton = transactionElement.querySelector('[data-action="edit"]');
          editButton.addEventListener('click', () => {
            // Load values into form
            descriptionInput.value = description;
            amountInput.value = amount;
            categoryInput.value = category;
            isCredit = type === 'credit';
            transactionTypeToggle.checked = isCredit;
            transactionTypeText.textContent = isCredit ? 'Credit' : 'Debit';
            transactionTypeText.className = isCredit ? 'text-emerald-600' : 'text-red-600';

          // Store ID in form dataset so we know it's editing
            transactionForm.dataset.editingId = id;
          });

        return transactionElement;
      }
      
      // Update summary information
      function updateSummary() {
        const transactions = getTransactions();
        
        let totalBalanceAmount = 0;
        let totalCreditsAmount = 0;
        let totalDebitsAmount = 0;
        
        transactions.forEach(transaction => {
          const amount = transaction.amount;
          
          if (transaction.type === 'credit') {
            totalCreditsAmount += amount;
            totalBalanceAmount += amount;
          } else {
            totalDebitsAmount += amount;
            totalBalanceAmount -= amount;
          }
        });
        
        // Update the DOM
        totalBalance.textContent = `$${totalBalanceAmount.toFixed(2)}`;
        totalCredits.textContent = `$${totalCreditsAmount.toFixed(2)}`;
        totalDebits.textContent = `$${totalDebitsAmount.toFixed(2)}`;
        
        // Add color to balance based on positive/negative
        if (totalBalanceAmount < 0) {
          totalBalance.className = 'text-3xl font-bold mt-2 text-red-500';
        } else {
          totalBalance.className = 'text-3xl font-bold mt-2';
        }
      }
      
      // Format date (e.g., "Jan 15, 2025")
      function formatDate(date) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
      }
      
      // Format time (e.g., "2:30 PM")
      function formatTime(date) {
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        return date.toLocaleTimeString('en-US', options);
      }
    });