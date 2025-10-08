let serverURLs = [
  {
    url: 'https://nvdbapiles.atlas.vegvesen.no',
    label: 'https://nvdbapiles.atlas.vegvesen.no (Les V4 PROD)',
  },
  {
    url: 'https://nvdbapiles-v3.atlas.vegvesen.no',
    label: 'https://nvdbapiles-v3.atlas.vegvesen.no (Les V3 PROD)',
  },
]

serverURLs.forEach((v) => {
  $('#server').append($('<option>', { value: v.url }).text(v.label))
})
