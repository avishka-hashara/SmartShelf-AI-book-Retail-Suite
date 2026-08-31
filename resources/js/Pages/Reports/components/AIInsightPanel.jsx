import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Sparkles, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * AIInsightPanel - Fetches AI-generated retail narratives from the backend service.
 *
 * Props:
 *   section   – 'overview' | 'sales' | 'inventory' | 'customers'
 *   filters   – { date_from, date_to, ... }
 *   className – optional extra classes on the outer wrapper
 */

const AIInsightPanel = ({ section = 'overview', filters, className = '' }) => {
    const [narrative, setNarrative] = useState('');
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState(false);
    const [fetched, setFetched]     = useState(false);

    const fetchNarrative = useCallback(async () => {
        setLoading(true);
        setError(false);

        try {
            const { data } = await axios.post('/api/reports/ai-narrative', {
                section,
                date_from: filters?.date_from,
                date_to: filters?.date_to,
            });

            if (data?.narrative) {
                setNarrative(data.narrative);
                setFetched(true);
            } else {
                throw new Error('Empty narrative received');
            }
        } catch (err) {
            console.error('[AIInsightPanel] error:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [section, filters?.date_from, filters?.date_to]);

    useEffect(() => {
        if (filters?.date_from && filters?.date_to) {
            fetchNarrative();
        }
    }, [fetchNarrative]);

    const sectionLabel = {
        overview:  'Overview',
        sales:     'Sales',
        inventory: 'Inventory',
        customers: 'Customers',
    }[section] ?? 'Report';

    return (
        <div className={`ai-insight-panel ${className}`}>
            <div className="ai-insight-inner">
                {/* Header */}
                <div className="ai-insight-header">
                    <div className="ai-insight-badge">
                        <span className="ai-badge-glow" />
                        <Sparkles size={14} className="ai-badge-icon" />
                        <span>AI Insights</span>
                    </div>
                    <button
                        onClick={fetchNarrative}
                        disabled={loading}
                        title="Regenerate insight"
                        className="ai-refresh-btn"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Body */}
                <div className="ai-insight-body">
                    {loading ? (
                        <div className="ai-loading-row">
                            <Loader2 size={18} className="animate-spin text-violet-400" />
                            <span className="ai-loading-text">
                                Analysing {sectionLabel.toLowerCase()} data…
                            </span>
                        </div>
                    ) : error ? (
                        <div className="ai-error-row">
                            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
                            <span>
                                Could not generate AI insights at this time. Please check your backend configuration.
                            </span>
                        </div>
                    ) : narrative ? (
                        <p className="ai-narrative-text">{narrative}</p>
                    ) : (
                        <p className="ai-narrative-text ai-narrative-muted">
                            Click <RefreshCw size={11} className="inline mb-0.5" /> to generate
                            an AI narrative for this section.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIInsightPanel;

