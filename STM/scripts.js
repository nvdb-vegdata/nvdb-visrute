const BACKGROUND_LAYER = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
});

const WGS84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
const UTM33 = "EPSG:25833";

const MAP = L.map('map');
const LAYERGROUP_ROUTE = L.layerGroup().addTo(MAP);
const LAYERGROUP_MARKER = L.layerGroup().addTo(MAP);

const ROUTE_SERVICEPATH_JSON = "/beta/vegnett/rute";

let startMarker = null;
let endMarker = null;

// addLayer legger til et kartlag, i dette tilfellet kartdataene som viser verdenskartet.
MAP.addLayer(BACKGROUND_LAYER);
MAP.setView([59.132, 10.22], 17);
proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs');


function setURL(briefURL, requestUrlDiv) {
    $(requestUrlDiv).empty();
    $('<a>', {
        text: briefURL,
        href: briefURL,
        target: "_blank"
    }).appendTo($(requestUrlDiv));
}

function getData(urlParams) {
    console.log('Fetching ' + urlParams);

    if (hasValue('#roadsysref')) {
        urlParams += "&vegsystemreferanse=" + $('#roadsysref').val();
    }

    if (hasValue('#roaduserGroup')) {
        urlParams += "&trafikantgruppe=" + $('#roaduserGroup').val();
    }

    if (hasValues('#typeOfRoad')) {
        urlParams += "&typeveg=" + $('#typeOfRoad').val();
    }

    let url = getServerUrl() + ROUTE_SERVICEPATH_JSON + urlParams + "&pretty=true";

    // Get the detailed format
    fetch(url)
        .then(function (response) {
            response.clone().json()

                // Detailed segments drawn in map
                .then(function (result) {
                    result.flatMap(o => o.geometri.wkt)
                        .map(wkt => Terraformer.WKT.parse(wkt))
                        .forEach(geojson => {
                            geojson.crs = {
                                'type': 'name',
                                'properties': {
                                    'name': 'urn:ogc:def:crs:EPSG::25833'
                                }
                            };
                            L.Proj.geoJson(geojson).addTo(LAYERGROUP_ROUTE);
                        });
                    if (result.length == 0) alert("Fant ingen rute!   Forsøk å endre maks_avstand og/eller ramme. ");
                });

            // Detailed segments as text
            response.text()
                .then(function (result) {
                    setURL(url, "#requesturldetailed");
                    $('#detailedFormatText').text(result);
                });
        });

    // Brief segments as text
    let briefURL = url + "&kortform=true";
    fetch(briefURL)
        .then(function (response) {
            return response.text()
                .then(function (result) {
                    setURL(briefURL, "#requesturlbrief");
                    $('#briefFormatText').text(result);
                });
        })
}

MAP.on('click', onMapClick);

$("#detailedFormat").hide();

$("#briefResponseFormat,#detailedResponseFormat").click(function(){
    $("#detailedFormat").toggle();
    $("#briefFormat").toggle();
});

$("#setMarkers").click(function (e) {
    event.preventDefault();
    setMarkers();
});

function setMarkers() {
    let start = $('input[name="startMarker"]').val();
    let end = $('input[name="endMarker"]').val();
    LAYERGROUP_MARKER.clearLayers();
    endMarker = null;
    startMarker = null;
    createEndMarker(convertUTM33ToWGS84LatLong(end));
    createStartMarker(convertUTM33ToWGS84LatLong(start));
}

$("#routeByMarkers").click(function (e) {
    event.preventDefault();
    clearRoute();
    if (startMarker && endMarker) {
        let start = convertWGS84ToUTM33Coordinates(startMarker.getLatLng());
        let end = convertWGS84ToUTM33Coordinates(endMarker.getLatLng());
        let avstand = $('input[name="maksavstand"]').val();
        let omkrets = $('input[name="omkrets"]').val();
        let urlParams =
            "?start=" + start[0] + "," + start[1]
            + "&slutt=" + end[0] + "," + end[1]
            + "&maks_avstand=" + avstand
            + "&omkrets=" + omkrets
            + "&konnekteringslenker=" + isConnectionLinks()
            + "&detaljerte_lenker=" + isDetailedLinks();

        getData(urlParams);
    } else {
        alert("Klikk i kartet for å angi start og slutt-merke for å beregne rute!");
    }
});

function hasValue(id) {
    return $(id).val().trim().length > 0;
}

function hasValues(id) {
    return $(id).val().length > 0;
}

$("#multipletype").click(function(e) {
    let multiple = $("#typeOfRoad").attr("multiple");
    if (multiple == null) {
        $("#typeOfRoad")
            .attr("multiple", "true")
            .attr("size", "6");
    } else {
        $("#typeOfRoad")
            .removeAttr("size")
            .removeAttr("multiple")
    }
});

$("#resetroadref").click(function(e) {
    event.preventDefault();
    $("#roadsysref").val("");
});

$("#routeByGeometry").click(function (e) {
    event.preventDefault();
    clearRoute();
    let geometri = $.trim($('#geometri').val());
    let avstand = $('input[name="maksavstand"]').val();

    if (geometri && avstand) {
        let urlParams =
            "?geometri=" + geometri
            + "&maks_avstand=" + avstand;

        getData(urlParams);
    } else {
        alert("Geometri må ha verdi!");
    }
});

$("#routeByLinks").click(function (e) {
    event.preventDefault();
    clearRoute();
    let start = $('input[name="startlenke"]').val();
    let slutt = $('input[name="sluttlenke"]').val();
    let avstand = $('input[name="maksavstand"]').val();

    if (start && slutt) {
        let urlParams =
            "?start=" + start
            + "&slutt=" + slutt
            + "&maks_avstand=" + avstand;

        getData(urlParams);
    } else {
        alert("Du må ha fylt ut startlenke og sluttlenke!");
    }
});

$('#clearRoutes').click(function (e) {
    event.preventDefault();
    LAYERGROUP_ROUTE.clearLayers();
});

$('#showMarkerPos').click(function() {
    setMarkers();
});

$("#POS_UTM33,#POS_WGS84").change(function() {
    setMarkers();
});

$('#clearMarkers').click(function (e) {
    event.preventDefault();
    LAYERGROUP_MARKER.clearLayers();
    endMarker = null;
    startMarker = null;
});

function clearRoute() {
    if ($('#clearRoute').is(":checked")) {
        LAYERGROUP_ROUTE.clearLayers();
    }
}

function showPos(){
    return $('#showMarkerPos').is(':checked');
}

function showLatLongWGS84() {
    return $('#POS_WGS84').is(':checked');
}

function showLatLongUTM33() {
    return $('#POS_UTM33').is(':checked');
}
function isConnectionLinks() {
    return $('#connectionLinks').is(':checked');
}

function isDetailedLinks() {
    return $('#detailedLinks').is(':checked');
}

function tooltipLatLng(latlong) {
    if (showPos()) {
        if (showLatLongWGS84()) return " (" + latlong.lat + ", " + latlong.lng + ")";
        if (showLatLongUTM33()) return " (" + convertWGS84ToUTM33Coordinates(latlong) + ")";
    }
    return "";
}

function getServerUrl() {
    return $('#server').val();
}

function createStartMarker(e) {
    startMarker = L.marker(e.latlng,{draggable:true})
        .bindTooltip("Start" + tooltipLatLng(e.latlng), {permanent: true, direction: 'right'})
        .addTo(LAYERGROUP_MARKER);

    $('input[name="startMarker"]').val(convertWGS84ToUTM33Coordinates(e.latlng));

    startMarker.on("drag", function (e) {
        let marker = e.target;
        marker.bindTooltip("Start" + tooltipLatLng(marker.getLatLng()));
        $('input[name="startMarker"]').val(convertWGS84ToUTM33Coordinates(marker.getLatLng()));
    });
}

function createEndMarker(e) {
    endMarker = L.marker(e.latlng,{draggable:true})
        .bindTooltip("Slutt" + tooltipLatLng(e.latlng),{permanent: true, direction: 'right'})
        .addTo(LAYERGROUP_MARKER);

    $('input[name="endMarker"]').val(convertWGS84ToUTM33Coordinates(e.latlng));

    endMarker.on("drag", function (e) {
        let marker = e.target;
        marker.bindTooltip("Slutt" + tooltipLatLng(marker.getLatLng()));
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
    let xy = utm.split(",");
    let transformed = proj4(UTM33, WGS84, [(parseFloat(xy[0])),(parseFloat(xy[1]))]);
    return  {"latlng" :
            {"lat" : transformed[1], "lng" : transformed[0]}};
}