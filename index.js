const parseConfig = {header: true};

const reportForm = document.getElementById('report-form');
const inputFileInvoices = document.getElementById('input-invoices');
const inputFileCustomers = document.getElementById('input-customers');
const inputFileBalances = document.getElementById('input-balance');

const readInvoices = async () => {
  const fileInvoices = inputFileInvoices.files[0];
  const dataInvoices = await fileInvoices.text();
  return Papa.parse(dataInvoices, parseConfig).data;
};

const readCustomers = async () => {
  const fileCustomers = inputFileCustomers.files[0];
  const dataCustomers = await fileCustomers.text();
  return Papa.parse(dataCustomers, parseConfig).data;
};

const readTransactions = async () => {
  const fileTransactions = inputFileBalances.files[0];
  const dataTransactions = await fileTransactions.text();
  return Papa.parse(dataTransactions, parseConfig).data;
};

const calculateInvoiceDate = (invoice) => {
  const dateStringUtc = invoice['Date (UTC)'].split(' ')[0];
  const timeStringUtc = invoice['Date (UTC)'].split(' ')[1];
  const dateObject = new Date(`${dateStringUtc}T${timeStringUtc}Z`);
  
  const yearFormatter = new Intl.DateTimeFormat('en-IN', {timeZone: 'Asia/Kolkata', year: 'numeric'});
  const year = yearFormatter.format(dateObject);
  const monthFormatter = new Intl.DateTimeFormat('en-IN', {timeZone: 'Asia/Kolkata', month: '2-digit'});
  const month = monthFormatter.format(dateObject);
  const dayFormatter = new Intl.DateTimeFormat('en-IN', {timeZone: 'Asia/Kolkata', day: '2-digit'});
  const day = dayFormatter.format(dateObject);
  
  return `${year}-${month}-${day}`;
};

const calculateExchangeRate = (transaction) => {
  const amount = parseFloat(transaction['Amount']);
  const customerFacingAmount = parseFloat(transaction['Customer Facing Amount']);
  return (amount / customerFacingAmount).toFixed(2);
};

reportForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const invoices = await readInvoices();
  const customers = await readCustomers();
  const transactions = await readTransactions();
  
  const outputs = [];
  const errors = [];
  
  for (const invoice of invoices) {
    // Ignore invoices that don't have number
    if (!invoice['Number']) {
      continue;
    }
    
    // Ignore invoices that haven't been finalized
    if (!invoice['Finalized At (UTC)']) {
      continue;
    }
    
    // Get customer
    const customer = customers.find(customer => customer['id'] === invoice['Customer']);
    if (!customer) {
      errors.push({
        'Invoice Number': invoice['Number'],
        'Message': `Invoice has no customer`,
      });
      continue;
    }
    
    // Get transaction
    let transaction = undefined;
    if ((invoice['Charge'] !== '') && invoice['Closed'] === 'true') {
      transaction = transactions.find(transaction => transaction['Source'] === invoice['Charge']);
    } else {
      transaction = null;
    }
    
    if (transaction === undefined) {
      errors.push({
        'Invoice Number': invoice['Number'],
        'Message': `Could not find transaction`,
      });
      continue;
    }
    
    let exchangeRate = '';
    if ((transaction !== null) && (invoice['Currency'].toUpperCase() !== 'INR')) {
      exchangeRate = calculateExchangeRate(transaction);
    }
    
    const output = {
      'Invoice Number': invoice['Number'].trim(),
      'Invoice Date': calculateInvoiceDate(invoice),
      'Customer Name': invoice['Customer Name'].trim(),
      'GST Number': customer['Business Vat ID'].trim(),
      'Address Country Code': invoice['Customer Address Country'].trim(),
      'Address State': invoice['Customer Address State'].trim(),
      'Address City': invoice['Customer Address City'].trim(),
      'Address Zip': invoice['Customer Address Zip'].trim(),
      'Address Line 1': invoice['Customer Address Line1'].trim(),
      'Address Line 2': invoice['Customer Address Line2'].trim(),
      'Currency Code': invoice['Currency'].toUpperCase(),
      'Exchange Rate': exchangeRate,
      'Paid': invoice['Paid'],
      'Subtotal': invoice['Subtotal'],
      'Discount Amount': invoice['Total Discount Amount'],
      'Tax Amount': invoice['Tax'],
      'Total': invoice['Total'],
    };
    
    outputs.push(output);
  }
  
  const outputCsv = Papa.unparse(outputs) + '\n';
  const errorsCsv = Papa.unparse(errors) + '\n';
  
  downloadFile(outputCsv, 'output.csv');
  downloadFile(errorsCsv, 'errors.csv');
});

const downloadFile = (contents, fileName) => {
  // Create a Blob containing the string data
  const blob = new Blob([contents], { type: 'text/plain' });
  
  // Create a Blob URL
  const blobURL = URL.createObjectURL(blob);
  
  // Create an anchor element for downloading
  const a = document.createElement('a');
  a.href = blobURL;
  a.download = fileName;
  
  // Simulate a click event to trigger the download
  a.click();
  
  // Clean up by revoking the Blob URL
  URL.revokeObjectURL(blobURL);
}
