// Admin credentials
const ADMIN_PASSWORD = "admin123";
let isAdminLoggedIn = false;
let pendingPayments = [];
let foodStock = {}; // Track stock status of foods
let specialItem = {name: "Chicken Biriyani", price: 120}; // Today's special item

const foods = [
    {name:"Biriyani", price:120, img:"biriyani.jpeg", category:"Meals"},
    {name:"Half Biriyani", price:60, img:"biriyani.jpeg", category:"Meals"},
    {name:"Chicken 65", price:80, img:"chicken 65.jpeg", category:"Meals"},
    {name:"Half Chicken 65", price:40, img:"chicken 65.jpeg", category:"Meals"},
    {name:"Meen Curry", price:40, img:"meen curry.jpeg", category:"Meals"},
    {name:"Samosa", price:10, img:"samosa.jpeg", category:"Snacks"},
    {name:"Chicken Roll", price:20, img:"chicken roll.jpeg", category:"Snacks"},
    {name:"Cutlet", price:25, img:"cutlet.jpeg", category:"Snacks"},
    {name:"puffz", price:20, img:"puffz.jpeg", category:"Snacks"},
    {name:"Lays", price:30, img:"lays.jpeg", category:"Snacks"},
    {name:"Kurkure", price:25, img:"kurkure.jpeg", category:"Snacks"},
    {name:"Nabati", price:15, img:"nabati.jpeg", category:"Snacks"},
    {name:"Biscuits", price:20, img:"biscuits.jpeg", category:"Snacks"},
    {name:"sprite", price:20, img:"sprite.jpeg", category:"Drinks"},
    {name:"frooti", price:20, img:"frooti.jpeg", category:"Drinks"},
    {name:"Black Tea", price:8, img:"blacktea.jpeg", category:"Drinks"},
    {name:"Coffee", price:10, img:"coffee.jpeg", category:"Drinks"},
    {name:"Horlicks", price:15, img:"horlicks.jpeg", category:"Drinks"},
    {name:"Boost", price:15, img:"boost.jpeg", category:"Drinks"},
    {name:"Brownie", price:40, img:"brownie.jpeg", category:"Dessert"},
    {name:"Ice Cream", price:20, img:"icecream.jpeg", category:"Dessert"},
    {name:"Dairymilk", price:10, img:"dairymilk.jpeg", category:"Chocolates"},
    {name:"Milky Bar", price:10, img:"milkybar.jpeg", category:"Chocolates"},
    {name:"Snickers", price:10, img:"snickers.jpeg", category:"Chocolates"},
    {name:"Crispello", price:20, img:"crispello.jpeg", category:"Chocolates"},
    {name:"5 Star", price:10, img:"5star.jpeg", category:"Chocolates"}
];

let cart = {};

function loadFoods(items) {
    const list = document.getElementById("foodList");
    list.innerHTML = "";
    items.forEach((food) => {
        const foodIndex = foods.indexOf(food);
        const isOutOfStock = foodStock[foodIndex] === "out-of-stock";
        
        list.innerHTML += `
        <div class="card ${isOutOfStock ? 'out-of-stock' : ''}">
            <img src="${food.img}" ${isOutOfStock ? 'style="opacity: 0.5;"' : ''}>
            <h3>${food.name}</h3>
            <p class="price">₹${food.price}</p>
            <div id="addBtn-${foodIndex}" class="add-button-container">
                ${isOutOfStock ? '<p class="out-of-stock-message">Out of Stock</p>' : `<button onclick="showQuantitySelector(${foodIndex})">Add</button>`}
            </div>
            <div id="qtySelector-${foodIndex}" class="quantity-selector" style="display: none;">
                <button onclick="decrementQty(${foodIndex})">−</button>
                <input type="text" id="qtyInput-${foodIndex}" value="1" readonly>
                <button onclick="incrementQty(${foodIndex})">+</button>
                <button onclick="confirmAddToCart(${foodIndex})" class="confirm-btn">Add to Cart</button>
                <button onclick="cancelQuantitySelector(${foodIndex})" class="cancel-btn">Cancel</button>
            </div>
        </div>`;
    });
}

loadFoods(foods);

function showQuantitySelector(foodIndex) {
    document.getElementById("addBtn-" + foodIndex).style.display = "none";
    document.getElementById("qtySelector-" + foodIndex).style.display = "flex";
    document.getElementById("qtyInput-" + foodIndex).value = "1";
}

function cancelQuantitySelector(foodIndex) {
    document.getElementById("qtySelector-" + foodIndex).style.display = "none";
    document.getElementById("addBtn-" + foodIndex).style.display = "block";
}

function incrementQty(foodIndex) {
    let input = document.getElementById("qtyInput-" + foodIndex);
    input.value = parseInt(input.value) + 1;
}

function decrementQty(foodIndex) {
    let input = document.getElementById("qtyInput-" + foodIndex);
    if(parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function confirmAddToCart(foodIndex) {
    let quantity = parseInt(document.getElementById("qtyInput-" + foodIndex).value);
    
    if(cart[foodIndex]) {
        cart[foodIndex] += quantity;
    } else {
        cart[foodIndex] = quantity;
    }
    
    updateCart();
    cancelQuantitySelector(foodIndex);
}

/* SPECIAL ITEM ORDERING */
function showQuantitySelectorForSpecial() {
    document.getElementById("specialQtyInput").value = "1";
    document.getElementById("specialItemName").innerText = specialItem.name + " - ₹" + specialItem.price;
    document.getElementById("specialQtySelector").style.display = "flex";
}

function incrementSpecialQty() {
    let input = document.getElementById("specialQtyInput");
    input.value = parseInt(input.value) + 1;
}

function decrementSpecialQty() {
    let input = document.getElementById("specialQtyInput");
    if(parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function confirmAddSpecialToCart() {
    let quantity = parseInt(document.getElementById("specialQtyInput").value);
    
    // Create a special item entry in cart with unique key
    const specialCartKey = "special_" + Date.now();
    cart[specialCartKey] = {
        name: specialItem.name,
        price: specialItem.price,
        quantity: quantity
    };
    
    updateCart();
    cancelSpecialQtySelector();
}

function cancelSpecialQtySelector() {
    document.getElementById("specialQtySelector").style.display = "none";
}

/* UPDATE CART */
function updateCart() {
    let html = "";
    let total = 0;

    for(let i in cart) {
        let item = cart[i];
        let qty, food, cost, name;
        
        // Check if it's a special item or regular food
        if(typeof item === 'object' && item.name) {
            // Special item
            qty = item.quantity;
            name = item.name;
            cost = qty * item.price;
            total += cost;
            
            html += `
            ${name}
            <button onclick="changeQty('${i}',-1)">-</button>
            ${qty}
            <button onclick="changeQty('${i}',1)">+</button>
            = ₹${cost}<br>`;
        } else {
            // Regular food item
            qty = item;
            food = foods[i];
            cost = qty * food.price;
            total += cost;

            html += `
            ${food.name}
            <button onclick="changeQty(${i},-1)">-</button>
            ${qty}
            <button onclick="changeQty(${i},1)">+</button>
            = ₹${cost}<br>`;
        }
    }

    document.getElementById("cartItems").innerHTML = html;
    document.getElementById("total").innerText = "Total: ₹" + total;
}

/* CHANGE QUANTITY */
function changeQty(index, change) {
    // Check if it's a special item
    if(typeof cart[index] === 'object' && cart[index].quantity) {
        cart[index].quantity += change;
        if(cart[index].quantity <= 0) delete cart[index];
    } else {
        // Regular food item
        cart[index] += change;
        if(cart[index] <= 0) delete cart[index];
    }
    updateCart();
}

/* BILL */
function showBill() {
    if(Object.keys(cart).length === 0) {
        alert("Please add items to your cart first!");
        return;
    }
    
    let billHTML = "<h3>Bill Receipt</h3>";
    let total = 0;

    for(let i in cart) {
        let qty = cart[i];
        let food = foods[i];
        let cost = qty * food.price;
        total += cost;

        billHTML += `${food.name} | Qty: ${qty} | ₹${cost}<br>`;
    }

    billHTML += `<hr><h2>Total: ₹${total}</h2>`;

    document.getElementById("bill").innerHTML = billHTML;
    document.getElementById("bill").style.display = "block";
    document.getElementById("payment").style.display = "block";
    document.getElementById("success").style.display = "none";
    
    // Store total for later use
    window.billTotal = total;
}

/* PAYMENT SUCCESS */
function paymentSuccess() {
    let billHTML = "<h3>✅ Payment Successful</h3>";
    let total = window.billTotal || 0;

    for(let i in cart) {
        let qty = cart[i];
        let food = foods[i];
        let cost = qty * food.price;

        billHTML += `${food.name} | Qty: ${qty} | ₹${cost}<br>`;
    }

    billHTML += `<hr><h2>Total: ₹${total}</h2>`;
    billHTML += `<h3 style="color: #4a7c59; margin-top: 20px;">STATUS: <span style="font-weight: 800;">PAID</span></h3>`;
    billHTML += `<p style="text-align: center; margin-top: 15px; color: #666;">Thank you for your order!</p>`;

    document.getElementById("success").innerHTML = billHTML;
    document.getElementById("success").style.display = "block";
    document.getElementById("bill").style.display = "none";
    document.getElementById("payment").style.display = "none";
    
    // Clear cart after successful payment
    cart = {};
}

/* SEARCH */
document.getElementById("searchInput").addEventListener("keyup", function() {
    let value = this.value.toLowerCase();
    let filtered = foods.filter(f =>
        f.name.toLowerCase().includes(value)
    );
    loadFoods(filtered);
})

/* FILTER BY CATEGORY */
function filterByCategory(category) {
    let filtered = foods.filter(f => f.category === category);
    loadFoods(filtered);
}

/* COMPLETE PAYMENT */
function completePayment() {
    let total = window.billTotal || 0;
    let orderId = "ORD" + Date.now();
    let timestamp = new Date().toLocaleString();
    
    // Create order object
    let order = {
        id: orderId,
        items: {},
        total: total,
        timestamp: timestamp,
        status: "PENDING",
        approved: false
    };
    
    // Store order items
    for(let i in cart) {
        let qty = cart[i];
        let food = foods[i];
        order.items[i] = {
            name: food.name,
            qty: qty,
            price: food.price
        };
    }
    
    // Add to pending payments
    pendingPayments.push(order);
    localStorage.setItem('pendingPayments', JSON.stringify(pendingPayments));
    
    // Store current order ID for tracking
    window.currentOrderId = orderId;
    
    // Show pending status
    displayPendingPayment(orderId, total);
    
    // Start checking for payment approval every 2 seconds
    checkPaymentStatus(orderId);
    
    // Clear cart after payment confirmation
    cart = {};
    updateCart();
}

function displayPendingPayment(orderId, total) {
    let billHTML = "<h3 style='text-align: center; color: #4a7c59;'>📋 INVOICE</h3>";
    billHTML += `<hr>`;
    billHTML += `<p style="text-align: center; margin-top: 10px; font-weight: 700; color: #4a7c59; font-size: 1.2em;">Order ID: ${orderId}</p>`;
    billHTML += `<p style="text-align: center; color: #666; font-size: 0.9em;">Timestamp: ${new Date().toLocaleString()}</p>`;
    billHTML += `<hr><br>`;
    billHTML += `<p style="font-weight: 700; color: #333;">ORDERED ITEMS:</p>`;

    for(let i in cart) {
        let qty = cart[i];
        let food = foods[i];
        let cost = qty * food.price;
        billHTML += `<div style='display: flex; justify-content: space-between; margin: 8px 0; border-bottom: 1px solid #ddd; padding-bottom: 8px;'>`;
        billHTML += `<span>${food.name} x ${qty}</span>`;
        billHTML += `<span>₹${cost}</span>`;
        billHTML += `</div>`;
    }

    billHTML += `<hr><div style='display: flex; justify-content: space-between; font-size: 1.2em; font-weight: 700; color: #4a7c59; margin: 15px 0;'>`;
    billHTML += `<span>TOTAL:</span>`;
    billHTML += `<span>₹${total}</span>`;
    billHTML += `</div><hr>`;
    billHTML += `<p style="text-align: center; margin-top: 15px; color: #666;"><strong>Payment Status:</strong></p>`;
    billHTML += `<h3 style="color: #f59e0b; text-align: center; margin-top: 10px;">⏳ PENDING ADMIN APPROVAL</h3>`;
    billHTML += `<p style="text-align: center; margin-top: 15px; color: #666; font-size: 0.9em;">Your payment has been confirmed. Admin will verify and approve shortly.</p>`;

    document.getElementById("success").innerHTML = billHTML;
    document.getElementById("success").style.display = "block";
    document.getElementById("bill").style.display = "none";
    document.getElementById("payment").style.display = "none";
}

function checkPaymentStatus(orderId) {
    let statusCheck = setInterval(function() {
        let saved = localStorage.getItem('pendingPayments');
        if(saved) {
            let payments = JSON.parse(saved);
            let currentOrder = payments.find(p => p.id === orderId);
            
            if(currentOrder && currentOrder.status === "APPROVED") {
                clearInterval(statusCheck);
                showApprovedPayment(currentOrder);
            } else if(currentOrder && currentOrder.status === "REJECTED") {
                clearInterval(statusCheck);
                showRejectedPayment(currentOrder);
            }
        }
    }, 2000); // Check every 2 seconds
}

function showApprovedPayment(order) {
    let billHTML = "<h3 style='text-align: center; color: #16a34a;'>✅ PAYMENT APPROVED - INVOICE</h3>";
    billHTML += `<hr>`;
    billHTML += `<p style="text-align: center; margin-top: 10px; font-weight: 700; color: #16a34a; font-size: 1.2em;">Order ID: ${order.id}</p>`;
    billHTML += `<p style="text-align: center; color: #666; font-size: 0.9em;">Timestamp: ${order.timestamp}</p>`;
    billHTML += `<hr><br>`;
    billHTML += `<p style="font-weight: 700; color: #333;">ORDERED ITEMS:</p>`;

    for(let i in order.items) {
        let item = order.items[i];
        let cost = item.qty * item.price;
        billHTML += `<div style='display: flex; justify-content: space-between; margin: 8px 0; border-bottom: 1px solid #ddd; padding-bottom: 8px;'>`;
        billHTML += `<span>${item.name} x ${item.qty}</span>`;
        billHTML += `<span>₹${cost}</span>`;
        billHTML += `</div>`;
    }

    billHTML += `<hr><div style='display: flex; justify-content: space-between; font-size: 1.2em; font-weight: 700; color: #16a34a; margin: 15px 0;'>`;
    billHTML += `<span>TOTAL:</span>`;
    billHTML += `<span>₹${order.total}</span>`;
    billHTML += `</div><hr>`;
    billHTML += `<h3 style="color: #16a34a; text-align: center; margin-top: 15px;">✅ APPROVED BY ADMIN</h3>`;
    billHTML += `<p style="text-align: center; margin-top: 15px; color: #666; font-weight: 700; font-size: 0.95em;">Your order has been approved! Please collect your order from the counter.</p>`;

    document.getElementById("success").innerHTML = billHTML;
    document.getElementById("success").style.display = "block";
}

function showRejectedPayment(order) {
    let billHTML = "<h3 style='text-align: center; color: #dc2626;'>❌ PAYMENT REJECTED - INVOICE</h3>";
    billHTML += `<hr>`;
    billHTML += `<p style="text-align: center; margin-top: 10px; font-weight: 700; color: #dc2626; font-size: 1.2em;">Order ID: ${order.id}</p>`;
    billHTML += `<p style="text-align: center; color: #666; font-size: 0.9em;">Timestamp: ${order.timestamp}</p>`;
    billHTML += `<hr><br>`;
    billHTML += `<p style="font-weight: 700; color: #333;">ORDERED ITEMS:</p>`;

    for(let i in order.items) {
        let item = order.items[i];
        let cost = item.qty * item.price;
        billHTML += `<div style='display: flex; justify-content: space-between; margin: 8px 0; border-bottom: 1px solid #ddd; padding-bottom: 8px;'>`;
        billHTML += `<span>${item.name} x ${item.qty}</span>`;
        billHTML += `<span>₹${cost}</span>`;
        billHTML += `</div>`;
    }

    billHTML += `<hr><div style='display: flex; justify-content: space-between; font-size: 1.2em; font-weight: 700; color: #dc2626; margin: 15px 0;'>`;
    billHTML += `<span>TOTAL:</span>`;
    billHTML += `<span>₹${order.total}</span>`;
    billHTML += `</div><hr>`;
    billHTML += `<h3 style="color: #dc2626; text-align: center; margin-top: 15px;">❌ REJECTED BY ADMIN</h3>`;
    billHTML += `<p style="text-align: center; margin-top: 15px; color: #666; font-weight: 700; font-size: 0.95em;">Your order has been rejected by admin. Please try placing a new order.</p>`;

    document.getElementById("success").innerHTML = billHTML;
    document.getElementById("success").style.display = "block";
}

/* ADMIN LOGIN */
function openAdminLogin() {
    document.getElementById("adminLoginModal").style.display = "block";
}

function closeAdminLogin() {
    document.getElementById("adminLoginModal").style.display = "none";
    document.getElementById("adminLoginError").innerText = "";
    document.getElementById("adminPassword").value = "";
}

function loginAdmin() {
    let password = document.getElementById("adminPassword").value;
    
    if(password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        closeAdminLogin();
        showAdminPanel();
    } else {
        document.getElementById("adminLoginError").innerText = "❌ Incorrect password!";
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    document.getElementById("adminPanel").style.display = "none";
    // Clear refresh interval when logging out
    if(window.adminRefreshInterval) {
        clearInterval(window.adminRefreshInterval);
    }
}

function toggleStockStatus(foodIndex, newStatus) {
    foodStock[foodIndex] = newStatus;
    localStorage.setItem('foodStock', JSON.stringify(foodStock));
    showStockControl();
    // Reload foods to update display
    loadFoods(foods);
}

function showAdminPanel() {
    if(!isAdminLoggedIn) return;
    
    // Load pending payments from localStorage
    let saved = localStorage.getItem('pendingPayments');
    if(saved) {
        pendingPayments = JSON.parse(saved);
    }
    
    refreshPaymentsTab();
    showStockControl();
    
    document.getElementById("adminPanel").style.display = "block";
    
    // Start auto-refresh for admin panel
    startAdminPanelRefresh();
}

function switchAdminTab(tabName) {
    // Hide all tabs
    document.getElementById("paymentsTab").style.display = "none";
    document.getElementById("stockTab").style.display = "none";
    document.getElementById("specialTab").style.display = "none";
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    if(tabName === 'payments') {
        document.getElementById("paymentsTab").style.display = "block";
        refreshPaymentsTab();
    } else if(tabName === 'stock') {
        document.getElementById("stockTab").style.display = "block";
        showStockControl();
    } else if(tabName === 'special') {
        document.getElementById("specialTab").style.display = "block";
        showSpecialItems();
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function showStockControl() {
    let html = "";
    
    foods.forEach((food, idx) => {
        let isOutOfStock = foodStock[idx] === "out-of-stock";
        let statusColor = isOutOfStock ? "#dc2626" : "#16a34a";
        let statusText = isOutOfStock ? "❌ OUT OF STOCK" : "✅ IN STOCK";
        let buttonText = isOutOfStock ? "Mark In Stock" : "Mark Out of Stock";
        
        html += `
        <div class='stock-item'>
            <div class='stock-item-info'>
                <img src='${food.img}' alt='${food.name}'>
                <div>
                    <h4>${food.name}</h4>
                    <p>Category: ${food.category}</p>
                    <p>Price: ₹${food.price}</p>
                </div>
            </div>
            <div class='stock-item-status'>
                <p style='color: ${statusColor}; font-weight: 700;'>${statusText}</p>
                <button onclick="toggleStockStatus(${idx}, '${isOutOfStock ? 'in-stock' : 'out-of-stock'}')" class='${isOutOfStock ? 'stock-btn-in' : 'stock-btn-out'}'>
                    ${buttonText}
                </button>
            </div>
        </div>
        `;
    });
    
    document.getElementById("stockItems").innerHTML = html;
}

function startAdminPanelRefresh() {
    // Clear any existing interval
    if(window.adminRefreshInterval) {
        clearInterval(window.adminRefreshInterval);
    }
    
    // Auto-refresh admin panel every 3 seconds
    window.adminRefreshInterval = setInterval(function() {
        if(isAdminLoggedIn && document.getElementById("adminPanel").style.display === "block") {
            let saved = localStorage.getItem('pendingPayments');
            if(saved) {
                let newPayments = JSON.parse(saved);
                let pendingCount = newPayments.filter(p => p.status === "PENDING").length;
                
                // Only refresh if there are pending payments
                if(pendingCount > 0) {
                    let currentTab = document.querySelector('.tab-btn.active')?.getAttribute('onclick').split("'")[1];
                    if(currentTab === 'payments') {
                        refreshPaymentsTab();
                    }
                }
            }
        }
    }, 3000); // Refresh every 3 seconds
}

function refreshPaymentsTab() {
    let saved = localStorage.getItem('pendingPayments');
    if(saved) {
        pendingPayments = JSON.parse(saved);
    }
    
    let html = "<h3 style='color: #4a7c59; margin-bottom: 20px;'>📋 Pending Payment Approvals</h3>";
    
    if(pendingPayments.length === 0) {
        html += "<p style='text-align: center; color: #666;'>✅ No pending payments</p>";
    } else {
        pendingPayments.forEach((order, idx) => {
            if(order.status === "PENDING") {
                html += `<div class='payment-card'>`;
                html += `<h4>Order ID: ${order.id}</h4>`;
                html += `<p><strong>Time:</strong> ${order.timestamp}</p>`;
                html += `<p><strong>Total Amount:</strong> ₹${order.total}</p>`;
                html += `<p><strong>Items:</strong></p><ul style='margin-left: 20px;'>`;
                
                for(let i in order.items) {
                    let item = order.items[i];
                    html += `<li>${item.name} x ${item.qty} = ₹${item.qty * item.price}</li>`;
                }
                
                html += `</ul>`;
                html += `<p style='color: #f59e0b; font-weight: 700;'>Status: ${order.status}</p>`;
                html += `<button onclick="approvePayment(${idx})" class='approve-btn'>✅ Approve Payment</button>`;
                html += `<button onclick="rejectPayment(${idx})" class='reject-btn'>❌ Reject Payment</button>`;
                html += `</div>`;
            }
        });
    }
    
    document.getElementById("pendingPayments").innerHTML = html;
}

function approvePayment(idx) {
    if(confirm("Are you sure you want to APPROVE this payment?")) {
        pendingPayments[idx].status = "APPROVED";
        pendingPayments[idx].approved = true;
        localStorage.setItem('pendingPayments', JSON.stringify(pendingPayments));
        showAdminPanel();
        alert("✅ Payment APPROVED!");
    }
}

function rejectPayment(idx) {
    if(confirm("Are you sure you want to REJECT this payment?")) {
        pendingPayments[idx].status = "REJECTED";
        localStorage.setItem('pendingPayments', JSON.stringify(pendingPayments));
        showAdminPanel();
        alert("❌ Payment REJECTED!");
    }
}

function showSpecialItems() {
    let html = `
    <div class="special-item-container">
        <div class="special-item-form">
            <h4>Edit Today's Special</h4>
            <div class="form-group">
                <label>Food Item Name:</label>
                <input type="text" id="specialFoodName" value="${specialItem.name}" placeholder="Enter food name">
            </div>
            <div class="form-group">
                <label>Price (₹):</label>
                <input type="number" id="specialFoodPrice" value="${specialItem.price}" placeholder="Enter price">
            </div>
            <button onclick="saveSpecialItem()" class="save-btn">Save Special Item</button>
        </div>
        <div class="special-item-preview">
            <h4>Preview</h4>
            <div class="special-preview">
                ⭐ Today Special: ${specialItem.name} ₹${specialItem.price}
            </div>
        </div>
    </div>
    `;
    
    document.getElementById("specialItems").innerHTML = html;
}

function saveSpecialItem() {
    const name = document.getElementById("specialFoodName").value.trim();
    const price = parseInt(document.getElementById("specialFoodPrice").value);
    
    if(!name) {
        alert("Please enter food name");
        return;
    }
    
    if(!price || price <= 0) {
        alert("Please enter valid price");
        return;
    }
    
    specialItem = {name: name, price: price};
    
    // Update the special display on main page
    document.querySelector(".special").innerHTML = `⭐ Today Special: ${specialItem.name} ₹${specialItem.price}`;
    
    // Save to localStorage
    localStorage.setItem('specialItem', JSON.stringify(specialItem));
    
    alert("Special item updated successfully!");
    showSpecialItems();
}

// Load pending payments from localStorage on page load
window.addEventListener('load', function() {
    let saved = localStorage.getItem('pendingPayments');
    if(saved) {
        pendingPayments = JSON.parse(saved);
    }
    
    // Load food stock status
    let savedStock = localStorage.getItem('foodStock');
    if(savedStock) {
        foodStock = JSON.parse(savedStock);
    }
    
    // Load special item
    let savedSpecial = localStorage.getItem('specialItem');
    if(savedSpecial) {
        specialItem = JSON.parse(savedSpecial);
        document.querySelector(".special").innerHTML = `⭐ Today Special: ${specialItem.name} ₹${specialItem.price}`;
    }
    
    // Reload foods with current stock status
    loadFoods(foods);
});