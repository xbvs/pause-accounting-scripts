#!/usr/bin/env python3

import csv
from datetime import date, time, datetime, timezone
from zoneinfo import ZoneInfo


def read_invoices(invoices_file):
    invoices = []
    with open(invoices_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        invoices.extend(reader)
    return invoices


def read_transactions(transactions_file):
    transactions = []
    with open(transactions_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        transactions.extend(reader)
    return transactions


def read_customers(customers_file):
    customers = []
    with open(customers_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        customers.extend(reader)
    return customers


def calculate_invoice_date(invoice):
    field = invoice["Date (UTC)"]
    date_utc = date.fromisoformat(field.split()[0])
    time_utc = time.fromisoformat(field.split()[1])
    combined = datetime.combine(date_utc, time_utc, tzinfo=timezone.utc)
    return combined.astimezone(ZoneInfo('Asia/Kolkata')).date().isoformat()


def calculate_exchange_rate(transaction):
    amount = float(transaction["Amount"])
    customer_facing_amount = float(transaction["Customer Facing Amount"])
    return str(round((amount / customer_facing_amount), 2))


def main():
    invoices_file = 'input-files/invoices.csv'
    transactions_file = 'input-files/balance_history.csv'
    customers_file = 'input-files/unified_customers.csv'
    output_file = 'output-files/output-2023-07.csv'

    customers = read_customers(customers_file)
    invoices = read_invoices(invoices_file)
    transactions = read_transactions(transactions_file)

    outputs = []
    for invoice in invoices:
        # Ignore invoices that don't have number
        if invoice["Number"] == '':
            continue

        # Ignore invoices that haven't been finalized
        if invoice["Finalized At (UTC)"] == '':
            continue

        output = {}

        customer = [x for x in customers if x["id"] == invoice["Customer"]][0]

        print(invoice["Number"])
        transaction = [x for x in transactions if x["Source"] == invoice["Charge"]][0] if (invoice["Charge"] != "") and (invoice["Closed"] == "true") else None

        output["Invoice Number"] = invoice["Number"]
        output["Invoice Date"] = calculate_invoice_date(invoice)
        output["Customer Name"] = invoice["Customer Name"]
        output["GST Number"] = customer["Business Vat ID"]
        output["Address Country Code"] = invoice["Customer Address Country"]
        output["Address State"] = invoice["Customer Address State"]
        output["Address City"] = invoice["Customer Address City"]
        output["Address Zip"] = invoice["Customer Address Zip"]
        output["Address Line 1"] = invoice["Customer Address Line1"]
        output["Address Line 2"] = invoice["Customer Address Line2"]
        output["Currency Code"] = invoice["Currency"].upper()
        output["Exchange Rate"] = calculate_exchange_rate(transaction) if (transaction is not None) and (output["Currency Code"] != "INR") else ""
        output["Paid"] = invoice["Paid"]
        output["Subtotal"] = invoice["Subtotal"]
        output["Discount Amount"] = invoice["Total Discount Amount"]
        output["Tax Amount"] = invoice["Tax"]
        output["Total"] = invoice["Total"]
        outputs.append(output)

    output_headers = [
        "Invoice Number",
        "Invoice Date",
        "Customer Name",
        "GST Number",
        "Address Country Code",
        "Address State",
        "Address City",
        "Address Zip",
        "Address Line 1",
        "Address Line 2",
        "Currency Code",
        "Exchange Rate",
        "Paid",
        "Subtotal",
        "Discount Amount",
        "Tax Amount",
        "Total",
    ]

    with open(output_file, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=output_headers)

        writer.writeheader()
        writer.writerows(outputs)

    print('Done compiling')


if __name__ == '__main__':
    main()
