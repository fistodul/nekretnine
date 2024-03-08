# Nekretnine
Real estate listing site, the main features are search and results pages that query a MariaDB database in the backend and show each row result on the frontend using ejs, a html templating engine. Each real estate object has it's own page from which they can be ordered.

The search page, showing only the available type of real estate object

![image](https://user-images.githubusercontent.com/4060824/157556757-fdd17e59-82a2-4f39-be58-9d6043e820a9.png)
results page

![image](https://user-images.githubusercontent.com/4060824/157556804-d2cd9006-959b-4126-9f0c-6764873205b7.png)
There is an admin part where real estate objects can be configured alongside the locations and types of real estate objects

![image](https://user-images.githubusercontent.com/4060824/157557394-7bcf3f88-1d54-40cb-b400-35842970add9.png)

TODO:
- [ ] Make nekretnine company agnostic, with assets configurable in the admin panel
- [ ] Add possibility to use docker (https://hub.docker.com/r/darthsim/imgproxy) / node.js (https://github.com/lovell/sharp) microservice for resizing images into thumbnail versions
- [ ] Improve page number logic on the search results pages
- [ ] Refactor backend code to make better use of async / await
- [ ] Make sure the English translation is complete (including switching database to English)
- [ ] Improve and refactor form search options to better categorize real estate objects from multiple areas
- [ ] Finish separating main pages and admin CSS
# Installation instructions
## Modify the .env file for the environment in use
This project uses the dotenv middleware to add key/value pairs from files into the project as process.env environment variables, the variables in use are:
```
DB_Host = "localhost"
```
Should be set to the address of the database
```
DB_User = "root"
```
Should be set to the user who has control over the database
```
DB_Pass = ""
```
The password of the user who has control over the database
```
DB_Db = "nekretnine"
```
The name of the database itself
```
Cookie_secret = "testcookie123"
```
Should be a random string, for cookie authentificaiton
```
Site_Pass = "testpass123"
```
The password to the admin part of the site, should be strong (Minimum of 8 characters consiting of at least 1 uppercase and lowercase letter, 1 number and 1 special character)
## Install the app
At this point you have the option to use Docker or to manually install the app
<details>
  <summary>Docker instructions</summary>
  Running `docker compose up` Will build the Dockerfile in the current directory and start 2 containers, the nodejs site and a MariaDB database
  Alternatively, if you configured the .env file with another database you can skip using docker compose and run just the nodejs container like this:
  ```
  docker build -t nekretnine:latest .
  docker run --name nekretnine -d --restart unless-stopped -p 8000:8000 nekretnine:latest
  ```
</details>
<details>
  <summary>Manual instructions</summary>
  These commands should be run inside the root folder of the project, i'm assuming you'll be running them on Linux but they can easily be modified for Windows
  ### Install nodejs and the dependencies for the app
  Node.js can be found on the offical site: https://nodejs.org
  
  With Node.js installed, running `npm install` will download and install all the needed dependencies
  ### Import the database
  The database in use by the project is MariaDB which is cross compatible with MySQL, first the database for app should be created:
  ```
  mysql -u root -p -e "CREATE DATABASE nekretnine"
  ```
  Then the schema should be imported into the created database
  ```
  mysql -u root -p nekretnine < nekretnine.sql
  ```
  There is dummy data available in the repository with locations for the Niš, Serbia area. It can be imported like this:
  ```
  mysql -u root -p nekretnine < data.sql
  ```
  All of these commands will prompt for the password of the root user
  ### Running the app
  The app can be started with a shell script that will automatically start the app in production mode and restart it should it crash
  ```
  cd src && sh app.sh
  ```
  alternatively, the app.js file can be ran directly directly with the NODE_ENV=production environment variable
  ```
  NODE_ENV=production npm start
  ```
</details>
## Visiting the website
After starting the app, the website can be visited on the following address: http://localhost:3000

Logging using the morgan middleware can be achieved with setting the logging environment variable to 1 like `logging=1 node app.js`, the format of the logs can be configured, more info can be found here: https://github.com/expressjs/morgan#predefined-formats

A log file rotator is also in use, the availble options are documented on the middleware page: https://www.npmjs.com/package/rotating-file-stream#options
