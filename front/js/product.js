// functions call
(async function() {
    const productId = getProductId()
    const product = await getProduct(productId)
    hydrateProduct(product)
    addToCart(product)
    console.log(product)
})()

// query string of a URL to get a product Id
function getProductId() {
    const queryString = window.location.search
    const url = new URLSearchParams(queryString)

    if(url.has('id')) {
        const productId = url.get('id')
        return productId
    }
}

// fetch request constains product Id
async function getProduct(productId) {
    return fetch(`http://localhost:3000/api/products/${productId}`)
    .then(res => {
        if (!res.ok) {
            throw Error(res.statusText);
        }
        console.log(res)
        return res.json();
    })
    .then(product => {
        return product
    })
    .catch(err => {
        console.log("Ce produit n'existe pas")
        console.log(err)
    })
}

// display product find with the product id
function hydrateProduct(product) {
    // display image
    const getImage = document.querySelector('.item__img');
    const img = document.createElement('img');
    img.src = product.imageUrl;
    img.alt = product.altTxt
    getImage.appendChild(img);

    // display simple elements
    const name = document.getElementById('title').innerHTML = product.name
    const price = document.getElementById('price').innerHTML = product.price
    const description = document.getElementById('description').innerHTML = product.description

    // display select options
    const getOption = document.getElementById('colors')
    for(i = 0; i < product.colors.length ; i++) {
        const option = document.createElement('option')
        option.value = product.colors[i]
        getOption.appendChild(option).innerHTML += product.colors[i]
    }
}

// add product information to cart
function addToCart(product) {
    document.getElementById('addToCart')
    .addEventListener('click', (event) => {
        event.preventDefault()
        const colorOption = document.getElementById('colors').value
        const quantity = document.getElementById('quantity').value
        let addProduct = {
            id : product._id,
            colors : colorOption,
            productQuantity : quantity
        }
        if(colorOption != '' && quantity > 0) {
            addBasket(addProduct)
            alert ('Produit ajouté à votre panier')
        } else {
            alert ('Veuillez entrer une donnée correcte')
        }
    })
}

// save in localStorage
function saveCart(cart) {
    localStorage.setItem('item', JSON.stringify(cart))
}

// create empty array and get product from localStorage
function getCart() {
    let cart = localStorage.getItem('item')
    if (cart === null) {
        return []
    } else {
        return JSON.parse(cart)
    }
}

// modification of a product before saving it in the localStorage
function addBasket(product) {
    let cart = getCart()
    let found = cart.find(p => p.id === product.id && p.colors === product.colors)
    console.log(found)
    if (found) {
        found.productQuantity = parseInt(found.productQuantity) + parseInt(product.productQuantity)
        console.log('existe')
    } else {
        product.productQuantity = parseInt(product.productQuantity)
        product.colors
        cart.push(product)
        console.log('existe pas')
    }
    saveCart(cart)
}