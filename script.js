let expenses = [];
let filteredExpenses = [];

const expense_table=document.getElementById("espense-table")
const form = document.getElementById("expense-form");
const totalExpenseEl = document.getElementById("total-expense");
const subtotalExpenseEl = document.getElementById("subtotal-expense");
const expenseList = document.getElementById("expense-list");

const filterMonth = document.getElementById("filter-month");
const filterDate = document.getElementById("filter-date");
const filterCategory = document.getElementById("filter-category");

// Add Expense
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("expense-name").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const category = document.getElementById("expense-category").value;
  const date = document.getElementById("expense-date").value;

  expenses.push({ name, amount, category, date });
  form.reset();
  applyFilters();
});

// Display Expenses
function renderExpenses(list) {
  expenseList.innerHTML = "";
  list.forEach(exp => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${exp.name}</td>
      <td>₹${exp.amount}</td>
      <td>${exp.category}</td>
      <td>${exp.date}</td>
      <td><button style="background-color:red; color:white ; padding: 5px; border: none; cursor: pointer; border-radius: 8px">Delete</button></td> `;
    expenseList.appendChild(row);
    row.querySelector(".del-btn").addEventListener("click", (e) => {
     row.remove();  
     expenses = expenses.filter(e => e !== exp);
     filteredExpenses = filteredExpenses.filter(e => e !== exp);
      applyFilters();
  });
  });
  updateCharts(list);
}
// Apply Filters
document.getElementById("apply-filters").addEventListener("click", applyFilters);
document.getElementById("reset-filters").addEventListener("click", () => {
  filterMonth.value = "";
  filterDate.value = "";
  filterCategory.value = "";
  applyFilters();
});

function applyFilters() {
  filteredExpenses = expenses.filter(exp => {
    const monthMatch = filterMonth.value ? exp.date.startsWith(filterMonth.value) : true;
    const dateMatch = filterDate.value ? exp.date === filterDate.value : true;
    const categoryMatch = filterCategory.value ? exp.category === filterCategory.value : true;
    return monthMatch && dateMatch && categoryMatch;
  });
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
   totalExpenseEl.textContent = total;
   const subtotal = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
   subtotalExpenseEl.textContent = subtotal;
  renderExpenses(filteredExpenses);
}

// Charts

let donutChart, dateBarChart, monthBarChart;

function updateCharts(list) {
  // Destroy old charts if exist
  if (donutChart) donutChart.destroy();
  if (dateBarChart) dateBarChart.destroy();
  if (monthBarChart) monthBarChart.destroy();

  // ---- 1. Donut Chart (Category-wise) ----
  const categories = [...new Set(list.map(exp => exp.category))];
  const categoryTotals = categories.map(cat =>
    list.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.amount, 0)
  );

  donutChart = new Chart(document.getElementById("donutChart"), {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [{
        data: categoryTotals,
        backgroundColor: ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#9333ea"]
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Category-wise Expenses",
          font:{
            size:18,
            weight:'bold'
          }
        }
      }
    }
  });

  // ---- 2. Date-wise Bar Chart ----
  const dates = [...new Set(list.map(exp => exp.date))].sort();
  const dateTotals = dates.map(d =>
    list.filter(exp => exp.date === d).reduce((sum, exp) => sum + exp.amount, 0)
  );

  dateBarChart = new Chart(document.getElementById("dateBarChart"), {
    type: "bar",
    data: {
      labels: dates,
      datasets: [{
        label: "Expenses (₹)",
        data: dateTotals,
        backgroundColor: "rgba(37,99,235,0.6)"
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Date-wise Expenses",
           font:{
            size:18,
            weight:'bold'
          }
        }
      },
      scales: {
        x: { title: { display: true, text: "Date" } },
        y: { title: { display: true, text: "Amount (₹)" }, beginAtZero: true }
      }
    }
  });

  // ---- 3. Month-wise Bar Chart ----
  const monthMap = {};
  list.forEach(exp => {
    const month = exp.date.slice(0, 7); // YYYY-MM
    monthMap[month] = (monthMap[month] || 0) + exp.amount;
  });
  const months = Object.keys(monthMap).sort();
  const monthTotals = months.map(m => monthMap[m]);

  monthBarChart = new Chart(document.getElementById("monthBarChart"), {
    type: "bar",
    data: {
      labels: months,
      datasets: [{
        label: "Expenses (₹)",
        data: monthTotals,
        backgroundColor: "rgba(16,163,70,0.6)"
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Month-wise Expenses",
           font:{
            size:18,
            weight:'bold'
          }
        }
      },
      scales: {
        x: { title: { display: true, text: "Month" } },
        y: { title: { display: true, text: "Amount (₹)" }, beginAtZero: true }
      }
    }
  });
}



// Chatbot
const chatbotIcon = document.querySelector(".chatbot-icon");
const chatbotWindow = document.querySelector(".chatbot-window");
const chatbotMessages = document.getElementById("chatbot-messages");
const chatbotInput = document.getElementById("chatbot-input");
const chatbotSend = document.getElementById("chatbot-send");

chatbotIcon.addEventListener("click", () => {
  chatbotWindow.style.display = chatbotWindow.style.display === "flex" ? "none" : "flex";
});

chatbotSend.addEventListener("click", sendMessage);
chatbotInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = chatbotInput.value.trim();
  if (!text) return;
  addMessage("You", text);
  chatbotInput.value = "";

  setTimeout(() => {
    addMessage("Bot", getBotResponse(text));
  }, 500);
}

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.textContent = `${sender}: ${text}`;
  chatbotMessages.appendChild(msg);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}
function getBotResponse(input) {
  input = input.toLowerCase();
   // ---- HELP ----
  if (input.includes("help")) {
    return `Ask me total, highest, lowest, average expenses and get a summary based on categories, date or month.`;
  }

  if (filteredExpenses.length === 0) {
    return "No expenses found. Try adding some or adjusting filters.";
  }

  
  const getTotal = (list) => list.reduce((sum, exp) => sum + exp.amount, 0);
  const getHighest = (list) => list.reduce((max, exp) => exp.amount > max.amount ? exp : max, list[0]);
  const getLowest = (list) => list.reduce((min, exp) => exp.amount < min.amount ? exp : min, list[0]);
  const getAverage = (list) => (getTotal(list) / list.length).toFixed(2);

  // ---- TOTAL ----
  if (input.includes("total")) {
    return `Total expenses: ₹${getTotal(filteredExpenses)}`;
  }

  // ---- HIGHEST ----
  if (input.includes("highest")) {
    if (input.includes("category")) {
      const category = input.split(" ").pop();
      const list = filteredExpenses.filter(exp => exp.category.toLowerCase() === category);
      if (list.length === 0) return `No expenses found for category "${category}".`;
      const maxExp = getHighest(list);
      return `Highest expense in category ${category}: ₹${maxExp.amount} (${maxExp.date})`;
    }
    if (input.includes("month")) {
      const month = input.match(/\d{4}-\d{2}/)?.[0];
      if (!month) return "Please provide month in YYYY-MM format.";
      const list = filteredExpenses.filter(exp => exp.date.startsWith(month));
      if (list.length === 0) return `No expenses found in ${month}.`;
      const maxExp = getHighest(list);
      return `Highest expense in ${month}: ₹${maxExp.amount} (${maxExp.category}, ${maxExp.date})`;
    }
    if (input.includes("date")) {
      const day = input.match(/\d{4}-\d{2}-\d{2}/)?.[0];
      if (!day) return "Please provide date in YYYY-MM-DD format.";
      const list = filteredExpenses.filter(exp => exp.date === day);
      if (list.length === 0) return `No expenses found on ${day}.`;
      const maxExp = getHighest(list);
      return `Highest expense on ${day}: ₹${maxExp.amount} (${maxExp.category})`;
    }
  }

  // ---- LOWEST ----
  if (input.includes("lowest")) {
    if (input.includes("category")) {
      const category = input.split(" ").pop();
      const list = filteredExpenses.filter(exp => exp.category.toLowerCase() === category);
      if (list.length === 0) return `No expenses found for category "${category}".`;
      const minExp = getLowest(list);
      return `Lowest expense in category ${category}: ₹${minExp.amount} (${minExp.date})`;
    }
    if (input.includes("month")) {
      const month = input.match(/\d{4}-\d{2}/)?.[0];
      if (!month) return "Please provide month in YYYY-MM format.";
      const list = filteredExpenses.filter(exp => exp.date.startsWith(month));
      if (list.length === 0) return `No expenses found in ${month}.`;
      const minExp = getLowest(list);
      return `Lowest expense in ${month}: ₹${minExp.amount} (${minExp.category}, ${minExp.date})`;
    }
    if (input.includes("date")) {
      const day = input.match(/\d{4}-\d{2}-\d{2}/)?.[0];
      if (!day) return "Please provide date in YYYY-MM-DD format.";
      const list = filteredExpenses.filter(exp => exp.date === day);
      if (list.length === 0) return `No expenses found on ${day}.`;
      const minExp = getLowest(list);
      return `Lowest expense on ${day}: ₹${minExp.amount} (${minExp.category})`;
    }
  }

  // ---- AVERAGE ----
  if (input.includes("average")) {
    if (input.includes("category")) {
      const category = input.split(" ").pop();
      const list = filteredExpenses.filter(exp => exp.category.toLowerCase() === category);
      if (list.length === 0) return `No expenses found for category "${category}".`;
      return `Average expense in category ${category}: ₹${getAverage(list)}`;
    }
    if (input.includes("month")) {
      const month = input.match(/\d{4}-\d{2}/)?.[0];
      if (!month) return "Please provide month in YYYY-MM format.";
      const list = filteredExpenses.filter(exp => exp.date.startsWith(month));
      if (list.length === 0) return `No expenses found in ${month}.`;
      return `Average expense in ${month}: ₹${getAverage(list)}`;
    }
    if (input.includes("date")) {
      const day = input.match(/\d{4}-\d{2}-\d{2}/)?.[0];
      if (!day) return "Please provide date in YYYY-MM-DD format.";
      const list = filteredExpenses.filter(exp => exp.date === day);
      if (list.length === 0) return `No expenses found on ${day}.`;
      return `Average expense on ${day}: ₹${getAverage(list)}`;
    }
  }

  // ---- SUMMARY ----
  if (input.includes("summary")) {
    if (input.includes("category")) {
      const map = {};
      filteredExpenses.forEach(exp => {
        map[exp.category] = (map[exp.category] || 0) + exp.amount;
      });
      return "Summary by category:\n" + Object.entries(map).map(([cat, amt]) => `${cat}: ₹${amt}`).join("\n");
    }
    if (input.includes("month")) {
      const map = {};
      filteredExpenses.forEach(exp => {
        const month = exp.date.slice(0, 7);
        map[month] = (map[month] || 0) + exp.amount;
      });
      return "Summary by month:\n" + Object.entries(map).map(([m, amt]) => `${m}: ₹${amt}`).join("\n");
    }
    if (input.includes("date")) {
      const map = {};
      filteredExpenses.forEach(exp => {
        map[exp.date] = (map[exp.date] || 0) + exp.amount;
      });
      return "Summary by date:\n" + Object.entries(map).map(([d, amt]) => `${d}: ₹${amt}`).join("\n");
    }
  }

 

  return "Sorry, I didn't understand. Try 'help' for examples.";
}








