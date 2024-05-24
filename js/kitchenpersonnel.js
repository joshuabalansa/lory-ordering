const pendingList = document.getElementById("pending-list");
const completedList = document.getElementById("completed-list");

async function populateTable() {
    let count = 0;
    await db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").orderBy("date", "desc").get().then(async (itemSnapshot) => {
        for (const itemDoc of itemSnapshot.docs) {
            const itemData = itemDoc.data();
            const tableID = itemData.tableid;
            const date = itemData.date.toDate();
            const timeString = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            const status = itemData.status;
            let completed = 0;
            let pending = 0;

            try {
                const checklistSnapshot = await db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(itemDoc.id).collection("checklist").get();

                // Compare items in checklist with items in details
                const detailsSnapshot = await db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(itemDoc.id).collection("details").get();
                detailsSnapshot.forEach(async (detailDoc) => {
                    const detailData = detailDoc.data();
                    const dish = detailData.dish;
                    const qty = detailData.qty;

                    const existingChecklistItem = await checklistSnapshot.docs.find(doc => doc.data().dish === dish);

                    if (!existingChecklistItem) {
                        // Add new item to checklist
                        await db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(itemDoc.id).collection("checklist").add({
                            qty: qty,
                            dish: dish,
                            status: "incomplete"
                        });
                        pending++;
                    }
                });

                // Update existing items in checklist
                for (const checklistDoc of checklistSnapshot.docs) {
                    const checklistData = checklistDoc.data();
                    const dish = checklistData.dish;
                    const qty = checklistData.qty;
                    const status = checklistData.status;

                    const detailSnapshot = await db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(itemDoc.id).collection("details").where("dish", "==", dish).get();

                    if (detailSnapshot.empty) {
                        // Remove item from checklist if it doesn't exist in details
                        await checklistDoc.ref.delete();
                    } else {
                        const detailData = detailSnapshot.docs[0].data();
                        const detailQty = detailData.qty;

                        if (qty !== detailQty) {
                            // Update quantity in checklist to match the one from details
                            await checklistDoc.ref.update({ qty: detailQty });
                        }

                        if (qty == detailQty) {
                            // Keep status as is
                            if (status === "completed") {
                                completed++;
                            } else {
                                pending++;
                            }
                        } else {
                            // Set status to pending if quantity in details is greater or less than
                            pending++;
                            await checklistDoc.ref.update({ status: "pending" });
                        }
                    }
                }

                // Generate table row based on status
                if (status === "completed" || status === "served") {
                    count++;
                    generateRow(tableID, timeString, completed, pending, status, itemDoc.id, count, completedList);
                } else if(status === "pending"){
                    count++;
                    generateRow(tableID, timeString, completed, pending, status, itemDoc.id, count, pendingList);
                }
            } catch (error) {
                console.error("Error populating table: ", error);
            }
        }
    }).catch((error) => {
        console.log("Error getting documents: ", error);
    });
}

// Function to generate table row
const generateRow = (tableID, timeString, completed, pending, status, itemID, count, targetList) => {
    const row = `
        <tr id="${count}">
            <td>${tableID}</td>
            <td>${timeString}</td>
            <td>${completed}</td>
            <td>${pending}</td>
            <td>${status}</td>
            <td><button class="btn btn-sm btn-success list-button" id="${itemID}" onclick="getChecklist('${itemID}', '${tableID}', ${count})">View</button></td>
        </tr>
    `;
    targetList.innerHTML += row;
};

// Function to handle getting checklist items
async function getChecklist(itemId, tableID, rowId){
    const currentRow = document.getElementById(rowId);
    // Update counts in column number 3 and 4 of the current row
    let column3Value = currentRow.cells[2].textContent;
    let column4Value = currentRow.cells[3].textContent;
    console.log("Column 3 value:", column3Value);
    console.log("Column 4 value:", column4Value);

    const customerIdContainer = document.querySelector('.customer-id');
    // Clear existing checklist items
    const checklistItemsContainer = document.getElementById('checklist-items');
    checklistItemsContainer.innerHTML = `
        <div class="row mb-2">
            <div class="col-4 list-item p-0"><b class="h6">Quantity</b></div>
            <div class="col-4 list-item p-0"><b class="h6">Dishname</b></div>
            <div class="col-4 list-item p-0"><b class="h6">Actions</b></div>
        </div>
    `;

    // Retrieve checklist items for the given itemId
    await db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(itemId).collection("checklist").get().then((checklistSnapshot) => {
        // Convert snapshot to array for sorting
        const checklistItems = [];
        checklistSnapshot.forEach((checklistDoc) => {
            const checklistData = checklistDoc.data();
            checklistItems.push({ id: checklistDoc.id, ...checklistData });
        });

        // Sort checklist items by dish name
        checklistItems.sort((a, b) => {
            const dishA = a.dish.toLowerCase();
            const dishB = b.dish.toLowerCase();
            if (dishA < dishB) return -1;
            if (dishA > dishB) return 1;
            return 0;
        });

        let allChecked = true; // Flag to track if all checklist items are checked

        // Display sorted checklist items
        checklistItems.forEach((checklistItem) => {
            const qty = checklistItem.qty; // Get the quantity
            const dish = checklistItem.dish;
            const status = checklistItem.status;

            // Create checkbox element
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'checklist-item-checkbox';
            checkbox.value = dish;
            checkbox.checked = status === 'completed'; // If status is completed, checkbox is checked

            // Add event listener to checkbox for status update
            checkbox.addEventListener('change', () => {
                const isChecked = checkbox.checked;
                if (isChecked) {
                    // Perform actions when checkbox is checked
                    currentRow.cells[2].textContent = parseInt(currentRow.cells[2].textContent)+1;
                    currentRow.cells[3].textContent = parseInt(currentRow.cells[3].textContent)-1;
                } else {
                    // Perform actions when checkbox is unchecked
                    currentRow.cells[2].textContent = parseInt(currentRow.cells[2].textContent)-1;
                    currentRow.cells[3].textContent = parseInt(currentRow.cells[3].textContent)+1;
                }

                // Update the status of the checklist item in the database
                db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(itemId).collection("checklist").doc(checklistItem.id).update({
                    status: isChecked ? 'completed' : 'incomplete'
                }).then(() => {
                    console.log("Checklist item status updated successfully.");
                    // Retrieve updated checklist items after status update
                    return db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(itemId).collection("checklist").get();
                }).then((updatedChecklistSnapshot) => {
                    // Check if all checklist items are checked
                    const allChecked = updatedChecklistSnapshot.docs.every(item => item.data().status === 'completed');
                    // Update the status of the parent item based on all checklist items' status
                    const parentStatus = allChecked ? 'completed' : 'pending';
                    
                    // Update UI based on parent status
                    if (allChecked) {
                        currentRow.cells[4].textContent = 'completed';
                    } else {
                        currentRow.cells[4].textContent = 'pending';
                    }

                    // Update the status of the parent item in the database
                    return db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(itemId).update({
                        status: parentStatus
                    });
                }).then(() => {
                    console.log(`Parent item status updated.`);
                }).catch((error) => {
                    console.error("Error updating status: ", error);
                });
            });

            // Create div to hold quantity, checkbox, and dish name
            const checklistItemDiv = document.createElement('div');
            checklistItemDiv.className = 'row mb-2';
            checklistItemDiv.innerHTML = `
                <div class="col-4 list-item p-0">${qty}</div>
                <div class="col-4 list-item p-0">${dish}</div>
                <div class="col-4 list-item p-0"></div>
            `;
            checklistItemDiv.children[2].appendChild(checkbox); // Append checkbox to the third column

            // Append checklist item to container
            checklistItemsContainer.appendChild(checklistItemDiv);
        });
    }).catch((error) => {
        console.error("Error getting checklist items: ", error);
    });

    // Display customer ID
    const changeId = `
        <h6><b>Table Number - ${tableID}</b></h6>
    `;
    customerIdContainer.innerHTML = changeId;
};

async function servedStatusUpdate() {
    try {
        const orderId = localStorage.getItem("orderId");
        const orderRef = db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(orderId);

        // Get the order status
        const orderDoc = await orderRef.get();
        if (orderDoc.exists) {
            const orderData = orderDoc.data();
            const orderStatus = orderData.status;

            // Check if the order status is "completed"
            if (orderStatus === "completed") {
                // Update the order status to "served"
                await orderRef.update({ status: "served" });
                console.log("Order status updated to 'served'.");
                location.reload();
            } else {
                // If the order status is not "completed", alert the user
                alert("Order is not yet complete. Cannot update to 'served'.");
            }
        } else {
            console.error("Order document not found.");
        }
    } catch (error) {
        console.error("Error updating order status:", error);
    }
}


populateTable();
