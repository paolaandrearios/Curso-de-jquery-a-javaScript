
(async function load() {
  
  async function getData(url) {
    const response = await fetch(url);
    const data = await response.json()
    if(data.data.movie_count > 0){
      return data;
    }
    throw new Error('No se encontró ningún resultado');
  }
  const $form = document.getElementById('form');
  const $home = document.getElementById('home');
    
   function setAttributes($element,attributes){
     for (const attribute in attributes){
       $element.setAttribute(attribute, attributes[attribute]);
      }
    }
    
    const BASE_API = 'https://yts.mx/api/v2/';
    
    function featuringTemplate(peli) {
      return (
      `<div class="featuring">
        <div class="featuring-image">
          <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">Pelicula encontrada</p>
          <p class="featuring-album">${peli.title}</p>
        </div>
      </div>`
      )
    }

    $form.addEventListener('submit', async (event) => {
      event.preventDefault();
      $home.classList.add('search-active')
      const $loader = document.createElement('img');
      setAttributes($loader, {
        src:'src/images/loader.gif',
        height:50,
        width:50,
      })
      $featuringContainer.append($loader);

      const data = new FormData($form);
      try {
        const {
          data: {
            movies: pelis
          }
        } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`)
        const HTMLString = featuringTemplate(pelis[0]);
        $featuringContainer.innerHTML = HTMLString;
      } catch(error) {
        alert(error.message);
        $loader.remove();
        $home.classList.remove('search-active');
      }
    })  
 
    function videoItemTemplate(movie, category) {
      return (
        `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category=${category}>
          <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
          </div>
          <h4 class="primaryPlaylistItem-title">
            ${movie.title}
          </h4>
         </div>`
      )
    }

    function createTemplate(HTMLString) {
      const html = document.implementation.createHTMLDocument();
      html.body.innerHTML = HTMLString;
      return html.body.children[0];
    }
   
    function addEventClick($element){
      $element.addEventListener('click', () => {
      showModal($element);
      })
    }
    
    function renderMovieList(list, $container, category) {
      $container.children[0].remove();
      list.forEach((movie) =>{
        const HTMLString = videoItemTemplate(movie, category);
        const movieElement = createTemplate(HTMLString);
        $container.append(movieElement);
        const image = movieElement.querySelector('img');
        image.addEventListener('load',(event) => {
          image.classList.add('fadeIn');
        })
        addEventClick(movieElement);
      })
    }

    async function cacheExist(category) {
      const listName = `${category}List`;
      const cacheList = window.localStorage.getItem(listName);
      if (cacheList){
        return JSON.parse(cacheList);
      }
      const {data: { movies:data} } = await getData(`${BASE_API}list_movies.json?genre=${category}`);
      window.localStorage.setItem(listName, JSON.stringify(data))
      return data;
    }
    
    const actionList = await cacheExist('action');
    // window.localStorage.setItem('actionList', JSON.stringify(actionList))
    const $actionContainer = document.getElementById('action');
    renderMovieList(actionList , $actionContainer, 'action');
    
    const dramaList = await cacheExist('drama');
    const $dramaContainer = document.getElementById('drama');
    renderMovieList(dramaList , $dramaContainer, 'drama' );
    
    const animationList = await cacheExist('animation');
    const $animationContainer = document.getElementById('animation');
    renderMovieList(animationList , $animationContainer, 'animation');

    const $featuringContainer = document.getElementById('featuring');

    const $modal = document.getElementById('modal');
    const $overlay = document.getElementById('overlay');
    const $hideModal = document.getElementById('hide-modal');
    
    const $modalTitle = $modal.querySelector('h1');
    const $modalImage = $modal.querySelector('img');
    const $modalDescription = $modal.querySelector('p');

    function findById(list, id){
      return list.find(movie => movie.id === parseInt(id,10))
    }
    function findMovie(id, category){
      switch(category) {
        case 'action': {
          return findById(actionList, id)
        }
        case 'drama' : {
          return findById(dramaList, id)
        }
        default: {
          return findById(animationList, id)
        }
      }
    }
    
      
    function showModal($element){
      $overlay.classList.add('active');
      $modal.style.animation='modalIn .8s forwards';
      const id = $element.dataset.id;
      const category = $element.dataset.category;
      const data = findMovie(id,category);

      $modalTitle.textContent = data.title;
      $modalImage.setAttribute('src', data.medium_cover_image);
      $modalDescription.textContent = data.description_full;
    }
    
    $hideModal.addEventListener('click', hideModal);
    function hideModal(){
      $overlay.classList.remove('active');
      $modal.style.animation='modalOut .8s forwards';
    }
  // ______________________________________________________________________________________
  
  // Lista de películas
  
    const myPlayListContainer = document.getElementsByClassName('myPlaylist')[0];
    
    function myPlayListTemplate (title) {
      return (
       `<li class="myPlaylist-item">
          <a href="#">
            <span>
              ${title}
            </span>
          </a>
        </li>`
      )
    }
    
     function renderMoviePlayList(movies,$container) {
          movies.forEach(movie => {
          const {title} = movie;
          const HTMLString = myPlayListTemplate(title);
          const moviePLayListElement = createTemplate(HTMLString);
          
          $container.append(moviePLayListElement);          
        })
    }

    const { data: { movies: moviesPlaylist } } = await getData(`${BASE_API}list_movies.json?minimum_rating>7&minimum_rating<9&sort_by=rating&limit=9`);
    renderMoviePlayList(moviesPlaylist, myPlayListContainer);

    // __________________________________________________________________
      // PLAYLIST AMIGOS 

    const urlFriends = "https://randomuser.me/api/?inc=name,picture&results=9";
    
    async function getDataFriends(urlFriends) {
        const responseUser = await fetch(urlFriends);
        const dataUser = await responseUser.json();
        return dataUser;
      }
    
      const {results:friends} = await getDataFriends('https://randomuser.me/api/?inc=name,picture&results=9');

      const $playlistFriends = document.getElementsByClassName('playlistFriends')[0];

      function friendsTemplate(friend) {
        return (
      ` <li class="playlistFriends-item">
          <a href="#">
            <img src='${friend.picture.thumbnail}'/>
            <span>
              ${friend.name.first} ${friend.name.last}
            </span>
          </a>
        </li> `
        )
      }
   

      function renderListFriends(friends, $friendsContainer) {
        friends.forEach(friend => {
          HTMLStringFriend = friendsTemplate(friend);
          html = document.implementation.createHTMLDocument();
          html.body.innerHTML = HTMLStringFriend;       
          $friendsContainer.append(html.body.children[0]);
        })
      }
      

      renderListFriends(friends, $playlistFriends);

})()


// ______________________________________________

// NOTAS


/*Promesas

Promesas
Una promesa es un objeto que representa la terminación o el fracaso eventual de una operación asíncrona.

//Crear una promesa
const getUser = new Promise(function(todoBien, todoMal) {
  //llamar a un API
  todoBien("todo bien");
})

//Consumir una promesa
getUser
  .then(function(msn) { 
    //maneja cuando la promesa funciona correctamente.
  })
  .catch(function(msn) {
    //maneja cuando hay un error en la promesa.
  })

//Consumir varias promesas a la vez.
//El then se ejecutan cuando terminen todas las promesas.
//El catch se ejecuta en el primer error.
Promise.all([
  promesa1,
  promesa2
])
.then(function() {})
.catch(function() {})

//Se ejecuta el then de la promesa que termine primero.
Promise.race([
  promesa1,
  promesa2
])
.then(function() {})
.catch(function() {})
Timers
setInterval() se ejecuta cada cierto tiempo.
setTimeout() se ejecuta una sola vez luego de un periodo de tiempo.
.*/
// ____________________________________________________________

/* Tutorial de Ajax en jQuery y Javascript
Una característica muy solicitada en cualquier sitio dinámico es solicitar datos a un servidor, denominado API.

Para hacer esto tenemos dos opciones:

$.ajax con jQuery
fetch con Vanilla JS
Ajax - jQuery

Ajax recibe dos parámetros los cuales son la url de la API y un objeto donde pondrás la configuración que se usara para realizar la petición. En la configuración se añaden dos funciones para manejar cuando la petición se realizo correctamente y cuando falla.

Referencia: http://api.jquery.com/jquery.ajax/

$.ajax('htpps://randomuser.me/api/', {
  method: 'GET',
  success: function (data){
    console.log(data)
  },
  error: function (error) {
    console.log(error)
  }
})

fetch - JavaScript

JavaScript internamente cuenta con una función llamada fetch que también realiza peticiones a una API.
Al igual que Ajax necesita dos parámetros, una url y una configuración, pero si solo le mandas la url fetch usará una configuración por defecto donde el método HTTP será GET.
fetch te regresa una promesa, esa promesa al resolverse te da los datos de respuesta y tiene un método llamado json() que te regresa otra promesa con los datos en formato JSON.

fetch('https://randomuser.me/api/')
.then(res => res.json())
.then(data => console.log(data.results[0].name.first))
.catch(error => console.log(error))

fetch('https://randomuser.me/api/')
  // A su vez tenemos esos datos que son la respuesta 
  .then(function(response) {
      // console.log(response);
      return response.json()
  })
  .then(function(user) {
    console.log('user', user.results[0].email)
  })
  // También debemos Validar nuestra respuesta si algo falla
  .catch(function(err) {
    console.log(`lo siento, algo fallo :(`)
  })


*/

/* Funciones asíncronas
Una función asíncrona va a ser como una función normal, pero poniendo código asíncrono de forma que sea más fácil de leer de forma síncrona.

Para declarar una función asíncrona se usa async / await:

async: declara quye una función es asíncrona.
await: indica que se debe de terminar con el fragmento de código para continuar con la ejecución de la función.
async function load() {
  const response = await fetch("url") 
}*/

// -----------------------------------------------------------------------------------------------
/* Selectores
Los selectores nos permites seleccionar un elemento del DOM con el fin de poder manipularlos.

Por convención, las variables que son elementos del DOM comienzan con una $.

jQuery

const $home = $(".home") //Elemento con la clase home
const $home = $("#home") //Elemento con el id home

JavaScript

//Retorna un elemento con el id home
document.getElementById("home")

//Retorna una lista de elementos con la clase home
document.getElementsByClassname("home")

//Retorna una lista de elementos con el tag div
document.getElementsByTagName("div")

//Devuelve el primer elemento que coincida con el query de búsqueda.
document.querySelector("div .home #modal")

//Devuelve todos los elementos que coincidan con el query de búsqueda.
document.querySelectorAll("div .home #modal")*/

// ------------------------------------------------------------------------

/*Templates
jQuery

En jQuery se tiene que poner todo el html dentro de una cadena de texto.

function videoItemTemplate(src, title) {
  return (
    '<div class="primaryPlaylistItem">' +
      '<div class="primaryPlaylistItem-image">' +
        '<img src="' + src + '">' +
      '</div>' +
      '<h4 class="primaryPlaylistItem-title">' +
        title +
      '</h4>' +
    '</div>'
  )
}
JavaScript

Se usa una característica de ES6 que se llama template literals.

function videoItemTemplate(src, title) {
  return (
    `<div class="primaryPlaylistItem">
      <div class="primaryPlaylistItem-image">
        <img src="${src}">
      </div>
      <h4 class="primaryPlaylistItem-title">
        ${title}
      </h4>
    </div>`
  )
}*/

// -----------------------------------------------------------------------------

/*
Usando Templates
La plantilla no puede puede ser llamada de frente puesto que en el html se mostraría como texto. Primero se hace una transformación de la plantilla para recién agregarla al contenedor que se desee.

function titleTemplate(title) {
  return (
    `<h1>${title}</h1>`
  )
}

//se trae la plantilla y se guarda en una variable.
const HTMLString = titleTemplate(movie);
//se crea un documento html vacío
const html = document.implementation.createHTMLDocument();
//se agrega la plantilla al innerHTML del documento html 
//esto hace que la plantilla en texto se convierta a elementos DOM
html.body.innerHTML = HTMLString;
//se agrega el primer hijo (que es donde se encuentra la plantilla) al contenedor donde se quiere agregar la plantilla
$actionContainer.append(html.body.children[0]);
*/
// -------------------------------------------------------------------------------

/*
Eventos
Toda aplicación web necesita lidiar con interacciones del usuario, desde un click hasta arrastrar algún elemento, estas interacciones son escuchadas por el navegador mediante algo llamado eventos. Existen muchos tipos de eventos, el más común es el evento de click.
En esta clase vamos a trabajar con el evento click y submit.
Para que un elemento HTML pueda escuchar algún evento debemos usar el método addEventListener. Este método recibe dos parámetros, el nombre del evento que va a escuchar y la función que se va a ejecutar al momento de que se accione el evento.
La página se recarga al momento de ejecutarse el evento submit, para evitar esto debemos quitarle la acción por defecto que viene en submit usando el método event.preventDefault().

Eventos
Son una forma de notificar a la aplicación cuando algo interesante ha sucedido.

jQuery

$("div").on("click", function(event) {

})
JavaScript

const $element = document.getElementById("element");
$element.addEventListener("click", function(event) {

})
Nota: cuando se activa el evento submit, el browser de refresca por defecto. Para evitar esto se usa event.preventDefault().

Para ver la lista de eventos:
http://developer.mozilla.org/en-US/docs/Web/Events */

// --------------------------------------------------------------------------------------
/* Clases y estilos CSS
Clases

//agrega una clase
$element.classList.add("clase");

//remueve una clase
$element.classList.remove("clase");

//intercambia entre agregar y remover una clase
$element.classList.toggle("clase");
Estilos Inline

$modal.style.animation = "modalOut .8s forwards";

Truquitos con el Chrome Dev Tools

$0 para coger al elemento seleccionado.*/

// ----------------------------------------------------------------------------------------------------------------
/*
Creación de elementos
const $loader = document.createElement("img");
Asignación de Atributos
jQuery

$("#element").attr({
  src: "",
  height: ""
})
JavaScript

const $element = document.getElementById("element");

//setear el atributo en un elemento DOM
$element.setAttribute("src", "img/foto.png");

//obtener un atributo de un elemento DOM
const src = $element.setAttribute("src")
También se puede crear una función para asignar múltiples atributos a un elemento DOM.

function setAttributes($element, attributes) {
  for(const attribute in attributes) {
    $element.setAttribute(attribute, attributes[attribute]);
  }
}

Formularios
FormData() es una interfaz que te permite obtener los valores de un formulario.

//FormData va a abstraerr todos los valores de los elementos del formulario que cuenten con un atributo 'name' asignado y los va a setear en un objeto de tipo FormData.
const data = new FormData($form);

//retorna el valor del elemento con el atributo name="nombre"
data.get("nombre");

//setea el valor avengers en la key pelicula 
data.set("pelicula", "avengers");

----------------------------------------------------------------------------------------
FORMULARIOS

Formularios
FormData() es una interfaz que te permite obtener los valores de un formulario.

//FormData va a abstraerr todos los valores de los elementos del formulario que cuenten con un atributo 'name' asignado y los va a setear en un objeto de tipo FormData.
const data = new FormData($form);

//retorna el valor del elemento con el atributo name="nombre"
data.get("nombre");

//setea el valor avengers en la key pelicula 
data.set("pelicula", "avengers");
-----------------------------------------------------------------

Desestructuración de objetos
Destructuring assignment permite entrar a un objeto o lista y poder sacar un dato para asignarlo a otra variable.

//el fetch devuelve una promesa con la siguiente estructura: promesa.data.movies
//con el destructuring assignmen estamos creando una variable que se llama pelis y solo contiene la información de movies.
const { 
  data: {
    movies: pelis
  }
} = await fetch(`api_url`); 

//Lo anterior sería igual a esto:
const response = await fetch(`api_url`);
const pelis = response.data.movies;
--------------------------------------------------------------------------

Dataset
Dataset permite acceder a un objeto con todos los atributos data de un elemento DOM.

<div id="element" data-id="10" data-category="action">
</div>
const $element = document.getElementById("element");

//guarda el valor de data-id
const id = $element.dataset.id;
//guarda el valor de data-category
const category = $element.dataset.category;
Transformar tipos de datos
Cambiar un string a entero

//parseInt("número", base)
let n = parseInt("500", 10)
-------------------------------------------------------------------------------------------------------

Manejo de errores
El manejo de errores se hace con un bloque try/catch. Se intenta ejecutar un bloque de instrucciones (try) y se especifica una respuesta en caso suceda un error (catch).

try {
  //codigo a evaluar
}
catch(error) {
  //código por si sucede un error
  alert(error.message);
}
Se puede crear un error customizado con Error().
Se puede lanzar un error con throw.
throw new Error('No se encontró ningún resultado');

----------------------------------------------------------------------------------------------------------
Guardar datos
localStorage permite almacenar datos sin tiempo de expiración
sessionStorage permite almacenar datos. Estos datos se van a borrar cuando se termine la sessión del navegador
En local storage solo se puede guardar texto plano. No se pueden guardar objetos.

//eliminar los datos
window.localStorage.clear();

//setear un valor
window.localStorage.setItem("nombre", "Toshi");

//setear un objeto
//primero se tiene que convertir el objeto en un string
window.localStorage.setItem("objeto", JSON.stringify({"peli": "wonder woman"});

//obtener el valor de un key
window.localStorage.getItem("nombre");

//obtener el valor de un texto objeto y convertirlo a objeto
JSON.parse(window.localStorage.getItem("objeto"));

*/
// -------------------------------------------------------------------------------------------------------
