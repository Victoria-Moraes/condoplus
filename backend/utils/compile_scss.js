const path = require('path')
const sass = require("sass");
const fs = require("fs");

console.log(__dirname)

const result = sass.compile(path.join(__dirname, "../../public/scss/main.scss"));

fs.writeFile(path.join(__dirname, "../../public/css/styles.css"), result.css, function (err) {
    if (err) 
        throw err;
        
    console.log('Results Received');
});