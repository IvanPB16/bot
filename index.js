const puppeteer = require('puppeteer');
var req = require('request');
var fs = require('fs');
const os = require('os');


const osPlatform = os.platform();
console.log('Scraper running on platform: ', osPlatform);
let executablePath;
if (/^win/i.test(osPlatform)) {
  executablePath = '';
} else if (/^linux/i.test(osPlatform)) {
  executablePath = '/usr/bin/google-chrome';
}

(async () => {
  // const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({ devtools: true });
  console.log('Abriendo navegador...');
  const page = await browser.newPage();
  const url = 'https://ptscdecprov.clouda.sat.gob.mx/Paginas/ConsultaDeclaracion.aspx';
  const reponse = await page.goto(url);
  console.log('Ingresando a ' + url);
  const body = await reponse.text();
  console.log('body ' + body);
  const img = await page.$$eval('#divCaptcha > img', anchors => [].map.call(anchors, img => img.src));
  console.log(img[0], 'img');
  
  var base64Data = img[0].replace(/^data:image\/jpeg;base64,/, "");

  fs.writeFile("descargar.jpeg", base64Data, 'base64', function (err) {
    console.log(err);
  })

  let textCaptcher = '';

  var options = {
    'method': 'POST',
    'url': 'http://poster.de-captcher.com/',
    'headers': {
      'Content-Type': 'multipart/form-data'
    },
    formData: {
      'username': '',
      'password': '',
      'pict': {
        'value': fs.createReadStream('/home/dante/Documents/workdinacore/scraper/bot/descargar.jpeg'),
        'options': {
          'filename': 'descargar.jpeg',
          'contentType': null
        }
      },
      'pict_type': '0',
      'function': 'picture2'
    }
  };
  req(options, async function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body, 'response.body');
    let parts = response.body.split('|');

    if(0 !== parseInt(parts[0])){
      textCaptcher = '';
    }
    console.log(parts[parts.length - 1])
    textCaptcher = parts[parts.length - 1]
    console.log(textCaptcher);


    const rfc = '';
    const ciec = '';

    await page.click('#rfc');
    await page.type('#rfc', rfc);

    await page.click('#password');
    await page.type('#password', ciec);

    await page.click('#userCaptcha');
    await page.type('#userCaptcha', textCaptcher);
    //click en boton login
    await Promise.all([
      page.click('#submit'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

    // Esperamos a que cargue 
    await page.waitForTimeout(8000);
    console.log('Iniciando sesión...');

    await page.close();
    await browser.close();
  });

})();