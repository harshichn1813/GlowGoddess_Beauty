
import { auth } from "./auth.js";
import { db, collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "./firebase-config.js";
 
// DOM Elements
const orderItemsList = document.getElementById("order-items");
const totalAmountSpan = document.getElementById("total-amount");
const finalAmountSpan = document.getElementById("final-amount");
const userCreditsSpan = document.getElementById("user-credits");
const customerEmailSpan = document.getElementById("customer-email");
const orderDateSpan = document.getElementById("order-date");
const useCreditsCheckbox = document.getElementById("use-credits");
const paymentMethodSelect = document.getElementById("payment-method");
const checkoutBtn = document.getElementById("checkout-btn");
 
// User & Cart Data
let userData = { email: "", credits: 0 };
let cartItems = [];
let totalAmount = 0;
let finalAmount = 0;
let orderId = "";
 
// ✅ Listen for Authentication & Fetch Cart
auth.onAuthStateChanged(async (user) => {
    if (user) {
        customerEmailSpan.textContent = user.email;
        orderDateSpan.textContent = new Date().toLocaleDateString();
        userData.email = user.email;
 
        await fetchUserCredits();
        await fetchCartItems();
    } else {
        alert("❌ Please log in to proceed with checkout.");
        window.location.href = "login.html";
    }
});
 
// ✅ Fetch User Credits
async function fetchUserCredits() {
    try {
        console.log("🔄 Fetching user credits...");
        const userRef = doc(db, "users", userData.email);
        const userSnap = await getDoc(userRef);
 
        if (userSnap.exists()) {
            userData.credits = userSnap.data().credits || 0;
            console.log(`✅ User Credits: ${userData.credits}`);
        } else {
            console.warn("⚠️ User not found in Firestore.");
            userData.credits = 0;
        }
 
        userCreditsSpan.textContent = userData.credits;
    } catch (error) {
        console.error("❌ Error fetching user credits:", error);
        userCreditsSpan.textContent = "Error";
    }
}
 
// ✅ Fetch Cart Items
async function fetchCartItems() {
    try {
        const cartSnapshot = await getDocs(collection(db, "cart"));
        orderItemsList.innerHTML = "";
        cartItems = [];
        totalAmount = 0;
 
        for (const docSnapshot of cartSnapshot.docs) {
            const cartItem = docSnapshot.data();
            if (cartItem.userEmail !== userData.email) continue;
 
            const productRef = doc(db, "products", cartItem.productId);
            const productSnap = await getDoc(productRef);
 
            if (!productSnap.exists() || productSnap.data().stock_status !== "visible") continue;
 
            const product = productSnap.data();
            const itemTotal = cartItem.quantity * product.price;
            totalAmount += itemTotal;
 
            cartItems.push({
                id: cartItem.productId,
                name: product.name,
                quantity: cartItem.quantity,
                price: product.price,
                total: itemTotal,
                credit: product.credit || 0,
                stock: product.stock
            });
 
            const listItem = document.createElement("li");
            listItem.innerHTML = `${product.name} - ${cartItem.quantity} x ₹${product.price} = ₹${itemTotal}`;
            orderItemsList.appendChild(listItem);
        }
 
        totalAmountSpan.textContent = totalAmount.toFixed(2);
        updateFinalAmount();
    } catch (error) {
        console.error("❌ Error fetching cart items:", error);
    }
}
 
// ✅ Calculate Final Amount After Applying Credits
useCreditsCheckbox.addEventListener("change", () => {
    updateFinalAmount();
});
 
function updateFinalAmount() {
    finalAmount = totalAmount;
    if (useCreditsCheckbox.checked) {
        finalAmount -= userData.credits;
        if (finalAmount < 0) finalAmount = 0;
    }
    finalAmountSpan.textContent = finalAmount.toFixed(2);
}
 
// ✅ Confirm Order & Store in Firestore
checkoutBtn.addEventListener("click", async () => {
    if (cartItems.length === 0) {
        alert("❌ Your cart is empty!");
        return;
    }
 
    const paymentMethod = paymentMethodSelect.value;
    orderId = `ORDER-${Date.now()}`;
 
    try {
        // ✅ Deduct Stock & Save Order Data
        let earnedCredits = 0;
        for (let item of cartItems) {
            const productRef = doc(db, "products", item.id);
            let newStock = item.stock - item.quantity;
 
            if (newStock < 0) {
                alert(`⚠️ Not enough stock for ${item.name}.`);
                return;
            }
 
            await updateDoc(productRef, { stock: newStock });
            console.log(`📉 Stock Updated: ${item.name} -> ${newStock} remaining`);
 
            earnedCredits += item.credit * item.quantity;
        }
 
        // ✅ Deduct Used Credits & Add Earned Credits
        let creditsUsed = useCreditsCheckbox.checked ? Math.min(userData.credits, totalAmount) : 0;
        let remainingCredits = userData.credits - creditsUsed + earnedCredits;
 
        await updateDoc(doc(db, "users", userData.email), { credits: remainingCredits });
 
        // ✅ Save Order in Firestore
        const orderData = {
            orderId,
            userEmail: userData.email,
            items: cartItems,
            totalAmount,
            finalAmount,
            creditsUsed,
            creditsEarned: earnedCredits,
            paymentMethod,
            date: serverTimestamp(),
        };
 
        await addDoc(collection(db, "orders"), orderData);
 
        // ✅ Clear Cart
        const cartSnapshot = await getDocs(collection(db, "cart"));
        cartSnapshot.docs.forEach(async (docSnapshot) => {
            if (docSnapshot.data().userEmail === userData.email) {
                await deleteDoc(doc(db, "cart", docSnapshot.id));
            }
        });
 
        alert("✅ Order placed successfully!");
        generateInvoice(orderData);
        window.location.href = "index.html"; // Redirect to homepage
    } catch (error) {
        console.error("❌ Error processing order:", error);
    }
});
 
// ✅ Generate Downloadable Invoice
function generateInvoice(orderData) {
    let invoiceContent = `
    SNACK IT - ORDER INVOICE
    ------------------------------------------
    Order ID: ${orderData.orderId}
    Date: ${new Date().toLocaleDateString()}
    Customer: ${orderData.userEmail}
    ------------------------------------------
    ITEMS:
    `;
 
    orderData.items.forEach((item) => {
        invoiceContent += `${item.name} - ${item.quantity} x ₹${item.price} = ₹${item.total}\n`;
    });
 
    invoiceContent += `
    ------------------------------------------
    Total Amount: ₹${orderData.totalAmount.toFixed(2)}
    Credits Used: ₹${orderData.creditsUsed.toFixed(2)}
    Credits Earned: ₹${orderData.creditsEarned.toFixed(2)}
    Final Amount: ₹${orderData.finalAmount.toFixed(2)}
    Payment Method: ${orderData.paymentMethod.toUpperCase()}
    ------------------------------------------
    Contact: support@glowgoddessbeauty.com
    Website: www.GlowGoddessBeauty.com
    Thank you for shopping with us!
    ------------------------------------------
    `;
 
    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${orderData.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}