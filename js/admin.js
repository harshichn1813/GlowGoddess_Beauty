// import { auth, db } from "../js/firebase-config.js"; // ✅ Import `auth` correctly
// import { collection, addDoc, getDocs, query, orderBy, limit, startAfter, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// document.addEventListener("DOMContentLoaded", async () => {
//     const adminPanel = document.getElementById("admin-panel");
//     const logoutBtn = document.getElementById("logout-btn");
//     const ProductsContainer = document.getElementById("Products-container");
//     let lastVisibleDoc = null;

//     console.log("✅ Script Loaded: admin.js");

//     // ✅ Check Authentication
//     onAuthStateChanged(auth, async (user) => {
//         if (user) {
//             console.log("🔄 Checking user role...");
    
//             if (user.email === "harshichn1813@gmail.com") {
//                 console.log("✅ Admin authenticated. Showing Admin Panel...");
//                 adminPanel.style.display = "block"; // Show admin panel
//                 await displayProducts(); // ✅ Load products
//             } else {
//                 console.log("❌ Not an admin. Redirecting to home page...");
//                 window.location.href = "index.html"; // Redirect non-admins
//             }
//         } else {
//             console.log("❌ No user logged in. Redirecting to login page...");
//             window.location.href = "login.html"; // Redirect if not logged in
//         }
//     });

//     // ✅ Handle Logout
//     if (logoutBtn) {
//         logoutBtn.addEventListener("click", async () => {
//             try {
//                 await signOut(auth);
//                 alert("✅ Logged out successfully!");
//                 window.location.href = "../index.html"; // ✅ Redirect to home page after logout
//             } catch (error) {
//                 console.error("❌ Error logging out:", error);
//                 alert("Error logging out: " + error.message);
//             }
//         });
//     }


//     // ✅ Add Product Function
//     const addProductForm = document.getElementById("add-product-form");
//     addProductForm.addEventListener("submit", async (e) => {
//         e.preventDefault();

//         const productData = {
//             name: document.getElementById("name").value,
//             credit: Number(document.getElementById("credit").value),
//             img_url: document.getElementById("img-url").value,
//             description: document.getElementById("description").value,
//             price: Number(document.getElementById("price").value),
//             stock_status: document.getElementById("stock-status").value,
//             stock: Number(document.getElementById("stock").value),
//         };

//         try {
//             await addDoc(collection(db, "products"), productData);
//             alert("✅ Product added successfully!");
//             addProductForm.reset();
//             await displayProducts(); // Refresh list after adding
//         } catch (error) {
//             console.error("❌ Error adding product:", error);
//             alert("Error adding product: " + error.message);
//         }
//     });

//     // ✅ Display Products
//     async function displayProducts() {
//         console.log("🔄 Fetching Products...");
//         ProductsContainer.innerHTML = "<p>Loading Products...</p>"; // Placeholder text

//         let q = lastVisibleDoc 
//             ? query(collection(db, "Products"), orderBy("name"), startAfter(lastVisibleDoc), limit(5)) 
//             : query(collection(db, "Products"), orderBy("name"), limit(5));

//         try {
//             const querySnapshot = await getDocs(q);
//             ProductsContainer.innerHTML = ""; // Clear previous content

//             if (querySnapshot.empty) {
//                 console.log("❌ No Products found.");
//                 ProductsContainer.innerHTML = "<p>No Products available.</p>";
//                 return;
//             }

//             querySnapshot.forEach((doc) => {
//                 const product = doc.data();
//                 console.log("📦 Product:", product); // Log each product

//                 let stockMessage = product.stock < 5 
//                     ? `<p class="stock-warning" style="color: red;">⚠️ Only ${product.stock} left!</p>` 
//                     : `<p>Stock: ${product.stock}</p>`;

//                 ProductsContainer.innerHTML += `
//                     <div class="product-card">
//                         <img src="${product.img_url}" alt="${product.name}">
//                         <h3>${product.name}</h3>
//                         <p>Price: ₹${product.price}</p>
                       
//                         <p>Status: ${product.stock_status}</p>
//                         ${stockMessage}
//                         <button onclick="editProduct('${doc.id}')">Edit</button>
//                         <button onclick="toggleStatus('${doc.id}', '${product.stock_status}')">
//                             ${product.stock_status === "visible" ? "Deactivate" : "Activate"}
//                         </button>
//                     </div>
//                 `;
//             });

//             lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1]; 
//             console.log("✅ Products displayed successfully!");
//         } catch (error) {
//             console.error("❌ Error fetching Products:", error);
//             ProductsContainer.innerHTML = "<p>Error loading Products.</p>";
//         }
//     }

//     // ✅ Pagination
//     document.getElementById("next-btn").addEventListener("click", async () => {
//         console.log("📄 Loading next batch...");
//         await displayProducts();
//     });

//     // ✅ Edit Product
//     window.editProduct = async (productId) => {
//         const newPrice = prompt("Enter new price:");
//         const newStockStatus = prompt("Enter new stock status (visible/hidden):");
      

//         if (newPrice && newStockStatus) {
//             const productRef = doc(db, "Products", productId);
//             try {
//                 await updateDoc(productRef, {
//                     price: Number(newPrice),
//                     stock_status: newStockStatus,
                   
//                 });
//                 alert("✅ Product updated successfully!");
//                 await displayProducts();
//             } catch (error) {
//                 console.error("❌ Error updating product:", error);
//                 alert("Error updating product: " + error.message);
//             }
//         }
//     };

//     // ✅ Toggle Product Status
//     window.toggleStatus = async (productId, currentStatus) => {
//         const newStatus = currentStatus === "visible" ? "hidden" : "visible";
//         const productRef = doc(db, "Products", productId);

//         try {
//             await updateDoc(productRef, { stock_status: newStatus });
//             alert(`✅ Product ${newStatus === "visible" ? "activated" : "deactivated"}!`);
//             await displayProducts();
//         } catch (error) {
//             console.error("❌ Error toggling product status:", error);
//             alert("Error toggling status: " + error.message);
//         }
//     };
// });




import { auth, db } from "../js/firebase-config.js";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    startAfter,
    doc,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    const adminPanel = document.getElementById("admin-panel");
    const logoutBtn = document.getElementById("logout-btn");
    const ProductsContainer = document.getElementById("Products-container");
    const addProductForm = document.getElementById("add-product-form");
    const nextBtn = document.getElementById("next-btn");
    let lastVisibleDoc = null;

    console.log("✅ Script Loaded: admin.js");

    // ✅ Check Authentication
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("🔄 Checking user role...");

            if (user.email === "harshichn1813@gmail.com") {
                console.log("✅ Admin authenticated. Showing Admin Panel...");

                if (adminPanel) adminPanel.style.display = "block";
                await displayProducts();
            } else {
                console.log("❌ Not an admin. Redirecting to home page...");
                window.location.href = "index.html";
            }
        } else {
            console.log("❌ No user logged in. Redirecting to login page...");
            window.location.href = "login.html";
        }
    });

    // ✅ Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await signOut(auth);
                alert("✅ Logged out successfully!");
                window.location.href = "../index.html";
            } catch (error) {
                console.error("❌ Error logging out:", error);
                alert("Error logging out: " + error.message);
            }
        });
    }

    // ✅ Add Product
    if (addProductForm) {
        addProductForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const productData = {
                name: document.getElementById("name").value,
                credit: Number(document.getElementById("credit").value),
                img_url: document.getElementById("img-url").value,
                description: document.getElementById("description").value,
                price: Number(document.getElementById("price").value),
                stock_status: document.getElementById("stock-status").value,
                stock: Number(document.getElementById("stock").value),
            };

            try {
                await addDoc(collection(db, "products"), productData);
                alert("✅ Product added successfully!");
                addProductForm.reset();
                await displayProducts();
            } catch (error) {
                console.error("❌ Error adding product:", error);
                alert("Error adding product: " + error.message);
            }
        });
    }

    // ✅ Display Products
    async function displayProducts() {
        console.log("🔄 Fetching Products...");
        if (!ProductsContainer) return;

        ProductsContainer.innerHTML = "<p>Loading Products...</p>";

        let q = lastVisibleDoc
            ? query(collection(db, "products"), orderBy("name"), startAfter(lastVisibleDoc), limit(5))
            : query(collection(db, "products"), orderBy("name"), limit(5));

        try {
            const querySnapshot = await getDocs(q);
            ProductsContainer.innerHTML = "";

            if (querySnapshot.empty) {
                console.log("❌ No Products found.");
                ProductsContainer.innerHTML = "<p>No Products available.</p>";
                return;
            }

            querySnapshot.forEach((doc) => {
                const product = doc.data();

                let stockMessage =
                    product.stock < 5
                        ? `<p class="stock-warning" style="color: red;">⚠️ Only ${product.stock} left!</p>`
                        : `<p>Stock: ${product.stock}</p>`;

                ProductsContainer.innerHTML += `
                    <div class="product-card">
                        <img src="${product.img_url}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>Price: ₹${product.price}</p>
                        <p>Status: ${product.stock_status}</p>
                        ${stockMessage}
                        <button onclick="editProduct('${doc.id}')">Edit</button>
                        <button onclick="toggleStatus('${doc.id}', '${product.stock_status}')">
                            ${product.stock_status === "visible" ? "Deactivate" : "Activate"}
                        </button>
                    </div>
                `;
            });

            lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            console.log("✅ Products displayed successfully!");
        } catch (error) {
            console.error("❌ Error fetching Products:", error);
            ProductsContainer.innerHTML = "<p>Error loading Products.</p>";
        }
    }

    // ✅ Pagination
    if (nextBtn) {
        nextBtn.addEventListener("click", async () => {
            console.log("📄 Loading next batch...");
            await displayProducts();
        });
    }

    // ✅ Edit Product
    window.editProduct = async (productId) => {
        const newPrice = prompt("Enter new price:");
        const newStockStatus = prompt("Enter new stock status (visible/hidden):");

        if (newPrice && newStockStatus) {
            const productRef = doc(db, "products", productId);

            try {
                await updateDoc(productRef, {
                    price: Number(newPrice),
                    stock_status: newStockStatus,
                });
                alert("✅ Product updated successfully!");
                await displayProducts();
            } catch (error) {
                console.error("❌ Error updating product:", error);
                alert("Error updating product: " + error.message);
            }
        }
    };

    // ✅ Toggle Product Status
    window.toggleStatus = async (productId, currentStatus) => {
        const newStatus = currentStatus === "visible" ? "hidden" : "visible";
        const productRef = doc(db, "products", productId);

        try {
            await updateDoc(productRef, { stock_status: newStatus });
            alert(`✅ Product ${newStatus === "visible" ? "activated" : "deactivated"}!`);
            await displayProducts();
        } catch (error) {
            console.error("❌ Error toggling product status:", error);
            alert("Error toggling status: " + error.message);
        }
    };
});
