let serverURLs = [
    {url: "https://apilesv3.test.atlas.vegvesen.no",  label: "https://apilesv3.test.atlas.vegvesen.no (ATM)"},
    {url: "https://www.test.vegvesen.no/nvdb/api/v3", label: "https://www.test.vegvesen.no/nvdb/api/v3 (ATM)"}
];

serverURLs.forEach(v => {
    $("#server")
        .append($("<option>", { value : v.url})
        .text(v.label));
});

