import {displayOrderQuantity} from './displayOrderQuantity.js';

const cartDiv = document.querySelector('.cart');
const confirmDiv = document.querySelector('.confirm-div');
const totalCost = document.getElementById('total-cost');
const orders = localStorage.getItem('pizzas');
let storedOrders = JSON.parse(orders);

document.addEventListener('DOMContentLoaded', () => {
  displayOrder();
  displayOrderQuantity();
  updateTotalCost();
});

function displayOrder() {
  // if no orders were made
  if (storedOrders === null || storedOrders.length === 0) {
    displayEmptyCartMsg();
  } else {
    storedOrders.map(item => {
      const { title, imgUrl, price, amount } = item;
      const orderDiv = document.createElement('div');
      orderDiv.className = 'order-container';
      const orderDetails = `
      <div class="order">
        <div class="order-image">
          <img src=${imgUrl} alt=${title}>
        </div>
        <div class="order-info">
          <p class="order-title">${title}</p>
          <p class="order-cost"><span>${price}</span>₽</p>
          <button class="remove-btn">Удалить</button>
        </div>
        <div class="amount-div">
          <button class="increase-btn"><i class="fa-solid fa-chevron-up"></i></button>
          <p>${amount}</p>
          <button class="decrease-btn"><i class="fa-solid fa-chevron-down"></i></button>
        </div>
        </div>
        <div class="line"></div>`;
      orderDiv.innerHTML = orderDetails;
      cartDiv.appendChild(orderDiv);
      const incBtn = orderDiv.querySelector('.increase-btn');
      const decBtn = orderDiv.querySelector('.decrease-btn');
      const removeBtn = orderDiv.querySelector('.remove-btn');
      incBtn.addEventListener('click', e => updateAmount(e, 'increase'));
      decBtn.addEventListener('click', e => updateAmount(e, 'decrease'));
      removeBtn.addEventListener('click', e => removeItem(e));
    });
    removeLastLine();
    updateTotalCost();
  }
}

function displayEmptyCartMsg() {
  cartDiv.innerHTML = '';
  const emptyCartMsg = document.createElement('div');
  emptyCartMsg.className = 'empty-cart';
  let msgContent = `
    <p>В корзине ничего нет</p>
    <img src="../images/empty pizza box.svg" alt="empty cart icon">
    <a href="./menu.html"><button>В меню</button></a>`;
  emptyCartMsg.innerHTML = msgContent;
  cartDiv.appendChild(emptyCartMsg);
  confirmDiv.style.display = 'none';
  displayOrderQuantity();
}

function updateAmount(e, operation) {
  // if event is click then e.target is <i>, if event is Enter key then e.target is <button>
  const orderDiv = e.target.classList.contains('fa-solid')
    ? e.target.parentElement.parentElement.parentElement.parentElement
    : e.target.parentElement.parentElement.parentElement;
  const orderTitle = orderDiv.querySelector('.order-title').textContent;
  const orderCost = orderDiv.querySelector('.order-cost span').textContent;
  const orderAmount = orderDiv.querySelector('.amount-div p');
  let obj = storedOrders.find(obj => obj.title === orderTitle && obj.price === orderCost);
  if (operation === 'increase') {
    obj.amount = obj.amount + 1;
  } else if (operation === 'decrease') {
    obj.amount = obj.amount - 1;
  }
  // remove pizza if amount is < 1
  if (obj.amount < 1) {
    storedOrders = storedOrders.filter(item => item.title !== obj.title || item.price !== obj.price || item.size !== obj.size);
    cartDiv.removeChild(orderDiv);
    removeLastLine();
  } else {
    orderAmount.textContent = obj.amount;
  }
  localStorage.setItem('pizzas', JSON.stringify(storedOrders));
  displayOrderQuantity();
  checkEmptyCart();
  updateTotalCost();
}

// check if after removing item a separation line was left
function removeLastLine() {
  let orderDivs = [...document.querySelectorAll('.order-container')];
  const lastOrderDiv = orderDivs[orderDivs.length - 1];

  if (storedOrders.length > 0 && lastOrderDiv.querySelector('.line')) {
    lastOrderDiv.removeChild(lastOrderDiv.querySelector('.line'));
  }
}

// if after removing item the cart becomes empty, display message
function checkEmptyCart() {
  if (storedOrders.length === 0) {
    displayEmptyCartMsg();
  }
}

function removeItem(e) {
  const orderToRemoveInfo = e.target.parentElement;
  const orderToRemoveTitle = orderToRemoveInfo.querySelector('.order-title').textContent;
  const orderToRemovePrice = orderToRemoveInfo.querySelector('.order-cost span').textContent;
  storedOrders = storedOrders.filter(item => item.title !== orderToRemoveTitle
    || item.price !== orderToRemovePrice);
  localStorage.setItem('pizzas', JSON.stringify(storedOrders));
  cartDiv.innerHTML = '';
  displayOrder();
  removeLastLine();
  displayOrderQuantity();
  updateTotalCost();
}

function updateTotalCost() {
  let total = 0;
  if (Array.isArray(storedOrders) && storedOrders.length !== 0) {
    storedOrders.forEach(pizza => {
      let pizzaPrice = pizza.price * pizza.amount;
      total += pizzaPrice;
    });
  }
  total = total.toFixed(2);
  totalCost.textContent = `${total}₽`;
}