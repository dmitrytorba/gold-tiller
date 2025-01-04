const pdf = require('pdf-parse');
const fs = require('fs');

function render_page(pageData) {
    return pageData.getTextContent()
	.then(function(textContent) {
		let lastY, text = '';
		for (let item of textContent.items) {
			if (lastY == item.transform[5] || !lastY){
				text += ' ' + item.str;
			}  
			else{
				text += '\n' + item.str;
			}    
			lastY = item.transform[5];
		}
		return text;
	});
}

let options = {
    pagerender: render_page
}


const dataBuffer = fs.readFileSync('./test.pdf');
let csvOutput = 'Date,Description,Amount\n';
 
pdf(dataBuffer,options).then(function(data) {
    // console.log(data.text);
    const tables = data.text.split(`Tran\nDate\nPost\nDate Reference Number Transaction Description Amount`);
    for (const table of tables) {
        console.log('-------------------');
        const lines = table.split('\n');
        for (const line of lines) {
            if (line.match(/^\d*\//)) {
                // console.log(line);
                const date = line.slice(0, 5);
                const sections = line.split(' ');
                let total = sections[sections.length - 1];
                if (total[total.length - 1] === '-') {
                    total = total.slice(0, total.length - 1);
                } else {
                    total = `-${total}`;
                }
                const description = sections.slice(3, sections.length - 1).join(' ');
                // console.log('total:', total);
                // console.log('date:', date);
                // console.log('description:', description);
                csvOutput += `${date},\"${description}\",${total}\n`;
            }
            if (line.match("Transactions continued on next page")) {
                break;
            }
        }
    }    
    fs.writeFile('output.csv', csvOutput, 'utf8', function (err) {
        if (err) {
        console.log('Some error occured - file either not saved or corrupted file saved.');
        } else{
        console.log('It\'s saved!');
        }
    });
});
