import React from 'react';

const GRADIENTS = {
    orange: 'linear-gradient(135deg, #f47b20 0%, #994700 100%)',
    pink: 'linear-gradient(135deg, #fc4c99 0%, #b80566 100%)',
    indigo: 'linear-gradient(135deg, #8f92ff 0%, #4849da 100%)',
    teal: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
};

/**
 * StatCard - Vivid gradient KPI metric card for dashboard overview.
 *
 * @param {string} title    - Metric label
 * @param {string} value    - Metric value (formatted externally)
 * @param {string} change   - Change string e.g. '+12%' or '-2%'
 * @param {JSX.Element} icon - Icon element shown top-right and as watermark
 * @param {'orange'|'pink'|'indigo'|'teal'} tone - Gradient tone
 * @param {string} subtitle - Optional extra sub-text line
 * @param {string} changeLabel - Comparison label next to the change badge (default 'vs last period')
 * @returns {JSX.Element}
 */
const StatCard = ({
    title,
    value,
    change,
    icon,
    tone = 'orange',
    subtitle,
    changeLabel = 'vs last period',
}) => {
    const isPositive = change?.startsWith('+');
    const isNegative = change?.startsWith('-');

    return (
        <div
            className="stat-grad-card animate-fade-up"
            style={{ background: GRADIENTS[tone] || GRADIENTS.orange }}
        >
            <div className="flex items-start justify-between">
                <span className="stat-grad-label">{title}</span>
                <div className="stat-grad-icon">{icon}</div>
            </div>

            <div>
                <p className="stat-grad-value">{value}</p>
                <div className="mt-2 flex items-center gap-2">
                    {change && (
                        <span className="stat-grad-change">
                            {isPositive && '↑'}
                            {isNegative && '↓'}
                            {!isPositive && !isNegative && '—'} {change}
                        </span>
                    )}
                    <span className="stat-grad-subtitle">{changeLabel}</span>
                </div>
                {subtitle && <p className="stat-grad-subtitle mt-1">{subtitle}</p>}
            </div>

            {/* Watermark icon */}
            <div className="qa-watermark">{icon}</div>
        </div>
    );
};

export default StatCard;
