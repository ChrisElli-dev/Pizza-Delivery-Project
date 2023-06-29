import { displayOrderQuantity } from './displayOrderQuantity.js';

const menuGrid = document.getElementById('menu-grid');
let discountPercent = 10;
let ordersArray = [];

fetch('/menu.json')
  .then(response => response.json())
  .then(MENU => {
    displayMenuItems(MENU);
    displayOrderQuantity();
  })
  .catch(error => console.error(error));

function displayMenuItems(MENU) {
  MENU.map(item => {
    const singlePizza = document.createElement('div');
    singlePizza.className = 'single-pizza';
    let pizzaContent = `
      <div class="size-btn-container">
        <button class="size-btn">S</button>
        <button class="size-btn active">M</button>
        <button class="size-btn">L</button>
      </div>
      <img src=${item.imgUrl} alt="pizza">
      <div class="single-pizza-info">
        <p class="pizza-price">
        ${item.isDiscount
          ? `<span class="discount-old-price">${item.price.m}</span>
            ${setDiscountPrice(item.price.m, discountPercent)}₽</p>`
          : `${item.price.m}₽`
        }
        </p>
        <h3 class="pizza-info-heading">${item.title}</h3>
        <p class="pizza-info-desc">${item.ingredients}</p>
      </div>
      <button class="add-btn btn">Добавить</button>`;
    singlePizza.innerHTML = pizzaContent;
    menuGrid.appendChild(singlePizza);
    if (item.isDiscount) {
      setDiscountTag(singlePizza, discountPercent);
    }

    menuGrid.addEventListener('click', e => {
      const sizeBtn = e.target.closest('.size-btn');
      if (sizeBtn) {
        changeSize(sizeBtn, MENU);
        const sizeBtns = [...sizeBtn.parentElement.children];
        sizeBtns.forEach(btn => {
          btn.classList.remove('active');
        })
        sizeBtn.classList.add('active');
      }
    });
    const addBtn = singlePizza.querySelector('.add-btn');
    addBtn.addEventListener('click', (e) => {
      addPizzaToCart(e, MENU);
      displayOrderQuantity();
    });
  });
}

// change price on size button click
function changeSize(sizeBtn, MENU) {
  const currentSize = sizeBtn.innerText;
  const singlePizza = sizeBtn.parentElement.parentElement;
  const pizzaTitle = singlePizza.querySelector('.pizza-info-heading').innerText;
  // find object with the name of current pizza
  const pizzaFromDb = MENU.find(elem => elem.title === pizzaTitle);
  let newPrice = pizzaFromDb.price[currentSize.toLowerCase()];
  const priceElement = singlePizza.querySelector('.pizza-price');
  // display new price
  // if the pizza has a discount
  if (pizzaFromDb.isDiscount) {
    // check if discount wasn't already displayed (for M size by default)
    if (!priceElement.querySelector('.discount-old-price')) {
      newPrice = setDiscountPrice(newPrice, discountPercent);
    }
    const newContent = `
      <span class="discount-old-price">₽${newPrice}</span>
      ${setDiscountPrice(newPrice, discountPercent)}₽`
    priceElement.innerHTML = newContent;
  } else {
    singlePizza.querySelector('.pizza-price').textContent = `${newPrice}₽`;
  }
}

// add discount tag on pizza
function setDiscountTag(item, percent) {
  item.querySelector('.size-btn-container')
    .insertAdjacentHTML('afterend', `<div class="discount-tag">-${percent}%</div>`);
}

// calculate price with discount
function setDiscountPrice(price, percent) {
  price = (price - (price * percent/100)).toFixed(2);
  return price;
}

// add order to local storage
function addPizzaToCart(e, MENU) {
  const currentPizza = e.target.parentElement;
  const currentSize = currentPizza.querySelector('.active').textContent.toLowerCase();
  const pizzaTitle = currentPizza.querySelector('.pizza-info-heading').textContent;
  const pizzaFromDb = MENU.find(elem => elem.title === pizzaTitle);
  const {title, imgUrl, price, isDiscount} = pizzaFromDb;
  const pizzaDataToStore = {title, imgUrl, isDiscount};
  pizzaDataToStore.price = isDiscount ? setDiscountPrice(price[currentSize], discountPercent) : price[currentSize];
  pizzaDataToStore.size = currentSize;
  pizzaDataToStore.amount = 1;
  const orders = localStorage.getItem('pizzas') ?? '[]';
  let storedOrders = JSON.parse(orders);

  let isMatchFound = false;
  ordersArray = storedOrders.reduce((acc, obj) => {
    // if such order is already in the array
    if (obj.title === pizzaDataToStore.title && obj.price === pizzaDataToStore.price) {
      // increase its amount
      obj.amount++;
      isMatchFound = true;
    }
    acc.push(obj);
    return acc;
  }, [])
  // if there's no such order in the array
  if (!isMatchFound) {
    // add it to the array
    ordersArray.push(pizzaDataToStore);
  } else {
    // set back the flag to false for the next iteration
    isMatchFound = false;
  }
  localStorage.setItem('pizzas', JSON.stringify(ordersArray));
}