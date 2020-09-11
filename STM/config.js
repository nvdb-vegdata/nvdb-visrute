let serverURLs = [
    {url: "https://nvdbapiles-v3-stm.utv.atlas.vegvesen.no", label: "https://nvdbapiles-v3-stm.utv.atlas.vegvesen.no (STM)"},
];

serverURLs.forEach(v => {
    $("#server")
        .append($("<option>", { value : v.url})
        .text(v.label));
});

