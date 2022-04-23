### I have made a node.js web scrapper

#### To start the scrapper do the following:- 

* Create a .env file in the root directory of the project
* then initialize the following variables:-
    * PASSWORD={your mongodb atlas password}
    * USER_NAME={your mongodb atlas username}
    * DB_NAME={name of the database}
* Then run npm install
* Then run node index.js and it will start scraping stackoverflow questions webpages..

#### I have used the following packages

* puppeteer-cluster
* async-sema
* dotenv
* fs
* mongodb

I am using mongodb atlas as the database to store the data that has been scraped..
I am also using clusters(5 clusters) in order to increase the performance of the crawler