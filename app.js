const puppeteer = require("puppeteer-extra");

// Add adblocker plugin, which will transparently block ads in all pages you
// create using puppeteer.
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin());

const baseUrl = `https://mangas.in/manga/nozoki-ana/`;
// here we parse url where we can all next chapter
const NewUrlGet = (urlToParse) => {
    const re = /(?!\/)(\d+-)(\w+)(\d*)/;
    return urlToParse.match(re);
};

// this is the config where all screeshots are taken 
const takeScreenshot = async(urlBegin, pagenumber) => {
    const browser = await puppeteer.launch({
        headless: true, // Set to false while development
        defaultViewport: null,
        args: [
            "--no-sandbox",
            "--start-maximized", // Start in maximized state
        ],
    });

    const page = await browser.newPage();

    let url = urlBegin + `${pagenumber}`;
    let name = NewUrlGet(url);
    const url_options = {
        waitUntil: "networkidle0",
        timeout: 0,
    };
    const options = {
        path: `images/${name[0]}-${pagenumber}.png`,
        fullpage: true,
        omitBackground: true,
        clip: { x: 160, y: 180, width: 480, height: 690 },
    };
    const response = await page.goto(url, url_options);
    const last_url = response._request._url;
    if (url === last_url) {
        console.log(response._request._url, pagenumber, options.path);
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        await page.setViewport({ width: bodyWidth, height: bodyHeight });
        await page.screenshot(options);
        await browser.close();
    } else {
        console.log(last_url, url, " ..... does not match Browser close");
        await browser.close();
        return last_url;
    }
};

const imagesFromUrl = async(urlInit, startpage, max_page) => {
    i = startpage;
    while (i <= max_page) {
        const url = await takeScreenshot(urlInit, i);
        if (url) {
            let urlParsed = NewUrlGet(url);
            i = 0;
            if (urlParsed) {
                let finalUrl = baseUrl + urlParsed[0] + "/";
                console.log(finalUrl, "printing final url to scrape");
                urlInit = finalUrl;
            } else {
                i = max_page;
            }
        }
        i++;
    }
};

imagesFromUrl("https://mangas.in/manga/nozoki-ana/109-vqtwm/", 1, 29);
