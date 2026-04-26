import { agentActions } from '../../store/useAgentStore.js';

export const notify = {
  toast(message, kind = 'info') {
    agentActions.pushToast(message, kind);
  },
};
