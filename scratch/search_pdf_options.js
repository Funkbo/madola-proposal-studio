const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function searchPdfs() {
  const files = [
    'C:\\Users\\shubh\\Downloads\\proposal-VYKDSFMWJW5N.pdf',
    'C:\\Users\\shubh\\Downloads\\Updated_Proposal_Bhavesh Pindoria_246_Ealing_Road.pdf',
    'C:\\Users\\shubh\\Downloads\\1786212369547-OpenSolar_Proposal.pdf',
    'C:\\Users\\shubh\\Downloads\\GHL\\Madola Proposal Tool\\Evidence_Gathering\\Opensolar_Customer_Pdf\\OpenSolar_Proposal.pdf'
  ];

  for (const f of files) {
    console.log("==================================================");
    console.log("Checking:", f);
    if (!fs.existsSync(f)) {
      console.log("Does not exist");
      continue;
    }
    const buffer = fs.readFileSync(f);
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const textResult = await parser.getText();
    console.log("Length:", textResult.text.length, "Pages:", textResult.pages ? textResult.pages.length : "N/A");

    const hasOptions = /Solar Options|System Option|Dura16|Powerwall 3/i.test(textResult.text);
    console.log("Matches options keywords?:", hasOptions);
    if (hasOptions) {
      console.log("Sample text snippet around Dura16/Powerwall/Option:");
      const matches = textResult.text.match(/(?:Solar Options|System Option|Dura16|Powerwall 3|13 Panels)[^\n]*/gi);
      console.log(matches ? matches.slice(0, 20) : "None");
    }
  }
}

searchPdfs();
