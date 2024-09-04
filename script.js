
document.addEventListener('DOMContentLoaded', (event) => {
    const selectedUser = localStorage.getItem('selectedUser');
    if (!selectedUser) {
        alert('No user selected! Redirecting to the user selection page.');
        window.location.href = 'index.html';
    } else {
        populateTable();
    }
});

function populateTable() {
    const table = document.getElementById('habitTable').getElementsByTagName('tbody')[0];
    table.innerHTML = '';

    const selectedMonth = parseInt(document.getElementById('monthSelect').value);
    const daysInMonth = new Date(2021, selectedMonth, 0).getDate(); // Adjust year if needed

    for (let day = 1; day <= daysInMonth; day++) {
        const row = table.insertRow();
        const dayCell = row.insertCell(0);
        dayCell.textContent = day;

        for (let i = 0; i < getNumberOfHabits(); i++) {
            const cell = row.insertCell(i + 1);
            cell.className = 'clickable-cell';
            cell.onclick = () => {
                cell.classList.toggle('clicked');
                updateChart();
            };
        }
    }

    loadData();
    updateChart();
}

function addHabit() {
    const headerRow = document.getElementById('headerRow');
    if (headerRow.cells.length >= 10) {
        alert('Cannot add more than 10 habits.');
        return;
    }

    const newHeaderCell = document.createElement('th');
    newHeaderCell.contentEditable = 'true';
    newHeaderCell.textContent = 'New Habit';
    headerRow.appendChild(newHeaderCell);

    const table = document.getElementById('habitTable');
    for (let row of table.rows) {
        if (row === headerRow) continue;
        const newCell = row.insertCell(-1);
        newCell.className = 'clickable-cell';
        newCell.onclick = () => {
            newCell.classList.toggle('clicked');
            updateChart();
        };
    }

    updateChart();
}

function removeHabit() {
    const headerRow = document.getElementById('headerRow');
    if (headerRow.cells.length <= 2) {
        alert('There must be at least one habit.');
        return;
    }

    headerRow.deleteCell(-1);
    const table = document.getElementById('habitTable');
    for (let row of table.rows) {
        if (row === headerRow) continue;
        row.deleteCell(-1);
    }

    updateChart();
}

function updateData() {
    const table = document.getElementById('habitTable');
    const data = [];

    for (let row of table.rows) {
        const rowData = [];
        for (let cell of row.cells) {
            rowData.push(cell.classList.contains('clicked'));
        }
        data.push(rowData);
    }

    const selectedUser = localStorage.getItem('selectedUser');
    if (selectedUser) {
        localStorage.setItem(`${selectedUser}_habitData`, JSON.stringify(data));
    }

    alert('Data updated!');
}

function loadData() {
    const selectedUser = localStorage.getItem('selectedUser');
    if (selectedUser) {
        const savedData = JSON.parse(localStorage.getItem(`${selectedUser}_habitData`));
        if (savedData) {
            const table = document.getElementById('habitTable');
            for (let i = 0; i < savedData.length; i++) {
                const row = table.rows[i];
                for (let j = 0; j < savedData[i].length; j++) {
                    if (savedData[i][j]) {
                        row.cells[j].classList.add('clicked');
                    }
                }
            }
        }
    }
    updateChart();
}

let habitChart;

function initializeChart() {
    const ctx = document.getElementById('habitChart').getContext('2d');
    habitChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 31 }, (_, i) => i + 1),
            datasets: [],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                },
                y: {
                    beginAtZero: true,
                    max: 1,
                },
            },
        },
    });
}

function updateChart() {
    const numberOfHabits = getNumberOfHabits();
    const table = document.getElementById('habitTable');
    const daysInMonth = table.rows.length - 1;

    // Update datasets
    habitChart.data.datasets = [];
    for (let i = 1; i <= numberOfHabits; i++) {
        habitChart.data.datasets.push({
            label: `Habit ${i}`,
            data: [],
            borderColor: getRandomColor(),
            backgroundColor: getRandomColor(0.2),
            fill: false,
        });
    }

    // Update data for each dataset
    for (let i = 1; i <= numberOfHabits; i++) {
        const data = [];
        for (let j = 1; j <= daysInMonth; j++) {
            data.push(table.rows[j].cells[i].classList.contains('clicked') ? 1 : 0);
        }
        habitChart.data.datasets[i - 1].data = data;
    }

    habitChart.update();
}

function getNumberOfHabits() {
    return document.getElementById('headerRow').cells.length - 1;
}

function getRandomColor(alpha = 1) {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${alpha})`;
}

// Initialize the chart when the page loads
initializeChart();
