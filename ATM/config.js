let serverURLs = [
    {url: "https://nvdbapiles-v3.test.atlas.vegvesen.no",  label: "https://nvdbapiles-v3.test.atlas.vegvesen.no (ATM)"}
];

serverURLs.forEach(v => {
    $("#server")
        .append($("<option>", { value : v.url})
        .text(v.label));
});

