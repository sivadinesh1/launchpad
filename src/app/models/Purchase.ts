export class Purchase {
    id: number;
    center_id: number;
    vendor_id: number;
    invoice_no: string;
    invoice_date: string;
    lr_no: string;
    lr_date: string;
    received_date: string;
    purchase_type: string;
    order_no: string;
    order_date: string;
    total_qty: number;
    no_of_items: number;
    taxable_value: number;
    cgst: number;
    sgst: number;
    igst: number;
    total_value: number;
    transport_charges: number;
    unloading_charges: number;
    misc_charges: number;
    net_total: number;
    no_of_boxes: number;
    status: string;
    stock_inwards_datetime;
    vendor_name: string;
}
