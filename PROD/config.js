let serverURLs = [
    {url: "https://nvdbapiles-v3.atlas.vegvesen.no",  label: "https://nvdbapiles-v3.atlas.vegvesen.no (PROD)"}
];

serverURLs.forEach(v => {
    $('#server')
        .append($('<option>', { value : v.url})
        .text(v.label));
});

