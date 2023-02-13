import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '33555589-7466b1bd2f6ce55c871b4b965';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', loadMore);

let page = 1;
let itemToSearch = '';
let per_page = 40;

async function getPictures(request) {
  const configs = {
    baseURL: BASE_URL,

    params: {
      key: API_KEY,
      q: `${request}`,
      image_type: 'photo',
      safesearch: 'true',
      orientation: 'horizontal',
      page,
      per_page,
    },
  };

  const result = await axios(configs);
  if (result.data.hits.length === 0) {
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  // .catch(error =>
  //   Notiflix.Notify.failure(`Sorry, some ${error.message} occurred`)
  // );

  return result.data;
}

function onSearch(e) {
  e.preventDefault();
  loadMoreBtn.classList.add('hidden');
  gallery.innerHTML = '';
  page = 1;

  itemToSearch = e.target.elements.searchQuery.value;
  getPictures(itemToSearch).then(renderCards);
  form.reset();
}

function renderCards(searchResult) {
  const totalPages = Math.ceil(searchResult.totalHits / per_page);
  if (page === 1) {
    Notiflix.Notify.success(
      `Hooray! We found ${searchResult.totalHits} images.`
    );
  }

  createMarkup(searchResult);
  loadBtnControl(totalPages);
  smoothScroll();

  return new SimpleLightbox('.gallery a');
}

function createMarkup(data) {
  const markup = data.hits.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      return `<div class="photo-card">
      <a href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags} width="50" height="50" loading="lazy" /> 
        <div class="info">
          <p class="info-item">
            <b>Likes: ${likes}</b>
          </p>
          <p class="info-item">
            <b>Views: ${views}</b>
          </p>
          <p class="info-item">
            <b>Comments: ${comments}</b>
          </p>
          <p class="info-item">
            <b>Downloads: ${downloads}</b>
          </p>
        </div>
      </a>    
      </div>`;
    }
  );

  gallery.insertAdjacentHTML('beforeend', markup.join(''));
}

function loadBtnControl(totalPages) {
  if (page !== totalPages) {
    loadMoreBtn.classList.remove('hidden');
  }
  if (page === totalPages) {
    loadMoreBtn.classList.add('hidden');
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function loadMore() {
  page += 1;
  getPictures(itemToSearch).then(renderCards).refresh;
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
