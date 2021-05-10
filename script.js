var map;
var vuelos = {};
var lugar = {};
var colores = {};
var marcadores = {};
var posiciones= {};
var path = "";
var infowindow;

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


function createMap() {
  const socket = io('wss://tarea-3-websocket.2021-1.tallerdeintegracion.cl', {
    path: '/flights'
  });

  socket.emit("FLIGHTS");
  socket.on("FLIGHTS", Vuelos);
  socket.on("POSITION", Posiciones);
  var options = { center: { lat: -20.654, lng: -10.383 }, zoom: 2 };
  map = new google.maps.Map(document.getElementById("map"), options);
  infowindow = new google.maps.InfoWindow();
}

function Posiciones(data) {
  moveMarker(marcadores[data["code"]], data["position"]);
}

function Vuelos(data) {
  data.forEach(function(element) {
    if (vuelos.hasOwnProperty(element["code"])) {
    } else {
      var origin = element["origin"];
      var destination = element["destination"];
      var coordenadas = [
        { lat: origin[0], lng: origin[1] },
        { lat: destination[0], lng: destination[1] }
      ];
      colores[element["code"]] = getRandomColor();

      var ruta = new google.maps.Polyline({
        path: coordenadas,
        geodesic: true,
        strokeColor: colores[element["code"]],
        strokeOpacity: 0.2,
        strokeWeight: 4
      });
      ruta.setMap(map);
      vuelos[element["code"]] = 1;

      var infovuelo =
        "<h6>Codigo: " +
        element["code"] +
        "</h6>" +
        "<h6>\nAerolinea: " +
        element["airline"] +
        "</h6>" +
        "<h6>\nOrigen: " +
        element["origin"] +
        "</h6>" +
        "<h6>\nDestino: " +
        element["destination"] +
        "</h6>" +
        "<h6>\nAvion:  " +
        element["plane"] +
        "</h6>" +
        "<h6>\nAsientos: " +
        element["seats"] +
        "</h6>";

      var numero = (Object.keys(vuelos).length % 2) + 1;
      var image = path + "plane" + numero.toString() + ".png";
      var marcador = new google.maps.Marker({
        position: { lat: origin[0], lng: origin[1] },
        map: map,
        icon: image
      });
      marcadores[element["code"]] = marcador;

      google.maps.event.addListener(marcador, "mouseover", function() {
        infowindow.setContent(infovuelo);
        infowindow.open(map, this);
      });
    }
  });
}


function moveMarker(Marker, position) {
  if (Marker) {
    Marker.setPosition(new google.maps.LatLng(position[0], position[1]));
  }
}