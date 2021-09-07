//import 'regenerator-runtime/runtime';
import './style/styles.scss';

const btnOpenMenuHeader = document.getElementById('header__menu-btn--open');
const btnCloseMenuHeader = document.getElementById('header__menu-btn--close');
const rightSide = document.querySelector('.right');

btnOpenMenuHeader.addEventListener('click', menuToggle);
btnCloseMenuHeader.addEventListener('click', menuToggle);

function menuToggle() {
  rightSide.classList.toggle('active');
}

let API_LINK = {
  random: 'https://api.chucknorris.io/jokes/random',
  category_joke: 'https://api.chucknorris.io/jokes/random?category=',
  categories: 'https://api.chucknorris.io/jokes/categories',
  search: 'https://api.chucknorris.io/jokes/search?query=',
};

let SEARCH_OPTION = {
  type: 'random',
  categories: [],
  selected_category: [],
  text: '',
};

let JOKE_LIST = [];
let JOKE_LIST_FAVOURITE = [];

const formSearchJoke = document.getElementById('form-search-joke');
formSearchJoke.addEventListener('change', changeFormSearchJoke);
formSearchJoke.addEventListener('submit', submitFormSearchJoke);

const elCategoriesList = document.getElementById('form__categories-list');
const elJokeListSearch = document.getElementById('joke-list-search');
const elJokeListFavourite = document.getElementById('joke-list-favourite');

initFavouriteJokeList();
getCategoryList();

function changeFormSearchJoke(e) {
  console.log('changeFormSearchJoke');

  let searchType = findSearchType(formSearchJoke);
  console.log(searchType);

  if (SEARCH_OPTION.type == searchType) {
    return;
  }
  console.log(SEARCH_OPTION.type == searchType);
  SEARCH_OPTION.type = searchType;

  let formRadioLabelList = document.querySelectorAll('.form__radio-label');
  for (const el of formRadioLabelList) {
    el.classList.remove('active');
  }
  let elCurRadioLabel = e.target.closest('.form__radio-label');
  elCurRadioLabel.classList.add('active');

  // if (SEARCH_OPTION.type == 'categories') { }
}

function submitFormSearchJoke() {
  console.log('submitFormSearchJoke');
  //search-txt
  //search-categories

  findSearchOption(formSearchJoke, SEARCH_OPTION);
  console.log(SEARCH_OPTION);
  getJokeData(SEARCH_OPTION, API_LINK);
}

function findSearchType(formEl) {
  let fd = new FormData(formEl);
  let st = fd.get('search-type');
  return st;
}

async function getCategoryList() {
  let response = await fetch(API_LINK.categories);

  if (response.ok) {
    let json = await response.json();
    console.log(json);
    SEARCH_OPTION.categories = json;
    paintCategoryList(json);
  } else {
    console.log('Ошибка HTTP: ' + response.status);
  }
}

function createElCategoryItem(itemValue) {
  let itemStr = `<label class="form__categories-item">
                <input type="checkbox" class="form__categories-checkbox" name="search-categories" value="${itemValue}" >
                <span class="form__categories-name">${itemValue}</span>
            </label>`;

  let itemEl = document.createRange().createContextualFragment(itemStr);
  return itemEl;
}

function paintCategoryList(itemList) {
  elCategoriesList.innerHTML = '';

  for (const item of itemList) {
    const elItem = createElCategoryItem(item);
    elCategoriesList.appendChild(elItem);
  }
}

function findSearchOption(formEl, searchOption) {
  let searchType = findSearchType(formEl);
  searchOption.type = searchType;

  if (searchType == 'random') {
    console.log('random');
  } else if (searchType == 'categories') {
    console.log('categories');
    findSearchCategories(formEl, searchOption);
  } else if (searchType == 'search') {
    console.log('search');
    findSearchText(formEl, searchOption);
  }
}

function findSearchText(formEl, searchOption) {
  let fd = new FormData(formEl);
  let st = fd.get('search-txt');
  searchOption.text = st;
  return st;
}

function findSearchCategories(formEl, searchOption) {
  let fd = new FormData(formEl);
  let arr = fd.getAll('search-categories');
  searchOption.selected_category = arr;
  return arr;
}

async function getJokeData(option, apiLink) {
  let tmpLink = '';

  if (option.type == 'categories') {
    tmpLink = apiLink.category_joke;
    tmpLink += option.selected_category.join(',');
  } else if (option.type == 'search') {
    tmpLink = apiLink.search;
    tmpLink += option.text;
  } else {
    tmpLink = apiLink.random;
  }

  console.log(tmpLink);
  let response = await fetch(tmpLink);

  if (response.ok) {
    let json = await response.json();
    console.log('getJokeData()', json);

    JOKE_LIST = [];
    if (json.total != undefined && json.total != null && json.total > 0) {
      JOKE_LIST = json.result;
    } else if (json.id != undefined && json.id != null) {
      JOKE_LIST.push(json);
    }

    paintJokeList(JOKE_LIST, elJokeListSearch);
  } else {
    console.log('Ошибка HTTP: ' + response.status);
  }
}

function paintJokeList(data, elContainer, isFavourite) {
  elContainer.innerHTML = '';

  for (const item of data) {
    let jokeStatus = isFavouriteJoke(item.id);
    let jokeEl = null;

    if (jokeStatus >= 0 || isFavourite) {
      jokeEl = createJoke(item, true);
    } else {
      jokeEl = createJoke(item, false);
    }
    elContainer.appendChild(jokeEl);
  }
}

function createJoke(data, isFavourite) {
  let categoryBlockTxt = createCategoryList(data.categories);
  console.log(new Date(data.updated_at).valueOf(), new Date().valueOf());
  let milisecRemind =
    new Date().valueOf() - new Date(data.updated_at).valueOf();
  let hoursRemind = Math.floor(milisecRemind / 3600000);

  let favouriteSelected = 'joke__heart--selected';
  if (!isFavourite) {
    favouriteSelected = '';
  }

  let jokeHtmlTxt = `<article class="joke" data-joke-id="${data.id}">
    <div class="joke__header">
        <button class="joke__heart ${favouriteSelected}" data-joke-id="${data.id}" ></button>
    </div>
    <div class="joke__content">
        <div class="joke__left">
            <div class="joke__message-img"></div>
        </div>
        <div class="joke__right">
            <div class="joke__id">
                ID: <a href="${data.url}" class="joke__id-link">${data.id}</a>
            </div>
            <div class="joke__txt-wrapper">
                <p class="joke__txt">${data.value}</p>
            </div>
            <div class="joke__date-and-category-wrapper">
                <p class="joke__date">Last update:
                    <time datetime="${data.updated_at}" class="joke__date-time">${hoursRemind} hours ago</time>
                </p>
                ${categoryBlockTxt}
            </div>
        </div>
    </div>
  </article>`;

  const node = document.createRange().createContextualFragment(jokeHtmlTxt);
  node.querySelector('.joke__heart').addEventListener('click', selectJokeHeart);
  return node;

  function createCategoryList(categoryListData) {
    if (categoryListData.length == 0) {
      return '';
    }

    let listElTxt = '<div class="joke__category-list">';
    for (const categoryData of categoryListData) {
      listElTxt += `<a href="javascript:void(0)" class="joke__category-link">${categoryData}</a>`;
    }
    listElTxt += '</div>';

    return listElTxt;
  }
}

function selectJokeHeart(el) {
  console.log(el);
  const jokeId = el.target.getAttribute('data-joke-id');
  console.log(jokeId);

  let jokeStatus = isFavouriteJoke(jokeId);
  console.log('jokeStatus', jokeStatus);

  if (jokeStatus >= 0) {
    removeFromFavouriteListByIndex(jokeStatus);
    const jokeEl = elJokeListSearch.querySelector(
      `.joke__heart--selected[data-joke-id="${jokeId}"]`
    );
    if (jokeEl) {
      jokeEl.classList.remove('joke__heart--selected');
    }
    // el.target.classList.remove('joke__heart--selected');
  } else {
    addToFavouriteListById(jokeId);
    el.target.classList.add('joke__heart--selected');
  }
  console.log('JOKE_LIST_FAVOURITE', JOKE_LIST_FAVOURITE);
  paintFavouriteJokeList();
}

function isFavouriteJoke(jokeId) {
  for (let i = 0; i < JOKE_LIST_FAVOURITE.length; i++) {
    const joke = JOKE_LIST_FAVOURITE[i];
    if (joke.id === jokeId) {
      return i;
    }
  }

  return -1;
}

function addToFavouriteListById(id) {
  let joke = {};

  for (const iterableJoke of JOKE_LIST) {
    if (iterableJoke.id == id) {
      joke = iterableJoke;
      break;
    }
  }
  addToFavouriteList(joke);
}

function addToFavouriteList(joke) {
  JOKE_LIST_FAVOURITE.push(joke);
  writeFavouriteJokeListToLocalStorage();
}

function removeFromFavouriteListByIndex(jokeIndex) {
  JOKE_LIST_FAVOURITE.splice(jokeIndex, 1);
  writeFavouriteJokeListToLocalStorage();
}

function removeFromFavouriteList(joke) {
  let i = 0;
  for (; i < JOKE_LIST_FAVOURITE.length; i++) {
    if (JOKE_LIST_FAVOURITE[i].id === joke.id) {
      break;
    }
  }
  removeFromFavouriteListByIndex(i);
}

function paintFavouriteJokeList() {
  paintJokeList(JOKE_LIST_FAVOURITE, elJokeListFavourite, true);
}

function writeFavouriteJokeListToLocalStorage() {
  console.log('writeFavouriteJokeListToLocalStorage()');

  localStorage.setItem(
    'favourite_joke_list',
    JSON.stringify(JOKE_LIST_FAVOURITE)
  );
}

function readFavouriteJokeListFromLocalStorage() {
  console.log('readFavouriteJokeListFromLocalStorage()');
  let dataJson = localStorage.getItem('favourite_joke_list');
  if (dataJson == null) {
    JOKE_LIST_FAVOURITE = [];
  } else {
    JOKE_LIST_FAVOURITE = JSON.parse(dataJson);
  }
}

function initFavouriteJokeList() {
  readFavouriteJokeListFromLocalStorage();
  paintFavouriteJokeList();
}
