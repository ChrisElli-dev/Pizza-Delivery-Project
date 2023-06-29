import {displayOrderQuantity} from './displayOrderQuantity.js';

const confirmBtn = document.getElementById('confirm-btn');
const nameInput = document.getElementById('name-input');
const phoneInput = document.getElementById('phone-input');
const emailInput = document.getElementById('email-input');
const orders = localStorage.getItem('pizzas');
let storedOrders = JSON.parse(orders);
let emailContent = '<tbody>';
let emailTotal = 0;

confirmBtn.addEventListener('click', (e) => {
  e.preventDefault();
  checkNameValidity();
  checkNumberValidity();
  checkEmailValidity();
  if (checkNameValidity() && checkNumberValidity() && checkEmailValidity()) {
    getTotalCost();
    formEmail();
    sendEmail();
    localStorage.removeItem('pizzas');
    storedOrders = [];
    displayOrderQuantity();
  } else {
    Swal.fire({
      position: 'center',
      icon: 'error',
      title: 'Error',
      text: 'Please enter correct values',
      showConfirmButton: false,
      timer: 2000
    });
  }
})


function checkNameValidity() {
  if (nameInput.value) {
    nameInput.style.border = '2px solid black';
    let result = !/[^A-Za-zА-Яа-я ]/.test(nameInput.value);   
    result 
      ? nameInput.style.border = '2px solid black' 
      : nameInput.style.border = '2px solid red'; 
    return result;
  } else {
    nameInput.style.border = '2px solid red';
    return false;
  }
}

function checkNumberValidity() {
  if (phoneInput.value) {
    phoneInput.style.border = '2px solid black';
    let result = /(\+7|8)\d{10}$/.test(phoneInput.value);
    result 
      ? phoneInput.style.border = '2px solid black' 
      : phoneInput.style.border = '2px solid red'; 
    return result;
  } else {
    phoneInput.style.border = '2px solid red';
    return false;
  }
}

function checkEmailValidity() {
  if (emailInput.value) {
    emailInput.style.border = '2px solid black';
    let result = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(emailInput.value);
    result 
      ? emailInput.style.border = '2px solid black' 
      : emailInput.style.border = '2px solid red'; 
    return result;
  } else {
    emailInput.style.border = '2px solid red';
    return false;
  }
}

function formEmail() {
  storedOrders.map(pizza => {
    let pizzaElem = document.createElement('tr');
    pizzaElem.innerHTML = `
      <td style="text-align:center;padding:3px"><img style="max-width:50px" src=${pizza.imgUrl} alt="pizza-img"></td>
      <td style="text-align:center;padding:3px">${pizza.title}</td>
      <td style="text-align:center;padding:3px">${pizza.price}₽</td>
      <td style="text-align:center;padding:3px">${pizza.amount}</td>`;
    pizzaElem = new XMLSerializer().serializeToString(pizzaElem);
    emailContent += pizzaElem;
  });
}

function getTotalCost() {
  storedOrders.forEach(pizza => {
    let pizzaPrice = pizza.price * pizza.amount;
    emailTotal += pizzaPrice;
  })
  emailTotal = Number(emailTotal).toFixed(2);
}

function sendEmail() {
  Email.send({
    SecureToken : "Djts487AJ_22SLcHFaeaz",
    To : `${emailInput.value}`,
    From : "galimsarapov@gmail.com",
    Subject : "Подтверждение заказа",
    Body : `
      <html>
        <h1>Благодарим вас за покупки в нашем магазине!</h1>
        <h3>Вот ваши контактные данные: </h3>
        <ul>
          <li><strong>Name: </strong>${nameInput.value}</li>
          <li><strong>Phone number: </strong>${phoneInput.value}</li>
          <li><strong>Email: </strong>${emailInput.value}</li>
        </ul>
        <h3>Вот детали вашего заказа</h3>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>Price</th>
              <th>Amount</th>
            </tr> 
          </thead>
          ${emailContent}
          </tbody>
          <hr>
          <p><strong>Total: ${emailTotal}₽</strong></p>
        </table>
        <h4>Ожидайте телефонного звонка от наших операторов, чтобы узнать о доставке.</h4>
        <h2 style="text-align: center; margin: 1rem 0; font-style: italic;">Хэппи пицца тайм! :)</h2>
      </html>`
})
  .then(Swal.fire({
    position: 'center',
    icon: 'success',
    title: 'Письмо отправлено',
    text: 'Проверьте свой почтовый ящик на наличие нашего письма',
    showConfirmButton: true,
    })
  );
}