let serverURLs = [
    {url: "https://nvdbapiles-v3-stm.utv.atlas.vegvesen.no", label: "https://nvdbapiles-v3-stm.utv.atlas.vegvesen.no (STM)"},
    {url: "https://pm1.utv.vegvesen.no/nvdb/api/v3", label: "https://pm1.utv.vegvesen.no/nvdb/api/v3 (STM)"},
];

serverURLs.forEach(v => {
    $("#server")
        .append($("<option>", { value : v.url})
        .text(v.label));
});

