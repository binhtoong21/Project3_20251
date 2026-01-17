import { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

export const useNotificationCounts = () => {
    const { user } = useAuth();
    const [counts, setCounts] = useState({
        buyer: { toConfirm: 0, total: 0 },
        seller: { toShip: 0, disputed: 0, total: 0 },
        admin: { pendingDeposits: 0, pendingWithdrawals: 0, total: 0 }
    });

    const fetchCounts = useCallback(async () => {
        if (!user) return;
        try {
            const data = await apiClient.get('/users/notifications/counts');
            setCounts(data);
        } catch (error) {
            console.error("Failed to fetch notification counts", error);
        }
    }, [user]);

    // Fetch on mount and when user changes
    useEffect(() => {
        fetchCounts();
        
        // Optional: Poll every 60 seconds
        const interval = setInterval(fetchCounts, 60000);
        return () => clearInterval(interval);
    }, [fetchCounts]);

    return { counts, refetchCounts: fetchCounts };
};
