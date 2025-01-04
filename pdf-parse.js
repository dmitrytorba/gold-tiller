const pdf = require('pdf-parse');
const fs = require('fs');

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('/');
  };

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
    const match = data.text.match(/Statement Closing Date.*\n/g);
    if (match) {
        const statementDate = new Date(match[0].replace('Statement Closing Date', '').replace('\n', '').trim());
        // console.log(data.text);
        const tables = data.text.split(`Tran\nDate\nPost\nDate Reference Number Transaction Description Amount`);
        for (const table of tables) {
            console.log('-------------------');
            const lines = table.split('\n');
            for (const line of lines) {
                if (line.match(/^\d*\//)) {
                    // console.log(line);
                    const date = new Date(line.slice(0, 5));
                    date.setFullYear(statementDate.getFullYear());
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
                    csvOutput += `${date.yyyymmdd()},\"${description}\",${total}\n`;
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
    } else {
        console.log("Statement date not found!");
    }
});
