import { randomUUID } from 'crypto';

export const v4 = () => randomUUID();
export const v1 = () => randomUUID();
export default {
  v4,
  v1
};
