import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  requestId: string;
  userId?: string;
  username?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getContext(): RequestContext | undefined {
  return requestContext.getStore();
}

/* Gets A Context Value Or An Empty Object If No Context Is Found */
/* Helpful For Easily Destructuring Inside Deep Services */
export function getContextData() {
  const store = requestContext.getStore();
  return {
    requestId: store?.requestId,
    userId: store?.userId,
    username: store?.username,
  };
}
