
var misParrafos = document.getElementsByClassName("mas-vendido");

var colores = ["red", "blue", "green", "orange", "purple"];
// Función para cambiar el color de los párrafos
function cambiarColor() {

  // Itera sobre todos los elementos con la clase "miParrafo"
  for (var i = 0; i < misParrafos.length; i++) {
    // Genera un número aleatorio entre 0 y el número de colores en la lista
    var colorAleatorio = Math.floor(Math.random() * colores.length);

    // Asigna el color aleatorio al estilo de fondo del párrafo actual
    misParrafos[i].style.color = colores[colorAleatorio];
  }
}

// Cambia el color de los párrafos cada 2 segundos
setInterval(cambiarColor, 2000);
