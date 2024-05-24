function getSales(period, value) {
    document.querySelector(`#sales-items`).innerHTML = '';
    console.log(`Sales Details for ${period}:`);
    const today = new Date();
    let counter = 0;

    // Calculate the start and end dates based on the selected period
    let startDate, endDate;

    switch (period) {
        case 'day':
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59); // Set the time to 23:59:59 to cover the entire day
            startDate = startOfDay;
            endDate = endOfDay;
            break;
        case 'week':
            const weekNumber = value; // Week number should be 1 for the first week, 2 for the second week, and so on
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
            const startOffset = (weekNumber - 1) * 7 + (1 - firstDayOfMonth);
            const endOffset = startOffset + 6;
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            startDate.setDate(startDate.getDate() + startOffset);
            endDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate.setDate(endDate.getDate() + endOffset);
            // Check if the end date extends beyond the end of the month and adjust accordingly
            if (endDate.getMonth() !== today.getMonth()) {
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            }
            break;
        case 'month':
            const monthOffset = value - 1; // Value should be between 1 (January) and 12 (December)
            startDate = new Date(today.getFullYear(), monthOffset, 1);
            endDate = new Date(today.getFullYear(), monthOffset, 31);
            break;
        case 'year':
            const targetYear = value; // Specify the desired year as YYYY
            startDate = new Date(targetYear, 0, 1); // January 1st of the specified year
            endDate = new Date(targetYear, 11, 31); // December 31st of the specified year
            break;
        default:
            console.error("Invalid period specified.");
            return;
    }

    // Query sales collection and filter by the selected period
    db.collection("sales")
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .get()
        .then((itemSnapshot) => {
            const sortedSales = [];
            itemSnapshot.forEach((itemDoc) => {
                const docId = itemDoc.id;
                const itemData = itemDoc.data();
                const date = itemData.date.toDate();
                sortedSales.push({
                    docId: docId,
                    customerId: itemData.customerid,
                    tableId: itemData.tableid,
                    total: itemData.total,
                    date: date
                });
            });
            // Sort sales by date and time in descending order
            sortedSales.sort((a, b) => b.date - a.date);
            sortedSales.forEach((sale) => {
                const newDate = sale.date.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: '2-digit'
                });
                const hours = sale.date.getHours() % 12 || 12;
                const minutes = sale.date.getMinutes();
                const amPm = sale.date.getHours() >= 12 ? 'PM' : 'AM';
                const time = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${amPm}`;
                counter++;
                console.log(counter);
                appendSale(sale.docId, sale.customerId, sale.tableId, sale.total, newDate, time);
            });
        })
        .catch((error) => {
            console.error("Error getting sales:", error);
        });
}

// Appending the Sale
function appendSale(docId, customerId, tableId, total, date, time){
    // console.log(docId);

    document.querySelector(`#sales-items`).innerHTML += `
        <tr>
            <td>${date}</td>
            <td>${time}</td>
            <td>${customerId}</td>
            <td>${tableId}</td>
            <td>${total}</td>
            <td><button class="btn btn-sm btn-success list-button" id="${docId}" onclick="getDetails('${docId}', 'sales')">View</button></td>
        </tr>
    `;
}

// Function to populate the value dropdown based on the selected period
function populateValueDropdown(period) {
    const valueDropdown = document.getElementById('valueDropdownMenu');
    valueDropdown.innerHTML = ''; // Clear previous options

    // Convert the period to lowercase
    const lowercasePeriod = period.toLowerCase();
    let monthValue = 1;
    switch (lowercasePeriod) {
        case 'day':
            console.log("DAY");
            // valueDropdown.innerHTML += '<a class="dropdown-item" href="#" id="dayOption" disabled>Day</a>';
            break;
        case 'week':
            console.log("WEEK");
            valueDropdown.removeAttribute('disabled');
            for (let i = 1; i <= 10; i++) {
                valueDropdown.innerHTML += `<a class="dropdown-item" href="#" id="weekOption" onclick="changeText('valueDropdown', '${i}'); getSales('week', '${i}')">${i}</a>`;
            }
            break;
        case 'month':
            console.log("MONTH");
            valueDropdown.removeAttribute('disabled');
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            months.forEach((month, index) => {
                valueDropdown.innerHTML += `<a class="dropdown-item" href="#" id="monthOption" onclick="changeText('valueDropdown', '${month}'); getSales('month', ${monthValue++})">${month}</a>`;
            });
            break;
        case 'year':
            console.log("YEAR");
            valueDropdown.removeAttribute('disabled');
            const currentYear = new Date().getFullYear();
            valueDropdown.innerHTML += `<a class="dropdown-item" href="#" id="yearOption" onclick="changeText('valueDropdown', '${currentYear}'); getSales('year', ${currentYear})">${currentYear}</a>`;
            for (let year = currentYear - 1; year >= 2002; year--) {
                valueDropdown.innerHTML += `<a class="dropdown-item" href="#" id="yearOption" onclick="changeText('valueDropdown', '${year}'); getSales('year', ${year})">${year}</a>`;
            }
            break;
        default:
            console.error("Invalid period specified.");
    }
}

function changeText(id, value) {
    // Update the text content of the dropdown with the provided ID
    const dropdown = document.getElementById(id);
    if (dropdown) {
        dropdown.textContent = value;
    }

    // If the provided ID is for the periodDropdown, reset the valueDropdown
    if (id === "periodDropdown") {
        const valueDropdown = document.getElementById("valueDropdown");
        if (valueDropdown) {
            valueDropdown.textContent = "Select";
        }
    }
}

// Default Sales Query
getSales('day', '');