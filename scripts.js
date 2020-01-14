const bakgrunnsLag = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
});

const WGS84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
const UTM33 = "EPSG:25833";

// const baseurl = "http://localhost:12002";

const map = L.map('mapid');
const layerGroupRoute = L.layerGroup().addTo(map);
const layerGroupMarker = L.layerGroup().addTo(map);

var startMarker = null;
var endMarker = null;

// addLayer legger til et kartlag, i dette tilfellet kartdataene som viser verdenskartet.
map.addLayer(bakgrunnsLag);
map.setView([59.129641, 10.224452018737795], 15);
proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs');


function getData(url) {
    console.log('Fetching ' + url);
    fetch(url)
        .then(function (response) {
                return response.json()
        }).then(function (result) {
            result.flatMap(o => o.elementer)
                .flatMap(g => g.geometri.wkt)
                .map(wkt => Terraformer.WKT.parse(wkt))
                .forEach(geojson => {
                    geojson.crs = {
                        'type': 'name',
                        'properties': {
                        'name': 'urn:ogc:def:crs:EPSG::25833'
                        }
                    };
                    L.Proj.geoJson(geojson).addTo(layerGroupRoute);
                });
            if (result.length == 0) alert ("Fant ingen rute!   Forsøk å endre maks_avstand og/eller ramme. ");
        });
}

map.on('click', onMapClick);

$("#setMarkers").click(function (e) {
    event.preventDefault();
    var start = $('input[name="startMarker"]').val();
    var end = $('input[name="endMarker"]').val();
    layerGroupMarker.clearLayers();
    endMarker = null;
    startMarker = null;
    createEndMarker(convertUTM33ToWGS84LatLong(end));
    createStartMarker(convertUTM33ToWGS84LatLong(start));
});



$("#beregn_marker").click(function (e) {
    event.preventDefault();
    clearRoute();
    if (startMarker && endMarker) {
        var start = convertWGS84ToUTM33Coordinates(startMarker.getLatLng());
        var end = convertWGS84ToUTM33Coordinates(endMarker.getLatLng());
        var avstand = $('input[name="maksavstand"]').val();
        var omkrets = $('input[name="omkrets"]').val();
        var myurl = getBaseUrl() + "/beta/vegnett/rute"
            + "?start=" + start[0] + "," + start[1]
            + "&slutt=" + end[0] + "," + end[1]
            + "&maks_avstand=" + avstand
            + "&omkrets=" + omkrets;

        getData(myurl);
    } else {
        alert("Klikk i kartet for å angi start og slutt-merke for å beregne rute!");
    }
});


$("#beregn_geometri").click(function (e) {
    event.preventDefault();
    clearRoute();
    var geometri = $.trim($('#geometri').val());
    var avstand = $('input[name="maksavstand"]').val();

    if (geometri && avstand) {
        var myurl = getBaseUrl() + "/beta/vegnett/rute"
            + "?geometri=" + geometri
            + "&maks_avstand=" + avstand

        getData(myurl);
    } else {
        alert("Geometri må ha verdi!");
    }
});

$("#beregn_lenke").click(function (e) {
    event.preventDefault();
    clearRoute();
    var start = $('input[name="startlenke"]').val();
    var slutt = $('input[name="sluttlenke"]').val();
    var avstand = $('input[name="maksavstand"]').val();

    if (start && slutt) {
        var myurl = getBaseUrl() + "/beta/vegnett/rute"
            + "?start=" + start
            + "&slutt=" + slutt
            + "&maks_avstand=" + avstand;

        getData(myurl);
    } else {
        alert("Du må ha fylt ut startlenke og sluttlenke!");
    }
});

$('#clearRoutes').click(function (e) {
    event.preventDefault();
    layerGroupRoute.clearLayers();
});

$('#clearMarkers').click(function (e) {
    event.preventDefault();
    layerGroupMarker.clearLayers();
    endMarker = null;
    startMarker = null;
});

function clearRoute() {
    if ($('#clearRoute').is(":checked")) {
        layerGroupRoute.clearLayers();
    }
}

function getBaseUrl() {
    return $('#server').val();
}

function createStartMarker(e) {
    startMarker = L.marker(e.latlng,{draggable:true})
        .bindTooltip("Start",{permanent: true, direction: 'right'})
        .addTo(layerGroupMarker);

    $('input[name="startMarker"]').val(convertWGS84ToUTM33Coordinates(e.latlng));

    startMarker.on("drag", function (e) {
        var marker = e.target;
        $('input[name="startMarker"]').val(convertWGS84ToUTM33Coordinates(marker.getLatLng()));
    });
}

function createEndMarker(e) {
    endMarker = L.marker(e.latlng,{draggable:true})
        .bindTooltip("Slutt",{permanent: true, direction: 'right'})
        .addTo(layerGroupMarker);

    $('input[name="endMarker"]').val(convertWGS84ToUTM33Coordinates(e.latlng));

    endMarker.on("drag", function (e) {
        var marker = e.target;
        $('input[name="endMarker"]').val(convertWGS84ToUTM33Coordinates(marker.getLatLng()));
    });
}

function onMapClick(e) {
    if (!startMarker) {
        event.preventDefault();
        createStartMarker(e);
    } else  if (!endMarker) {
        event.preventDefault();
        createEndMarker(e);
    }
}

function convertWGS84ToUTM33Coordinates(latlong) {
    return proj4(WGS84,UTM33,[latlong.lng, latlong.lat]);
}

function convertUTM33ToWGS84LatLong(utm) {
    var xy = utm.split(",");
    var transformed = proj4(UTM33, WGS84, [(parseFloat(xy[0])),(parseFloat(xy[1]))]);
    return  { "latlng" :
            {"lng" : transformed[0], "lat" : transformed[1]}};
}