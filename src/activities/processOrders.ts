import { Client } from '@temporalio/client';
import { createWorker } from "../workers/worker"
import { sendOrdersWorkFlow } from '../workflows/sendOrders';
import { nanoid } from 'nanoid';

const client = new Client();

export const processOrders = async (orders: any[]) => {
    const targetSystemMaxConcurrency: number = 4
    const maxNumOfWorkers: number = 10
    const orderBatches = splitArrayIntoBatches(orders, 2)
    const numOfWorkers = Math.min(...[targetSystemMaxConcurrency, maxNumOfWorkers, orderBatches.length])
    const maxConcurrentActivityExecutionsPerWorker = Math.floor(targetSystemMaxConcurrency / numOfWorkers)
    const orderBatchTaskQueue = 'send-orders-task'

    const workerPromises: any[] = []
    for (let index = 0; index < numOfWorkers; index++) {
        const worker = await createWorker(orderBatchTaskQueue, 'sendOrders', maxConcurrentActivityExecutionsPerWorker)
        worker.run().catch((err) => console.error(err));
        workerPromises.push(worker)
    }
    Promise.all(workerPromises).then((workers) => {
        const orderBatchResponses = orderBatches.map(async (orderBatch) => {
            return await client.workflow.execute(sendOrdersWorkFlow, {
                args: [orderBatch],
                taskQueue: orderBatchTaskQueue,
                workflowId: `${orderBatchTaskQueue}-${nanoid()}`,
            })
        });

        Promise.all(orderBatchResponses).then(() => workers.map((worker) => worker.shutdown()))
    })
}

function splitArrayIntoBatches(array: any[], batchSize: number): any[] {
    const result: any[] = [];
    for (let i = 0; i < array.length; i += batchSize) {
        result.push(array.slice(i, i + batchSize));
    }
    return result;
}
