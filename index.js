const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = '';  // enter ur api key 'ur api key '; 

const apiUrl = 'https://fortniteapi.io/v2/shop?lang=fr';  // remplace fr to ur language ( en = english )

const exportFolder = 'export';

function cleanFileName(name) {
  return name.replace(/[/\\?%*:|"<>]/g, '');
}

async function downloadShopImages() {
  try {

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: API_KEY,
      },
    });

    const shopData = response.data.shop;

    if (!fs.existsSync(exportFolder)) {
      fs.mkdirSync(exportFolder);
    }
    shopData.forEach((item) => {
      const imageUrl = item.displayAssets[0].full_background;
      const fileName = path.join(exportFolder, `${cleanFileName(item.displayName)}.jpg`);

      axios({
        method: 'get',
        url: imageUrl,
        responseType: 'stream',
      }).then((response) => {
        response.data.pipe(fs.createWriteStream(fileName));
      });
    });

    console.log('Téléchargement terminé. Les images sont dans le dossier "export".');
  } catch (error) {
    console.error('Une erreur s\'est produite :', error.message);
  }
}

downloadShopImages();