const pdf = require("pdf-parse");
const fs = require("fs");
const { program } = require("commander");

Date.prototype.mmddyyyy = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
    this.getFullYear(),
  ].join("/");
};

function render_page(pageData) {
  return pageData.getTextContent().then(function (textContent) {
    let lastY,
      text = "";
    for (let item of textContent.items) {
      if (lastY == item.transform[5] || !lastY) {
        text += " " + item.str;
      } else {
        text += "\n" + item.str;
      }
      lastY = item.transform[5];
    }
    return text;
  });
}

const institution = "Robinhood";
const accountNumber = "xxxx5396";
const accountName = "Robinhood Gold Creditcard";

function processFile(file) {
  console.log("Reading statement file:", fileName);
  const dataBuffer = fs.readFileSync(file);
  let csvOutput = "Date,Description,Amount,Institution,Account #,Account\n";

  pdf(dataBuffer, {
    pagerender: render_page,
  }).then(function (data) {
    const match = data.text.match(/Statement Closing Date.*\n/g);
    if (match) {
      const statementDate = new Date(
        match[0].replace("Statement Closing Date", "").replace("\n", "").trim()
      );
      // console.log(data.text);
      const tables = data.text.split(
        `Tran\nDate\nPost\nDate Reference Number Transaction Description Amount`
      );
      for (const table of tables) {
        console.log("-------------------");
        const lines = table.split("\n");
        for (const line of lines) {
          if (line.match(/^\d*\//)) {
            // console.log(line);
            const date = new Date(line.slice(0, 5));
            date.setFullYear(statementDate.getFullYear());
            const sections = line.split(" ");
            let total = sections[sections.length - 1].replace(",", "");
            if (total[total.length - 1] === "-") {
              total = total.slice(0, total.length - 1);
            } else {
              total = `-${total}`;
            }
            total = parseFloat(total);
            const description = sections
              .slice(3, sections.length - 1)
              .join(" ");
            // console.log('total:', parseFloat(total));
            // console.log('date:', date);
            // console.log('description:', description);
            if (total !== 0) {
              csvOutput += `${date.mmddyyyy()},\"${description}\",${total},${institution},${accountNumber},${accountName}\n`;
            }
          }
          if (line.match("Transactions continued on next page")) {
            break;
          }
        }
      }
      const csvFileName = `robinhood-${statementDate.getFullYear()}-${
        statementDate.getMonth() + 1
      }.csv`;
      fs.writeFile(csvFileName, csvOutput, "utf8", function (err) {
        if (err) {
          console.log(
            "Some error occured - file either not saved or corrupted file saved."
          );
        } else {
          console.log("Generated CSV file:", csvFileName);
        }
      });
    } else {
      console.log("Statement date not found!");
    }
  });
}

program.argument("<string>");

program.parse();

const fileName = program.args[0];

processFile(fileName);
