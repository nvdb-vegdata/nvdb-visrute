let serverURLs = [
  {
    url: 'https://nvdbapiles.test.atlas.vegvesen.no',
    label: 'https://nvdbapiles.test.atlas.vegvesen.no (Les V4 ATM)',
  },
  {
    url: 'https://nvdbapiles-v3.test.atlas.vegvesen.no',
    label: 'https://nvdbapiles-v3.test.atlas.vegvesen.no (Les V3 ATM)',
  },
]

serverURLs.forEach((v) => {
  $('#server').append($('<option>', { value: v.url }).text(v.label))
})
