let serverURLs = [
    {url: "https://nvdbapiles-v3.utv.atlas.vegvesen.no", label: "https://nvdbapiles-v3.utv.atlas.vegvesen.no (UTV)"},
    {url: "http://localhost:12002", label: "http://localhost:12002 (localhost for developers)"}
];

serverURLs.forEach(v => {
    $("#server")
        .append($("<option>", { value : v.url})
        .text(v.label));
});

