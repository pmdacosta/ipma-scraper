require('dotenv').config();
const puppeteer = require('puppeteer');
const { ask } = require('./utils/utils');
const { exit } = require('process');
const location = {
  district: process.env.DISTRICT,
  city: process.env.CITY,
};
const URL = 'https://www.ipma.pt/pt/otempo/prev.localidade.hora/';
const DEBUG_MODE = true;

(async () => {

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const pages = await browser.pages();
  const page = pages[0];
  await page.goto(URL, {
    waitUntil: 'networkidle0'
  });

  await page.waitForSelector('select#district>option');
  const districtSelector = await page.$('select#district');
  await districtSelector.select(location.district);
  const cityCodes = {};
  const cities = await page.$$('select#locations > option');
  for (const city of cities) {
    const name = await city.evaluate(el => el.innerText);
    const code = await city.evaluate(el => el.getAttribute('value'));
    cityCodes[name] = code;
  }

  await page.waitForSelector('select#locations>option');
  const citySelector = await page.$('select#locations');
  await citySelector.select(cityCodes[location.city]);

  const data = [];
  const weekly = await page.$$('#weekly > .weekly-column');
  console.log(weekly.length);
  for (const day of weekly) {
    const date = await day.$eval('.date', el => el.textContent);
    const min = await day.$eval('.tempMin', el => el.textContent);
    const max = await day.$eval('.tempMax', el => el.textContent);
    const windDir = await day.$eval('.windDir', el => el.textContent);
    const precProb = await day.$eval('.precProb', el => el.textContent);
    const uv = await day.$eval('.iuvImg', el => el.getAttribute("title"));
    data.push({ date, min, max, windDir, precProb, uv });
  }

  console.log(data);

  if (DEBUG_MODE) await ask("Close browser");
  await browser.close();

  exit();
})();
