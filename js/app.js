const API_KEY = "d0337c4902614b91b950a7f4c4f81a6e";
const country = "us";
const main = document.querySelector('main');
const sourceSelector = document.querySelector('#sourceSelector');
const defaultCountry = "us";
let results = [];


window.addEventListener('load', async e => {
    await getTopHeadlineByCountry();
    updateNews();

    await updateSource();
    sourceSelector.value = defaultCountry;

    sourceSelector.addEventListener('change', e => {
        alert(e.target.value);
        updateNews(e.target.value);
    });
    createDB(results);
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../service-worker.js')
            .then(function(registration) {
                console.log("Registration successful in scope:", registration.scope);
            }).catch(function(error) {
                console.log("service worker registration failed,error:", error);
            });
    }
});
async function getTopHeadlineByCountry(query = country) {
    const res = await fetch(`https://newsapi.org/v2/top-headlines?country=${query}&apiKey=${API_KEY}`);
    const result = await res.json();
    results = result.articles;
    console.log(results);
}

async function updateNews(source = defaultCountry) {

    const res = await fetch(`https://newsapi.org/v2/sources?language=en&country=${source}&apiKey=${API_KEY}`)
    const json = await res.json();
    console.log(json);
    main.innerHTML = json.sources.map(createArticle).join('\n');
}

async function updateSource(params) {
    const res = await fetch(`https://newsapi.org/v2/sources?apiKey=${API_KEY}`);
    const json = await res.json();
    sourceSelector.innerHTML = json.sources.map(src => `<option value="${src.country}">${src.country}</option>`).join('\n');
}


function createArticle(article) {
    return `
        <div class="article">
        <a href="${article.url}" target="_blank">
          <h2>${article.name}</h2>
          
          <p>${article.description}</p>
        </a>
        </div>`;
}
// Fix in the generated post
function loadPosts(posts) {
    wrapper.innerHTML = posts.map(post => `
  <div class="col s12 m7">
    <div class="card">
      <div class="card-image">
        <img src="${post.urlToImage}">
        <i class="small material-icons right" id="fav-icon" style="padding: 10px; cursor: pointer;">favorite</i>
        <p class="btn-flat disabled" id="post-detail">${post.source.name}</p><br>
        <p class="btn-flat disabled" id="post-detail">${formattingTime(post.publishedAt)}</p>
      </div>
      <a href="${post.url}">
        <div class="card-stacked">
          <div class="card-content">
            <h5>${post.title}</h5>
            <p>${post.description}</p>
          </div>
        </div>
      </a>
    </div>
  </div>`).join("");
}

function createDB(result) {
    var request = openDb();
    request.onupgradeneeded = function(e) {
        var db = e.target.result;
        var objectStore = db.createObjectStore("headline", { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex("author", "author", { unique: false });
        objectStore.createIndex("title", "title", { unique: false });
        objectStore.createIndex("source", "source", { unique: false });
        objectStore.createIndex("description", "description", { unique: false });
        objectStore.transaction.oncomplete = function(e) {
            var store = db.transaction(["headline"], "readwrite").objectStore("headline");

            for (var i = 0; i < results.length; i++) {
                store.add(results[i]);
            }

        }

    }

    request.onsuccess = function(e) {
        console.log("success");
    }
};

function openDb() {
    if (window.indexedDB) {
        var request = indexedDB.open("headline", 1);

        request.onerror = function(e) {
            console.log(e);
        }

        return request;
    };
}