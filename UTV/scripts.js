const BACKGROUND_LAYER = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 22,
    maxNativeZoom: 19,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
});

const WGS84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
const UTM33 = "EPSG:25833";
const ROUTE_SERVICEPATH_JSON = "/beta/vegnett/rute";

let startMarker = null;
let endMarker = null;
let geometryDrawn = false;

let map = L.map('map');
let layerGroupRoute = L.layerGroup().addTo(map);
let layerGroupGeometry = L.layerGroup().addTo(map);
let layerGroupMarker = L.layerGroup().addTo(map);

// Add scale to map (metric scale)
L.control.scale({imperial:false}).addTo(map);

// addLayer legger til et kartlag, i dette tilfellet kartdataene som viser verdenskartet.
map.addLayer(BACKGROUND_LAYER);
map.setView([59.132, 10.22], 17);
proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs');


let drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

let options = {
    draw : {
        rectangle: false,
        circle: false,
        marker: true,
        circlemarker: false
    },
    shapeOptions: {
        showArea: true,
        clickable: true
    },
    metric: true,
    edit: {
        featureGroup: drawnItems
    }
};

let drawControl = new L.Control.Draw(options);
map.addControl(drawControl);

map.on('draw:created', function(e) {
    drawnItems.addLayer(e.layer);
    setGeometry(e.layer, e.layerType);
});

map.on('draw:editstart', function() {
    console.log('edit start');
});

map.on('draw:edited', function(e) {
    var layers = e.layers;
    layers.eachLayer(function (layer) {
        if ((layer instanceof L.Polyline) && ! (layer instanceof L.Polygon)) {
            setGeometry(layer, "polyline");
        }

        if ((layer instanceof L.Polygon) && ! (layer instanceof L.Rectangle)) {
            setGeometry(layer, "polygon");
        }

        if ((layer instanceof L.Marker)) {
            setGeometry(layer, "marker");
        }
    });
});


function setGeometry(layer, layerType) {

    let result = "";
    let iterator;

    switch (layerType) {
        case "marker":
            result = "POINT (";
            break;

        case "polygon":
            result = "POLYGON ((";
            iterator = layer.getLatLngs()[0];
            break;

        default:
        case "polyline":
            result = "LINESTRING (";
            iterator = layer.getLatLngs();
            break;
    }

    let next = false;
    try {
        if (layerType == "marker") {
            let utm33Coordinate = convertWGS84ToUTM33Coordinates(layer.getLatLng());
            result += utm33Coordinate[0] + " " + utm33Coordinate[1];
        } else {
            iterator.forEach(latlng => {
                if (next) result += ", ";
                let utm33Coordinate = convertWGS84ToUTM33Coordinates(latlng);
                result += utm33Coordinate[0] + " " + utm33Coordinate[1];
                next = true;
            });
        }

        switch (layerType) {
            case "marker":
            case "polyline" :
            default:
                result += ")";
                break;

            case "polygon":
                let utm33Coordinate = convertWGS84ToUTM33Coordinates(layer.getLatLngs()[0][0]);
                result += ", "
                    +utm33Coordinate[0] + " " + utm33Coordinate[1]
                    + " ))";
                break;
        }

        $("#geometri").val(result);
    } catch (e) {
        alert(e);
    }
}

function setURL(briefURL, requestUrlDiv) {
    $(requestUrlDiv).empty();
    $('<a>', {
        text: briefURL,
        href: briefURL,
        target: "_blank"
    }).appendTo($(requestUrlDiv));
}

function getData(jsonObject) {
    console.log('Fetching ' + jsonObject);

    if (hasValue('#roadsysref')) {
        jsonObject["vegsystemreferanse"] = $('#roadsysref').val();
    }

    if (hasValue('#roaduserGroup')) {
        jsonObject["trafikantgruppe"] = $('#roaduserGroup').val();
    }

    if (hasValues('#typeOfRoad')) {
        jsonObject["typeveg"] = $('#typeOfRoad').val();
    }

    jsonObject["pretty"] = true;

    let url = getServerUrl() + ROUTE_SERVICEPATH_JSON;

    // Get the detailed format
    fetch(url, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(jsonObject)
    })
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
                            L.Proj.geoJson(geojson).addTo(layerGroupRoute);
                        });
                    if (result.length == 0) alert("Fant ingen rute!   Forsøk å endre parametre som maks_avstand, omkrets...");
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

map.on('click', onMapClick);

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
    try {
        let start = $('input[name="startMarker"]').val();
        let end = $('input[name="endMarker"]').val();
        layerGroupMarker.clearLayers();
        endMarker = null;
        startMarker = null;
        createEndMarker(convertUTM33ToWGS84LatLong(end));
        createStartMarker(convertUTM33ToWGS84LatLong(start));
    } catch (e) {
        alert("Kunne ikke sette markører: " + e)
    }
}

$("#zoomToGeometry").click(function(e) {
    event.preventDefault();
    zoomToPosition(getUrlDecodedGeometry());
});

$("#zoomToStartMarker").click(function(e) {
    event.preventDefault();
    zoomToPosition($('input[name="startMarker"]').val());
});

$("#zoomToEndMarker").click(function(e) {
    event.preventDefault();
    zoomToPosition($('input[name="endMarker"]').val());
});


$("#drawGeometry").click(function(e) {
    event.preventDefault();
    layerGroupGeometry.clearLayers();

    geometryDrawn = !geometryDrawn;

    try {
        if (geometryDrawn) {
            let geojson = Terraformer.WKT.parse(getUrlDecodedGeometry());
            geojson.crs = {
                'type': 'name',
                'properties': {
                    'name': 'urn:ogc:def:crs:EPSG::25833'
                }
            };
            L.Proj.geoJson(geojson).addTo(layerGroupGeometry);
        }
    } catch (e) {
        alert("Feil i geometri: " + e.toString());
    }

    layerGroupGeometry.eachLayer(function(layer) {
        layer.setStyle({color :'yellow'})
    });
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
            + "&maks_avstand=" + avstand
            + "&konnekteringslenker=" + isConnectionLinks()
            + "&detaljerte_lenker=" + isDetailedLinks()
            + (getPointInTime() == null ? "" : "&tidspunkt=" + getPointInTime());

        getData(urlParams);
    } else {
        alert("Du må ha fylt ut startlenke og sluttlenke!");
    }
});

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
            + "&detaljerte_lenker=" + isDetailedLinks()
            + (getPointInTime() == null ? "" : "&tidspunkt=" + getPointInTime());

        getData(urlParams);
    } else {
        alert("Klikk i kartet for å angi start og slutt-merke for å beregne rute!");
    }
});

$("#routeByGeometry").click(function (e) {
    event.preventDefault();
    clearRoute();
    let geometri = $.trim($('#geometri').val());
    let avstand = $('input[name="maksavstand"]').val();

    if (geometri && avstand) {
        let jsonObject = {};

        jsonObject["geometri"] = geometri;
        jsonObject["maks_avstand"] = avstand;
        jsonObject["konnekteringslenker"] = isConnectionLinks();
        jsonObject["detaljerte_lenker"] = isDetailedLinks();
        if(getPointInTime() != null)  jsonObject["tidspunkt"] = getPointInTime();

        getData(jsonObject);
    } else {
        alert("Geometri må ha verdi!");
    }
});

function zoomToPosition(geometry) {
    // Find points in geometry
    matches = geometry.match(/(\d+\.\d+|\d+)/g);

    // Take first point of geometry
    let x = matches[0];
    let y = matches[1];

    let point = convertUTM33ToWGS84LatLong( x + ", " + y);

    // Set view to zoom to geometry
    map.setView([point.latlng.lat, point.latlng.lng], 17);
}

function getPointInTime() {
    let time =  $('#pointInTime').val().trim();
    return time == "" ? null : time;
}

function getUrlDecodedGeometry() {
    let geometry = decodeURI($('#geometri').val());
    $('#geometri').val(geometry);
    return geometry;
}

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



$('#clearRoutes').click(function (e) {
    event.preventDefault();
    layerGroupRoute.clearLayers();
});

$('#showMarkerPos').click(function() {
    setMarkers();
});

$("#POS_UTM33,#POS_WGS84").change(function() {
    setMarkers();
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
        .addTo(layerGroupMarker);

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
        .addTo(layerGroupMarker);

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