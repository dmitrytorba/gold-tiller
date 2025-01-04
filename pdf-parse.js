const pdf = require('pdf-parse');
const fs = require('fs');

let dataBuffer = fs.readFileSync('./test.pdf');
 
pdf(dataBuffer).then(function(data) {
    const tables = data.text.split(`Tran\nDate\nPost\nDateReference NumberTransaction DescriptionAmount`);
    for (const table of tables) {
        console.log('-------------------');
        const lines = table.split('\n');
        for (const line of lines) {
            if (line.match(/^\d*\//)) {
                console.log(line);
                const date = line.slice(0, 5);
                const prefix = line.split(' ')[0];
                const priceMatches = line.match(/[+-]?([0-9]*[.])?[0-9]+$/);
                if (priceMatches) {
                    const price = priceMatches[0];
                    const description = line.replace(price, '').replace(prefix, '').trim();
                    console.log('amount:', price);
                    console.log('date:', date);
                    console.log('description:', description);
                }
            }
            if (line.match("Transactions continued on next page")) {
                break;
            }
        }
    }
    
        
});