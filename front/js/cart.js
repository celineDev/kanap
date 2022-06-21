// functions call
(async function() {
    const products = await getProducts()
    getCart()
    const orderId = getOrdertId()
    if (orderId != undefined) {
        displayOrderId(orderId)
    } else {
        sendForm()
        displayProduct(products)
        itemsQuantity()
        totalPrice(products)
    }
    removeProduct()
    changeQuantity()
})()

// Fetch request
async function getProducts() {
    return fetch("http://localhost:3000/api/products/")
    .then(res => {
        if (!res.ok) {
            throw Error(res.statusText + "-" + res.url);
        }
        return res.json();
    })
    .then(products => {
        return products
    })
    .catch(err => {
        console.log("Page non trouvée")
        console.log(err)
    })
}
// save in localStorage
function saveCart(cart) {
    localStorage.setItem('item', JSON.stringify(cart))
}
// get product from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('item'))
}
// remove product from localStorage
function removeProduct() {
    let cart = getCart()
    let el = document.querySelectorAll('.deleteItem')

    for (let i=0 ; i < el.length ; i++) {
        el[i].addEventListener('click', () => {
            let closestEl = el[i].closest(".cart__item")
            console.log('el[i].closest(".cart__item")')
            // recupération de l'id du produit avec le dataset-id
            let dataSet = closestEl.dataset.id
            // recupération de l'id du produit depuis le local storage
            let cartId = cart[i].id

            if (cartId === dataSet) {
                cart.splice(i, 1)
                if (confirm('Voulez-vous supprimer ce produit de votre panier ?')) {
                    saveCart(cart)
                    location.reload()
                    return
                }
                else {
                    location.reload()
                    return
                }
            }
        })
    }
}
// modify quantity of a product from localStorage
function changeQuantity() {
    let cart = getCart()
    let input = document.querySelectorAll('.itemQuantity')
    let result = document.querySelectorAll('.cart__item .cart__item__content__settings__quantity p')

    for (let i=0 ; i < input.length ; i++) {
        input[i].addEventListener('change', function() {
            // récupération via dataset
            let dataSet = input[i].closest(".cart__item")
            let id = dataSet.dataset.id
            let color = dataSet.dataset.color

            // récupération via localstorage
            let cartId = cart[i].id
            let cartColor = cart[i].colors

            // modifie la valeur du texte proche de l'input
            result[i].textContent = this.value

            let found = cart.find(p => p.id === cartId && p.colors === cartColor)
            console.log(found)
            if (found) {
                found.productQuantity = parseInt(result[i].textContent)
                input[i] = found.productQuantity
                if (found.productQuantity <= 0) {
                    console.log('found remove')
                    removeProduct()
                } else {
                    console.log('found reload')
                    location.reload()
                    saveCart(cart)
                    return
                }
            }
        })
    }
}
// number of products contains in the localStorage
function itemsQuantity() {
    let cart = getCart()
    let quantity = 0
    for (let items of cart) {
        quantity += items.productQuantity
        if (quantity <= 1 || quantity == undefined) {
            document.querySelector('.cart__price p').innerHTML = `<p>Total (<span id="totalQuantity">${quantity}</span> article) : <span id="totalPrice"><!-- 84,00 --></span> €</p>`
        } else {
            document.querySelector('.cart__price p').innerHTML = `<p>Total (<span id="totalQuantity">${quantity}</span> articles) : <span id="totalPrice"><!-- 84,00 --></span> €</p>`
        }
    }
    return quantity
}
// price of the products contains in the localStorage
function totalPrice(products) {
    let cart = getCart()
    let price = 0
    for( let i=0 ; i < cart.length; i++ ){
        let cartId = cart[i].id
        let found = products.find(p => p._id === cartId)
        let qty = cart[i].productQuantity
        price += found.price * qty

        const el = document.getElementById('totalPrice').innerHTML = `<span id="totalPrice">${price}</span>`
    }
    return price
}
// Display products
function displayProduct(products) {
    let cart = getCart()

    for( let i=0 ; i < cart.length; i++ ){
        let cartId = cart[i].id
        let found = products.find(p => p._id === cartId)

        document.getElementById('cart__items').innerHTML += `
        <article class="cart__item" data-id="${cart[i].id}" data-color="${cart[i].colors}">
            <div class="cart__item__img">
                <img src="${found.imageUrl}" alt="Photographie d'un canapé">
            </div>
            <div class="cart__item__content">
                <div class="cart__item__content__description">
                    <h2>${found.name}</h2>
                    <p>${cart[i].colors}</p>
                    <p>${found.price * cart[i].productQuantity} €</p>
                </div>
                <div class="cart__item__content__settings">
                    <div class="cart__item__content__settings__quantity">
                    <p>${cart[i].productQuantity} : </p>
                    <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${cart[i].productQuantity}">
                    </div>
                    <div class="cart__item__content__settings__delete">
                    <p class="deleteItem">Supprimer</p>
                    </div>
                </div>
            </div>
        </article>
        `
    }
}

/*********************************** FORM ***********************************/
// POST request to the api to send form
function sendForm() {
    let cart = getCart()
    console.log(cart)
    let productsId = cart.map(cart => cart.id )
    console.log(productsId)

    document.getElementById('order').addEventListener('click', async (e) => {
        e.preventDefault()
        if (checkInput() !== true) {
            alert ('Veuillez remplir le formulaire')
        } else {
            await fetch("http://localhost:3000/api/products/order", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contact: {
                        firstName : document.getElementById('firstName').value,
                        lastName : document.getElementById('lastName').value,
                        address : document.getElementById('address').value,
                        city : document.getElementById('city').value,
                        email : document.getElementById('email').value
                    },
                    products: productsId
                })
            })
            .then(res => {
                if (!res.ok) {
                    throw Error(res.statusText + "-" + res.url);
                }
                return res.json();
            })
            .then(data => {
                console.log(data.orderId)
                location.href = `./confirmation.html?order=${data.orderId}`;
            })
            .catch(err => {
                console.log("Echec d'envoi du formulaire")
                console.log(err)
            })
        }
    })
}
// query string of a URL to get a order Id
function getOrdertId() {
    const queryString = window.location.search
    const url = new URLSearchParams(queryString)

    if(url.has('order')) {
        const orderId = url.get('order')
        return orderId
    }
}
// display order Id and clear localStorage
function displayOrderId(orderId) {
    document.getElementById('orderId').innerHTML = `${orderId}`
    localStorage.clear('item')
}

// check input validation
function checkInput() {
    // input
    const firstName = document.getElementById('firstName')
    const lastName = document.getElementById('lastName')
    const address = document.getElementById('address')
    const city = document.getElementById('city')
    const email = document.getElementById('email')

    // error
    const firstNameEr = document.getElementById('firstNameErrorMsg')
    const lastNameEr = document.getElementById('lastNameErrorMsg')
    const addressEr = document.getElementById('addressErrorMsg')
    const cityEr = document.getElementById('cityErrorMsg')
    const emailEr = document.getElementById('emailErrorMsg')

    // regex type
    let aphaRegExp = new RegExp('^[a-zA-Z]+$')
    let aphaNumbRegExp = new RegExp('^[- 0-9a-zA-Z+,]+$')
    let cityRegExp = new RegExp('^[- a-zA-Z]+$')
    let emailRegExp = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)

    // first name
    if (firstName.value ===''){
        firstNameEr.innerHTML = 'Ce champ ne peut pas être vide'
        firstNameEr.style.color = '#FBBCBC'
        return false
    } else if (firstName.value.length < 2 || firstName.value.length > 50 || aphaRegExp.test(firstName.value) != true) {
        firstNameEr.innerHTML = 'Ce champ doit être compris entre 2 et 50 caractères sans accent'
        firstNameEr.style.color = '#FBBCBC'
        return false
    }
    else {
        firstNameEr.innerHTML = 'Prénom valide'
        firstNameEr.style.color = 'yellow'
    }

    // last name
    if (lastName.value ===''){
        lastNameEr.innerHTML = 'Ce champ ne peut pas être vide'
        lastNameEr.style.color = '#FBBCBC'
        return false
    } else if (lastName.value.length < 2 || lastName.value.length > 50 || aphaRegExp.test(lastName.value) != true) {
        lastNameEr.innerHTML = 'Ce champ doit être compris entre 2 et 50 caractères sans accent'
        lastNameEr.style.color = '#FBBCBC'
        return false
    }
    else {
        lastNameEr.innerHTML = 'Nom valide'
        lastNameEr.style.color = 'yellow'
    }
    // address
    if (address.value ===''){
        addressEr.innerHTML = 'Ce champ ne peut pas être vide'
        addressEr.style.color = '#FBBCBC'
        return false
    } else if (address.value.length < 2 || address.value.length > 200 || aphaNumbRegExp.test(address.value) != true) {
        addressEr.innerHTML = 'Ce champ doit être compris entre 2 et 200 caractères sans accent'
        addressEr.style.color = '#FBBCBC'
        return false
    }
    else {
        addressEr.innerHTML = 'Adresse valide'
        addressEr.style.color = 'yellow'
    }
    // city
    if (city.value ===''){
        cityEr.innerHTML = 'Ce champ ne peut pas être vide'
        cityEr.style.color = '#FBBCBC'
        return false
    } else if (city.value.length < 2 || city.value.length > 200 || cityRegExp.test(city.value) != true) {
        cityEr.innerHTML = 'Ce champ doit être compris entre 2 et 200 caractères sans accent'
        cityEr.style.color = '#FBBCBC'
        return false
    }
    else {
        cityEr.innerHTML = 'Nom de ville valide'
        cityEr.style.color = 'yellow'
    }
    // email
    if (email.value ===''){
        emailEr.innerHTML = 'Ce champ ne peut pas être vide'
        emailEr.style.color = '#FBBCBC'
        return false
    } else if (email.value.length < 2 || email.value.length > 200 || emailRegExp.test(email.value) != true) {
        emailEr.innerHTML = 'Format email non valide'
        emailEr.style.color = '#FBBCBC'
        return false
    }
    else {
        emailEr.innerHTML = 'Email valide'
        emailEr.style.color = 'yellow'
    }
    return true
}