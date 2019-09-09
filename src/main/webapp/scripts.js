const bakgrunnsLag = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
});

const baseurl = "http://localhost:12002";
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
        if (result.length == 0) alert ("Ingen treff!   Forsøk å snu start- og slutt-markør!");
    });
}

function onMapClick(e) {
    if (!startMarker) {
        startMarker = L.marker(e.latlng,{draggable:true})
            .bindTooltip("Start",{permanent: true, direction: 'right'})
            .addTo(layerGroupMarker);
    } else if (!endMarker) {
        endMarker = L.marker(e.latlng,{draggable:true})
            .bindTooltip("Slutt",{permanent: true, direction: 'right'})
            .addTo(layerGroupMarker);
    }
}

map.on('click', onMapClick);

$("#beregn_marker").click(function () {
    event.preventDefault();
    if (startMarker && endMarker) {
        var start = convert(startMarker.getLatLng());
        var end = convert(endMarker.getLatLng());
        var avstand = $('input[name="maksavstand"]').val();
        var myurl = baseurl + "/vegnett/rute"
            + "?start=" + start[0] + "," + start[1]
            + "&slutt=" + end[0] + "," + end[1]
            + "&maks_avstand=" + avstand;

        getData(myurl);
    } else {
        alert("Klikk i kartet for å angi start og slutt-merke for å beregne rute!");
    }
});

$("#beregn_lenke").click(function () {
    event.preventDefault();
    var start = $('input[name="startlenke"]').val();
    var slutt = $('input[name="sluttlenke"]').val();

    if (start && slutt) {
        var myurl = baseurl + "/vegnett/rute"
            + "?start=" + start
            + "&slutt=" + slutt;

        getData(myurl);
    } else {
        alert("Du må ha fylt ut startlenke og sluttlenke!");
    }
});

$('#tom_ruter').click(function () {
    event.preventDefault();
    layerGroupRoute.clearLayers();
});

$('#tom_marker').click(function () {
    event.preventDefault();
    layerGroupMarker.clearLayers();
    endMarker = null;
    startMarker = null;
});

function convert(latlong) {
    var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
    var utm = "EPSG:25833";
    var result =  proj4(wgs84,utm,[latlong.lng, latlong.lat]);
    return result;
}
