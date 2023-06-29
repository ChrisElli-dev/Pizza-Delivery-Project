export function displayOrderQuantity() {
  const storedOrders = localStorage.getItem('pizzas');
  const quantityDiv = document.querySelectorAll('.order-quantity');
  let amount;

  // if orders quantity > 0
  if (storedOrders) {
    const ordersArray = JSON.parse(storedOrders);
    if(ordersArray.length) {
      amount = ordersArray.reduce((acc, obj) => acc + obj.amount, 0);
      quantityDiv.forEach(el => el.textContent = amount);
    } else {
      quantityDiv.forEach(el => el.textContent = '');
    }
  } else {
    quantityDiv.forEach(el => el.textContent = '');
  }
}