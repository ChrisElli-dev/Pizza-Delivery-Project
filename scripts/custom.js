import {displayOrderQuantity} from './displayOrderQuantity.js';

const url = '/ingredients.json';
const sizeBtnDiv = document.querySelector('.size-btn-container');
const toppingBtnDiv = document.querySelector('.topping-btn-container');
const pizzaConstructorDiv = document.querySelector('.pizza-constructor-image');
const addBtn = document.getElementById('add-btn');
const totalPrice = document.querySelector('.total-price');
let ordersArray = [];

fetch(url)
  .then(response => response.json())
  .then(INGREDIENTS => {
    displaySizes(INGREDIENTS);
    displayIngredients(INGREDIENTS);
    updateTotalCost(INGREDIENTS);
    displayOrderQuantity();
});

addBtn.addEventListener('click', () => {
  addPizzaToCart();
  displayOrderQuantity();
});


function displaySizes(INGREDIENTS) {
  INGREDIENTS['sizes'].map(size => {
    const sizeBtn = document.createElement('button');
    sizeBtn.className = 'size-btn';
    sizeBtn.innerHTML = `<span class="pizza-size">${size.size}</span><span>${size.price}₽</span>`;
  // устанавливаем дефолтный размер пиццы на медиум ( средняя пицца ) 
    if (size.size === 'm') {
      sizeBtn.classList.add('active');
    }
    sizeBtnDiv.appendChild(sizeBtn);
  });

  const sizeBtns = [...document.querySelectorAll('.size-btn')];
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      sizeBtns.forEach(btn => {
        btn.classList.remove('active');
      })
      btn.classList.add('active');
      updateTotalCost(INGREDIENTS);
    });
  });
}

function displayIngredients(INGREDIENTS) {
  INGREDIENTS["ingredients"].map(ingredient => {
    const ingredientBtn = document.createElement('button');
    ingredientBtn.className = 'topping-btn';
    ingredientBtn.textContent = ingredient.topping;
    toppingBtnDiv.appendChild(ingredientBtn);
    ingredientBtn.addEventListener('click', (e) => {
      ingredientBtn.classList.toggle('active');
      addTopping(e, INGREDIENTS);
      updateTotalCost(INGREDIENTS);
    })
  });
}

// добавление изображения дополнений (топингов) к пицце
function addTopping(e, INGREDIENTS) {
  const currentTopping = e.target;
  const toppingFromDb = INGREDIENTS["ingredients"].find(el => el.topping === currentTopping.textContent);

  // добавление изображений топингов
  if (currentTopping.classList.contains('active')) {
    const toppingImg = document.createElement('img');
    toppingImg.src = toppingFromDb.imgUrl;
    toppingImg.alt = toppingFromDb.topping;
    toppingImg.className = 'pizza-topping-image';
    toppingImg.id = toppingFromDb.id;
    toppingImg.style.zIndex = toppingFromDb.zIndex;
    pizzaConstructorDiv.appendChild(toppingImg);
  } else {
    // удаление
    const displayedToppings = document.querySelectorAll('.pizza-topping-image');

    for (let img of displayedToppings) {
      if (img.id === toppingFromDb.id) {
        pizzaConstructorDiv.removeChild(img);
      }
    }
  }
}

let total = 0;
function updateTotalCost(INGREDIENTS) {
  // добавляем цену за размер пицц ( маленькая средняя и большая имеют разную цену)
  // они находтся в ingridients.json
  const selectedSize = sizeBtnDiv.querySelector('.active .pizza-size');
  const sizeFromDb = INGREDIENTS["sizes"].find(el => el.size === selectedSize.textContent);
  total = Number(sizeFromDb.price);

  // добавляем цену топингов 
  const selectedToppings = [...toppingBtnDiv.querySelectorAll('.active')];
 // если человек не выбрал ни одной начинки для пиццы, отключаем кнопку добавления
  if (selectedToppings.length < 1) {
    addBtn.setAttribute("disabled", "disabled");
  } else {
    addBtn.removeAttribute("disabled");
    let toppingsTotal = 0;
    selectedToppings.forEach(btn => {
      let toppingFromDb = INGREDIENTS["ingredients"].find(el => el.topping === btn.textContent);
      toppingsTotal += parseFloat(toppingFromDb.price);
    });
    total += toppingsTotal;
  }
  total = total.toFixed(2);
  totalPrice.textContent = `${total}₽`;
}

// добавляем информацию о пицце в локальное хранилище
function addPizzaToCart() {
  const orders = localStorage.getItem('pizzas') ?? '[]';
  const storedOrders = JSON.parse(orders);
  const selectedSize = sizeBtnDiv.querySelector('.active .pizza-size').textContent;
  const customPizza = {
    title: 'Своя пицца',
    imgUrl: '/images/своя_760x760.webp',
    amount: 1,
    size: selectedSize,
  };
  customPizza.price = total;

  let isMatchFound = false;
// Проверяем наличие повторяющихся заказов пиццы
ordersArray = storedOrders.reduce((acc, obj) => {
  // Если такой заказ уже есть в массиве
  if (obj.title === customPizza.title && obj.price === customPizza.price) {
    // Увеличиваем количество таких заказов
    obj.amount++;
    isMatchFound = true;
  }
  acc.push(obj);
  return acc;
  }, []);

  // Если такого заказа еще нет в массиве
  if (!isMatchFound) {
    // Добавляем его в массив
    ordersArray.push(customPizza);
  } else {
    // Сбрасываем флаг для следующей итерации
    isMatchFound = false;
  }

  // Сохраняем массив заказов пиццы в локальном хранилище
  localStorage.setItem('pizzas', JSON.stringify(ordersArray));

  }