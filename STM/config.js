let serverURLs = [
  {
    url: 'https://nvdbapiles.utv.atlas.vegvesen.no',
    label: 'https://nvdbapiles.utv.atlas.vegvesen.no (Les V4 STM)',
  },
  {
    url: 'https://nvdbapiles-v3-stm.utv.atlas.vegvesen.no',
    label: 'https://nvdbapiles-v3-stm.utv.atlas.vegvesen.no (Les V3 STM)',
  },
]

serverURLs.forEach((v) => {
  $('#server').append($('<option>', { value: v.url }).text(v.label))
})
