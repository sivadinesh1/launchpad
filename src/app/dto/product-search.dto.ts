export interface IProductSearchDto {
    product_id: number;
    product_code: string;
    product_description: string;
    available_stock: number;
    mrp: number;
    name: string;
    qty: number;
    disc_info: string;
    rack_info: string;
    stock_id: number;
    tax_rate: number;
    unit_price: number;
}
