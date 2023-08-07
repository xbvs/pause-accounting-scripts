# Pause accounting scripts

## Steps to get input documents

### invoices.csv

1. Go to [https://dashboard.stripe.com/invoices](https://dashboard.stripe.com/invoices)
2. Select "All invoices"
3. Click "Export"
4. Select timezone as "GMT+05:30"
5. Select date-range as custom starting 1st of last month and ending day before today
6. Under columns select "All columns"
7. Start export
8. Copy the downloaded file to `input-files/invoices.csv`

### unified_customers.csv

1. Go to [https://dashboard.stripe.com/customers](https://dashboard.stripe.com/customers)
2. Select "All customers"
3. Click "Export"
4. Select timezone as "GMT+05:30"
5. Select date-range as "All"
6. Under columns select "All columns"
7. Start export
8. Copy the downloaded file to `input-files/unified_customers.csv`

### balance_history.csv

1. Go to [https://dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)
2. Select "All transactions"
3. Click "Export"
4. Select timezone as "GMT+05:30"
5. Select date-range as "All"
6. Under columns select "All columns"
7. Start export
8. Copy the downloaded file to `input-files/balance_history.csv`

## Handle output file

1. Move the file `output-files/output.csv` to `output-files/output-<YYYY>-<MM>.csv`