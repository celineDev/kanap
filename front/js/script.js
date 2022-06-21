// functions call
(async function() {
    const products = await getProducts()
    // boucle sur les produits
    for(let product of products) {
        displayProduct(product)
    }
})()

// fetch request
async function getProducts() {
    return fetch("http://localhost:3000/api/products/")
    .then(res => {
        if (!res.ok) {
            throw Error(res.statusText + "-" + res.url);
        }
        return res.json();
    })
    .then(products => {
        console.log(products)
        return products
    })
    .catch(err => {
        console.log("Page non trouvée")
        console.log(err)
    })
}

function displayProduct(product) {
    const myItems = document.createElement("a");
    myItems.innerHTML += `
    <a href="./product.html?id=${product._id}">
        <article>
        <img src="${product.imageUrl}" alt="${product.altTxt}">
        <h3 class="productName">${product.name}</h3>
        <p class="productDescription">${product.description}</p>
        </article>
    </a>
`
document.getElementById("items").appendChild(myItems)
}