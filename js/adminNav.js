
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for each navigation item
    document.getElementById('dashboard-nav').addEventListener('click', function() {
        // Show the dashboard content
        showDashboard();
    });

    document.getElementById('employee-dropdown').addEventListener('click', function() {
        // Show the add employee screen
        showAddEmployeeScreen();
    });

    document.getElementById('purchase-order-dropdown').addEventListener('click', function() {
        showAddPurchaseOrderScreen();
    })

    document.getElementById('order-listing-dropdown').addEventListener('click', function() {
        showAddOrderListingScreen();
    })

    document.getElementById('purchase-report-dropdown').addEventListener('click', function() {
        // Show the reports content
        showPurchaseReports();
    });

    document.getElementById('sales-report-dropdown').addEventListener('click', function() {
        // Show the reports content
        showSalesReports();
    });

    // Function to show the dashboard content
    function showDashboard() {
        hideAllContainers();
        document.querySelectorAll('.dashboard-content, .data-container, .product-container, .purchase-report-container, .sales-report-container, .settings-container').forEach(function(content) {
            content.classList.add('d-none');
        });
        document.querySelector('.dashboard-content').classList.remove('d-none');
    }

    function hideAllContainers() {
        document.querySelectorAll('.dashboard-content, .data-container, .purchase-order-container, .order-listing-container, .product-container, .transactions-container, .notifications-container, .reports-container, .settings-container')
            .forEach(function(content) {
                content.classList.add('d-none');
            });
    }

    // Function to show the add employee screen
    function showAddEmployeeScreen() {
        hideAllContainers();
        document.querySelectorAll('.dashboard-content, .data-container, .product-container, .purchase-report-container, .sales-report-container, .settings-container').forEach(function(content) {
            content.classList.add('d-none');
        });
        document.querySelector('.data-container').classList.remove('d-none');
    }

    function showAddPurchaseOrderScreen() {
        hideAllContainers();
        document.querySelectorAll('.dashboard-content, .data-container, .product-container, .purchase-report-container, .sales-report-container, .settings-container').forEach(function(content) {
            content.classList.add('d-none');
        });
        document.querySelector('.purchase-order-container').classList.remove('d-none');
    }

    function showAddOrderListingScreen() {
        hideAllContainers();
        document.querySelectorAll('.dashboard-content, .data-container, .product-container, .purchase-report-container, .sales-report-container, .settings-container').forEach(function(content) {
            content.classList.add('d-none');
        });
        document.querySelector('.order-listing-container').classList.remove('d-none');
    }

    // Function to show the reports content
    function showPurchaseReports() {
        hideAllContainers();
        document.querySelectorAll('.dashboard-content, .data-container, .product-container, .purchase-report-container, .sales-report-container, .settings-container').forEach(function(content) {
            content.classList.add('d-none');
        });
        document.querySelector('.purchase-report-container').classList.remove('d-none');
    }

    function showSalesReports() {
        hideAllContainers();
        document.querySelectorAll('.dashboard-content, .data-container, .product-container, .purchase-report-container, .sales-report-container, .settings-container').forEach(function(content) {
            content.classList.add('d-none');
        });
        document.querySelector('.sales-report-container').classList.remove('d-none');
    }
});