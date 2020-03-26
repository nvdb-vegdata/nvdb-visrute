let serverURLs = [
    {url: "https://nvdbapiles-v3.utv.atlas.vegvesen.no", label: "https://nvdbapiles-v3.utv.atlas.vegvesen.no (STM)"},
    {url: "https://www.utv.vegvesen.no/nvdb/api/v3", label: "https://www.utv.vegvesen.no/nvdb/api/v3 (STM)"},
    {url: "https://nvdbw01.kantega.no/nvdb/api/v3", label: "https://nvdbw01.kantega.no/nvdb/api/v3 (K2 - Kantega)"},
    {url: "http://localhost:12002", label: "http://localhost:12002 (localhost for developers)"}
];

serverURLs.forEach(v => {
    $("#server")
        .append($("<option>", { value : v.url})
        .text(v.label));
});

