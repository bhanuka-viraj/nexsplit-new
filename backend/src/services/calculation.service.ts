import { Types } from 'mongoose';
import { Transaction as TransactionModel } from '../models/transaction.model';
import { Group as GroupModel } from '../models/group.model';
import { User as UserModel } from '../models/user.model';

interface BalanceSummary {
    current: number;
    income: number;
    expenses: number;
}

interface MonthlySpend {
    current: number;
    limit: number;
    percentage: number;
}

interface MemberSummary {
    userId: string;
    userName: string;
    avatarUrl: string;
    paid: number;
    owe: number;
    net: number;
    status: 'TO_RECEIVE' | 'TO_PAY' | 'SETTLED';
}

interface Settlement {
    from: {
        userId: string;
        userName: string;
        avatarUrl: string;
    };
    to: {
        userId: string;
        userName: string;
        avatarUrl: string;
    };
    amount: number;
    groupId?: string;
    groupName?: string;
}

export class CalculationService {
    private static STARTING_BALANCE = 5000;

    /**
     * Calculate user's total balance
     */
    static async calculateUserBalance(userId: Types.ObjectId): Promise<BalanceSummary> {
        const transactions = await TransactionModel.find({
            $or: [
                { paidByUserId: userId },
                { 'splitDetails.userId': userId }
            ]
        });

        const income = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
            .filter(t => t.type === 'EXPENSE' && t.paidByUserId.equals(userId))
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            current: this.STARTING_BALANCE + income - expenses,
            income,
            expenses
        };
    }

    /**
     * Calculate monthly spend for current month
     */
    static async calculateMonthlySpend(userId: Types.ObjectId, monthlyLimit: number): Promise<MonthlySpend> {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const transactions = await TransactionModel.find({
            paidByUserId: userId,
            type: 'EXPENSE',
            date: { $gte: startOfMonth }
        });

        const current = transactions.reduce((sum, t) => sum + t.amount, 0);
        const percentage = monthlyLimit > 0 ? Math.round((current / monthlyLimit) * 100) : 0;

        return {
            current,
            limit: monthlyLimit,
            percentage
        };
    }

    /**
     * Calculate debt summary for a specific group
     */
    static async calculateGroupSummary(groupId: Types.ObjectId): Promise<MemberSummary[]> {
        const group = await GroupModel.findById(groupId).populate('members', 'name avatarUrl');
        if (!group) throw new Error('Group not found');

        const transactions = await TransactionModel.find({ groupId });

        const summary: MemberSummary[] = group.members.map((member: any) => {
            const memberId = member._id;

            // Calculate total paid by this member
            const paid = transactions
                .filter(t => t.paidByUserId.equals(memberId))
                .reduce((sum, t) => sum + t.amount, 0);

            // Calculate total owed by this member
            const owe = transactions.reduce((sum, t) => {
                // For settlements: use split details to adjust debt
                if (t.type === 'SETTLEMENT') {
                    const split = t.splitDetails.find(s => s.userId.equals(memberId));
                    if (split && split.amount < 0) {
                        // Negative amount = this member paid off debt
                        // This REDUCES what they owe
                        return sum + split.amount; // Adding negative reduces total
                    }
                    return sum;
                }

                // For expenses and income: calculate normal split
                const split = t.splitDetails.find(s => s.userId.equals(memberId));
                if (!split) return sum;

                let share = 0;
                if (t.splitType === 'EQUAL') {
                    share = t.amount / t.splitDetails.length;
                } else if (t.splitType === 'EXACT') {
                    share = split.amount || 0;
                } else if (t.splitType === 'PERCENTAGE') {
                    share = t.amount * ((split.percentage || 0) / 100);
                }

                return sum + share;
            }, 0);

            const net = paid - owe;

            return {
                userId: memberId.toString(),
                userName: member.name,
                avatarUrl: member.avatarUrl,
                paid: Math.round(paid * 100) / 100,
                owe: Math.round(owe * 100) / 100,
                net: Math.round(net * 100) / 100,
                status: net > 0.01 ? 'TO_RECEIVE' : net < -0.01 ? 'TO_PAY' : 'SETTLED'
            };
        });

        return summary;
    }

    /**
     * Calculate simplified settlements using greedy algorithm
     */
    static async calculateSettlements(
        userId?: Types.ObjectId,
        groupId?: Types.ObjectId,
        strategy: 'simplified' | 'detailed' = 'simplified'
    ): Promise<Settlement[]> {
        let groups;
        
        if (groupId) {
            const group = await GroupModel.findById(groupId);
            groups = group ? [group] : [];
        } else if (userId) {
            groups = await GroupModel.find({ 'members': userId });
        } else {
            throw new Error('Either userId or groupId must be provided');
        }

        if (strategy === 'detailed') {
            return this.calculateDetailedSettlements(groups);
        }

        return this.calculateSimplifiedSettlements(groups);
    }

    /**
     * Simplified settlements - minimize number of transactions
     */
    private static async calculateSimplifiedSettlements(groups: any[]): Promise<Settlement[]> {
        const balanceMap = new Map<string, { balance: number; user: any }>();

        // Calculate net balance for each user across all groups
        for (const group of groups) {
            const summary = await this.calculateGroupSummary(group._id);

            for (const memberSum of summary) {
                const existing = balanceMap.get(memberSum.userId);
                if (existing) {
                    existing.balance += memberSum.net;
                } else {
                    const user = await UserModel.findById(memberSum.userId);
                    balanceMap.set(memberSum.userId, {
                        balance: memberSum.net,
                        user: {
                            userId: memberSum.userId,
                            userName: user?.name || 'Unknown',
                            avatarUrl: user?.avatarUrl || ''
                        }
                    });
                }
            }
        }

        // Separate creditors (owed money) and debtors (owe money)
        const creditors = Array.from(balanceMap.entries())
            .filter(([_, data]) => data.balance > 0.01)
            .map(([id, data]) => ({ ...data.user, balance: data.balance }))
            .sort((a, b) => b.balance - a.balance);

        const debtors = Array.from(balanceMap.entries())
            .filter(([_, data]) => data.balance < -0.01)
            .map(([id, data]) => ({ ...data.user, balance: Math.abs(data.balance) }))
            .sort((a, b) => b.balance - a.balance);

        const settlements: Settlement[] = [];
        let i = 0, j = 0;

        while (i < creditors.length && j < debtors.length) {
            const creditor = creditors[i];
            const debtor = debtors[j];

            const settleAmount = Math.min(creditor.balance, debtor.balance);

            settlements.push({
                from: {
                    userId: debtor.userId,
                    userName: debtor.userName,
                    avatarUrl: debtor.avatarUrl
                },
                to: {
                    userId: creditor.userId,
                    userName: creditor.userName,
                    avatarUrl: creditor.avatarUrl
                },
                amount: Math.round(settleAmount * 100) / 100
            });

            creditor.balance -= settleAmount;
            debtor.balance -= settleAmount;

            if (creditor.balance < 0.01) i++;
            if (debtor.balance < 0.01) j++;
        }

        return settlements;
    }

    /**
     * Detailed settlements - show exact debts per group
     */
    private static async calculateDetailedSettlements(groups: any[]): Promise<Settlement[]> {
        const settlements: Settlement[] = [];

        for (const group of groups) {
            const summary = await this.calculateGroupSummary(group._id);

            const creditors = summary.filter(s => s.net > 0.01);
            const debtors = summary.filter(s => s.net < -0.01);

            for (const debtor of debtors) {
                for (const creditor of creditors) {
                    if (debtor.net >= -0.01) break; // debtor settled

                    const settleAmount = Math.min(creditor.net, Math.abs(debtor.net));
                    if (settleAmount < 0.01) continue;

                    settlements.push({
                        from: {
                            userId: debtor.userId,
                            userName: debtor.userName,
                            avatarUrl: debtor.avatarUrl
                        },
                        to: {
                            userId: creditor.userId,
                            userName: creditor.userName,
                            avatarUrl: creditor.avatarUrl
                        },
                        amount: Math.round(settleAmount * 100) / 100,
                        groupId: group._id.toString(),
                        groupName: group.name
                    });

                    creditor.net -= settleAmount;
                    debtor.net += settleAmount;
                }
            }
        }

        return settlements;
    }
}
