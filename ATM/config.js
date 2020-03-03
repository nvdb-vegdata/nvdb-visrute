let serverURLs = [
    {url: "https://nvdbapiles-v3.test.atlas.vegvesen.no",  label: "https://nvdbapiles-v3.test.atlas.vegvesen.no (ATM)"},
    {url: "https://www.test.vegvesen.no/nvdb/api/v3", label: "https://www.test.vegvesen.no/nvdb/api/v3 (ATM)"}
];

serverURLs.forEach(v => {
    $("#server")
        .append($("<option>", { value : v.url})
        .text(v.label));
});

