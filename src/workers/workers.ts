import { Worker } from '@temporalio/worker';
import * as sendOrdersActivities from '../activities/sendOrders';
import * as processOrdersActivities from '../activities/processOrders';
import * as prepareOrderActivities from '../activities/prepareOrder';
import * as fetchOrderActivities from '../activities/fetchOrder';

const workflows: any = {
  subscribeOrderQueue: require.resolve('../workflows/subscribeOrderQueue'),
  sendOrders: require.resolve('../workflows/sendOrders'),
  prepareOrder: require.resolve('../workflows/prepareOrder'),
  fetchOrders: require.resolve('../workflows/fetchOrders'),
}
const activities: any = {
  subscribeOrderQueue: processOrdersActivities,
  sendOrders: sendOrdersActivities,
  prepareOrder: prepareOrderActivities,
  fetchOrders: fetchOrderActivities,
}

export async function createWorker(taskQueue: string, type: string, maxConcurrentActivityTaskExecutions: number = 100) {
  const worker = await Worker.create({
    workflowsPath: workflows[type],
    activities: activities[type],
    taskQueue,
    maxConcurrentActivityTaskExecutions,
    
  });
  return worker;
}

async function run() {
  (await createWorker('prepare-order-task', 'prepareOrder')).run().catch((err) => console.error(err));
  (await createWorker('subscribe-order-queue-task', 'subscribeOrderQueue')).run().catch((err) => console.error(err));
  (await createWorker('fetch-orders-task', 'fetchOrders')).run().catch((err) => console.error(err));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
