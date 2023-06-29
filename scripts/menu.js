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

// Изменение цены при выборе размера пиццы
function changeSize(sizeBtn, MENU) {
  const currentSize = sizeBtn.innerText;
  const singlePizza = sizeBtn.parentElement.parentElement;
  const pizzaTitle = singlePizza.querySelector('.pizza-info-heading').innerText;
  // Находим объект с названием текущей пиццы
  const pizzaFromDb = MENU.find(elem => elem.title === pizzaTitle);
  let newPrice = pizzaFromDb.price[currentSize.toLowerCase()];
  const priceElement = singlePizza.querySelector('.pizza-price');
  // Отображение новой цены
  // Если на пиццу есть скидка
  if (pizzaFromDb.isDiscount) {
    // Проверяем, не была ли скидка уже отображена (для размера M по умолчанию)
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

// Добавление тега скидки на пиццу
function setDiscountTag(item, percent) {
  item.querySelector('.size-btn-container')
    .insertAdjacentHTML('afterend', `<div class="discount-tag">-${percent}%</div>`);
}

// Расчет цены со скидкой
function setDiscountPrice(price, percent) {
  price = (price - (price * percent/100)).toFixed(2);
  return price;
}

// Добавление заказа в локальное хранилище
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
    // Если такой заказ уже есть в массиве
    if (obj.title === pizzaDataToStore.title && obj.price === pizzaDataToStore.price) {
      // Увеличиваем его количество
      obj.amount++;
      isMatchFound = true;
    }
    acc.push(obj);
    return acc;
  }, []);
  // Если такого заказа еще нет в массиве
  if (!isMatchFound) {
    // Добавляем его в массив
    ordersArray.push(pizzaDataToStore);
  } else {
    // Сбрасываем флаг для следующей итерации
    isMatchFound = false;
  }
  localStorage.setItem('pizzas', JSON.stringify(ordersArray));
}
