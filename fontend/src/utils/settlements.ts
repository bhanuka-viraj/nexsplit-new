import type { Transaction, User } from '@/services/api';

export interface Debt {
    fromUserId: string;
    toUserId: string;
    amount: number;
}

/**
 * Calculates detailed pairwise debts.
 * Logic:
 * 1. For every expense, Payer lends to Split Participants.
 * 2. Accumulate these "loans" into a directed graph (User A owes User B $X).
 * 3. Subtract reverse debts (if A owes B $10 and B owes A $2, result is A owes B $8).
 */
export function calculateDetailedDebts(transactions: Transaction[], members: User[]): Debt[] {
    const debts: Record<string, Record<string, number>> = {};

    // Initialize
    members.forEach(m => {
        debts[m.id] = {};
        members.forEach(other => {
            if (m.id !== other.id) debts[m.id][other.id] = 0;
        });
    });

    transactions.forEach(t => {
        if (t.type === 'SETTLEMENT' && t.paidToUserId) {
            // Settlement reduces debt: "PaidBy" paid "PaidTo", so "PaidBy" has given money to "PaidTo"
            // Interpreting settlement: It cancels out existing debt.
            // If A pays B $50, it's effectively A lending B $50 in the "ledger" which cancels B's debt to A?
            // NO. Settlement is satisfying a debt.
            // If A owed B $50, and A pays B $50 (Settlement), A's debt to B reduces.
            // In a debt graph, we can treat Settlement as a generic transfer.
            // Payer (A) gives value to Receiver (B).
            // So A "lends" B $amount. This counteracts any "borrowing" A did from B.
            
            const payer = t.paidByUserId;
            const receiver = t.paidToUserId;
            
            if (!debts[payer]) debts[payer] = {};
            if (!debts[payer][receiver]) debts[payer][receiver] = 0;

            // Add to the "Payer -> Receiver" flow
            debts[payer][receiver] += t.amount;
        } else {
            // Expense
            // Payer lends to everyone else involved.
            // Assuming EQUAL split for now (as per current mock data limitations).
            // Future: Inspect `splitDetails` if available.
            
            // Note: Current mock data doesn't fully detail split participants, assuming ALL group members for now unless specified.
            // The API type `Transaction` has `splitDetails`.
            
            const payer = t.paidByUserId;
            let participants = members.map(m => m.id); 

            if (t.splitDetails && t.splitDetails.length > 0) {
                 participants = t.splitDetails.map(sd => sd.userId);
            }

            const splitAmount = t.amount / participants.length;

            participants.forEach(participantId => {
                if (participantId !== payer) {
                    // Payer lends to Participant
                    if (!debts[payer]) debts[payer] = {};
                    if (!debts[payer][participantId]) debts[payer][participantId] = 0;
                    
                    debts[payer][participantId] += splitAmount;
                }
            });
        }
    });

    // Simplify pairwise (A->B $10, B->A $2  => A->B $8)
    const finalDebts: Debt[] = [];
    const processedPairs = new Set<string>();

    members.forEach(a => {
        members.forEach(b => {
            if (a.id === b.id) return;
            
            const pairId = [a.id, b.id].sort().join('-');
            if (processedPairs.has(pairId)) return;
            processedPairs.add(pairId);

            const aLentB = debts[a.id]?.[b.id] || 0;
            const bLentA = debts[b.id]?.[a.id] || 0;

            if (aLentB > bLentA) {
                // B owes A
                const amount = aLentB - bLentA;
                if (amount > 0.01) finalDebts.push({ fromUserId: b.id, toUserId: a.id, amount });
            } else if (bLentA > aLentB) {
                // A owes B
                const amount = bLentA - aLentB;
                if (amount > 0.01) finalDebts.push({ fromUserId: a.id, toUserId: b.id, amount });
            }
        });
    });

    return finalDebts;
}

/**
 * Calculates simplified debts.
 * Logic:
 * 1. Calculate Net Balance for everyone (Total Paid - Total Share).
 * 2. Positive Balance = Creditor, Negative Balance = Debtor.
 * 3. Greedy match: Richest Creditor is paid by Poorest Debtor (or vice-versa).
 */
export function calculateSimplifiedDebts(transactions: Transaction[], members: User[]): Debt[] {
    const balances: Record<string, number> = {};
    members.forEach(m => balances[m.id] = 0);

    // 1. Build Net Balances
    transactions.forEach(t => {
        if (t.type === 'SETTLEMENT' && t.paidToUserId) {
            // Simple transfer
            balances[t.paidByUserId] += t.amount; // Payer gave money (+ contribution)
            balances[t.paidToUserId] -= t.amount; // Receiver got money (- claim)
        } else {
            // Expense
            balances[t.paidByUserId] += t.amount; // Payer gave money

             // Assuming split
            let participants = members.map(m => m.id);
            if (t.splitDetails && t.splitDetails.length > 0) {
                 participants = t.splitDetails.map(sd => sd.userId);
            }
            const splitAmount = t.amount / participants.length;

            participants.forEach(p => {
                balances[p] -= splitAmount; // Participant 'consumed' value
            });
        }
    });

    // 2. Separate into Debtors and Creditors
    let debtors: { id: string, amount: number }[] = [];
    let creditors: { id: string, amount: number }[] = [];

    Object.entries(balances).forEach(([id, amount]) => {
        if (amount < -0.01) debtors.push({ id, amount }); // Negative balance = owes money
        if (amount > 0.01) creditors.push({ id, amount }); // Positive balance = owed money
    });

    // Sort by magnitude (descending) to optimize basic greedy approach
    debtors.sort((a, b) => a.amount - b.amount); // Most negative first
    creditors.sort((a, b) => b.amount - a.amount); // Most positive first

    const debts: Debt[] = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    // 3. Greedy Match
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is the minimum of what's owed vs what's needed
        // debtor.amount is negative, so we check Math.min(abs(debtor), creditor)
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        debts.push({
            fromUserId: debtor.id,
            toUserId: creditor.id,
            amount
        });

        // Adjust valid balances
        debtor.amount += amount; // becomes closer to 0 (e.g. -50 + 40 = -10)
        creditor.amount -= amount; // becomes closer to 0 (e.g. 100 - 40 = 60)

        // If settled within rounding error, move pointer
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return debts;
}
