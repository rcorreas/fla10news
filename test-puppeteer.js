const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Go to homepage
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Find all links to caderno
  const links = await page.$$eval('a[href^="/colunas/caderno"]', anchors => anchors.map(a => ({
    text: a.innerText,
    href: a.href,
    visible: a.offsetWidth > 0 && a.offsetHeight > 0
  })));
  
  console.log("CADERNO LINKS ON PAGE:", links);
  
  if (links.length > 0) {
      console.log("Attempting to click first link:", links[0].href);
      await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2' }),
          page.click(`a[href="${new URL(links[0].href).pathname}"]`)
      ]);
      console.log("Navigated to:", page.url());
      const title = await page.title();
      console.log("Page title:", title);
      
      const is404 = await page.evaluate(() => document.body.innerText.includes('404'));
      console.log("Is 404 page?", is404);
  }
  
  await browser.close();
})();
