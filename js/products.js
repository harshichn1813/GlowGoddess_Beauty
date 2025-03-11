// import { db, collection, getDocs, addDoc, serverTimestamp } from "./firebase-config.js";
// import { auth } from "./auth.js";

// const productList = document.querySelector(".product-list");

// // ✅ Fetch Products from Firestore
// async function fetchProducts() {
//     try {
//         console.log("🔄 Fetching products...");

//         const querySnapshot = await getDocs(collection(db, "products"));
//         productList.innerHTML = ""; // Clear previous products

//         querySnapshot.forEach((doc) => {
//             const product = doc.data();

//             // ❌ Skip hidden products
//             if (product.stock_status !== "visible") return;

//             // ✅ Use Direct Image URL or Default
//             let imageUrl = product.img_url && product.img_url.startsWith("http") 
//             ? product.img_url 
//             : "default.jpg"; // Fallback if URL is missing

//             let stockMessage = product.stock < 5 
//                 ? `<p class="stock-warning" style="color: red;">⚠️ Only ${product.stock} left!</p>` 
//                 : "";

//             // ✅ Quantity Selector
//             let quantitySelector = `
//                 <div class="quantity-selector">
//                     <button class="decrease-qty" data-id="${doc.id}">−</button>
//                     <span class="qty-value" id="quantity-${doc.id}">1</span>
//                     <button class="increase-qty" data-id="${doc.id}">+</button>
//                 </div>
//             `;

//             // ✅ Product Card with Working Image Handling
//             let productHTML = `
//                 <div class="product">
//                     <img src="${imageUrl}" alt="${product.name}" 
//                          onerror="this.onerror=null; this.src='default.jpg';"> 
//                     <h2>${product.name}</h2>
//                     <p>₹${product.price}</p>
//                     <p>Credit: ${product.credit}</p>
//                     ${stockMessage}
//                     ${quantitySelector}
//                     <button data-id="${doc.id}" class="add-to-cart">Add to Cart</button>
//                 </div>
//             `;

//             productList.innerHTML += productHTML;
//         });

//         console.log("✅ Finished rendering products, attaching event listeners...");
//         attachQuantityEventListeners();
//         attachAddToCartEvent();

//     } catch (error) {
//         console.error("❌ Error fetching products:", error);
//     }
// }

// // ✅ Load Products When Page Loads
// document.addEventListener("DOMContentLoaded", fetchProducts);

// // ✅ Quantity Button Logic
// function attachQuantityEventListeners() {
//     document.querySelectorAll(".quantity-selector").forEach((container) => {
//         const minusBtn = container.querySelector(".decrease-qty");
//         const plusBtn = container.querySelector(".increase-qty");
//         const qtySpan = container.querySelector(".qty-value");

//         let quantity = parseInt(qtySpan.innerText, 10); // Get initial value

//         minusBtn.addEventListener("click", () => {
//             if (quantity > 1) { // Ensure at least 1
//                 quantity--;
//                 qtySpan.innerText = quantity;
//             }
//         });

//         plusBtn.addEventListener("click", () => {
//             if (quantity < 20) { // Max limit
//                 quantity++;
//                 qtySpan.innerText = quantity;
//             }
//         });
//     });
// }

// // // ✅ Attach "Add to Cart" Event Listeners
// // function attachAddToCartEvent() {
// //     document.querySelectorAll(".add-to-cart").forEach((button) => {
// //         button.addEventListener("click", async (event) => {
// //             const productId = event.target.getAttribute("data-id");
// //             const user = auth.currentUser;

// //             if (!user) {
// //                 alert("❌ You must be logged in to add items to the cart.");
// //                 return;
// //             }

// //             const quantityElement = document.querySelector(`#quantity-${productId}`);
// //             const quantity = quantityElement ? parseInt(quantityElement.innerText) : 1;

// //             if (quantity <= 0) {
// //                 alert("⚠️ Please select at least 1 item before adding to the cart.");
// //                 return;
// //             }

// //             console.log(`🛒 Added ${quantity} of Product ID: ${productId} to cart`);
// //             await addToCart(user.uid, productId, quantity);
// //         });
// //     });
// // }

// // ✅ Add Product to Firestore "cart" Collection
// async function addToCart(userId, productId, quantity) {
//     try {
//         const cartRef = collection(db, "cart");
//         await addDoc(cartRef, {
//             userId,
//             productId,
//             quantity,
//             timestamp: serverTimestamp()
//         });
//         alert("✅ Item added to cart successfully!");
//     } catch (error) {
//         console.error("❌ Error adding to cart:", error);
//         alert("Error adding to cart: " + error.message);
//     }
// }

// function attachAddToCartEvent() {
//     document.querySelectorAll(".add-to-cart").forEach((button) => {
//         button.addEventListener("click", async (event) => {
//             const productId = event.target.getAttribute("data-id");
//             const qtyElement = document.querySelector(`#quantity-${productId}`);
//             const quantity = qtyElement ? parseInt(qtyElement.innerText) : 0;
 
//             if (quantity <= 0) {
//                 alert("⚠️ Please select at least 1 item before adding to the cart.");
//                 return;
//             }
 
//             console.log(`🛒 Adding ${quantity} of Product ID: ${productId} to cart`);
//             await updateCartQuantity(productId, quantity);
//             alert("✅ Item added to cart successfully!");
//         });
//     });
// }





import {
    db, collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp
} from "./firebase-config.js";
import { auth } from "./auth.js";
 
// Global variables
let allProducts = [];
const productList = document.querySelector(".product-list");
const categoryFilter = document.getElementById("category-filter");
const searchBar = document.getElementById("search-bar");
 
// ✅ Fetch Cart Data
async function fetchCartData() {
    try {
        const user = auth.currentUser;
        if (!user) return {};
 
        const cartSnapshot = await getDocs(collection(db, "cart"));
        const cartData = {};
 
        cartSnapshot.forEach((doc) => {
            const item = doc.data();
            if (item.userEmail === user.email) {
                cartData[item.productId] = item.quantity;
            }
        });
 
        return cartData;
    } catch (error) {
        console.error("❌ Error fetching cart data:", error);
        return {};
    }
}
 
// ✅ Fetch Products and Sync with Cart
async function fetchProducts() {
    try {
        const cartData = await fetchCartData();
        const querySnapshot = await getDocs(collection(db, "products"));
        allProducts = [];
        productList.innerHTML = "";
 
        querySnapshot.forEach((doc) => {
            const product = doc.data();
            if (product.stock_status !== "visible") return;
 
            product.id = doc.id;
            allProducts.push(product);
 
            let imageUrl = product.img_url ? product.img_url : "default.jpg";
            let stockMessage = product.stock < 5
                ? `<p class="stock-warning" style="color: red;">⚠️ Only ${product.stock} left!</p>`
                : "";
 
            let cartQuantity = cartData[doc.id] || 0;
 
            let quantitySelector = `
                <div class="quantity-selector">
                    <button class="decrease-qty" data-id="${doc.id}">−</button>
                    <span class="qty-value" id="quantity-${doc.id}">${cartQuantity}</span>
                    <button class="increase-qty" data-id="${doc.id}" data-stock="${product.stock}">+</button>
                </div>
            `;
 
            let productHTML = `
                <div class="product">
                    <img src="${imageUrl}" alt="${product.name}">
                    <h2>${product.name}</h2>
                    <p class="price">₹${product.price}</p>
                    <p>Credit: ${product.credit}</p>
                    ${stockMessage}
                    ${quantitySelector}
                    <button data-id="${doc.id}" class="add-to-cart"
                        data-name="${product.name}"
                        data-img="${imageUrl}"
                        data-price="${product.price}">
                        Add to Cart
                    </button>
                </div>
            `;
 
            productList.innerHTML += productHTML;
        });
 
        attachQuantityEventListeners();
        attachAddToCartEvent();
    } catch (error) {
        console.error("❌ Error fetching products:", error);
    }
}
 
// ✅ Update Firestore on Quantity Change
async function updateCartQuantity(productId, quantity) {
    try {
        const user = auth.currentUser;
        if (!user) return;
 
        const cartRef = doc(db, "cart", `${user.email}_${productId}`);
 
        if (quantity > 0) {
            await setDoc(cartRef, {
                userEmail: user.email,
                productId: productId,
                quantity: quantity,
                timestamp: serverTimestamp()
            }, { merge: true });
        } else {
            await deleteDoc(cartRef);
        }
 
        console.log(`🔄 Cart updated: ${productId} => ${quantity}`);
    } catch (error) {
        console.error("❌ Error updating cart:", error);
    }
}
 
// ✅ Attach Events to Quantity Buttons
function attachQuantityEventListeners() {
    document.querySelectorAll(".quantity-selector").forEach((container) => {
        const minusBtn = container.querySelector(".decrease-qty");
        const plusBtn = container.querySelector(".increase-qty");
        const qtySpan = container.querySelector(".qty-value");
        const productId = minusBtn.getAttribute("data-id");
 
        let quantity = parseInt(qtySpan.innerText, 10);
 
        minusBtn.addEventListener("click", async () => {
            if (quantity > 0) {
                quantity--;
                qtySpan.innerText = quantity;
                await updateCartQuantity(productId, quantity);
            }
        });
 
        plusBtn.addEventListener("click", async () => {
            const maxStock = parseInt(plusBtn.getAttribute("data-stock"), 10);
            const maxLimit = 20;
 
            if (quantity >= maxLimit) {
                alert(`⚠️ You can only buy up to ${maxLimit} units per product.`);
                return;
            }
 
            if (quantity >= maxStock) {
                alert(`⚠️ Only ${maxStock} items available in stock.`);
                return;
            }
 
            quantity++;
            qtySpan.innerText = quantity;
            await updateCartQuantity(productId, quantity);
        });
    });
}
 
// ✅ Attach Event to Add to Cart Button
function attachAddToCartEvent() {
    document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", async (event) => {
            const productId = event.target.getAttribute("data-id");
            const qtyElement = document.querySelector(`#quantity-${productId}`);
            const quantity = qtyElement ? parseInt(qtyElement.innerText) : 0;
 
            if (quantity <= 0) {
                alert("⚠️ Please select at least 1 item before adding to the cart.");
                return;
            }
 
            console.log(`🛒 Adding ${quantity} of Product ID: ${productId} to cart`);
            await updateCartQuantity(productId, quantity);
            alert("✅ Item added to cart successfully!");
        });
    });
}
 
// ✅ Fetch Categories
// async function fetchCategories() {
//     try {
//         const productsRef = collection(db, "products");
//         const snapshot = await getDocs(productsRef);
//         let categories = new Set();
 
//         snapshot.forEach(doc => {
//             const product = doc.data();
//             if (product.category) {
//                 categories.add(product.category);
//             }
//         });
 
//         categoryFilter.innerHTML = '<option value="all">All Categories</option>';
//         categories.forEach(category => {
//             categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
//         });
 
//     } catch (error) {
//         console.error("❌ Error fetching categories:", error);
//     }
// }
 
// ✅ Filter Products
// function filterProducts() {
//     const searchText = searchBar.value.toLowerCase();
//     const selectedCategory = categoryFilter.value;
 
//     let filteredProducts = allProducts.filter(product => {
//         const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
//         const matchesSearch = product.name.toLowerCase().includes(searchText);
//         return matchesCategory && matchesSearch;
//     });
 
//     displayProducts(filteredProducts);
// }
 
// ✅ Display Products
// function displayProducts(products) {
//     productList.innerHTML = "";
 
//     if (products.length === 0) {
//         productList.innerHTML = "<p>No products found!</p>";
//         return;
//     }
 
//     products.forEach(product => {
//         let imageUrl = product.img_url ? product.img_url : "default.jpg";
//         let stockMessage = product.stock < 5 ? `<p class="stock-warning" style="color: red;">⚠️ Only ${product.stock} left!</p>` : "";
 
//         let productHTML = `
//             <div class="product">
//                 <img src="${imageUrl}" alt="${product.name}">
//                 <h2>${product.name}</h2>
//                 <p class="price">₹${product.price}</p>
//                 ${stockMessage}
//                 <button data-id="${product.id}" class="add-to-cart">Add to Cart</button>
//             </div>
//         `;
 
//         productList.innerHTML += productHTML;
//     });
 
//     attachAddToCartEvent();
// }
 
// ✅ Initialize
document.addEventListener("DOMContentLoaded", async () => {
    await fetchCategories();
    await fetchProducts();
});
 
async function fetchCategories() {
    try {
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);
        let categories = new Set();
 
        snapshot.forEach(doc => {
            const product = doc.data();
            if (product.category) {
                categories.add(product.category);
            }
        });
 
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(category => {
            categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
        });
 
    } catch (error) {
        console.error("❌ Error fetching categories:", error);
    }
}
 
// ✅ Filter Products
function filterProducts() {
    const searchText = searchBar.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
 
    let filteredProducts = allProducts.filter(product => {
        const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchText);
        return matchesCategory && matchesSearch;
    });
 
    displayProducts(filteredProducts);
}
 
// ✅ Display Products
function displayProducts(products) {
    productList.innerHTML = "";
 
    if (products.length === 0) {
        productList.innerHTML = "<p>No products found!</p>";
        return;
    }
 
    products.forEach(product => {
        let imageUrl = product.img_url ? product.img_url : "default.jpg";
        let stockMessage = product.stock < 5 ? `<p class="stock-warning" style="color: red;">⚠️ Only ${product.stock} left!</p>` : "";
 
        let productHTML = `
            <div class="product">
                <img src="${imageUrl}" alt="${product.name}">
                <h2>${product.name}</h2>
                <p class="price">₹${product.price}</p>
                ${stockMessage}
                <button data-id="${product.id}" class="add-to-cart">Add to Cart</button>
            </div>
        `;
 
        productList.innerHTML += productHTML;
    });
 
    attachAddToCartEvent();
}
 
// ✅ Initialize
document.addEventListener("DOMContentLoaded", async () => {
    await fetchCategories();
    await fetchProducts();
});
 
 
window.filterProducts=filterProducts;