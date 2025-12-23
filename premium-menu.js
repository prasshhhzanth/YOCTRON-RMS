// Premium Menu Card Renderer
function renderPremiumPOS() {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
            
            .dish-card {
                position: relative;
                background: #ffffff;
                border-radius: 32px;
                padding: 32px;
                transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                border: 1px solid #f1f5f9;
                cursor: pointer;
                margin-top: 80px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
            }
            
            .dish-img-container {
                position: absolute;
                top: -70px;
                left: 50%;
                transform: translateX(-50%);
                width: 140px;
                height: 140px;
                z-index: 10;
                transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
            
            .dish-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
                border: 6px solid #ffffff;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
                transition: inherit;
            }
            
            .img-glow {
                position: absolute;
                inset: 10px;
                border-radius: 50%;
                filter: blur(25px);
                opacity: 0;
                transition: opacity 0.6s ease;
                z-index: -1;
            }
            
            .dish-card:hover {
                transform: translateY(-10px);
                box-shadow: 0 40px 60px -15px rgba(0, 0, 0, 0.12);
                border-color: rgba(37, 99, 235, 0.2);
            }
            
            .dish-card:hover .dish-img-container {
                transform: translateX(-50%) translateY(-15px) scale(1.1) rotate(8deg);
            }
            
            .dish-card:hover .dish-img {
                box-shadow: 0 25px 50px rgba(37, 99, 235, 0.25);
            }
            
            .dish-card:hover .img-glow {
                opacity: 0.3;
            }
            
            .dish-content {
                padding-top: 80px;
                text-align: center;
            }
            
            .price-badge {
                display: inline-block;
                background: #f1f5f9;
                padding: 6px 16px;
                border-radius: 99px;
                font-weight: 800;
                color: #1e293b;
                transition: all 0.3s ease;
                font-size: 16px;
            }
            
            .dish-card:hover .price-badge {
                background: #2563eb;
                color: white;
                transform: scale(1.1);
            }
            
            .dish-card::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 50%;
                height: 100%;
                background: linear-gradient(to right, transparent, rgba(255,255,255,0.6), transparent);
                transform: skewX(-25deg);
                transition: 0.75s;
                border-radius: 32px;
            }
            
            .dish-card:hover::after {
                left: 150%;
            }
            
            .add-order-btn {
                width: 100%;
                padding: 16px;
                background: #1e293b;
                color: white;
                border-radius: 16px;
                font-weight: 800;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 8px 24px rgba(30, 41, 59, 0.15);
                font-family: 'Plus Jakarta Sans', sans-serif;
            }
            
            .add-order-btn:hover {
                background: #2563eb;
                transform: translateY(-2px);
                box-shadow: 0 12px 32px rgba(37, 99, 235, 0.25);
            }
        </style>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 64px 24px; margin-top: 100px; font-family: 'Plus Jakarta Sans', sans-serif;">
            ${MENU_ITEMS.map(item => `
                <div class="dish-card" onclick="addToBill('${item.id}')">
                    <div class="dish-img-container">
                        <div class="img-glow" style="background: ${getCategoryColor(item.category)};"></div>
                        <img src="${item.image}" 
                             alt="${item.name}" 
                             class="dish-img"
                             onerror="this.style.display='none';">
                    </div>
                    <div class="dish-content">
                        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: ${getCategoryColor(item.category)}; display: block; margin-bottom: 8px;">
                            ${item.category}
                        </span>
                        <h3 style="font-size: 24px; font-weight: 800; color: #1e293b; line-height: 1.2; margin-bottom: 12px; letter-spacing: -0.02em;">
                            ${item.name}
                        </h3>
                        <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px; min-height: 42px;">
                            ${getItemDescription(item.name)}
                        </p>
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                            <span class="price-badge">₹${item.price.toFixed(2)}</span>
                            <button onclick="event.stopPropagation(); addToBill('${item.id}')" class="add-order-btn">
                                Add to Order
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Populate table selector
    const tableSelect = document.getElementById('bill-table');
    tableSelect.innerHTML = '<option value="WALK-IN">Walk-in</option>' +
        TABLES.map(t => `<option value="${t.id}">${t.name} (${t.capacity}-seater)</option>`).join('');

    // Populate customer selector
    const customerSelect = document.getElementById('bill-customer');
    customerSelect.innerHTML = '<option value="">Walk-in</option>' +
        customers.map(c => `<option value="${c.id}">${c.name} - ${c.points} pts</option>`).join('');
}

function getCategoryColor(category) {
    const colors = {
        'Starters': '#f97316',
        'Main Course': '#2563eb',
        'Breads': '#eab308',
        'Beverages': '#06b6d4',
        'Desserts': '#ec4899'
    };
    return colors[category] || '#2563eb';
}

function getItemDescription(name) {
    const descriptions = {
        'Paneer Tikka': 'Cottage cheese cubes marinated in spices and grilled to perfection',
        'Chicken Wings': 'Crispy wings tossed in tangy sauce with aromatic spices',
        'Veg Spring Rolls': 'Crispy rolls filled with fresh vegetables and herbs',
        'Butter Chicken': 'Tender chicken in rich creamy tomato gravy',
        'Paneer Butter Masala': 'Rich cottage cheese cubes in creamy tomato gravy with aromatic spices',
        'Veg Biryani': 'Fragrant basmati rice with mixed vegetables and spices',
        'Chicken Biryani': 'Aromatic rice layered with succulent chicken pieces',
        'Butter Naan': 'Soft flatbread brushed with butter',
        'Garlic Naan': 'Naan topped with fresh garlic and herbs',
        'Tandoori Roti': 'Whole wheat flatbread from clay oven',
        'Fresh Lime Soda': 'Refreshing citrus drink with a zesty kick',
        'Virgin Mojito': 'Mint and lime mocktail with crushed ice',
        'Mango Lassi': 'Creamy yogurt drink with sweet mango',
        'Gulab Jamun': 'Soft milk dumplings in rose-flavored syrup',
        'Ice Cream': 'Creamy frozen dessert in assorted flavors'
    };
    return descriptions[name] || 'Delicious dish prepared with finest ingredients';
}

// Override the original renderPOS function
if (typeof renderPOS !== 'undefined') {
    renderPOS = renderPremiumPOS;
}
