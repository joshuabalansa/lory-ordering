// // Function to display existing employees in the table
// const displayEmployees = async () => {
//     const employeeTableBody = document.getElementById('employee-table-body');

//     try {
//         // Retrieve existing employees from Firestore
//         const querySnapshot = await getDocs(collection(firestoreGet, 'employees'));

//         // Clear existing table rows
//         employeeTableBody.innerHTML = '';

//         // Populate table with employee data
//     querySnapshot.forEach((doc) => {
//         const employee = doc.data();
//         const row = `
//             <tr id="${doc.id}" class="employee-row">
//                 <!-- Remove the <td> for Employee ID -->
//                 <td>${employee.name} ${employee.middleName} ${employee.lastName}</td>
//                 <td>${employee.role}</td>
//                 <td>
//                     <button type="button" class="btn btn-primary edit-btn">Edit</button> <!-- Added Edit button -->
//                     <button type="button" class="btn btn-danger delete-btn">Delete</button>

//                 </td>
//             </tr>
//         `;
//         employeeTableBody.innerHTML += row;
//     });
//     // Attach event listeners to each delete button
//     const deleteButtons = document.querySelectorAll('.delete-btn');
//     deleteButtons.forEach((button) => {
//     button.addEventListener('click', async () => {
//         const employeeId = button.parentElement.parentElement.id;
//         console.log('Clicked delete button for employee ID:', employeeId);
        
//         // Show confirmation modal
//         $('#confirmDeleteModal').modal('show');

//         // Attach event listener to confirm deletion
//         document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
//         // Delete employee only if confirmed
//         await deleteEmployee(employeeId);
//         // Close the confirmation modal
//         $('#confirmDeleteModal').modal('hide');
//         });
//     });
//     });

//         // Attach event listeners to each edit button
//     const editButtons = document.querySelectorAll('.edit-btn');
//     editButtons.forEach((button) => {
//         button.addEventListener('click', async () => {
//             const employeeId = button.parentElement.parentElement.id;
//             console.log('Clicked edit button for employee ID:', employeeId);

//             // Retrieve employee details and open edit modal
//             await openEditModal(employeeId);
//         });
//     });


//     } catch (error) {
//         console.error("Error displaying employees:", error);
//     }
// };
// // Call the function to display employees when the page loads
// displayEmployees();