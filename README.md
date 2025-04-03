# Robinhood Gold Card to Tiller CSV

This is a script to convert Robinhood Gold Credit Card statement into a CSV that can be imported to Tiller.

## Instructions

Clone this repo, install dependencies:

```zsh
 npm i
```

Download a Gold card statement using the app and then run the script to generate the CSV:

```zsh
 node pdf-parse.js Statement\ January\ 2025.pdf
```

Open Tiller Community Solutions > Import CSV Line Items and upload the generated file.
