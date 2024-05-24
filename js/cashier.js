// Add event listener to the "Dashboard" item
document.querySelector('.dashboard').addEventListener('click', function() {
    // Show the content when the item is clicked
    document.querySelector('.dashboard-content').classList.remove('d-none');
    document.querySelector('.detailslist-container').classList.remove('d-none');
    document.querySelector('.order').classList.add('d-none');
    document.querySelector('.orderlist-container').classList.add('d-none');
    document.querySelector('.sales-container').classList.add('d-none');
    document.querySelector('.salesdetails-container').classList.add('d-none');
});
// Add event listener to the "Sales" item
document.querySelector('.sales').addEventListener('click', function() {
    // Show the content when the item is clicked
    document.querySelector('.sales-container').classList.remove('d-none');
    document.querySelector('.salesdetails-container').classList.remove('d-none');
    document.querySelector('.order').classList.add('d-none');
    document.querySelector('.orderlist-container').classList.add('d-none');
    document.querySelector('.dashboard-content').classList.add('d-none');
    document.querySelector('.detailslist-container').classList.add('d-none');
});
// Add event listener to the "Take Orders" item
document.querySelector('.take-orders').addEventListener('click', function() {
    // Show the content when the item is clicked
    document.querySelector('.order').classList.remove('d-none');
    document.querySelector('.orderlist-container').classList.remove('d-none');
    document.querySelector('.dashboard-content').classList.add('d-none');
    document.querySelector('.detailslist-container').classList.add('d-none');
    document.querySelector('.sales-container').classList.add('d-none');
    document.querySelector('.salesdetails-container').classList.add('d-none');
});

let documentId = "";
let total = 0;
function resetDetailsList(){
    document.querySelector(`.detailslist-container`).innerHTML = `
        <div class="details-list">
            <div class="row">
                <!-- Customer ID -->
                <div class="col-12">
                    <div class="customer-id m-2 pt-3 p-2">
                        <h6><b>Table Number - #</b></h6>
                    </div>
                    <!-- List -->
                </div>
                <!-- Order Items -->
                <div class="details-items col-10 offset-1 p-3">
                    <!-- Headers -->
                    <div class="row mb-2">
                        <div class="col-3 list-item p-0"><b>Qty</b></div>
                        <div class="col-6 list-item p-0"><b>Item</b></div>
                        <div class="col-3 list-item p-0"><b>Total</b></div>
                    </div>
                    <!-- Contents -->
                    
                </div>
                <div class="col-12 pt-3">
                    <div class="row">
                        <div class="col-12">
                            <h6><b>Order Total</b></h6>
                        </div>
                        <div class="col-12">
                            <h6 id="order-total">0</h6>
                        </div>
                    </div>
                </div>
                <div class="buttons-list col-12 mt-1">
                    <div class="row">
                        <div class="col-6">
                            <button class="btn btn-c btn-outline-success verify">
                                <img src="images/check.svg" alt="Check" height="100%" width="100%">
                            </button>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-c btn-outline-danger cancel">
                                X
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
function pendingButtonAdjust(){
    document.getElementById("total-list").innerHTML = `
        <div class="col-12">
            <h6><b>Order Total</b></h6>
        </div>
        <div class="col-12">
            <h6 id="order-total">0</h6>
        </div>`;
    document.querySelector('.buttons-list').innerHTML = `
        <button class="btn btn-c btn-outline-danger cancel">
            X
        </button>
    `;
}
function billOutButtonAdjust(){
    document.getElementById("total-list").innerHTML = `
        <div class="col-6">
            <h6><b>Discount</b></h6>
        </div>
        <div class="col-6">
            <input type="number" id="discount-input" class="form-control" min="0">
        </div>
        <div class="col-12">
            <h6><b>Order Total</b></h6>
        </div>
        <div class="col-12">
            <h6 id="order-total">0</h6>
        </div>`;
    document.querySelector('.buttons-list').innerHTML = `
        <button class="btn btn-c btn-outline-success" id="paymentSuccessBtn">
            <img src="images/check.svg" alt="Check" height="100%" width="100%">
        </button>
    `;
}
function completedButtonAdjust(){
    document.getElementById("total-list").innerHTML = `
        <div class="col-12">
            <h6><b>Order Total</b></h6>
        </div>
        <div class="col-12">
            <h6 id="order-total">0</h6>
        </div>`;
    document.querySelector('.buttons-list').innerHTML = `
    `;
}

async function paymentSuccess(docId) {
    try {
        const originalDocRef = db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(docId);
        const originalDocSnapshot = await originalDocRef.get();

        if (originalDocSnapshot.exists) {
            const originalData = originalDocSnapshot.data();
            const status = originalData.status;
            const discountInputValue = document.getElementById('discount-input').value;
            const discountInput = parseInt(discountInputValue);

            if (!originalData.discount) {
                // No discount field, handle the first button click to update the discounted price
                if (!isNaN(discountInput) && discountInput > 0) {
                    const originalTotal = originalData['total'];
                    const newTotal = originalTotal - discountInput;

                    // Update the discount and new total in the document
                    await originalDocRef.update({ discount: discountInput, 'total': newTotal });
                    console.log(`Discount applied: ${discountInput}. New total: ${newTotal}`);
                    alert("Discount applied successfully. Click again to complete payment.");
                } else {
                    console.log("Invalid discount value.");
                }
            } else if (originalData.discount !== discountInput) {
                // Discount exists and has changed
                if (!isNaN(discountInput) && discountInput > 0) {
                    const oldDiscount = originalData.discount;
                    const originalTotal = originalData['total'] + oldDiscount;
                    const newTotal = originalTotal - discountInput;

                    // Update the discount and new total in the document
                    await originalDocRef.update({ discount: discountInput, 'total': newTotal });
                    console.log(`Discount updated: ${discountInput}. New total: ${newTotal}`);
                    alert("Discount updated successfully. Click again to complete payment.");
                } else {
                    console.log("Invalid discount value.");
                }
            } else if (status === "bill-out") {
                // Handle the payment and transfer process if the discount field already exists and discount input is the same
                await originalDocRef.update({ status: "paid" });
                console.log("Payment successful. Status updated to paid.");

                // Move the document and its subcollections to "sales" collection
                const salesCollectionRef = db.collection("sales").doc(docId);
                await salesCollectionRef.set(originalData);

                // Move "details" subcollection
                const detailsCollectionRef = originalDocRef.collection("details");
                const detailsSnapshot = await detailsCollectionRef.get();
                detailsSnapshot.forEach(async (doc) => {
                    await salesCollectionRef.collection("details").doc(doc.id).set(doc.data());
                });

                // Move "checklist" subcollection
                const checklistCollectionRef = originalDocRef.collection("checklist");
                const checklistSnapshot = await checklistCollectionRef.get();
                checklistSnapshot.forEach(async (doc) => {
                    await salesCollectionRef.collection("checklist").doc(doc.id).set(doc.data());
                });

                // Delete documents in "details" subcollection
                await Promise.all(detailsSnapshot.docs.map(async (doc) => {
                    await detailsCollectionRef.doc(doc.id).delete();
                }));

                // Delete documents in "checklist" subcollection
                await Promise.all(checklistSnapshot.docs.map(async (doc) => {
                    await checklistCollectionRef.doc(doc.id).delete();
                }));

                // Delete the original document
                await originalDocRef.delete();
                console.log("Document and its subcollections removed from original collection.");
                location.reload();
            } else {
                console.log("Payment failed. Status is not bill-out.");
            }
        } else {
            console.log("No such document exists.");
        }
    } catch (error) {
        console.error("Error updating document:", error);
    }
}

function paymentButtonUpdate(docId){
    const paymentSuccessBtn = document.getElementById("paymentSuccessBtn");
    paymentSuccessBtn.setAttribute("onclick", "paymentSuccess('"+docId+"')");
}

// Pending Button
pendingButtonAdjust();  
fetchData();
async function fetchData() {
    let notified = false;
    await db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").orderBy("date", "desc").get().then((itemSnapshot) => {
        itemSnapshot.forEach((itemDoc) => {
            const itemData = itemDoc.data();
            const tableid = itemData.tableid;
            const customerid = itemData.customerid;
            const status = itemData.status;
            const total = itemData.total;
            const date = itemData.date.toDate();
            const timeString = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            let billOutEvent = null; 
            let tableName = "";
            

            // Construct HTML for each row based on status
            if (status === "pending") {
                tableName = "pending-list";
            } else if (status === "completed" || status === "served") {
                tableName = "completed-list";
            } else if (status === "bill-out") {
                tableName = "bill-out-list";
                if(!notified){
                    alert("Bill-out notification received!");
                    notified = true;
                }
                billOutEvent = "paymentButtonUpdate('"+itemDoc.id+"')";
            }
            console.log("table name: ", tableName);
            document.getElementById(tableName).innerHTML += `
                <tr>
                    <td>${tableid}</td>
                    <td>${timeString}</td>
                    <td>${customerid}</td>
                    <td>${total}</td>
                    <td>${status}</td>
                    <td><button class="btn btn-sm btn-success list-button" id="${itemDoc.id}" onclick="getDetails('${itemDoc.id}', 'dashboard');${billOutEvent}">View</button></td>
                </tr>
            `;
        });
    });
}

function getDetails(docId, operation){
    let labelId = "";
    let sales = false;
    const verifyButton = document.querySelector('.verify');
    const cancelButton = document.querySelector('.cancel');
    let total = 0;
    let discount = 0;

    if (operation == 'sales'){
        sales = true;
        labelId = docId;
        document.querySelector(".salesdetails-items").innerHTML = `
            <div class="row mb-2">
                <div class="col-3 list-item p-0"><b>Qty</b></div>
                <div class="col-6 list-item p-0"><b>Item</b></div>
                <div class="col-3 list-item p-0"><b>Total</b></div>
            </div>
        `;
    } else {
        document.querySelector(".details-items").innerHTML = `
            <div class="row mb-2">
                <div class="col-3 list-item p-0"><b>Qty</b></div>
                <div class="col-6 list-item p-0"><b>Item</b></div>
                <div class="col-3 list-item p-0"><b>Total</b></div>
            </div>
        `;
        
        labelId = "d716BHinTx1rHwR96KOV";
    }
    
    // If the document was only clicked once
    if(documentId != docId){
        // Reset all list buttons
        document.querySelectorAll('.list-button').forEach(button => {
            button.classList.add('btn-success');
            button.classList.remove('btn-danger');
            button.innerHTML = "Confirm";

        });
        document.getElementById(`${docId}`).classList.remove('btn-success');
        document.getElementById(`${docId}`).classList.add('btn-danger');
        document.getElementById(`${docId}`).innerHTML = "X";
        // For changing ID
        const customerIDElement = document.querySelector(".customer-id h6 b");
        if(sales){
            // If sales mode, fetch the customer ID from the sales collection
            db.collection("sales").doc(labelId).get().then((doc) => {
                if (doc.exists) {
                    const customerID = doc.data().tableId;
                    total = doc.data().total;
                    discount = doc.data().discount;
                    customerIDElement.textContent = `Table Number - ${customerID}`;
                } else {
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.log("Error getting customer ID:", error);
            });
            // ---
            db.collection("sales").doc(labelId).collection("details").get().then((detailSnapshot) => {
                detailSnapshot.forEach((detailDoc) => {
                    const detailData = detailDoc.data();
                    console.log(detailData.dish);
                    const rowId = 'row_' + Math.random().toString(36).substr(2, 9);
                    document.querySelector(".salesdetails-items").innerHTML += `
                    <div class="row mt-1 mb-1" id="${rowId}">
                        <div class="col-3 list-item p-0 mt-2 qty">${detailData.qty}</div>
                        <div class="col-6 list-item p-0 mt-2 item">${detailData.dish}</div>
                        <div class="col-3 list-item p-0 mt-2 total">${detailData.total}</div>
                    </div>
                `;
                // total += parseFloat(detailData.total);
                // console.log(total)
                document.getElementById("sales-list").innerHTML = `
                    <div class="col-6">
                        <h6><b>Discount</b></h6>
                    </div>
                    <div class="col-6">
                        <h6 id="discount-total">${discount}</h6>
                    </div>
                    <div class="col-12">
                        <h6><b>Order Total</b></h6>
                    </div>
                    <div class="col-12">
                        <h6 id="order-total">${total}</h6>
                    </div>
                `;
                });
            }).catch((error) => {
                console.log("Error getting details:", error);
            });
        } else {
            // change the table Id
            db.collection("orders").doc(labelId).collection("queue").doc(docId).get().then((doc) => {
                if (doc.exists) {
                    const tableId = doc.data().tableid;
                    document.getElementById("order-total").innerText = doc.data().total;
                    document.getElementById("discount-input").value = doc.data().discount;
                    customerIDElement.textContent = `Table Number - ${tableId}`;
                } else {
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.log("Error getting customer ID:", error);
            });
            // ---
            // Get details from the same collection for the current itemDoc
            db.collection("orders").doc(labelId).collection("queue").doc(docId).collection("details").get().then((detailSnapshot) => {
                detailSnapshot.forEach((detailDoc) => {
                    const detailData = detailDoc.data();
                    console.log(detailData.dish);
                    // Append details to the itemHTML
                    const rowId = 'row_' + Math.random().toString(36).substr(2, 9);
                    console.log(detailDoc.id);
                    
                    document.querySelector(".details-items").innerHTML += `
                        <div class="row mt-1 mb-1 row-items" id="${rowId}">
                            <div class="col-3 list-item p-0 mt-2 qty">${detailData.qty}</div>
                            <div class="col-6 list-item p-0 mt-2 item">${detailData.dish}</div>
                            <div class="col-3 list-item p-0 mt-2 total">${detailData.total}</div>
                        </div>
                    `;
                    total += parseFloat(detailData.total);
                    console.log("Order Total: ",total);
                    // document.getElementById("order-total").innerHTML = total;
                });
            }).catch((error) => {
                console.log("Error getting details:", error);
            });
        }
        documentId = docId;
    } else {
        // Reset all list buttons
        document.querySelectorAll('.list-button').forEach(button => {
            button.classList.add('btn-success');
            button.classList.remove('btn-danger');
            button.innerHTML = "Confirm";

        });
        documentId = "";
    }
}

function cancel(docId, label) {
    let labelId = "";
    if (label == 'verification') {
        labelId = "BawoijACJlbVRi8sHQqI";
    } else if (label == 'pending') {
        labelId = "d716BHinTx1rHwR96KOV";
    } else {
        labelId = "QiQgHzK5ejJONcqySnGg";
    }

    const docRef = db.collection(`orders/${labelId}/queue`).doc(docId);

    // Delete the "details" collection
    docRef.collection('details').get().then(snapshot => {
        snapshot.forEach(doc => {
            doc.ref.delete();
        });
        console.log("Collection 'details' successfully deleted!");

        // Now delete the document itself
        docRef.delete().then(() => {
            alert("Document has been successfully removed!")
            location.reload();
            console.log("Document and its 'details' collection successfully deleted from the 'queue' subcollection!");
        }).catch(error => {
            console.error("Error removing document from the 'queue' subcollection: ", error);
        });
    }).catch(error => {
        console.error("Error deleting documents in 'details' collection: ", error);
    });
}

