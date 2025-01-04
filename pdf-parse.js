const pdf = require('pdf-parse');
const fs = require('fs');

// console.log('haha')
let dataBuffer = fs.readFileSync('./test.pdf');
 
pdf(dataBuffer).then(function(data) {
    // console.log(data.text);
    const tables = data.text.split(`Tran\nDate\nPost\nDateReference NumberTransaction DescriptionAmount`);
    for (const table of tables) {
        console.log('-------------------');
        // console.log(table);
        const lines = table.split('\n');
        for (const line of lines) {
            // console.log(line);
            if (line.match(/^\d*\//)) {
                console.log(line);
            }
            if (line.match("Transactions continued on next page")) {
                break;
            }
        }
    }
    
        
});