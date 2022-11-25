import Notiflix from "notiflix";
import axios from "axios";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const searchFormRef = document.querySelector("#search-form");
const loadMoreBtnRef = document.querySelector(".load-more");
const galleryRef = document.querySelector(".gallery");

const URL = 'https://pixabay.com/api/'
const KEY = '31353184-8776e57a10ac5c3d03bd92626';
const perPage = 40;
let page = 1;
let query = '';

const newLightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
});

async function axiosGetData() {

    axios.defaults.baseURL = URL;
    axios.defaults.params = {
      key: KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: page,
      per_page: perPage,
    };
    return await axios.get();
}

searchFormRef.addEventListener("submit", event => {
    event.preventDefault();
    galleryRef.innerHTML = '';
    query = event.currentTarget.searchQuery.value.trim();

    if (query === '') {
        Notiflix.Notify.failure('Please enter a search query');
        return;
    }

    axiosGetData().then(response => {

        if (response.data.hits.length === 0) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            return;
        } 

        createGallery(response.data.hits);
        // loadMoreBtnRef.classList.remove("is-hidden");
        Notiflix.Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
})
    .catch(error => console.log(error));
});

function createGallery(array) {
    const render = array
        .map(({webformatURL, largeImageURL, tags, likes, views, comments, downloads,}) => `
            <a href="${largeImageURL}">
            <div class="photo-card">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
                <p class="info-item">
                <b>Likes</b>${likes}
                </p>
                <p class="info-item">
                <b>Views</b>${views}
                </p>
                <p class="info-item">
                <b>Comments</b>${comments}
                </p>
                <p class="info-item">
                <b>Downloads</b>${downloads}
                </p>
            </div>
            </div>
            </a>
            `)
        .join('');
    galleryRef.insertAdjacentHTML('beforeend', render);
    newLightbox.refresh();
  }

loadMoreBtnRef.addEventListener("click", () => {
    page += 1;

    axiosGetData().then(response => {
        const totalPages = response.data.totalHits / perPage;
        createGallery(response.data.hits);

        if (page > totalPages) {
            loadMoreBtnRef.classList.add("is-hidden");
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.")
        }

    });

});

window.addEventListener("scroll", () => {

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollHeight - clientHeight === scrollTop) {
        // loadMoreBtnRef.classList.add("is-hidden");
        loadMoreBtnRef.click();
    }

});

