// YOCTRON v0.A1.03 - Complete Restaurant Management System
// ============================================================

// ===== CONFIGURATION =====
const VERSION = "0.A1.03";
const TAX_RATE = 0.025; // 2.5% CGST + 2.5% SGST
const LOYALTY_EARN_RATE = 0.10; // 10% back in points
const LOYALTY_REDEEM_RATE = 10; // 10 points = ₹1

// ===== AUTHENTICATION =====
const USERS = {
    admin: { password: 'admin123', role: 'admin', name: 'Administrator' },
    staff: { password: 'staff123', role: 'staff', name: 'Staff Member' },
    captain: { password: 'captain123', role: 'captain', name: 'Captain' },
    kitchen: { password: 'kitchen123', role: 'kitchen', name: 'Kitchen Staff' }
};

let currentUser = null;

// Role-based menu access
const ROLE_MENUS = {
    admin: ['dashboard', 'pos', 'kot', 'tables', 'inventory', 'crm', 'online', 'reports'],
    staff: ['pos', 'tables'],
    captain: ['pos', 'tables', 'kot', 'crm'],
    kitchen: ['kot', 'inventory']
};

// ===== SYSTEM STATUS TRACKING =====
let systemStatus = {
    pos: 'green',        // POS system status
    kitchen: 'green',    // Kitchen system status
    inventory: 'green',  // Inventory system status
    network: 'green',    // Network connectivity
    lastUpdate: new Date()
};

// ===== QR ORDERING =====
let qrOrders = loadFromStorage('qrOrders') || [];
let activeQRSession = null;

// ===== DATA STRUCTURES =====

const MENU_ITEMS = [
    { id: 'M001', name: 'Paneer Tikka', price: 280, category: 'Starters', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', ingredients: [{ item: 'Paneer', qty: 200 }] },
    { id: 'M002', name: 'Chicken Wings', price: 320, category: 'Starters', image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400', ingredients: [{ item: 'Chicken', qty: 250 }] },
    { id: 'M003', name: 'Veg Spring Rolls', price: 180, category: 'Starters', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', ingredients: [{ item: 'Flour', qty: 100 }] },
    { id: 'M004', name: 'Butter Chicken', price: 350, category: 'Main Course', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', ingredients: [{ item: 'Chicken', qty: 300 }, { item: 'Butter', qty: 50 }] },
    { id: 'M005', name: 'Paneer Butter Masala', price: 280, category: 'Main Course', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', ingredients: [{ item: 'Paneer', qty: 250 }] },
    { id: 'M006', name: 'Veg Biryani', price: 220, category: 'Main Course', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', ingredients: [{ item: 'Rice', qty: 200 }] },
    { id: 'M007', name: 'Chicken Biryani', price: 320, category: 'Main Course', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', ingredients: [{ item: 'Rice', qty: 200 }, { item: 'Chicken', qty: 250 }] },
    { id: 'M008', name: 'Butter Naan', price: 50, category: 'Breads', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', ingredients: [{ item: 'Flour', qty: 80 }] },
    { id: 'M009', name: 'Garlic Naan', price: 60, category: 'Breads', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', ingredients: [{ item: 'Flour', qty: 80 }] },
    { id: 'M010', name: 'Tandoori Roti', price: 30, category: 'Breads', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', ingredients: [{ item: 'Flour', qty: 60 }] },
    { id: 'M011', name: 'Fresh Lime Soda', price: 80, category: 'Beverages', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400', ingredients: [{ item: 'Mint', qty: 10 }] },
    { id: 'M012', name: 'Virgin Mojito', price: 150, category: 'Beverages', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400', ingredients: [{ item: 'Mint', qty: 15 }] },
    { id: 'M013', name: 'Mango Lassi', price: 120, category: 'Beverages', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400', ingredients: [] },
    { id: 'M014', name: 'Gulab Jamun', price: 80, category: 'Desserts', image: 'https://images.unsplash.com/photo-1589119908995-c6c8f8b62e93?w=400', ingredients: [] },
    { id: 'M015', name: 'Ice Cream', price: 100, category: 'Desserts', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', ingredients: [] },
];

const TABLES = [
    { id: 'T1', name: 'Table 1', capacity: 2, status: 'available', zone: 'Inside' },
    { id: 'T2', name: 'Table 2', capacity: 2, status: 'available', zone: 'Inside' },
    { id: 'T3', name: 'Table 3', capacity: 4, status: 'available', zone: 'Inside' },
    { id: 'T4', name: 'Table 4', capacity: 4, status: 'available', zone: 'Inside' },
    { id: 'T5', name: 'Table 5', capacity: 6, status: 'available', zone: 'Window' },
    { id: 'T6', name: 'Table 6', capacity: 4, status: 'available', zone: 'Window' },
    { id: 'T7', name: 'Table 7', capacity: 2, status: 'available', zone: 'Outdoor' },
    { id: 'T8', name: 'Table 8', capacity: 4, status: 'available', zone: 'Outdoor' },
    { id: 'T9', name: 'Table 9', capacity: 6, status: 'available', zone: 'Outdoor' },
    { id: 'T10', name: 'Table 10', capacity: 8, status: 'available', zone: 'Inside' },
];

// ===== STATE MANAGEMENT =====
let currentOutlet = 'outlet1';
let currentBill = [];
let orders = loadFromStorage('orders') || [];
let kots = loadFromStorage('kots') || [];
let inventory = loadFromStorage('inventory') || [
    { item: 'Paneer', stock: 5000, unit: 'g', reorderLevel: 1000, supplier: 'Dairy Fresh' },
    { item: 'Chicken', stock: 8500, unit: 'g', reorderLevel: 2000, supplier: 'Meat Hub' },
    { item: 'Butter', stock: 1200, unit: 'g', reorderLevel: 500, supplier: 'Dairy Fresh' },
    { item: 'Flour', stock: 12000, unit: 'g', reorderLevel: 2000, supplier: 'Grains Co' },
    { item: 'Rice', stock: 14000, unit: 'g', reorderLevel: 3000, supplier: 'Grains Co' },
    { item: 'Mint', stock: 500, unit: 'g', reorderLevel: 100, supplier: 'Fresh Herbs' },
];
let customers = loadFromStorage('customers') || [
    { id: 'C001', name: 'Arjun Sharma', phone: '9876543210', points: 450, visits: 12, totalSpent: 4500 },
    { id: 'C002', name: 'Priya Verma', phone: '9988776655', points: 120, visits: 4, totalSpent: 1200 },
    { id: 'C003', name: 'Rahul Kumar', phone: '9123456789', points: 280, visits: 8, totalSpent: 2800 },
    { id: 'C004', name: 'Sneha Patel', phone: '9876501234', points: 650, visits: 18, totalSpent: 6500 },
    { id: 'C005', name: 'Vikram Singh', phone: '9845612378', points: 320, visits: 9, totalSpent: 3200 },
    { id: 'C006', name: 'Ananya Reddy', phone: '9912345678', points: 890, visits: 25, totalSpent: 8900 },
    { id: 'C007', name: 'Karthik Iyer', phone: '9823456789', points: 180, visits: 5, totalSpent: 1800 },
    { id: 'C008', name: 'Meera Nair', phone: '9734567890', points: 540, visits: 15, totalSpent: 5400 },
    { id: 'C009', name: 'Rohan Gupta', phone: '9645678901', points: 410, visits: 11, totalSpent: 4100 },
    { id: 'C010', name: 'Divya Menon', phone: '9556789012', points: 760, visits: 21, totalSpent: 7600 },
    { id: 'C011', name: 'Aditya Joshi', phone: '9467890123', points: 95, visits: 3, totalSpent: 950 },
    { id: 'C012', name: 'Kavya Rao', phone: '9378901234', points: 1250, visits: 35, totalSpent: 12500 },
];
let onlineOrders = [];

// ===== STORAGE HELPERS =====
function saveToStorage(key, data) {
    try {
        localStorage.setItem(`yoctron_${key}`, JSON.stringify(data));
    } catch (e) {
        console.error('Storage error:', e);
    }
}

function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(`yoctron_${key}`);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Load error:', e);
        return null;
    }
}

// ===== AUTHENTICATION =====
function handleLogin(event) {
    event.preventDefault();

    const role = document.getElementById('login-role').value;
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const user = USERS[username];

    if (user && user.password === password && user.role === role) {
        currentUser = { username, ...user };

        // Hide login, show app
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('app-sidebar').style.display = 'flex';
        document.getElementById('app-main').style.display = 'block';

        // Render sidebar based on role
        renderSidebar();

        // Navigate to first available page
        const firstPage = ROLE_MENUS[role][0];
        navigate(firstPage);

        showToast(`Welcome, ${user.name}!`);
        console.log('✅ Login successful:', username, '-', role);
    } else {
        showToast('Invalid credentials or role mismatch');
    }
}

function logout() {
    currentUser = null;

    // Show login, hide app
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('app-sidebar').style.display = 'none';
    document.getElementById('app-main').style.display = 'none';

    // Clear form
    document.getElementById('login-form').reset();

    showToast('Logged out successfully');
}

function renderSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const allowedMenus = ROLE_MENUS[currentUser.role];

    const menuItems = {
        dashboard: { icon: '◆', label: 'Dashboard' },
        pos: { icon: '◇', label: 'Order Station' },
        kot: { icon: '◈', label: 'Kitchen' },
        tables: { icon: '◉', label: 'Tables' },
        inventory: { icon: '◊', label: 'Inventory' },
        crm: { icon: '◐', label: 'Loyalty' },
        online: { icon: '◑', label: 'Online Orders' },
        reports: { icon: '◒', label: 'Analytics' }
    };

    sidebar.innerHTML = `
        <div class="logo">
            <div class="logo-text">YOCTRON</div>
            <div class="logo-version">v${VERSION}</div>
        </div>
        <nav class="nav-menu">
            ${allowedMenus.map(menuId => `
                <div class="nav-item ${menuId === allowedMenus[0] ? 'active' : ''}" onclick="navigate('${menuId}')">
                    <span class="nav-icon">${menuItems[menuId].icon}</span>
                    <span>${menuItems[menuId].label}</span>
                </div>
            `).join('')}
        </nav>
        <div style="padding: 16px; border-top: 1px solid var(--mono-pale-gray);">
            <div style="background: var(--accent-subtle); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                <div style="font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mono-medium-gray); margin-bottom: 4px;">Logged in as</div>
                <div style="font-size: 13px; font-weight: 600; color: var(--mono-charcoal);">${currentUser.name}</div>
                <div style="font-size: 11px; color: var(--mono-light-gray); margin-top: 2px;">${getRoleBadge(currentUser.role)}</div>
            </div>
            <button onclick="logout()" class="btn btn-secondary" style="width: 100%; padding: 10px; font-size: 12px;">
                Logout
            </button>
        </div>
    `;
}

function getRoleBadge(role) {
    const badges = {
        admin: '👑 Administrator',
        staff: '👔 Staff',
        captain: '🎯 Captain',
        kitchen: '👨‍🍳 Kitchen'
    };
    return badges[role] || role;
}

// ===== NAVIGATION =====
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById(page).classList.add('active');
    event.target.closest('.nav-item').classList.add('active');

    const titles = {
        dashboard: 'Control Center',
        pos: 'Order Station',
        kot: 'Kitchen Display System',
        tables: 'Floor Plan',
        inventory: 'Stock Manager',
        crm: 'Loyalty Hub',
        online: 'Online Orders',
        reports: 'Analytics Dashboard'
    };

    document.getElementById('page-title').textContent = titles[page] || page;

    // Render page content
    if (page === 'dashboard') renderDashboard();
    if (page === 'pos') renderPOS();
    if (page === 'kot') renderKOT();
    if (page === 'tables') renderTables();
    if (page === 'inventory') renderInventory();
    if (page === 'crm') renderCRM();
    if (page === 'online') renderOnlineOrders();
    if (page === 'reports') renderReports();
}

// ===== POS SYSTEM =====
function renderPOS() {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = MENU_ITEMS.map(item => `
        <div class="item-card" onclick="addToBill('${item.id}')">
            <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/80'">
            <div class="item-info">
                <div class="item-category">${item.category}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-price">₹${item.price}</div>
            </div>
            <button class="item-add-btn" onclick="event.stopPropagation(); addToBill('${item.id}')">+</button>
        </div>
    `).join('');

    // Populate table selector
    const tableSelect = document.getElementById('bill-table');
    tableSelect.innerHTML = '<option value="WALK-IN">Walk-in</option>' +
        TABLES.map(t => `<option value="${t.id}">${t.name} (${t.capacity}-seater)</option>`).join('');

    // Populate customer selector
    const customerSelect = document.getElementById('bill-customer');
    customerSelect.innerHTML = '<option value="">Walk-in</option>' +
        customers.map(c => `<option value="${c.id}">${c.name} - ${c.points} pts</option>`).join('');
}

function filterMenu() {
    const search = document.getElementById('menu-search').value.toLowerCase();
    const filtered = MENU_ITEMS.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search)
    );

    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = filtered.map(item => `
        <div class="item-card" onclick="addToBill('${item.id}')">
            <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/80'">
            <div class="item-info">
                <div class="item-category">${item.category}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-price">₹${item.price}</div>
            </div>
            <button class="item-add-btn" onclick="event.stopPropagation(); addToBill('${item.id}')">+</button>
        </div>
    `).join('');
}

function addToBill(itemId) {
    const menuItem = MENU_ITEMS.find(m => m.id === itemId);
    if (!menuItem) return;

    const existing = currentBill.find(b => b.id === itemId);
    if (existing) {
        existing.quantity++;
    } else {
        currentBill.push({ ...menuItem, quantity: 1 });
    }

    updateBillDisplay();
    showToast(`${menuItem.name} added to cart`);
}

function updateBillDisplay() {
    const container = document.getElementById('bill-items');

    if (currentBill.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-400);">
                <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
                <div style="font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">No Items Added</div>
            </div>
        `;
        updateBillTotals(0, 0, 0, 0);
        return;
    }

    container.innerHTML = currentBill.map(item => `
        <div class="bill-item">
            <div>
                <div style="font-weight: 700; font-size: 16px;">${item.name}</div>
                <div style="font-size: 13px; color: var(--gray-500);">₹${item.price} each</div>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
                    <span style="min-width: 30px; text-align: center; font-weight: 700;">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <span style="font-weight: 800; min-width: 80px; text-align: right; font-size: 18px;">₹${(item.price * item.quantity).toFixed(0)}</span>
            </div>
        </div>
    `).join('');

    const subtotal = currentBill.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cgst = subtotal * TAX_RATE;
    const sgst = subtotal * TAX_RATE;
    const total = subtotal + cgst + sgst;

    updateBillTotals(subtotal, cgst, sgst, total);
}

function updateBillTotals(subtotal, cgst, sgst, total) {
    document.getElementById('bill-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('bill-cgst').textContent = `₹${cgst.toFixed(2)}`;
    document.getElementById('bill-sgst').textContent = `₹${sgst.toFixed(2)}`;
    document.getElementById('bill-total').textContent = `₹${total.toFixed(2)}`;
}

function updateQuantity(itemId, delta) {
    const item = currentBill.find(b => b.id === itemId);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        currentBill = currentBill.filter(b => b.id !== itemId);
        showToast(`${item.name} removed`);
    }

    updateBillDisplay();
}

function sendToKOT() {
    if (currentBill.length === 0) {
        showToast('Add items first!');
        return;
    }

    const table = document.getElementById('bill-table').value;
    const kot = {
        id: `KOT-${Date.now().toString().slice(-6)}`,
        table,
        items: [...currentBill],
        status: 'pending',
        timestamp: new Date().toISOString(),
        priority: Math.random() > 0.8
    };

    kots.push(kot);
    saveToStorage('kots', kots);

    showToast(`KOT sent to kitchen for ${table}!`);
    console.log('✅ KOT Created:', kot.id);

    // Don't clear bill - allow adding more items
    renderKOT();
    renderDashboard();
}

function settleBill() {
    if (currentBill.length === 0) {
        showToast('Add items first!');
        return;
    }

    const table = document.getElementById('bill-table').value;
    const customerId = document.getElementById('bill-customer').value;

    const subtotal = currentBill.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cgst = subtotal * TAX_RATE;
    const sgst = subtotal * TAX_RATE;
    const total = subtotal + cgst + sgst;

    const order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        table,
        customerId,
        items: [...currentBill],
        subtotal,
        cgst,
        sgst,
        total,
        timestamp: new Date().toISOString()
    };

    orders.push(order);
    saveToStorage('orders', orders);

    // Deduct inventory
    deductInventory(currentBill);

    // Award loyalty points
    if (customerId) {
        awardLoyaltyPoints(customerId, total);
    }

    showToast(`Bill settled: ₹${total.toFixed(2)}`);
    console.log('✅ Order Completed:', order.id);

    currentBill = [];
    updateBillDisplay();
    renderDashboard();
    renderInventory();
}

// ===== INVENTORY MANAGEMENT =====
function deductInventory(items) {
    items.forEach(billItem => {
        const menuItem = MENU_ITEMS.find(m => m.id === billItem.id);
        if (!menuItem || !menuItem.ingredients) return;

        menuItem.ingredients.forEach(ing => {
            const invItem = inventory.find(i => i.item === ing.item);
            if (invItem) {
                const totalUsed = ing.qty * billItem.quantity;
                invItem.stock = Math.max(0, invItem.stock - totalUsed);

                if (invItem.stock <= invItem.reorderLevel) {
                    showToast(`⚠️ Low stock alert: ${invItem.item}`);
                }
            }
        });
    });

    saveToStorage('inventory', inventory);
}

function renderInventory() {
    const container = document.getElementById('inventory-list');

    // Helper function to find menu items using an ingredient
    const getMenuItemsForIngredient = (ingredientName) => {
        return MENU_ITEMS.filter(menuItem =>
            menuItem.ingredients && menuItem.ingredients.some(ing => ing.item === ingredientName)
        );
    };

    container.innerHTML = `
        <div style="display: grid; gap: 24px;">
            ${inventory.map(item => {
        const isLow = item.stock <= item.reorderLevel;
        const stockPercentage = Math.min(100, (item.stock / (item.reorderLevel * 3)) * 100);
        const relatedItems = getMenuItemsForIngredient(item.item);

        return `
                    <div style="background: var(--mono-white); border-radius: 16px; padding: 24px; border: 1px solid var(--mono-pale-gray); box-shadow: var(--shadow-sm);">
                        <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 16px;">
                            <div style="flex: 1;">
                                <h3 style="font-size: 18px; font-weight: 700; color: var(--mono-black); margin-bottom: 4px;">${item.item}</h3>
                                <p style="font-size: 12px; color: var(--mono-medium-gray); font-weight: 500;">Supplier: ${item.supplier}</p>
                            </div>
                            <span style="padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: ${isLow ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}; color: ${isLow ? '#ef4444' : '#10b981'};">
                                ${isLow ? '⚠️ Low Stock' : '✅ Good'}
                            </span>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-size: 13px; font-weight: 600; color: var(--mono-charcoal);">Current Stock</span>
                                <span style="font-size: 14px; font-weight: 700; color: var(--mono-black);">${item.stock} ${item.unit}</span>
                            </div>
                            <div style="width: 100%; height: 8px; background: var(--mono-pale-gray); border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; background: ${isLow ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, #10b981, #059669)'}; width: ${stockPercentage}%; transition: width 0.3s ease; border-radius: 4px;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                                <span style="font-size: 11px; color: var(--mono-light-gray); font-weight: 500;">Reorder at: ${item.reorderLevel} ${item.unit}</span>
                                <span style="font-size: 11px; color: var(--mono-light-gray); font-weight: 500;">${stockPercentage.toFixed(0)}%</span>
                            </div>
                        </div>
                        
                        ${relatedItems.length > 0 ? `
                            <div style="padding-top: 16px; border-top: 1px solid var(--mono-pale-gray);">
                                <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mono-medium-gray); margin-bottom: 12px;">Used in ${relatedItems.length} menu item${relatedItems.length > 1 ? 's' : ''}</p>
                                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                    ${relatedItems.map(menuItem => `
                                        <div style="background: var(--accent-subtle); padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; color: var(--mono-charcoal); display: flex; align-items: center; gap: 6px;">
                                            <span style="font-size: 16px;">${getCategoryEmoji(menuItem.category)}</span>
                                            <span>${menuItem.name}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

function getCategoryEmoji(category) {
    const emojis = {
        'Starters': '🍢',
        'Main Course': '🍲',
        'Breads': '🍞',
        'Beverages': '🍹',
        'Desserts': '🍰'
    };
    return emojis[category] || '🍽️';
}

// ===== KOT SYSTEM =====
function renderKOT() {
    const container = document.getElementById('kot-list');
    const activeKOTs = kots.filter(k => k.status !== 'completed');

    document.getElementById('kot-count').textContent = activeKOTs.length;

    if (activeKOTs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px; color: var(--gray-400);">
                <div style="font-size: 64px; margin-bottom: 16px;">👨‍🍳</div>
                <div style="font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">No Active Tickets</div>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px;">
            ${activeKOTs.map(kot => {
        const elapsed = Math.floor((Date.now() - new Date(kot.timestamp)) / 60000);
        return `
                    <div class="kot-card ${kot.priority ? 'priority' : ''}">
                        <div class="kot-header">
                            <div>
                                <div style="font-size: 24px; font-weight: 800;">${kot.table}</div>
                                <div style="font-size: 12px; color: var(--gray-500); margin-top: 4px;">${kot.id}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 13px; color: var(--gray-500);">${elapsed} min ago</div>
                                ${kot.priority ? '<div style="background: var(--warning); color: white; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: 800; margin-top: 8px;">PRIORITY</div>' : ''}
                            </div>
                        </div>
                        <div class="kot-items">
                            ${kot.items.map(item => `
                                <div class="kot-item">
                                    <span><strong>${item.quantity}x</strong> ${item.name}</span>
                                    <span style="color: var(--gray-500); font-size: 13px;">${item.category}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px;">
                            <button class="btn btn-primary" style="padding: 12px;" onclick="updateKOTStatus('${kot.id}', 'preparing')">Preparing</button>
                            <button class="btn btn-success" style="padding: 12px;" onclick="updateKOTStatus('${kot.id}', 'completed')">Complete</button>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

function updateKOTStatus(kotId, status) {
    const kot = kots.find(k => k.id === kotId);
    if (!kot) return;

    kot.status = status;
    saveToStorage('kots', kots);

    showToast(status === 'completed' ? 'KOT completed!' : 'KOT status updated');
    renderKOT();
    renderDashboard();
}

// ===== TABLE MANAGEMENT =====
function renderTables() {
    const container = document.getElementById('tables-grid');
    container.innerHTML = TABLES.map(table => {
        return `
            <div class="table-card ${table.status}">
                <div class="table-number">${table.name}</div>
                <div style="font-size: 12px; color: var(--mono-medium-gray); margin: 8px 0;">👥 ${table.capacity}-seater</div>
                <div style="font-size: 11px; color: var(--mono-light-gray); margin-bottom: 12px;">${table.zone}</div>
                <div class="table-status ${table.status}">${table.status}</div>
                <button class="btn btn-secondary" onclick="showTableQR('${table.id}')" style="margin-top: 12px; width: 100%; padding: 8px; font-size: 11px;">
                    View QR Code
                </button>
            </div>
        `;
    }).join('');
}

// ===== CRM & LOYALTY =====
function awardLoyaltyPoints(customerId, amount) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const pointsEarned = Math.floor(amount * LOYALTY_EARN_RATE);
    customer.points += pointsEarned;
    customer.visits++;
    customer.totalSpent += amount;

    saveToStorage('customers', customers);
    showToast(`${customer.name} earned ${pointsEarned} points!`);
}

function renderCRM() {
    const container = document.getElementById('crm-list');
    container.innerHTML = `
        <div style="margin-bottom: 32px;">
            <button class="btn btn-primary" onclick="showToast('Feature coming soon!')">+ Add New Member</button>
        </div>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--gray-100); text-align: left;">
                        <th style="padding: 16px; font-weight: 800; text-transform: uppercase; font-size: 12px;">Customer</th>
                        <th style="padding: 16px; font-weight: 800; text-transform: uppercase; font-size: 12px;">Phone</th>
                        <th style="padding: 16px; font-weight: 800; text-transform: uppercase; font-size: 12px;">Points</th>
                        <th style="padding: 16px; font-weight: 800; text-transform: uppercase; font-size: 12px;">Visits</th>
                        <th style="padding: 16px; font-weight: 800; text-transform: uppercase; font-size: 12px;">Total Spent</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.map(c => `
                        <tr style="border-bottom: 1px solid var(--gray-200);">
                            <td style="padding: 16px; font-weight: 700;">${c.name}</td>
                            <td style="padding: 16px; color: var(--gray-600);">${c.phone}</td>
                            <td style="padding: 16px;">
                                <span style="background: rgba(37, 99, 235, 0.1); color: var(--primary); padding: 6px 12px; border-radius: 12px; font-weight: 800;">${c.points} pts</span>
                            </td>
                            <td style="padding: 16px; color: var(--gray-600);">${c.visits}</td>
                            <td style="padding: 16px; font-weight: 700;">₹${c.totalSpent.toFixed(0)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div style="margin-top: 32px; padding: 24px; background: rgba(37, 99, 235, 0.05); border-radius: 20px; border: 2px dashed var(--primary);">
            <h4 style="font-weight: 800; margin-bottom: 12px;">Loyalty Program Rules</h4>
            <ul style="list-style: none; padding: 0;">
                <li style="padding: 8px 0;">✅ Earn 10% back in points on every purchase</li>
                <li style="padding: 8px 0;">💰 10 points = ₹1 redemption value</li>
                <li style="padding: 8px 0;">🎁 Auto-apply points at checkout</li>
            </ul>
        </div>
    `;
}

// ===== ONLINE ORDERS =====
function simulateOnlineOrder() {
    if (Math.random() > 0.7) {
        const platforms = ['Zomato', 'Swiggy', 'Dunzo'];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const orderId = `${platform.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        onlineOrders.unshift({
            id: orderId,
            platform,
            timestamp: new Date().toISOString(),
            status: 'pending'
        });

        onlineOrders = onlineOrders.slice(0, 10);
        showToast(`📱 New ${platform} order: ${orderId}`);
        renderOnlineOrders();
        renderDashboard();
    }
}

function renderOnlineOrders() {
    const container = document.getElementById('online-list');

    if (onlineOrders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px; color: var(--gray-400);">
                <div style="font-size: 64px; margin-bottom: 16px;">🚴</div>
                <div style="font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">No Online Orders</div>
            </div>
        `;
        return;
    }

    container.innerHTML = onlineOrders.map(order => `
        <div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 24px; margin-bottom: 16px; border-left: 4px solid var(--primary);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 800; font-size: 18px;">${order.id}</div>
                    <div style="font-size: 13px; color: var(--gray-500); margin-top: 4px;">${new Date(order.timestamp).toLocaleTimeString()}</div>
                </div>
                <div style="text-align: right;">
                    <div style="background: ${order.platform === 'Zomato' ? '#e23744' : order.platform === 'Swiggy' ? '#fc8019' : '#5d4fb3'}; color: white; padding: 8px 16px; border-radius: 12px; font-weight: 800; font-size: 12px; margin-bottom: 8px;">
                        ${order.platform}
                    </div>
                    <button class="btn btn-success" style="padding: 8px 16px; font-size: 12px;" onclick="acceptOnlineOrder('${order.id}')">Accept</button>
                </div>
            </div>
        </div>
    `).join('');
}

function acceptOnlineOrder(orderId) {
    onlineOrders = onlineOrders.filter(o => o.id !== orderId);
    showToast(`Order ${orderId} accepted!`);
    renderOnlineOrders();
    renderDashboard();
}

// ===== DASHBOARD =====
function renderDashboard() {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const activeKOTs = kots.filter(k => k.status !== 'completed').length;

    document.getElementById('stat-revenue').textContent = `₹${totalRevenue.toFixed(0)}`;
    document.getElementById('stat-kots').textContent = activeKOTs;
    document.getElementById('stat-online').textContent = onlineOrders.length;
    document.getElementById('stat-customers').textContent = customers.length;

    const recentContainer = document.getElementById('recent-orders');
    if (orders.length === 0) {
        recentContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--gray-400);">
                <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                <div style="font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">No Orders Yet</div>
            </div>
        `;
    } else {
        recentContainer.innerHTML = orders.slice(-10).reverse().map(order => `
            <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--gray-200);">
                <div>
                    <div style="font-weight: 700; font-size: 16px;">${order.table}</div>
                    <div style="font-size: 13px; color: var(--gray-500); margin-top: 4px;">${new Date(order.timestamp).toLocaleString()}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 800; font-size: 20px; color: var(--primary);">₹${order.total.toFixed(0)}</div>
                    <div style="font-size: 12px; color: var(--gray-500); margin-top: 4px;">${order.items.length} items</div>
                </div>
            </div>
        `).join('');
    }
}

// ===== REPORTS =====
function renderReports() {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate top items
    const itemSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!itemSales[item.name]) {
                itemSales[item.name] = { count: 0, revenue: 0 };
            }
            itemSales[item.name].count += item.quantity;
            itemSales[item.name].revenue += item.price * item.quantity;
        });
    });

    const topItems = Object.entries(itemSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    const container = document.getElementById('reports-content');
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px;">
            <div style="background: rgba(37, 99, 235, 0.05); padding: 24px; border-radius: 20px;">
                <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--gray-500); margin-bottom: 8px;">Total Revenue</div>
                <div style="font-size: 40px; font-weight: 800; color: var(--primary);">₹${totalRevenue.toFixed(0)}</div>
            </div>
            <div style="background: rgba(16, 185, 129, 0.05); padding: 24px; border-radius: 20px;">
                <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--gray-500); margin-bottom: 8px;">Total Orders</div>
                <div style="font-size: 40px; font-weight: 800; color: var(--success);">${totalOrders}</div>
            </div>
            <div style="background: rgba(245, 158, 11, 0.05); padding: 24px; border-radius: 20px;">
                <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--gray-500); margin-bottom: 8px;">Avg Order Value</div>
                <div style="font-size: 40px; font-weight: 800; color: var(--warning);">₹${avgOrder.toFixed(0)}</div>
            </div>
        </div>
        
        <div style="background: white; padding: 32px; border-radius: 24px; margin-bottom: 24px;">
            <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 24px;">Top Selling Items</h3>
            ${topItems.length === 0 ? '<p style="color: var(--gray-400); text-align: center; padding: 40px;">No sales data yet</p>' :
            topItems.map((item, index) => `
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-weight: 700;">${index + 1}. ${item.name}</span>
                            <span style="font-weight: 800; color: var(--primary);">₹${item.revenue.toFixed(0)}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="flex: 1; height: 12px; background: var(--gray-200); border-radius: 6px; overflow: hidden;">
                                <div style="height: 100%; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); width: ${(item.revenue / topItems[0].revenue) * 100}%; border-radius: 6px;"></div>
                            </div>
                            <span style="font-size: 13px; color: var(--gray-500); min-width: 80px; text-align: right;">${item.count} sold</span>
                        </div>
                    </div>
                `).join('')
        }
        </div>
    `;
}

// ===== MULTI-OUTLET =====
function switchOutlet() {
    currentOutlet = document.getElementById('outlet-selector').value;
    showToast(`Switched to ${currentOutlet === 'outlet1' ? 'Main Outlet' : currentOutlet === 'outlet2' ? 'Mall Branch' : 'Airport Branch'}`);
    renderDashboard();
}

// ===== QR CODE ORDERING =====
function showTableQR(tableId) {
    const table = TABLES.find(t => t.id === tableId);
    if (!table) return;

    const qrUrl = `${window.location.origin}${window.location.pathname}?mode=customer&table=${tableId}`;

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div style="text-align: center;">
            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px; letter-spacing: -0.01em;">QR Code - ${table.name}</h3>
            <div id="qrcode" style="display: flex; justify-content: center; margin: 24px 0;"></div>
            <p style="font-size: 13px; color: var(--mono-medium-gray); margin-bottom: 16px;">Scan to view menu and order</p>
            <div style="background: var(--accent-subtle); padding: 16px; border-radius: 6px; font-size: 12px; color: var(--mono-gray); word-break: break-all;">
                ${qrUrl}
            </div>
            <button class="btn btn-primary" onclick="closeModal()" style="margin-top: 20px; width: 100%;">Close</button>
        </div>
    `;

    document.getElementById('modal').classList.add('active');

    // Generate QR code
    new QRCode(document.getElementById('qrcode'), {
        text: qrUrl,
        width: 200,
        height: 200,
        colorDark: '#1a1a1a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// Check if in customer mode
function checkCustomerMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const tableId = urlParams.get('table');

    if (mode === 'customer' && tableId) {
        renderCustomerMenu(tableId);
        return true;
    }
    return false;
}

function renderCustomerMenu(tableId) {
    const table = TABLES.find(t => t.id === tableId);
    if (!table) return;

    document.body.innerHTML = `
        <style>
            .customer-menu {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: var(--mono-off-white);
                min-height: 100vh;
            }
            .customer-header {
                background: var(--mono-white);
                padding: 24px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid var(--mono-pale-gray);
                text-align: center;
            }
            .customer-cart {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--mono-charcoal);
                color: var(--mono-white);
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: var(--shadow-xl);
            }
            .floating-cart-btn {
                background: var(--mono-black);
                color: var(--mono-white);
                border: none;
                padding: 14px 28px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
            }
        </style>
        <div class="customer-menu">
            <div class="customer-header">
                <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.02em;">YOCTRON</div>
                <div style="font-size: 14px; color: var(--mono-medium-gray); font-weight: 500;">Table: ${table.name}</div>
            </div>
            
            <div style="margin-bottom: 100px;">
                ${MENU_ITEMS.map(item => `
                    <div class="item-card" onclick="addToCustomerCart('${item.id}')">
                        <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/64'">
                        <div class="item-info">
                            <div class="item-category">${item.category}</div>
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">₹${item.price}</div>
                        </div>
                        <button class="item-add-btn" onclick="event.stopPropagation(); addToCustomerCart('${item.id}')">+</button>
                    </div>
                `).join('')}
            </div>
            
            <div class="customer-cart">
                <div>
                    <div style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">Total</div>
                    <div style="font-size: 20px; font-weight: 700;" id="customer-total">₹0</div>
                </div>
                <button class="floating-cart-btn" onclick="submitCustomerOrder('${tableId}')">
                    Place Order (<span id="customer-count">0</span> items)
                </button>
            </div>
        </div>
        
        <script>
            let customerCart = [];
            
            function addToCustomerCart(itemId) {
                const menuItems = ${JSON.stringify(MENU_ITEMS)};
                const item = menuItems.find(m => m.id === itemId);
                if (!item) return;
                
                const existing = customerCart.find(c => c.id === itemId);
                if (existing) {
                    existing.quantity++;
                } else {
                    customerCart.push({ ...item, quantity: 1 });
                }
                
                updateCustomerCart();
            }
            
            function updateCustomerCart() {
                const total = customerCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const count = customerCart.reduce((sum, item) => sum + item.quantity, 0);
                
                document.getElementById('customer-total').textContent = '₹' + total.toFixed(0);
                document.getElementById('customer-count').textContent = count;
            }
            
            function submitCustomerOrder(tableId) {
                if (customerCart.length === 0) {
                    alert('Please add items to your cart');
                    return;
                }
                
                const order = {
                    id: 'QR-' + Date.now().toString().slice(-6),
                    tableId: tableId,
                    items: customerCart,
                    timestamp: new Date().toISOString(),
                    source: 'qr'
                };
                
                // Save to localStorage for main app to pick up
                let qrOrders = JSON.parse(localStorage.getItem('yoctron_qrOrders') || '[]');
                qrOrders.push(order);
                localStorage.setItem('yoctron_qrOrders', JSON.stringify(qrOrders));
                
                alert('Order placed successfully! Your order will be prepared shortly.');
                customerCart = [];
                updateCustomerCart();
            }
        </script>
    `;
}

// ===== SYSTEM STATUS MONITORING =====
function updateSystemStatus() {
    // Check POS status
    systemStatus.pos = currentBill.length > 0 ? 'yellow' : 'green';

    // Check Kitchen status
    const activeKOTCount = kots.filter(k => k.status !== 'completed').length;
    if (activeKOTCount === 0) {
        systemStatus.kitchen = 'green';
    } else if (activeKOTCount <= 3) {
        systemStatus.kitchen = 'yellow';
    } else {
        systemStatus.kitchen = 'red';
    }

    // Check Inventory status
    const lowStockItems = inventory.filter(i => i.stock <= i.reorderLevel);
    if (lowStockItems.length === 0) {
        systemStatus.inventory = 'green';
    } else if (lowStockItems.length <= 2) {
        systemStatus.inventory = 'yellow';
    } else {
        systemStatus.inventory = 'red';
    }

    // Network status (simulated)
    systemStatus.network = 'green';

    systemStatus.lastUpdate = new Date();
    renderSystemStatus();
}

function renderSystemStatus() {
    const statusHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 6px;" title="POS System">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${getStatusColor(systemStatus.pos)};"></div>
                <span style="font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mono-medium-gray);">POS</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;" title="Kitchen System">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${getStatusColor(systemStatus.kitchen)};"></div>
                <span style="font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mono-medium-gray);">Kitchen</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;" title="Inventory System">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${getStatusColor(systemStatus.inventory)};"></div>
                <span style="font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mono-medium-gray);">Stock</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;" title="Network Status">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${getStatusColor(systemStatus.network)};"></div>
                <span style="font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mono-medium-gray);">Network</span>
            </div>
        </div>
    `;

    const statusContainer = document.getElementById('system-status');
    if (statusContainer) {
        statusContainer.innerHTML = statusHTML;
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'green': return '#2d7a2d';
        case 'yellow': return '#d4a017';
        case 'red': return '#c41e3a';
        default: return '#9e9e9e';
    }
}

// Check for QR orders periodically
function checkQROrders() {
    const newQROrders = loadFromStorage('qrOrders') || [];

    newQROrders.forEach(order => {
        if (!qrOrders.find(q => q.id === order.id)) {
            // New QR order detected
            showToast(`📱 New QR order from ${order.tableId}: ${order.id}`);

            // Add to KOT system
            const kot = {
                id: order.id,
                table: order.tableId,
                items: order.items,
                status: 'pending',
                timestamp: order.timestamp,
                priority: false,
                source: 'qr'
            };

            kots.push(kot);
            saveToStorage('kots', kots);
        }
    });

    qrOrders = newQROrders;
    renderKOT();
    renderDashboard();
    updateSystemStatus();
}

// ===== UTILITIES =====
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 YOCTRON v' + VERSION + ' initialized');

    // Ensure customer data is saved to localStorage if not already present
    if (!loadFromStorage('customers')) {
        saveToStorage('customers', customers);
        console.log('✅ Customer data initialized with', customers.length, 'customers');
    }

    renderDashboard();
    renderPOS();
    renderTables();
    renderInventory();
    renderCRM();
    renderKOT();
    renderOnlineOrders();
    renderReports();

    // Simulate online orders every 20 seconds
    setInterval(simulateOnlineOrder, 20000);

    console.log('✅ All systems ready');
});
