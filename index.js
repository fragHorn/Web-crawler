//importing the database from the db.js file and Questions model from Questions.js file
const { mongoConnect } = require('./db');
const Questions = require('./Questions');

const {RateLimit} = require('async-sema');
const {Cluster} = require('puppeteer-cluster');

const fs = require('fs');

const limit = RateLimit(5);

// number of pages to scrap in the website...
const page = 100;

//appending the header of the csv file
fs.writeFile('scraped.csv', 'title,url,references,upvotes,answers\n', err => {
    if(err)
    console.log(err);
});

//setting the limit of concurrent request to 5
const scrapper = async (callback) => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 5,
        // monitor: true,
        puppeteerOptions: {
            headless: false,
            defaultViewport: false,
        }
    });

    //to handle any error on clusters
    cluster.on('taskerror', (err, data) => {
        console.log(`Error crawling ${data} : ${err.message}`);
    });

    //all the clusters will be executed in the folloeing block and will use the url provided in the arguments
    await cluster.task(async ({page, data: url}) => {
        //go to page with the given url
        await page.goto(url);
        await limit();
        //waits for the selector to load before begining the HTML parsing...
        await page.waitForSelector("#mainbar > div.s-pagination.site1.themed.pager.float-left");
        //selects the outer box that contains all the questions on that page of stackoverflow
        const questions = await page.$$('#questions > .s-post-summary');
        
        //traverse through all the questions in the questions array and store them in the database...
        for(const question of questions){
            let title = "null", upvotes = "null", answers = "null", url = "null";
            try {
                //parse the title of the question
                title = await page.evaluate(el => el.querySelector("div.s-post-summary--content > h3 > a").textContent, question);

                //parse the url of the question
                url = 'https://www.stackoverflow.com'+ await page.evaluate(el => el.querySelector("div.s-post-summary--content > h3 > a").getAttribute('href'), question);

                //parse the number of upvotes of the question
                upvotes = await page.evaluate(el => el.querySelector("div.s-post-summary--stats.js-post-summary-stats > div.s-post-summary--stats-item.s-post-summary--stats-item__emphasized > span.s-post-summary--stats-item-number").textContent, question);
                
                //parse the number of answers of the question
                answers = await page.evaluate(el => el.querySelector("div.s-post-summary--stats.js-post-summary-stats > div:nth-child(2) > span.s-post-summary--stats-item-number").textContent, question);
                
                //create a new instance of the Questions class to store in the database...
                const ques = new Questions(title, 1, upvotes, answers, url);

                //save the data of the question in the database...
                await ques.save();
            } catch (error) {

                //show any errors in performing the above task...
                console.log(error);
            }
        }
    });

    //creating the queue of actions for clusters to perform... here
    for(let i = 1;i<=page;i++)
        await cluster.queue(`https://stackoverflow.com/questions?tab=newest&page=${i}`);
    
    await cluster.idle();
    
    //retrieving all the data from the database and storing it in a .csv file...
    const res = await Questions.retrieveAll();
    
    //appending all the question in the scraped.csv file
    res.map( ques => {
        const str = `"${ques.title}","${ques.url}",${ques.references},${ques.upvotes},${ques.answers}\n`;
        fs.appendFile('scraped.csv', str, err => {
            if(err)
                console.log(err);
        })
    })

    //close all the clusters...
    await cluster.close();

    //exit the process...
    process.exit(1);
};

//create a mongoDB connection and then start scraping...
mongoConnect(scrapper);
