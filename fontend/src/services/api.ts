// --- Types ---

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Group {
  id: string;
  name: string;
  totalCost: number;
  currency: string;
  members: User[];
  createdAt: string;
  imageUrl?: string;
}

export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE';

export interface SplitDetail {
    userId: string;
    amount?: number;     // For EXACT
    percentage?: number; // For PERCENTAGE
}

export interface Transaction {
  id: string;
  type: 'EXPENSE' | 'INCOME' | 'SETTLEMENT';
  groupId?: string; // Optional for personal
  paidByUserId: string;
  paidToUserId?: string; // For SETTLEMENT: who received the money
  amount: number;
  description: string;
  date: string;
  splitType: SplitType;
  splitDetails: SplitDetail[];
}

export interface ExpenseSummary {
  userId: string;
  paid: number;
  owe: number;
  net: number; // positive = get back, negative = owe
}

export interface Invitation {
    id: string;
    groupId: string;
    groupName: string;
    groupImageUrl?: string;
    toUserId: string;
    fromUserId: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

// --- API Helper ---

const mapId = (item: any): any => {
    if (!item) return item;
    if (Array.isArray(item)) {
        return item.map(mapId);
    }
    if (item._id && !item.id) {
        return { ...item, id: item._id };
    }
    return item;
};

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    } as HeadersInit;

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
        throw new Error('Session expired');
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error(data.message || 'API Error');
    }
    // Automatically map _id to id for all responses
    return mapId(data.data);
};

// --- API Functions ---

export const api = {
  getCurrentUser: async (): Promise<User> => {
      const data = await fetchWithAuth('/users/me');
      return data;
  },

  getGroups: async (): Promise<Group[]> => {
      const groups = await fetchWithAuth('/groups');
      return groups;
  },

  getGroupDetails: async (groupId: string): Promise<{ group: Group, transactions: Transaction[], summary: ExpenseSummary[] } | null> => {
      try {
          const data = await fetchWithAuth(`/groups/${groupId}`);
          
          if (!data) return null;

          // data is already mapped by fetchWithAuth, but nested objects/arrays inside might need care if mapId wasn't deep enough.
          // mapId implementation above is shallow for properties but handles arrays.
          // Does it handle { group: { _id }, transactions: [{ _id }] }? 
          // My mapId only handles Array or Object with _id.
          // If data is { group: {...}, transactions: [...] }, mapId returns it as is because it doesn't have _id itself.
          // We need deeper mapping or manual mapping here.
          
          // Let's improve mapId or manually map here for safety.
          // Actually, let's make mapId recursive for objects.
          
          const group = mapId(data.group);
          // Manually ensure members are mapped too if they are populated
          if (group.members) group.members = mapId(group.members);
          
          const transactions = mapId(data.transactions);
          
          const summaryMap = new Map<string, ExpenseSummary>();

          group.members.forEach((m: User) => {
              // m.id should be present now
              summaryMap.set(m.id, { userId: m.id, paid: 0, owe: 0, net: 0 });
          });

          transactions.forEach((t: Transaction) => {
              if (t.type === 'EXPENSE') {
                  const payer = summaryMap.get(t.paidByUserId as any as string); // In case it's populated object or string
                  // Wait, paidByUserId might be an object now if populated.
                  // The backend controller populates paidByUserId.
                  const payerId = (typeof t.paidByUserId === 'object' && (t.paidByUserId as any).id) ? (t.paidByUserId as any).id : t.paidByUserId;
                  
                  const payerRecord = summaryMap.get(payerId);
                  if (payerRecord) payerRecord.paid += t.amount;

                  t.splitDetails.forEach((split) => {
                       // split.userId might be populated too?
                       const borrowerId = (typeof split.userId === 'object' && (split.userId as any).id) ? (split.userId as any).id : split.userId;
                       const borrower = summaryMap.get(borrowerId);
                       if (borrower) borrower.owe += split.amount || 0;
                  });
              } else if (t.type === 'SETTLEMENT') {
                  const payerId = (typeof t.paidByUserId === 'object' && (t.paidByUserId as any).id) ? (t.paidByUserId as any).id : t.paidByUserId;
                  const receiverId = t.paidToUserId ? ((typeof t.paidToUserId === 'object' && (t.paidToUserId as any).id) ? (t.paidToUserId as any).id : t.paidToUserId) : null;
                  
                  const payer = summaryMap.get(payerId);
                  const receiver = receiverId ? summaryMap.get(receiverId) : null;
                  
                  if (payer) payer.paid += t.amount; 
                  if (receiver) receiver.owe += t.amount; 
              }
          });

          const summary = Array.from(summaryMap.values()).map(s => ({
              ...s,
              net: s.paid - s.owe
          }));

          return { group, transactions, summary };
      } catch (e) {
          console.error(e);
          return null;
      }
  },

  addTransaction: async (transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
      return await fetchWithAuth('/transactions', {
          method: 'POST',
          body: JSON.stringify(transaction)
      });
  },

  createGroup: async (group: Omit<Group, 'id' | 'totalCost' | 'createdAt'>): Promise<Group> => {
      return await fetchWithAuth('/groups', {
          method: 'POST',
          body: JSON.stringify(group)
      });
  },

  getAllTransactions: async (): Promise<Transaction[]> => {
      const data = await fetchWithAuth('/transactions');
      return data;
  },

  // --- Member & Invite API ---

  searchUsers: async (query: string): Promise<User[]> => {
      if (!query) return [];
      const data = await fetchWithAuth(`/users/search?q=${encodeURIComponent(query)}`);
      return data;
  },

  getPendingInvitations: async (): Promise<Invitation[]> => {
      const data = await fetchWithAuth('/invitations');
      return data;
  },

  inviteUser: async (groupId: string, userId: string): Promise<void> => {
      await fetchWithAuth('/invitations', {
          method: 'POST',
          body: JSON.stringify({ groupId, userId })
      });
  },

  respondToInvite: async (inviteId: string, accept: boolean): Promise<void> => {
      await fetchWithAuth(`/invitations/${inviteId}/respond`, {
          method: 'POST',
          body: JSON.stringify({ accept })
      });
  },

  // --- Auth API ---

  login: async (email: string, password: string): Promise<User> => {
      const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!data.success) {
          throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data.user;
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
      const response = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (!data.success) {
          throw new Error(data.message || 'Signup failed');
      }

      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data.user;
  },

  logout: async (): Promise<void> => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Call backend logout if needed, but stateless JWT just needs client cleanup
      await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
  },

  verifyGoogleToken: async (token: string): Promise<{ user: User, accessToken: string }> => {
      const response = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
      });

      const data = await response.json();
      if (!data.success) {
          throw new Error(data.message || 'Google authentication failed');
      }

      // Persist session
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      return data.data;
  }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
