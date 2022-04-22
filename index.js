const { mongoConnect } = require('./db');

const {RateLimit} = require('async-sema');
const {Cluster} = require('puppeteer-cluster');

const questionData = [];
const limit = RateLimit(5);
const scrapper = async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 5,
        // monitor: true,
        puppeteerOptions: {
            headless: false,
            defaultViewport: false,
        }
    });
    cluster.on('taskerror', (err, data) => {
        console.log(`Error crawling ${data} : ${err.message}`);
    });

    await cluster.task(async ({page, data: url}) => {
        // const browser = await puppeteer.launch({headless: false, defaultViewport: false});
        // const page = await browser.newPage();
        await page.goto(url);
        // console.log(questions);
        // let shouldContinue = true;
        // while(shouldContinue){
            await limit();
            await page.waitForSelector("#mainbar > div.s-pagination.site1.themed.pager.float-left");
            const questions = await page.$$('#questions > .s-post-summary');
            // currentPage++;
            for(const question of questions){
                let title = "null", upvotes = "null", answers = "null", url = "null";
                try {
                    title = await page.evaluate(el => el.querySelector("div.s-post-summary--content > h3 > a").textContent, question);
                    url = 'https://www.stackoverflow.com'+ await page.evaluate(el => el.querySelector("div.s-post-summary--content > h3 > a").getAttribute('href'), question);
                    upvotes = await page.evaluate(el => el.querySelector("div.s-post-summary--stats.js-post-summary-stats > div.s-post-summary--stats-item.s-post-summary--stats-item__emphasized > span.s-post-summary--stats-item-number").textContent, question);
                    // console.log(title);
                    answers = await page.evaluate(el => el.querySelector("div.s-post-summary--stats.js-post-summary-stats > div:nth-child(2) > span.s-post-summary--stats-item-number").textContent, question);
                    // console.log(title);
                    questionData.push({
                        title: title,
                        url: url,
                        upvotes: upvotes, 
                        answers: answers
                    });
                } catch (error) {
                    console.log(error);
                }
            }
            // if(currentPage <= 100){
            //     await Promise.all([
            //         page.click("#mainbar > div.s-pagination.site1.themed.pager.float-left > a:last-child"),
            //         page.waitForNavigation({waitUntil: 'networkidle2'})
            //     ]);
            // }
            // else{
            //     shouldContinue = false;
            // }
        // }
    });
    for(let i = 1;i<=10;i++)
        await cluster.queue(`https://stackoverflow.com/questions?tab=newest&page=${i}`);
    // console.log(questionData);
    await cluster.idle();
    await cluster.close();
    // console.log(questionData);
    process.exit(1);
};


mongoConnect(scrapper);
// scrapper();