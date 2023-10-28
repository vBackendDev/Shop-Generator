const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Remplacez 'VOTRE_CLE_API' par votre clé API FortniteAPI.io
const API_KEY = ' ';

// URL de l'API FortniteAPI.io
const apiUrl = 'https://fortniteapi.io/v2/shop?lang=fr';

// Dossier d'export
const exportFolder = 'export';

// Chemin de l'image de remplacement
const placeholderImage = 'C:\\Users\\backend\\Pictures\\Fortnite\\backend.png'; // path custom image example use code backend

function cleanFileName(name) {
  // Supprimer les caractères non valides
  return name.replace(/[/\\?%*:|"<>]/g, '');
}

async function downloadShopImages() {
  try {
    // Récupérer les données de la boutique
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: API_KEY,
      },
    });

    const shopData = response.data.shop;
    const numImages = shopData.length;

    // Calculer la taille de chaque vignette en fonction du nombre d'images
    const canvasWidth = Math.ceil(Math.sqrt(numImages)); // Largeur de la toile
    const canvasHeight = Math.ceil(numImages / canvasWidth); // Hauteur de la toile
    const thumbnailSize = 1920 / canvasWidth; // Taille de chaque vignette (ajustée à 1920 pixels)

    // Calculer le nombre d'images manquantes pour remplir la mosaïque
    const missingImages = canvasWidth * canvasHeight - numImages;

    // Créer une toile
    const canvas = createCanvas(1920, canvasHeight * thumbnailSize);
    const ctx = canvas.getContext('2d');

    // Position pour la première image
    let x = 0;
    let y = 0;

    // Télécharger et dessiner chaque image sur la toile
    for (const item of shopData) {
      const imageUrl = item.displayAssets[0].full_background;
      const image = await loadImage(imageUrl);

      // Dessiner une version réduite de l'image
      ctx.drawImage(image, x, y, thumbnailSize, thumbnailSize);

      // Déplacer la position pour la prochaine image
      x += thumbnailSize;
      if (x + thumbnailSize > canvas.width) {
        x = 0;
        y += thumbnailSize;
      }
    }

    // Télécharger et dessiner l'image de remplacement pour combler les espaces vides
    for (let i = 0; i < missingImages; i++) {
      const placeholder = await loadImage(placeholderImage);
      ctx.drawImage(placeholder, x, y, thumbnailSize, thumbnailSize);
      x += thumbnailSize;
      if (x + thumbnailSize > canvas.width) {
        x = 0;
        y += thumbnailSize;
      }
    }

    // Enregistrer l'image fusionnée
    const mergedImagePath = path.join(exportFolder, 'shop.jpg');
    const out = fs.createWriteStream(mergedImagePath);
    const stream = canvas.createJPEGStream({ quality: 0.95 });
    stream.pipe(out);

    out.on('finish', () => {
      console.log('Téléchargement et fusion d\'images terminés.');
      console.log(`L'image fusionnée est enregistrée sous : ${mergedImagePath}`);
    });
  } catch (error) {
    console.error('Une erreur s\'est produite :', error.message);
  }
}

downloadShopImages();
