// import { auth } from "./auth.js"; // Ensure auth is imported correctly
// import { db, collection, getDocs, doc, deleteDoc,getDoc} from "./firebase-config.js";
// import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// import { query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";


// const cartQuery = query(collection(db, "cart"), where("userId", "==", userId));
// const querySnapshot = await getDocs(cartQuery);

 
// const cartItemsContainer = document.getElementById("cart-items");
// const subtotalElement = document.getElementById("subtotal");
 
// // ✅ Listen for Authentication State Change BEFORE fetching cart items
// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         const userId = user.uid;  // Ensure userId is set here
//         console.log("User logged in:", userId);
//         fetchCartItems(userId);
//     } else {
//         console.log("No user logged in");
//     }
// });
 
// // ✅ Fetch Cart Items (Only Visible Products)
// async function fetchCartItems(userId) {
//     try {
//         console.log("🔄 Fetching cart items for user:", userId);
//         const querySnapshot = await getDocs(collection(db, "cart"));
 
//         cartItemsContainer.innerHTML = ""; // Clear previous data
 
//         let subtotal = 0;
//         let itemsHTML = "";
 
//         for (const docSnapshot of querySnapshot.docs) {
//             const cartItem = docSnapshot.data();
 
//             // ✅ Only show the logged-in user's cart items
//             const userEmail = auth.currentUser?.email;
//             if (!userEmail || cartItem.userEmail !== userEmail) {
//                 console.warn("⚠️ Skipping item (belongs to another user):", cartItem);
//                 continue;
//             }
 
//             // ✅ Fetch the product details
//             const productRef = doc(db, "products", cartItem.productId);
//             const productSnap = await getDoc(productRef);
 
//             if (!productSnap.exists() || productSnap.data().stock_status !== "visible") {
//                 console.warn(`🚫 Skipping hidden/unavailable product: ${cartItem.productId}`);
//                 continue; // Skip if the product is hidden or removed
//             }
 
//             const product = productSnap.data();
//             const totalPrice = cartItem.quantity * product.price;
//             subtotal += totalPrice;
 
//             itemsHTML += `
//                 <div class="cart-item">
//                     <img src="${product.img_url}" alt="${product.name}" class="cart-item-img">
//                     <div class="cart-item-details">
//                         <p><strong>${product.name}</strong></p>
//                         <p>Quantity: ${cartItem.quantity}</p>
//                         <p>Price: ₹${totalPrice.toFixed(2)}</p>
//                         <button data-id="${docSnapshot.id}" class="remove-from-cart">Remove</button>
//                     </div>
//                 </div>
//             `;
//         }
 
//         if (!itemsHTML) {
//             itemsHTML = "<p>Your cart is empty.</p>";
//         }
 
//         cartItemsContainer.innerHTML = itemsHTML;
//         subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
 
//         attachRemoveCartEvent();
//     } catch (error) {
//         console.error("❌ Error fetching cart items:", error);
//     }
// }
 
// // ✅ Attach Event Listeners for "Remove" Button
// function attachRemoveCartEvent() {
//     document.querySelectorAll(".remove-from-cart").forEach((button) => {
//         button.addEventListener("click", async (event) => {
//             const itemId = event.target.getAttribute("data-id");
//             console.log("🗑 Removing item:", itemId);
//             await removeCartItem(itemId);
//         });
//     });
// }
 
// // ✅ Function to Remove Item from Cart
// async function removeCartItem(itemId) {
//     try {
//         await deleteDoc(doc(db, "cart", itemId));
//         console.log("🗑 Item removed from cart!");
//         fetchCartItems(auth.currentUser.uid); // Refresh cart
//     } catch (error) {
//         console.error("❌ Error removing item:", error);
//     }
// }
 
// // ✅ Load Cart Items When Page Loads
// document.addEventListener("DOMContentLoaded", () => {
//     if (auth.currentUser) {
//         fetchCartItems(auth.currentUser.uid);
//     }
// });
 
// // ✅ Redirect to Checkout Page on Click
// document.addEventListener("DOMContentLoaded", () => {
//     const checkoutButton = document.getElementById("checkout");
 
//     if (checkoutButton) {
//         checkoutButton.addEventListener("click", () => {
//             window.location.href = "checkout.html";
//         });
//     }
// });
 
 



import { auth } from "./auth.js"; // Ensure auth is imported correctly
import { db, collection, getDocs, doc, deleteDoc,getDoc} from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
 
const cartItemsContainer = document.getElementById("cart-items");
const subtotalElement = document.getElementById("subtotal");
 
// ✅ Listen for Authentication State Change BEFORE fetching cart items
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ User detected. Loading cart...");
        fetchCartItems(user.uid);
    } else {
        console.warn("❌ No user logged in. Cart cannot be loaded.");
        cartItemsContainer.innerHTML = "<p>Please log in to view your cart.</p>";
    }
});
 
// ✅ Fetch Cart Items (Only Visible Products)
async function fetchCartItems(userId) {
    try {
        console.log("🔄 Fetching cart items for user:", userId);
        const querySnapshot = await getDocs(collection(db, "cart"));
 
        cartItemsContainer.innerHTML = ""; // Clear previous data
 
        let subtotal = 0;
        let itemsHTML = "";
 
        for (const docSnapshot of querySnapshot.docs) {
            const cartItem = docSnapshot.data();
 
            // ✅ Only show the logged-in user's cart items
            const userEmail = auth.currentUser?.email;
            if (!userEmail || cartItem.userEmail !== userEmail) {
                console.warn("⚠️ Skipping item (belongs to another user):", cartItem);
                continue;
            }
 
            // ✅ Fetch the product details
            const productRef = doc(db, "products", cartItem.productId);
            const productSnap = await getDoc(productRef);
 
            if (!productSnap.exists() || productSnap.data().stock_status !== "visible") {
                console.warn(`🚫 Skipping hidden/unavailable product: ${cartItem.productId}`);
                continue; // Skip if the product is hidden or removed
            }
 
            const product = productSnap.data();
            const totalPrice = cartItem.quantity * product.price;
            subtotal += totalPrice;
 
            itemsHTML += `
                <div class="cart-item">
                    <img src="${product.img_url}" alt="${product.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <p><strong>${product.name}</strong></p>
                        <p>Quantity: ${cartItem.quantity}</p>
                        <p>Price: ₹${totalPrice.toFixed(2)}</p>
                        <button data-id="${docSnapshot.id}" class="remove-from-cart">Remove</button>
                    </div>
                </div>
            `;
        }
 
        if (!itemsHTML) {
            itemsHTML = "<p>Your cart is empty.</p>";
        }
 
        cartItemsContainer.innerHTML = itemsHTML;
        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
 
        attachRemoveCartEvent();
    } catch (error) {
        console.error("❌ Error fetching cart items:", error);
    }
}
 
// ✅ Attach Event Listeners for "Remove" Button
function attachRemoveCartEvent() {
    document.querySelectorAll(".remove-from-cart").forEach((button) => {
        button.addEventListener("click", async (event) => {
            const itemId = event.target.getAttribute("data-id");
            console.log("🗑 Removing item:", itemId);
            await removeCartItem(itemId);
        });
    });
}
 
// ✅ Function to Remove Item from Cart
async function removeCartItem(itemId) {
    try {
        await deleteDoc(doc(db, "cart", itemId));
        console.log("🗑 Item removed from cart!");
        fetchCartItems(auth.currentUser.uid); // Refresh cart
    } catch (error) {
        console.error("❌ Error removing item:", error);
    }
}
 
// ✅ Load Cart Items When Page Loads
document.addEventListener("DOMContentLoaded", () => {
    if (auth.currentUser) {
        fetchCartItems(auth.currentUser.uid);
    }
});
 
// ✅ Redirect to Checkout Page on Click
document.addEventListener("DOMContentLoaded", () => {
    const checkoutButton = document.getElementById("checkout");
 
    if (checkoutButton) {
        checkoutButton.addEventListener("click", () => {
            window.location.href = "checkout.html";
        });
    }
});