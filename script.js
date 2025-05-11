// Initialize the BroadcastChannel for real-time sync across tabs
const expenseChannel = new BroadcastChannel('expense_tracker_channel');

// DOM Elements
const expenseForm = document.getElementById('expense-form');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseDateInput = document.getElementById('expense-date');
const expenseDescriptionInput = document.getElementById('expense-description');
const expensesList = document.getElementById('expenses-list');
const totalAmountElement = document.getElementById('total-amount');
const weekAmountElement = document.getElementById('week-amount');
const todayAmountElement = document.getElementById('today-amount');
const filterPeriodSelect = document.getElementById('filter-period');
const filterCategorySelect = document.getElementById('filter-category');
const customDateContainer = document.getElementById('custom-date-container');
const filterStartDateInput = document.getElementById('filter-start-date');
const filterEndDateInput = document.getElementById('filter-end-date');
const applyFiltersButton = document.getElementById('apply-filters');
const noExpensesMessage = document.getElementById('no-expenses-message');
const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
const notification = document.getElementById('notification');

// User Profile Elements
const userProfileModal = document.getElementById('user-profile-modal');
const userProfileForm = document.getElementById('user-profile-form');
const userNameInput = document.getElementById('user-name');
const monthlySalaryInput = document.getElementById('monthly-salary');
const profileNameElement = document.getElementById('profile-name');
const profileSalaryElement = document.getElementById('profile-salary');
const remainingBalanceElement = document.getElementById('remaining-balance');
const monthlySavingsElement = document.getElementById('monthly-savings');
const editProfileButton = document.getElementById('edit-profile');

// Chart instances
let categoryChart = null;
let trendChart = null;

// Current filters
let currentFilters = {
    period: 'all',
    category: 'all',
    startDate: null,
    endDate: null
};

// User profile data
let userProfile = {
    name: '',
    monthlySalary: 0
};

// Initialize the application
function initApp() {
    // Set today's date as default for the expense form
    const today = new Date().toISOString().split('T')[0];
    expenseDateInput.value = today;
    
    // Load user profile from localStorage
    loadUserProfile();
    
    // Load expenses from localStorage
    loadExpenses();
    
    // Initialize charts
    initCharts();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check for saved theme preference
    loadThemePreference();
}

// Load user profile from localStorage
function loadUserProfile() {
    const profile = localStorage.getItem('userProfile');
    
    if (profile) {
        userProfile = JSON.parse(profile);
        updateProfileDisplay();
    } else {
        // Show the profile modal if no profile exists
        showProfileModal();
    }
}

// Save user profile to localStorage
function saveUserProfile() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// Show the profile modal
function showProfileModal() {
    // Pre-fill the form with existing data if available
    if (userProfile.name) {
        userNameInput.value = userProfile.name;
    }
    
    if (userProfile.monthlySalary) {
        monthlySalaryInput.value = userProfile.monthlySalary;
    }
    
    // Show the modal
    userProfileModal.classList.add('show');
}

// Hide the profile modal
function hideProfileModal() {
    userProfileModal.classList.remove('show');
}

// Update the profile display in the UI
function updateProfileDisplay() {
    profileNameElement.textContent = userProfile.name || 'Not set';
    profileSalaryElement.textContent = `$${parseFloat(userProfile.monthlySalary).toFixed(2)}`;
    
    // Update remaining balance and monthly savings
    updateFinancialSummary();
}

// Update financial summary (remaining balance and monthly savings)
function updateFinancialSummary() {
    const expenses = getExpensesFromStorage();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Filter expenses for the current month
    const currentMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    // Calculate total expenses for the current month
    const monthlyExpenses = currentMonthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Calculate remaining balance
    const remainingBalance = parseFloat(userProfile.monthlySalary) - monthlyExpenses;
    
    // Update the UI
    remainingBalanceElement.textContent = `$${remainingBalance.toFixed(2)}`;
    
    // Calculate monthly savings (remaining balance as a percentage of salary)
    const monthlySavingsPercentage = userProfile.monthlySalary > 0 
        ? ((remainingBalance / parseFloat(userProfile.monthlySalary)) * 100).toFixed(1) 
        : 0;
    
    monthlySavingsElement.textContent = `$${remainingBalance.toFixed(2)} (${monthlySavingsPercentage}%)`;
}

// Load expenses from localStorage
function loadExpenses() {
    const expenses = getExpensesFromStorage();
    updateExpensesList(expenses);
    updateSummary(expenses);
    updateFinancialSummary();
}

// Get expenses from localStorage
function getExpensesFromStorage() {
    const expenses = localStorage.getItem('expenses');
    return expenses ? JSON.parse(expenses) : [];
}

// Save expenses to localStorage
function saveExpensesToStorage(expenses) {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Add a new expense
function addExpense(expense, broadcast = true) {
    const expenses = getExpensesFromStorage();
    
    // Generate a unique ID for the expense
    expense.id = Date.now().toString();
    
    // Add the new expense to the array
    expenses.push(expense);
    
    // Save to localStorage
    saveExpensesToStorage(expenses);
    
    // Update the UI
    updateExpensesList(expenses);
    updateSummary(expenses);
    updateCharts(expenses);
    updateFinancialSummary();
    
    // Show notification
    showNotification('Expense added successfully!');
    
    // Broadcast the change to other tabs if needed
    if (broadcast) {
        expenseChannel.postMessage({
            type: 'add',
            expense: expense
        });
    }
}

// Delete an expense
function deleteExpense(id, broadcast = true) {
    let expenses = getExpensesFromStorage();
    
    // Filter out the expense with the given ID
    expenses = expenses.filter(expense => expense.id !== id);
    
    // Save to localStorage
    saveExpensesToStorage(expenses);
    
    // Update the UI
    updateExpensesList(expenses);
    updateSummary(expenses);
    updateCharts(expenses);
    updateFinancialSummary();
    
    // Show notification
    showNotification('Expense deleted successfully!');
    
    // Broadcast the change to other tabs if needed
    if (broadcast) {
        expenseChannel.postMessage({
            type: 'delete',
            id: id
        });
    }
}

// Update the expenses list in the UI
function updateExpensesList(expenses) {
    // Clear the current list
    expensesList.innerHTML = '';
    
    // Filter expenses based on current filters
    const filteredExpenses = filterExpenses(expenses);
    
    // Show or hide the "no expenses" message
    if (filteredExpenses.length === 0) {
        noExpensesMessage.classList.remove('hidden');
    } else {
        noExpensesMessage.classList.add('hidden');
    }
    
    // Sort expenses by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add each expense to the list
    filteredExpenses.forEach(expense => {
        const row = document.createElement('tr');
        row.dataset.id = expense.id;
        
        // Format the date
        const expenseDate = new Date(expense.date);
        const formattedDate = expenseDate.toLocaleDateString();
        
        // Create the row content
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${expense.category}</td>
            <td>${expense.description || '-'}</td>
            <td>$${parseFloat(expense.amount).toFixed(2)}</td>
            <td class="expense-actions">
                <button class="btn-delete" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        // Add event listener to the delete button
        const deleteButton = row.querySelector('.btn-delete');
        deleteButton.addEventListener('click', () => {
            deleteExpense(expense.id);
        });
        
        // Add the row to the table
        expensesList.appendChild(row);
    });
}

// Filter expenses based on current filters
function filterExpenses(expenses) {
    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // Filter by period
        let periodMatch = true;
        if (currentFilters.period === 'today') {
            periodMatch = expenseDate.toDateString() === today.toDateString();
        } else if (currentFilters.period === 'week') {
            periodMatch = expenseDate >= startOfWeek;
        } else if (currentFilters.period === 'month') {
            periodMatch = expenseDate >= startOfMonth;
        } else if (currentFilters.period === 'custom') {
            const startDate = currentFilters.startDate ? new Date(currentFilters.startDate) : null;
            const endDate = currentFilters.endDate ? new Date(currentFilters.endDate) : null;
            
            if (startDate && endDate) {
                // Set end date to end of day
                endDate.setHours(23, 59, 59, 999);
                periodMatch = expenseDate >= startDate && expenseDate <= endDate;
            } else if (startDate) {
                periodMatch = expenseDate >= startDate;
            } else if (endDate) {
                endDate.setHours(23, 59, 59, 999);
                periodMatch = expenseDate <= endDate;
            }
        }
        
        // Filter by category
        const categoryMatch = currentFilters.category === 'all' || expense.category === currentFilters.category;
        
        return periodMatch && categoryMatch;
    });
}

// Update the summary section
function updateSummary(expenses) {
    // Calculate total amount
    const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    totalAmountElement.textContent = `$${totalAmount.toFixed(2)}`;
    
    // Calculate this week's amount
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekAmount = expenses
        .filter(expense => new Date(expense.date) >= startOfWeek)
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    weekAmountElement.textContent = `$${weekAmount.toFixed(2)}`;
    
    // Calculate today's amount
    const todayAmount = expenses
        .filter(expense => new Date(expense.date).toDateString() === today.toDateString())
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    todayAmountElement.textContent = `$${todayAmount.toFixed(2)}`;
}

// Initialize charts
function initCharts() {
    // Category chart
    const categoryCtx = document.getElementById('category-chart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4a6fa5', '#166088', '#4caf50', '#ff9800', 
                    '#f44336', '#9c27b0', '#3f51b5', '#607d8b'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Trend chart
    const trendCtx = document.getElementById('trend-chart').getContext('2d');
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Daily Expenses',
                data: [],
                borderColor: '#4a6fa5',
                backgroundColor: 'rgba(74, 111, 165, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                }
            }
        }
    });
    
    // Update charts with current data
    updateCharts(getExpensesFromStorage());
}

// Update charts with new data
function updateCharts(expenses) {
    // Filter expenses based on current filters
    const filteredExpenses = filterExpenses(expenses);
    
    // Update category chart
    updateCategoryChart(filteredExpenses);
    
    // Update trend chart
    updateTrendChart(filteredExpenses);
}

// Update the category chart
function updateCategoryChart(expenses) {
    // Group expenses by category
    const categoryData = {};
    
    expenses.forEach(expense => {
        const category = expense.category;
        const amount = parseFloat(expense.amount);
        
        if (categoryData[category]) {
            categoryData[category] += amount;
        } else {
            categoryData[category] = amount;
        }
    });
    
    // Prepare data for the chart
    const categories = Object.keys(categoryData);
    const amounts = categories.map(category => categoryData[category]);
    
    // Update the chart
    categoryChart.data.labels = categories;
    categoryChart.data.datasets[0].data = amounts;
    categoryChart.update();
}

// Update the trend chart
function updateTrendChart(expenses) {
    // Group expenses by date
    const dateData = {};
    
    expenses.forEach(expense => {
        const date = expense.date;
        const amount = parseFloat(expense.amount);
        
        if (dateData[date]) {
            dateData[date] += amount;
        } else {
            dateData[date] = amount;
        }
    });
    
    // Sort dates
    const dates = Object.keys(dateData).sort();
    
    // Prepare data for the chart
    const formattedDates = dates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString();
    });
    
    const amounts = dates.map(date => dateData[date]);
    
    // Update the chart
    trendChart.data.labels = formattedDates;
    trendChart.data.datasets[0].data = amounts;
    trendChart.update();
}

// Set up event listeners
function setupEventListeners() {
    // User profile form submission
    userProfileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = userNameInput.value;
        const monthlySalary = monthlySalaryInput.value;
        
        // Update user profile
        userProfile.name = name;
        userProfile.monthlySalary = parseFloat(monthlySalary);
        
        // Save to localStorage
        saveUserProfile();
        
        // Update the UI
        updateProfileDisplay();
        
        // Hide the modal
        hideProfileModal();
        
        // Show notification
        showNotification('Profile updated successfully!');
        
        // Broadcast the change to other tabs
        expenseChannel.postMessage({
            type: 'profile_update',
            profile: userProfile
        });
    });
    
    // Edit profile button
    editProfileButton.addEventListener('click', function() {
        showProfileModal();
    });
    
    // Expense form submission
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const amount = expenseAmountInput.value;
        const category = expenseCategoryInput.value;
        const date = expenseDateInput.value;
        const description = expenseDescriptionInput.value;
        
        // Create expense object
        const expense = {
            amount: parseFloat(amount),
            category,
            date,
            description
        };
        
        // Add the expense
        addExpense(expense);
        
        // Reset the form
        expenseForm.reset();
        expenseDateInput.value = new Date().toISOString().split('T')[0];
    });
    
    // Filter period change
    filterPeriodSelect.addEventListener('change', function() {
        const period = this.value;
        currentFilters.period = period;
        
        // Show/hide custom date inputs
        if (period === 'custom') {
            customDateContainer.style.display = 'flex';
        } else {
            customDateContainer.style.display = 'none';
        }
    });
    
    // Apply filters button
    applyFiltersButton.addEventListener('click', function() {
        // Update current filters
        currentFilters.category = filterCategorySelect.value;
        
        if (currentFilters.period === 'custom') {
            currentFilters.startDate = filterStartDateInput.value;
            currentFilters.endDate = filterEndDateInput.value;
        }
        
        // Update the UI
        const expenses = getExpensesFromStorage();
        updateExpensesList(expenses);
        updateCharts(expenses);
    });
    
    // Theme toggle
    themeToggleCheckbox.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
        
        // Update chart colors
        updateChartColors();
    });
    
    // Listen for messages from other tabs
    expenseChannel.addEventListener('message', function(event) {
        const message = event.data;
        
        if (message.type === 'add') {
            // Add the expense without broadcasting
            addExpense(message.expense, false);
        } else if (message.type === 'delete') {
            // Delete the expense without broadcasting
            deleteExpense(message.id, false);
        } else if (message.type === 'profile_update') {
            // Update the profile without broadcasting
            userProfile = message.profile;
            updateProfileDisplay();
        }
    });
}

// Update chart colors based on theme
function updateChartColors() {
    if (categoryChart && trendChart) {
        // Update text colors
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
        const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        
        // Update category chart
        categoryChart.options.plugins.legend.labels.color = textColor;
        
        // Update trend chart
        trendChart.options.scales.x.ticks.color = textColor;
        trendChart.options.scales.y.ticks.color = textColor;
        trendChart.options.scales.x.grid.color = borderColor;
        trendChart.options.scales.y.grid.color = borderColor;
        trendChart.options.plugins.legend.labels.color = textColor;
        
        // Update the charts
        categoryChart.update();
        trendChart.update();
    }
}

// Load theme preference from localStorage
function loadThemePreference() {
    const theme = localStorage.getItem('theme');
    
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleCheckbox.checked = true;
    }
}

// Show notification
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.className = 'notification';
    
    if (isError) {
        notification.classList.add('error');
    }
    
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);