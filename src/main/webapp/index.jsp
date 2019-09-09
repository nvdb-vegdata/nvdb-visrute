<%--
  Created by IntelliJ IDEA.
  User: hangun
  Date: 09/09/2019
  Time: 10.48
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<head>
    <meta charset="utf-8">

    <title>NVDB Visrute</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css"
          integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
          crossorigin=""/>
    <style>
        #mapid {
            height: 600px;
        }
    </style>
</head>
<body>


<main>
    <div id="mapid" class="map_container"></div>

    <form action="#">
        <button id="beregn_marker">Beregn rute med markører</button>
        <div></div>
        <button id="beregn_lenke">Beregn rute med start- og slutt-lenkeposisjoner</button>
        <input type="text" name="startlenke" placeholder="startposisjon@veglenkesekvens" value="0.57289@1175525">
        <input type="text" name="sluttlenke" placeholder="sluttposisjon@veglenkesekvens" value="0.04958@1175526">
    </form>
</main>

<script src="https://unpkg.com/leaflet@1.5.1/dist/leaflet.js"
        integrity="sha512-GffPMF3RvMeYyc1LWMHtK8EbPv0iNZ8/oTtHPx9/cc2ILxQ+u905qIwdpULaqDkyBKgOaB57QTMg7ztg8Jm2Og=="
        crossorigin=""></script>
<script src="https://unpkg.com/jquery@3.4.1/dist/jquery.js"></script>
<script src="https://unpkg.com/terraformer@1.0.7/terraformer.js"></script>
<script src="https://unpkg.com/terraformer-wkt-parser@1.1.2/terraformer-wkt-parser.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.5.0/proj4.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/proj4leaflet/1.0.2/proj4leaflet.min.js"></script>
<script src="scripts.js"></script>
</body>
</html>
