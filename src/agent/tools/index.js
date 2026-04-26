import { ledger } from './ledger.js';
import { pay } from './pay.js';
import { notify } from './notify.js';

/** Toolbox handed to every skill. Keep this list short on purpose. */
export const tools = { ledger, pay, notify };
