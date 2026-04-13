
export function AddToCart(newItem: string){
    //funkcija doda id od izbrane jedi v localstorage.
    const saved = localStorage.getItem("cart")
    let cart = []

    if (saved) {
        cart = JSON.parse(saved)
    }
    cart.push(newItem)
    
    localStorage.setItem("cart", JSON.stringify(cart))
}