let serverURLs = [
    {url: "https://apilesv3.atlas.vegvesen.no",  label: "https://apilesv3.atlas.vegvesen.no (PROD)"},
    {url: "https://www.vegvesen.no/nvdb/api/v3", label: "https://www.vegvesen.no/nvdb/api/v3 (PROD)"}
];

serverURLs.forEach(v => {
    $('#server')
        .append($('<option>', { value : v.url})
        .text(v.label));
});

