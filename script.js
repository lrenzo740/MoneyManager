// Helper functions for getting and setting local storage data
function getLocalStorageData(key, defaultValue = []) {
    return JSON.parse(localStorage.getItem(key)) || defaultValue;
}

function setLocalStorageData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Load data from local storage on page load
document.addEventListener("DOMContentLoaded", function() {
    loadBalance();
    loadTransactions();
    loadCards();
    loadExpenseSummary();  // Ensure expense summary is loaded on page load
});

// Load and display balance
function loadBalance() {
    const balance = parseFloat(localStorage.getItem("balance")) || 0.00;
    const balanceElement = document.getElementById("total-balance");
    if (balanceElement) {
        balanceElement.innerText = `$${balance.toFixed(2)}`;
    }
}

// Load and display transactions
function loadTransactions() {
    const transactions = getLocalStorageData("transactions");
    const transactionsList = document.getElementById("transactions-list");
    if (transactionsList) {
        transactionsList.innerHTML = '';
        transactions.forEach(transaction => {
            const transactionDiv = document.createElement("div");
            transactionDiv.className = "transaction";
            const typeClass = transaction.type === "income" ? "income" : "expense";
            transactionDiv.innerHTML = `
                <span>${transaction.description}</span>
                <span class="${typeClass}">${transaction.type === "income" ? "+" : "-"} $${transaction.amount.toFixed(2)}</span>
            `;
            transactionsList.appendChild(transactionDiv);
        });
    }
}

// Add a new transaction
document.getElementById("transaction-form")?.addEventListener("submit", function(event) {
    event.preventDefault();

    const description = document.getElementById("description").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("transaction-type").value;

    // Form validation
    if (!description || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid description and amount.");
        return;
    }

    // Update transactions in local storage
    const transactions = getLocalStorageData("transactions");
    transactions.push({ description, amount, type });
    setLocalStorageData("transactions", transactions);

    // Update balance in local storage
    const currentBalance = parseFloat(localStorage.getItem("balance")) || 0.00;
    const newBalance = type === "income" ? currentBalance + amount : currentBalance - amount;
    localStorage.setItem("balance", newBalance.toFixed(2));

    // Reload balance and transactions
    loadBalance();
    loadTransactions();

    // Clear the form
    document.getElementById("transaction-form").reset();

    // Update expense summary after transaction is added
    loadExpenseSummary();  // Recalculate and display expense summary
});

// Load and display cards
function loadCards() {
    const cards = getLocalStorageData("cards");
    const cardsList = document.getElementById("cards-list");
    if (cardsList) {
        cardsList.innerHTML = '';
        cards.forEach(card => {
            const cardDiv = document.createElement("div");
            cardDiv.className = "transaction";
            cardDiv.innerText = `Card: ${card.number}`;
            cardsList.appendChild(cardDiv);
        });
    }
}

// Add a new card
document.getElementById("add-card")?.addEventListener("click", function() {
    const cardNumber = prompt("Enter card number:");
    if (cardNumber) {
        const cards = getLocalStorageData("cards");
        cards.push({ number: cardNumber });
        setLocalStorageData("cards", cards);
        loadCards();
    }
});

// Load and display expense summary (with graph)
function loadExpenseSummary() {
    const transactions = getLocalStorageData("transactions");

    let totalIncome = 0;
    let totalExpense = 0;

    // Calculate total income and expenses
    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });

    // Update the expense summary display
    const expenseSummaryElement = document.getElementById("summary-details");
    if (expenseSummaryElement) {
        expenseSummaryElement.innerHTML = `
            <div>Total Income: $${totalIncome.toFixed(2)}</div>
            <div>Total Expense: $${totalExpense.toFixed(2)}</div>
            <div>Net Balance: $${(totalIncome - totalExpense).toFixed(2)}</div>
        `;
    }

    // Create the chart
    const ctx = document.getElementById("expenseChart").getContext("2d");
    const expenseChart = new Chart(ctx, {
        type: "bar",  // Choose a bar chart type
        data: {
            labels: ["Income", "Expense"],  // Labels for the chart
            datasets: [{
                label: "Amount",
                data: [totalIncome, totalExpense],  // Data points for the graph
                backgroundColor: [
                    "rgba(76, 175, 80, 0.5)",  // Green for income
                    "rgba(255, 87, 34, 0.5)"   // Red for expenses
                ],
                borderColor: [
                    "rgba(76, 175, 80, 1)",
                    "rgba(255, 87, 34, 1)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) { return "$" + value; }  // Format y-axis labels with "$"
                    }
                }
            }
        }
    });
}
