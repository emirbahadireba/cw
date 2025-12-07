import { api, endpoints } from './api';

export const planService = {
  async list() {
    return api.get<{ plans: any[] }>(endpoints.plans.list);
  },

  async getCurrent() {
    return api.get(endpoints.plans.current);
  },

  async getUsage() {
    return api.get(endpoints.plans.usage);
  },

  async upgrade(plan: string, paymentMethodId?: string) {
    return api.post(endpoints.plans.upgrade, { plan, payment_method_id: paymentMethodId });
  },

  async downgrade(plan: string) {
    return api.post(endpoints.plans.downgrade, { plan });
  },

  async getBilling() {
    return api.get(endpoints.plans.billing);
  },
};


