import axios from 'axios';

const host = 'localhost';
const port = '8081';
const url = `http://${host}:${port}/api`;

export async function sendOrders(orders: any[]): Promise<any> {
    try {
        await axios.post(`${url}/concurrency`, orders);
        return orders;
    } catch (error: any) {
        throw new Error(error?.message);
    }
}
