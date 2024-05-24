// // Query the 'foods' collection
// db.collection("foods").get().then((querySnapshot) => {
//     // Iterate through each document in the collection
//     querySnapshot.forEach((doc) => {
//         // Print the name of each document
//         console.log(doc.data());
//     });
// }).catch((error) => {
//     console.log("Error getting documents: ", error);
// });

// Function to generate HTML content for an item
function generateHTMLContent(itemName, itemPrice) {
    return `
        <td class="table-item ps-4 pe-4">
            <div class="row">
                <div class="col-12">
                    <img class="menu-item" src="images/butted-shrimp.jpg" alt="Food Image" height="100%" width="100%"> 
                </div>
            </div>
            <div class="row pt-2">
                <div class="col-12">
                    <h6><b>${itemName}</b></h6>
                </div>
                <div class="col-12">
                    <h6>Php ${itemPrice}</h6>
                </div>
            </div>
            <div class="row">
                <div class="col-12 d-grid mx-auto m-2">
                    <button class="btn btn-success" type="button" data-bs-toggle="modal" data-bs-target="#orderModal" data-item-name="${itemName}" data-item-price="${itemPrice}">Order</button>
                </div>
            </div>
        </td>`;
}

// Filter Items
filterItems('all');
function filterItems(category) {
    // Remove 'btn-active' class from all buttons
    const buttons = document.querySelectorAll('.btn-custom');
    buttons.forEach(button => {
        button.classList.remove('btn-active');
    });

    // Add 'btn-active' class to the clicked button
    const clickedButton = document.getElementById(category);
    clickedButton.classList.add('btn-active');

    // Clear the contents of 'append-1' and 'append-2'
    document.getElementById('append-1').innerHTML = '';
    document.getElementById('append-2').innerHTML = '';

    // Fetch data based on the selected category
    if (category === 'all') {
        // Fetch all items
        // Replace this with your actual logic to fetch all items from the database
        console.log('Fetching all items...');
        let counter = 0; // Initialize counter
        db.collection("foods").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const dishId = doc.id;
                const dishTag = data.tag;
                console.log(`Tag ID: ${dishId}, Name: ${dishTag}`);
                // Fetch items within the "items" subcollection for the current document
                db.collection("foods").doc(dishId).collection("items").get().then((itemSnapshot) => {
                    let htmlContent = ''; // Initialize HTML content string
                    itemSnapshot.forEach((itemDoc) => {
                        const itemData = itemDoc.data();
                        const itemName = itemData.dish;
                        const itemPrice = itemData.price;
                        // Construct HTML content for the item
                        htmlContent = generateHTMLContent(itemName, itemPrice);
                        counter++; // Increment counter
                        // Append the HTML content to the target element based on the counter value
                        const targetId = counter % 2 === 0 ? "append-2" : "append-1";
                        document.getElementById(targetId).innerHTML += htmlContent;
                        // Reset htmlContent for the next document
                        htmlContent = '';
                    });
                }).catch((error) => {
                    console.log("Error getting items: ", error);
                });
            });
        }).catch((error) => {
            console.log("Error getting documents: ", error);
        });        
    } else {
        // Fetch items for the selected category
        console.log(`Fetching items for category: ${category}...`);
        let counter = 0; // Initialize counter
        db.collection("foods").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const dishId = doc.id;
                const dishTag = data.tag;
                console.log(`Tag ID: ${dishId}, Name: ${dishTag}`);
                if(dishTag == category){
                    // Fetch items within the "items" subcollection for the current document
                    db.collection("foods").doc(dishId).collection("items").get().then((itemSnapshot) => {
                        let htmlContent = ''; // Initialize HTML content string
                        itemSnapshot.forEach((itemDoc) => {
                            const itemData = itemDoc.data();
                            const itemName = itemData.dish;
                            const itemPrice = itemData.price;
                            // Construct HTML content for the item
                            htmlContent = generateHTMLContent(itemName, itemPrice);
                            counter++; // Increment counter
                            console.log(counter);
                            // Append the HTML content to the target element based on the counter value
                            const targetId = counter % 2 === 0 ? "append-2" : "append-1";
                            document.getElementById(targetId).innerHTML += htmlContent;
                            // Reset htmlContent for the next document
                            htmlContent = '';
                        });         
                    }).catch((error) => {
                        console.log("Error getting items: ", error);
                    });
                }
            });
        }).catch((error) => {
            console.log("Error getting documents: ", error);
        });
    }
}


document.getElementById('orderModal').addEventListener('show.bs.modal', function (event) {
    // Extract item name from the triggering button's data attributes
    var button = event.relatedTarget;
    var itemName = button.dataset.itemName;

    // Default values for itemPrice, qty, and rowid
    var itemPrice = 0.00;
    var qty = 1;
    var rowid = null;
    var total = 0;
    // Check if itemPrice, qty, and rowid exist in the dataset properties
    if (button.dataset.itemPrice) {
        itemPrice = parseFloat(button.dataset.itemPrice); // Parse price as a float
        console.log("itemPrice: ",itemPrice);
    }

    if (button.dataset.itemQty) {
        qty = parseInt(button.dataset.itemQty); // Parse quantity as an integer
        console.log("qty: ",qty);

    }

    if (button.dataset.itemRowid) {
        rowid = button.dataset.itemRowid;
        console.log("rowid: ",rowid);
    }

    if (button.dataset.itemTotal) {
        total = parseFloat(button.dataset.itemTotal);
        console.log("Total: ",total);
    }
    
    // Update modal content with item name, price, quantity, and total
    var modal = this;
    modal.querySelector('.modal-title').textContent = 'Order ' + itemName;
    modal.querySelector('.modal-body').innerHTML = `
        <p>Price: Php ${itemPrice.toFixed(2)}</p>
        <form>
            <div class="mb-3">
                <label for="quantity" class="form-label">Quantity</label>
                <div class="input-group">
                    <button class="btn btn-outline-secondary" type="button" id="decrementBtn">-</button>
                    <input type="number" class="form-control" id="quantity" min="1" value="${qty}">
                    <button class="btn btn-outline-secondary" type="button" id="incrementBtn">+</button>
                </div>
            </div>
            <p>Total Price: <span id="totalPrice">Php ${(total).toFixed(2)}</span></p>
        </form>`;
    if (button.dataset.itemRowid) {
        rowid = button.dataset.itemRowid;
        document.getElementById("placeOrder").setAttribute("value", "true");
    }
    // Function to calculate total price
    function calculateTotalPrice(quantity) {
        return (itemPrice * quantity).toFixed(2); // Calculate total price and round to 2 decimal places
    }

    // Modal Trigger functionality
    const decrementBtn = modal.querySelector('#decrementBtn');
    const incrementBtn = modal.querySelector('#incrementBtn');
    const quantityInput = modal.querySelector('#quantity');
    const totalPriceSpan = modal.querySelector('#totalPrice');
    
    decrementBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 0) {
            quantityInput.value = currentValue - 1;
            totalPriceSpan.textContent = 'Php ' + calculateTotalPrice(currentValue - 1);
        }
    });

    incrementBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
        totalPriceSpan.textContent = 'Php ' + calculateTotalPrice(currentValue + 1);
    });

    quantityInput.addEventListener('input', function() {
        const currentValue = parseInt(quantityInput.value);
        totalPriceSpan.textContent = 'Php ' + calculateTotalPrice(currentValue);
    });
    
});

function placeOrder(classId) {
    const quantity = parseInt(document.getElementById('quantity').value);
    const itemName = document.querySelector('.modal-title').textContent.split('Order ')[1];
    const itemPrice = parseFloat(document.querySelector('.modal-body p').textContent.split('Php ')[1]);
    const buttonItemName = document.getElementById(itemName);
    const chgQtyBtn = document.getElementById("changeQuantityBtn");
    const originalValue = chgQtyBtn.getAttribute("data-item-total");
    let totalPrice = (quantity * itemPrice).toFixed(0); // Calculate total price
    console.log("Orig: ",originalValue, " New: ",totalPrice, " Difference: ", totalPrice-originalValue);
    // Generate Row Id
    let matchedRowId = "";
    // Check if there is an existing row for the item
    let existingRow = null;
    const rows = document.querySelectorAll(classId);
    rows.forEach(row => {
        console.log("Row: ",row)
        const itemNameInRow = row.querySelector('.item').textContent;
        if (itemNameInRow === itemName) {
            existingRow = row;
            matchedRowId = row.id;
        }
    });
    let placeOrderButton = document.getElementById("placeOrder").value;
    if(placeOrderButton=="true"){
        // qty
        existingRow.querySelector('.qty').textContent = quantity;
        // total price
        const newTotalPrice = parseFloat(totalPrice);
        existingRow.querySelector('.total').textContent = newTotalPrice.toFixed(0);
        // onclick
        buttonItemName.setAttribute('onclick', `openConfirmationModal('${itemName}', ${newTotalPrice}, ${quantity}, '${matchedRowId}')`);
        // placeorder value
        document.getElementById("placeOrder").value = "false";
        chgQtyBtn.setAttribute("data-item-name", itemName);
        chgQtyBtn.setAttribute("data-item-price", totalPrice/quantity);
        chgQtyBtn.setAttribute("data-item-qty", quantity);
        chgQtyBtn.setAttribute("data-item-total", newTotalPrice.toFixed(2));
        chgQtyBtn.setAttribute("data-item-rowid", matchedRowId);
        totalPrice = totalPrice - originalValue;
        // Remove row if necessary
        if (quantity === 0 && matchedRowId) {
            document.getElementById(matchedRowId).remove();
        }
    } else{
        if (existingRow) {
            const chgQtyBtn = document.getElementById("changeQuantityBtn");
            // If an existing row is found, update the quantity
            const existingQuantity = parseInt(existingRow.querySelector('.qty').textContent);
            const newQuantity = existingQuantity + quantity;
            existingRow.querySelector('.qty').textContent = newQuantity;
            const existingTotal = parseFloat(existingRow.querySelector('.total').textContent);
            const newTotalPrice = existingTotal + parseFloat(totalPrice);
            existingRow.querySelector('.total').textContent = newTotalPrice.toFixed(0);
            chgQtyBtn.setAttribute("data-item-qty", newQuantity);
            chgQtyBtn.setAttribute("data-item-total", newTotalPrice.toFixed(2));
            buttonItemName.setAttribute('onclick', `openConfirmationModal('${itemName}', ${newTotalPrice}, ${newQuantity}, '${matchedRowId}')`);
        } else {
            const rowId = 'row_' + Math.random().toString(36).substr(2, 9);
            // If no existing row is found, create a new row for the item
            const orderHTML = `
                <div class="row mt-1 mb-1 row-items" id="${rowId}">
                    <div class="col-2 list-item p-0 mt-2 qty">${quantity}</div>
                    <div class="col-6 list-item p-0 mt-2 item">${itemName}</div>
                    <div class="col-2 list-item p-0 mt-2 total">${totalPrice}</div>
                    <div class="col-2 list-item p-0"><button id="${itemName}" class="btn-x btn btn-sm btn-outline-danger" onclick="openConfirmationModal('${itemName}', ${totalPrice}, ${quantity}, '${rowId}')">X</button></div>
                </div>
            `;
            // Append the new row to the order items
            document.querySelector('.order-items').innerHTML += orderHTML;
                // Update the order total
        }
    }
    updateOrderTotal(totalPrice);
}

// Confirm Modal
function openConfirmationModal(itemName, totalPrice, quantity, rowId) {
    // Display the item name and total price in the confirmation modal
    document.querySelector('#confirmationModal .modal-body').innerHTML = `<p><b>Please select an action.</b></p>Item: ${itemName}<br>Quantity: ${quantity}<br>Total Price: Php ${totalPrice.toFixed(2)}`;
    const chgQtyBtn = document.getElementById("changeQuantityBtn");
    chgQtyBtn.setAttribute("data-item-name", itemName);
    chgQtyBtn.setAttribute("data-item-price", totalPrice/quantity);
    chgQtyBtn.setAttribute("data-item-qty", quantity);
    chgQtyBtn.setAttribute("data-item-total", totalPrice.toFixed(2));
    chgQtyBtn.setAttribute("data-item-rowid", rowId);
    console.log(rowId, totalPrice);
    // Show the confirmation modal
    $('#confirmationModal').modal('show');

    chgQtyBtn.setAttribute("onclick", "qtyChange(\'"+rowId+"\')");

    // Event listener for deleting the item
    document.getElementById('deleteItemBtn').setAttribute("onclick", "deleteRow(\'"+rowId+"\',"+totalPrice+")");

    // document.getElementById('deleteItemBtn').addEventListener('click', function(event) {
    //     console.log('Deleting item with ID:', rowId);
    //     // Call a function to handle deleting the item
    //     if(document.getElementById(rowId)){
    //         document.getElementById(rowId).remove();
    //         updateOrderTotal(-totalPrice);
    //     }
    //     // deleteItemAction(rowId, totalPrice);
    //     $('#confirmationModal').modal('hide');

    // });

}

function deleteRow(rowId, totalPrice){
    document.getElementById(rowId).remove();
    updateOrderTotal(-totalPrice);
    $('#confirmationModal').modal('hide');
}

function qtyChange(rowId){
    console.log('Changing quantity for item with ID:', rowId);
    $('#confirmationModal').modal('hide');
}

// Function to update the order total
function updateOrderTotal(totalPrice) {
    // Get the current order total
    console.log(totalPrice);
    const orderTotalElement = document.getElementById('order-total-list');
    console.log(orderTotalElement);
    if (orderTotalElement) {
        let currentTotal = parseFloat(orderTotalElement.innerHTML);
        if (isNaN(currentTotal)) {
            currentTotal = 0;
        }
        // Add the new total price to the current total
        const newTotal = currentTotal + parseFloat(totalPrice);
        // Update the order total in the DOM
        orderTotalElement.innerHTML = newTotal.toFixed(0);
    }
}

document.querySelector('#confirmationModal .btn-secondary').addEventListener('click', function() {
    // Hide the modal without removing the row
    const modal = document.getElementById('confirmationModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
});

document.querySelector('#confirmationModal .btn-close').addEventListener('click', function() {
    // Hide the modal without removing the row
    const modal = document.getElementById('confirmationModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
});
// Submit to database verification
async function submit() {
    const orderRef = await db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc();
    const details = [];
    const currentDate = new Date();
    const rows = document.querySelectorAll('.order-items .row-items');
    const tableid = Math.floor(Math.random() * 12) + 1; // To be changed based on table accounts || cashier account
    const date = firebase.firestore.Timestamp.fromDate(currentDate);
    const status = "pending";
    const total = document.getElementById("order-total-list").innerHTML;
    const docId = localStorage.getItem("userDocId");
    if(total != 0){
        try {
            // Get the highest customer id
            let customerid = await getHighestCustomerId();
    
            // Increment highestCustomerId
            customerid++;
    
            // Save order details to Firestore
            const orderData = {
                customerid,
                tableid,
                date,
                status,
                total
            };
    
            // Add details collection to the order document
            await orderRef.set(orderData);
    
            const batch = db.batch();
            const detailsCollection = orderRef.collection("details");
            // 
            const customerId = await orderRef.get();
            localStorage.setItem("customerId", customerId.data().customerid);
            const orderNumber = localStorage.getItem("customerId");
            document.getElementById("final-order-total").innerHTML = customerId.data().total;
            document.getElementById("finalModalTitle").innerHTML = "ORDER NUMBER: "+orderNumber;
            // Add details to batch
            rows.forEach((row, index) => {
                const qtyHTML = row.querySelector('.qty').innerHTML;
                const itemHTML = row.querySelector('.item').innerHTML;
                const totalHTML = row.querySelector('.total').innerHTML;
                const detailData = {
                    qty: qtyHTML,
                    dish: itemHTML,
                    total: totalHTML
                };
                batch.set(detailsCollection.doc(`${index+1}`), detailData);
            });
    
            // Commit batch
            await batch.commit();
            // console.log("Order and details saved successfully!");
            alert("Order and details saved successfully!");
            // Get the document ID of the newly created order
            const orderId = orderRef.id;
            localStorage.setItem("orderId", orderId);
            localStorage.setItem("customerId", customerid);
            console.log("Document ID of the newly created order:", orderId);
            console.log("Document ID of the newly created order:", customerid);
            
            // Update employee status
            const docRef = db.collection("employees").doc(docId);
    
            try {
                await docRef.update({
                    occupantOrderId: orderId, // Assuming orderId is the value you want to set for occupantOrderId
                    occupied: true
                });
                console.log("Fields updated successfully!");
                await populateOrder();
            } catch (error) {
                console.error("Error updating fields:", error);
            }
        } catch (error) {
            console.error("Error saving order and details: ", error);
            alert("Error saving order. Please call on a staff.");
        }
    } else {
        alert("Please select an item to order.");
        location.reload();
    }
    
}

// Upon follow-up order
async function followUpOrder() {
    try {
        const currentDate = new Date();
        const total = document.getElementById("order-total-list").innerHTML;
        const orderId = localStorage.getItem("orderId");
        const orderRef = db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(orderId);

        // Step 1: Update existing fields in the document
        const updateData = {
            date: currentDate,
            total: total,
            status: "pending"
        };
        await orderRef.update(updateData);

        const batch = db.batch();
        const detailsCollection = orderRef.collection("details");

        // Step 2: Update existing details documents and remove unmatched documents
        const existingDocsSnapshot = await detailsCollection.get();
        existingDocsSnapshot.forEach(existingDoc => {
            const existingData = existingDoc.data();
            const existingQty = existingData.qty;
            const existingTotal = existingData.total;

            let foundMatch = false;
            const rows = document.querySelectorAll('.order-items .row-items');
            rows.forEach(row => {
                const qtyHTML = row.querySelector('.qty').innerHTML;
                const totalHTML = row.querySelector('.total').innerHTML;
                if (qtyHTML === existingQty && totalHTML === existingTotal) {
                    foundMatch = true;
                    return;
                }
            });

            if (!foundMatch) {
                // Remove unmatched document
                batch.delete(existingDoc.ref);
            }
        });

        // Step 3: Add new items from the current rows
        const rows = document.querySelectorAll('.order-items .row-items');
        rows.forEach((row, index) => {
            const qtyHTML = row.querySelector('.qty').innerHTML;
            const itemHTML = row.querySelector('.item').innerHTML;
            const totalHTML = row.querySelector('.total').innerHTML;
            const detailData = {
                qty: qtyHTML,
                dish: itemHTML,
                total: totalHTML
            };
            batch.set(detailsCollection.doc(`${index+1}`), detailData, { merge: true });
        });

        // Step 4: Commit batch
        await batch.commit();

        // Step 5: Populate Order
        await populateOrder();

        // Step 6: Update total order price
        const orderSnapshot = await orderRef.get();
        const updatedTotal = orderSnapshot.data().total;
        document.getElementById('final-order-total').textContent = updatedTotal;
        
        console.log("Details collection updated successfully");
    } catch (error) {
        console.error("Error updating details collection:", error);
    }
}


// Function to get the highest customer id
async function getHighestCustomerId() {
    const queueRef = db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue");

    let highestCustomerId = 0;

    try {
        const querySnapshot = await queueRef.orderBy("customerid", "desc").limit(1).get();

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                highestCustomerId = doc.data().customerid;
            });
        }
    } catch (error) {
        console.error("Error getting highest customerid:", error);
        throw error;
    }

    return highestCustomerId;
}


// Function to remove all row-items from the place-order div
function removeRowItems(location) {
    // Get all elements with the class "row-items" inside the place-order div
    const rowItems = document.querySelectorAll('.'+location+' .row-items');
    
    // Loop through each row-item and remove it
    rowItems.forEach(rowItem => {
        rowItem.remove();
    });
}

async function populateOrder(){
    // Get the docId from local storage
    const docId = localStorage.getItem('orderId');
    console.log("Order ID from local storage:", docId);

    // Create or synchronize checklist for the order
    await createChecklistIfNotExists(docId);

    // Copy row items to the place-order div
    await copyRowItems('final-order', 'place-order-total');
}

// Function to copy row items to the place-order div
async function copyRowItems(info, order) {
    // Remove all existing row-items from the place-order div
    removeRowItems(info);

    // Get all elements with the class "row-items"
    const rowItems = document.querySelectorAll('.order-items .row-items');

    // Get the text content from the element with id "order-total-list"
    const orderTotal = document.getElementById('order-total-list').textContent;

    // Set the text content of the element with id "place-order-total" to the retrieved text content
    document.getElementById(order).textContent = orderTotal;

    // Get the place-order div
    const placeOrderDiv = document.querySelector('.' + info);
    // Get the docId from local storage
    const docId = localStorage.getItem('orderId');
    // Check checklistcollection
    console.log("Order ID from local storage:", docId);

    // Initialize an empty object to store checklist statuses
    let checklistData = {};

    // Fetch the checklist once and store the data
    if (info === 'final-order') {
        try {
            const checklistSnapshot = await db.collection("orders")
                .doc("d716BHinTx1rHwR96KOV")
                .collection("queue")
                .doc(docId)
                .collection("checklist")
                .get();

            checklistSnapshot.forEach(doc => {
                const dishName = doc.data().dish.replace(/\s+/g, ''); // Remove spaces from dish name
                checklistData[dishName] = { status: doc.data().status, docId: doc.id };
            });
            console.log("Checklist data fetched:", checklistData);
        } catch (error) {
            console.error("Error fetching checklist snapshot:", error);
        }
    }
    // Loop through each row-item
    rowItems.forEach(async rowItem => {
        // Create a copy of the row-item
        const copy = rowItem.cloneNode(true);

        // Remove the fourth column (actions column) from the copy
        copy.removeChild(copy.lastElementChild);

        // if info = 'final-order', add a script that will get the current status of that dish based on the checklist.
        if (info === 'final-order') {
            let dishName = copy.children[1].textContent.trim(); // Assuming the dish name is in the second column
            dishName = dishName.replace(/\s+/g, ''); // Remove spaces from dish name
            console.log("Processing dish:", dishName);
            const dishStatusData = checklistData[dishName];

            if (dishStatusData) {
                // Create a new status div
                const statusDiv = document.createElement('div');
                statusDiv.className = 'col-2 list-item p-0 mt-2 status';

                // Create the checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = dishStatusData.status === 'completed';

                // Add event listener to checkbox for status update
                checkbox.addEventListener('change', async () => {
                    const isChecked = checkbox.checked;
                    const newStatus = isChecked ? 'completed' : 'incomplete';
                    console.log(`Checkbox for ${dishName} changed to: ${isChecked}`);

                    try {
                        // Update the status of the checklist item
                        await db.collection("orders")
                            .doc("d716BHinTx1rHwR96KOV")
                            .collection("queue")
                            .doc(docId)
                            .collection("checklist")
                            .doc(dishStatusData.docId)
                            .update({ status: newStatus });
                        console.log(`Status of ${dishName} updated to ${newStatus}.`);

                        // Fetch the updated checklist statuses for all dishes
                        const updatedChecklistSnapshot = await db.collection("orders")
                            .doc("d716BHinTx1rHwR96KOV")
                            .collection("queue")
                            .doc(docId)
                            .collection("checklist")
                            .get();

                        // Update the checklist data with the new statuses
                        updatedChecklistSnapshot.forEach(doc => {
                            const dishName = doc.data().dish.replace(/\s+/g, ''); // Remove spaces from dish name
                            checklistData[dishName] = { status: doc.data().status, docId: doc.id };
                        });

                        // Check if all checklist items are checked
                        const allChecked = Object.values(checklistData).every(item => item.status === 'completed');

                        // Update the status of the parent item based on all checklist items' status
                        const parentStatus = allChecked ? 'served' : 'pending';

                        // Update UI based on parent status
                        if (allChecked) {
                            document.getElementById('final-order-status').textContent = 'served';
                        } else {
                            document.getElementById('final-order-status').textContent = 'pending';
                        }

                        // Update the status of the parent item in the database
                        await db.collection("orders")
                            .doc("d716BHinTx1rHwR96KOV")
                            .collection("queue")
                            .doc(docId)
                            .update({ status: parentStatus });

                        console.log(`Parent item status updated to ${parentStatus}.`);
                    } catch (error) {
                        console.error(`Error updating status of ${dishName}:`, error);
                    }
                });
                // Append the checkbox to the status div
                statusDiv.appendChild(checkbox);

                // Append the status div to the copy (inside the fourth column)
                copy.insertBefore(statusDiv, copy.children[3]);
            } else {
                console.warn(`No checklist data found for dish: ${dishName}`);
            }
        }
        // Append the copy to the place-order div
        placeOrderDiv.appendChild(copy);
    });
}

async function createChecklistIfNotExists(orderId) {
    try {
        const orderRef = db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(orderId);
        const checklistSnapshot = await orderRef.collection("checklist").get();

        if (checklistSnapshot.empty) {
            // Fetch details of the order
            const detailsSnapshot = await orderRef.collection("details").get();

            // Create checklist items based on order details
            detailsSnapshot.forEach(async (detailDoc) => {
                const detailData = detailDoc.data();
                const dish = detailData.dish;
                const qty = detailData.qty;

                // Add new item to checklist
                await orderRef.collection("checklist").add({
                    qty: qty,
                    dish: dish,
                    status: "incomplete"
                });
            });

            console.log("Checklist created for order:", orderId);
        } else {
            console.log("Checklist already exists for order:", orderId);

            // Fetch details of the order
            const detailsSnapshot = await orderRef.collection("details").get();
            const checklistDocs = checklistSnapshot.docs;
            let orderStatus = detailsSnapshot.status;

            // Update existing items in checklist and cross-check for newly added items in details
            for (const detailDoc of detailsSnapshot.docs) {
                const detailData = detailDoc.data();
                const dish = detailData.dish;
                const qty = detailData.qty;

                // Check if item exists in checklist
                const existingChecklistItem = checklistDocs.find(doc => doc.data().dish === dish);

                if (!existingChecklistItem) {
                    // Add new item to checklist
                    await orderRef.collection("checklist").add({
                        qty: qty,
                        dish: dish,
                        status: "incomplete"
                    });

                    console.log("New item added to checklist:", dish);
                } else {
                    // Update quantity and status if there is a difference
                    const existingQty = existingChecklistItem.data().qty;

                    if (qty !== existingQty) {
                        await existingChecklistItem.ref.update({ qty: qty, status: "incomplete" });
                        console.log(`Quantity updated for ${dish} in checklist.`);
                        orderStatus = "pending"; // Update order status to pending
                    }
                }
            }

            // Remove duplicate items in details
            const dishNames = new Set();
            detailsSnapshot.docs.forEach(doc => {
                const dish = doc.data().dish;
                if (dishNames.has(dish)) {
                    // Remove duplicate dish document
                    doc.ref.delete();
                    console.log(`Duplicate dish removed from details: ${dish}`);
                } else {
                    dishNames.add(dish);
                }
            });

            // Update order status
            await orderRef.update({ status: orderStatus });
            console.log("Order status updated to:", orderStatus);
        }
    } catch (error) {
        console.error("Error creating or synchronizing checklist:", error);
    }
}

async function checkOnload() {
    // Get the user's document ID from local storage
    const submitButton = document.getElementById("submitButton");
    const docId = localStorage.getItem("userDocId");
    console.log(docId);
    let customerId = "";
    // Reference to the user's document in the "employees" collection
    const docRef = db.collection("employees").doc(docId);
    const docSnapshot  = await docRef.get();
    // onload set the orderId to the current occupant data
    if (docSnapshot.exists){
        const occupantOrderId = docSnapshot.data().occupantOrderId;
        localStorage.setItem("orderId", occupantOrderId);
        console.log(occupantOrderId);
    } else {
        console.log("No document exists!")
    }

    let occupied, occupantDocId;
    try {
        // Get the user's document data
        const docSnapshot = await docRef.get();
        if (docSnapshot.exists) {
            // Extract occupied and occupantDocId from the user's document data
            
            const dataRef = docSnapshot.data();
            occupied = dataRef.occupied;
            occupantDocId = dataRef.occupantOrderId;
            // console.log(occupied, occupantDocId);
            if (occupied) {
                // If occupied, fetch the order data using occupantDocId
                const orderRef = db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(occupantDocId);
                const orderSnapshot = await orderRef.get();
                
                if (orderSnapshot.exists) {
                    // Display order details
                    if(orderSnapshot.data().discount){
                        // Show the total price and the discounted price in a modal
                        const originalTotal = orderSnapshot.data().total + orderSnapshot.data().discount;
                        const discount = orderSnapshot.data().discount;
                        const discountedTotal = orderSnapshot.data().total;
                        document.getElementById('total-price').innerHTML = `Original Total<br>${originalTotal.toFixed(2)}`;
                        document.getElementById('discount').innerHTML = `Discount<br>${discount.toFixed(2)}`;
                        document.getElementById('discounted-price').innerHTML = `<b>Please Prepare<br><div class="text-success">Php ${parseFloat(discountedTotal).toFixed(2)}</b></div>`;
                        hideModal();
                        $('#totalModal').modal('show');
                        // print the order details
                        const detailsRef = orderRef.collection("details"); // Reference to the "details" subcollection
                        const detailsSnapshot = await detailsRef.get(); // Get all documents within the "details" subcollection
                        let sum = 0;
                    
                        detailsSnapshot.forEach((doc) => {
                            // Access individual document data here using doc.data()
                            const data = doc.data();
                            // console.log(data); // Example: Log each document's data
                            // Extract individual item properties   
                            const qty = data.qty;
                            const dish = data.dish;
                            const total = data.total;
                            sum += parseInt(total); 
                            // Generate a unique row id for each item
                            const rowId = 'row_' + Math.random().toString(36).substr(2, 9);
                    
                            // Generate HTML for the current item
                            const orderHTML = `
                                <div class="row row-items" id="${rowId}">
                                    <div class="col-3 list-item p-0 qty border border-top-0 border-bottom-1 border-left-1 border-right-0 p-1 border-dark">${qty}</div>
                                    <div class="col-6 list-item p-0 item border border-top-0 border-bottom-1 border-left-2 border-right-2 p-1  border-dark">${dish}</div>
                                    <div class="col-3 list-item p-0 total border border-top-0 border-bottom-1 border-left-0 border-right-1 p-1 border-dark">${total}</div>
                                </div>
                            `;
                    
                            // Append the generated HTML for the current item to the order items section
                            document.getElementById('total-order').innerHTML += orderHTML;
                            
                        });
                    
                        // After user confirms in the modal
                        document.getElementById('confirm-bill-out').addEventListener('click', async () => {
                            await updateEmployeeStatusAndNotify();
                        });
                    } else{
                        await displayOrderItems(orderRef); // Implement this function to display order items
                        customerId = orderSnapshot.data().customerid;
                        localStorage.setItem("customerId", customerId);
                        const orderNumber = localStorage.getItem("customerId");
                        document.getElementById("final-order-status").innerHTML = orderSnapshot.data().status;
                        document.getElementById("final-order-total").innerHTML = orderSnapshot.data().total;
                        document.getElementById("finalModalTitle").innerHTML = "ORDER NUMBER: "+orderNumber;
                        console.log(finalModalTitle);
                        // Open the final modal
                        openFinalModal();
                        submitButton.setAttribute("onclick", "followUpOrder()")
                    }
                } else {
                    console.error("Order document does not exist.");
                }
            } else {
                console.log("A user is not occupying a table.");
            }
        } else {
            console.error("User document not found.");
        }
    } catch (error) {
        console.error("Error retrieving user information:", error);
    }
}

async function displayOrderItems(orderRef) {
    // Iterate over each item in the details array
    const detailsRef = orderRef.collection("details"); // Reference to the "details" subcollection
    const detailsSnapshot = await detailsRef.get(); // Get all documents within the "details" subcollection
    let sum = 0;

    detailsSnapshot.forEach((doc) => {
        // Access individual document data here using doc.data()
        const data = doc.data();
        // console.log(data); // Example: Log each document's data
        // Extract individual item properties   
        const qty = data.qty;
        const dish = data.dish;
        const total = data.total;
        sum += parseInt(total); 
        // Generate a unique row id for each item
        const rowId = 'row_' + Math.random().toString(36).substr(2, 9);

        // Generate HTML for the current item
        const orderHTML = `
            <div class="row mt-1 mb-1 row-items" id="${rowId}">
                <div class="col-2 list-item p-0 mt-2 qty">${qty}</div>
                <div class="col-6 list-item p-0 mt-2 item">${dish}</div>
                <div class="col-2 list-item p-0 mt-2 total">${total}</div>
                <div class="col-2 list-item p-0">
                    <button id="${dish}"class="btn-x btn btn-sm btn-outline-danger" onclick="openConfirmationModal('${dish}', ${total}, ${qty}, '${rowId}')">X</button>
                </div>
            </div>
        `;

        // Append the generated HTML for the current item to the order items section
        document.querySelector('.order-items').innerHTML += orderHTML;
        
    });
    document.getElementById('order-total-list').innerHTML = sum;
}


async function openFinalModal() {
    // Implement this function to open the final modal
   // Get a reference to the modal element
    const modal = document.getElementById('finalModal');

    await populateOrder();
    $('#finalModal').modal('show');
}

function hideModal(){
    $('#finalModal').modal('hide');
}

async function billOut() {
    try {
        const orderId = localStorage.getItem("orderId");
        const orderRef = db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(orderId);

        // Get the order status
        const orderDoc = await orderRef.get();
        if (orderDoc.exists) {
            const orderData = orderDoc.data();
            const orderStatus = orderData.status;

            // Check if the order status is "served"
            if (orderStatus === "served") {
                // Check if a discount is available
                if (!orderData.discount) {
                    // No discount, proceed with bill-out
                    await orderRef.update({ status: "bill-out" });
                }
            } else {
                // If the order status is not "served", alert the user
                alert("Order was not fully served. Cannot proceed with bill-out.");
            }
        } else {
            console.error("Order document not found.");
        }
    } catch (error) {
        console.error("Error during bill-out process:", error);
    }
}

async function updateEmployeeStatusAndNotify() {
    const docId = localStorage.getItem("userDocId");
    const employeeRef = db.collection("employees").doc(docId);
    await employeeRef.update({
        occupantOrderId: firebase.firestore.FieldValue.delete(),
        occupied: firebase.firestore.FieldValue.delete()
    });

    // Notify the cashier
    alert("Thankyou. Please come again!");

    // Clear local storage
    localStorage.setItem("orderId", "");
    localStorage.setItem("customerId", "");
    location.reload();
}
