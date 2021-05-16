var map;
var vuelos = {};
var lugar = {};
var colores = {};
var marcadores = {};
var posiciones= {};
var path = "";
var infowindow;
var socket;

function createMap() {
  socket = io('wss://tarea-3-websocket.2021-1.tallerdeintegracion.cl', {
    path: '/flights'
  });

  socket.emit("FLIGHTS");
  //socket.emit("CHAT", {"name": "nombre", "message": "mensaje"});
  socket.on("FLIGHTS", Vuelos);
  socket.on("POSITION", Posiciones);
  socket.on("CHAT", Chat);
  
    
  var options = { center: { lat: -20.654, lng: -10.383 }, zoom: 2 };
  map = new google.maps.Map(document.getElementById("map"), options);
  infowindow = new google.maps.InfoWindow();
}

function Posiciones(data) {
    if (posiciones.hasOwnProperty(data["code"])) {
    var trayecto = [posiciones[data["code"]], { lat: data["position"][0], lng: data["position"][1] } ];
    var linea_trayecto = new google.maps.Polyline({
      path: trayecto,
      geodesic: true,
      strokeColor: colores[data["code"]],
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    linea_trayecto.setMap(map);
    posiciones[data["code"]] = {lat: data["position"][0], lng: data["position"][1]};
    
    moveMarker(marcadores[data["code"]], data["position"]);
  } 
  else
  {
    posiciones[data["code"]] = {lat: data["position"][0], lng: data["position"][1]};
    moveMarker(marcadores[data["code"]], data["position"]);
  }
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
        strokeOpacity: 0.5,
        strokeWeight: 4
      });
      
      var centre_o = new google.maps.Circle({
        strokeColor: colores[element["code"]],
        strokeWeight: 2,
        fillColor: colores[element["code"]],
        map,
        center: { lat: origin[0], lng: origin[1] },
        radius: 3000,
      });

      var centre_d = new google.maps.Circle({
        strokeColor: colores[element["code"]],
        strokeWeight: 2,
        fillColor: colores[element["code"]],
        map,
        center: { lat: destination[0], lng: destination[1] },
        radius: 3000,
      });
      
      centre_o.setMap(map);
      centre_d.setMap(map);
      ruta.setMap(map);
      vuelos[element["code"]] = 1;

      var infovuelo =
        "<h6>Codigo: " + element["code"] + "</h6>" +
        "<h6>\nAerolinea: " + element["airline"] + "</h6>" +
        "<h6>\nOrigen: " + element["origin"] + "</h6>" +
        "<h6>\nDestino: " + element["destination"] + "</h6>" +
        "<h6>\nAvion:  " + element["plane"] + "</h6>" +
        "<h6>\nAsientos: " + element["seats"] + "</h6>";

      var pasajeros = "<h6>Pasajeros: \n </h6> " ;

      element["passengers"].forEach(function(pasajero)
      {
        pasajeros = pasajeros + "<h6>" + pasajero["name"] + ", "+ pasajero["age"] +   "\n</h6>";
      });

      var infototal = infovuelo + pasajeros;
      var numero = (Object.keys(vuelos).length % 2) + 1;
      var image = path + "plane" + numero.toString() + ".png";
      var marcador = new google.maps.Marker({
        position: { lat: origin[0], lng: origin[1] },
        map: map,
        icon: image
      });
      marcadores[element["code"]] = marcador;

      google.maps.event.addListener(marcador, "mouseover", function() {
        infowindow.setContent(infototal);
        infowindow.open(map, this);
      });
    }
  });
}

function Chat(data) {
  let ele = document.getElementById('texto_chat');
  var date = new Date( data["date"]);
  ele.innerHTML += "<h5>" +data["name"] + " " +"(" + date.toGMTString() + "): \n" + data["message"]+ "\n <h5>" ;
}

function moveMarker(Marker, position) {
  if (Marker) {
    Marker.setPosition(new google.maps.LatLng(position[0], position[1]));
  }
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function submitData(){
  var nickname = document.getElementById("nname").value;
  var mensaje = document.getElementById("mensaje").value;
  socket.emit("CHAT", {"name": nickname, "message": mensaje});
  document.getElementById("mensaje").value ="";
}

//codigo referenciado de: https://github.com/dalliende/MapsTarea4