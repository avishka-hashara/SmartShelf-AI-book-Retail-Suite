import { useState, useEffect } from 'react';
import axios from 'axios';

export const useReportData = (endpoint, filters) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(endpoint, { params: filters });
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching report data:', err);
            setError('Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (endpoint) {
            fetchData();
        }
    }, [endpoint, filters.date_from, filters.date_to, filters.branch, filters.category]);

    return { data, loading, error, refresh: fetchData };
};
