# TOOLS

Side-effecting capabilities the agent can reach for. Tools are deliberately
narrow — a skill cannot invent SQL, can only call these functions.

| id     | actions                              | requires approval |
| ------ | ------------------------------------ | ----------------- |
| ledger | list, byMonth, byCategory, update    | no                |
| pay    | simulate(payee, amount, category)    | **yes** — opens a confirmation modal |
| notify | toast(message, kind)                 | no                |

Approval gate: `pay.simulate` does not write to the ledger directly. It pushes
a pending payment onto the agent store; the UI shows a modal; only after the
user clicks Approve does the transaction land.
