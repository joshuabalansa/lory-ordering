
// Add event listener to the "Take Orders" item
document.querySelector('.employees').addEventListener('click', function() {
    // Show the content when the item is clicked
    document.querySelector('.order').classList.add('d-none');
    document.querySelector('.orderlist-container').classList.add('d-none');
    document.querySelector('.sales-container').classList.add('d-none');
    document.querySelector('.salesdetails-container').classList.add('d-none');
    document.querySelector('.employee-container').classList.remove('d-none');
});

// Add event listener to the "Sales" item
document.querySelector('.sales').addEventListener('click', function() {
    // Show the content when the item is clicked
    document.querySelector('.sales-container').classList.remove('d-none');
    document.querySelector('.salesdetails-container').classList.remove('d-none');
    document.querySelector('.order').classList.add('d-none');
    document.querySelector('.orderlist-container').classList.add('d-none');
    document.querySelector('.employee-container').classList.add('d-none');
});
// Add event listener to the "Take Orders" item
document.querySelector('.take-orders').addEventListener('click', function() {
    // Show the content when the item is clicked
    document.querySelector('.order').classList.remove('d-none');
    document.querySelector('.orderlist-container').classList.remove('d-none');
    document.querySelector('.sales-container').classList.add('d-none');
    document.querySelector('.salesdetails-container').classList.add('d-none');
    document.querySelector('.employee-container').classList.add('d-none');
});
