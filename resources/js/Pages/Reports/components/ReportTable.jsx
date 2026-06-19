import React from 'react';

const ReportTable = ({ columns, data, totals = false, maxHeight = 'none' }) => {
    return (
        <div className="table-wrapper" style={{ maxHeight }}>
            <table className="table">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} className={col.align === 'right' ? 'text-right' : ''}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, i) => (
                            <tr key={i}>
                                {columns.map(col => (
                                    <td key={col.key} className={col.align === 'right' ? 'text-right font-medium' : ''}>
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-12 text-slate-400 italic">
                                No records found for this period
                            </td>
                        </tr>
                    )}
                </tbody>
                {totals && data.length > 0 && (
                    <tfoot>
                        <tr>
                            {columns.map((col, i) => (
                                <td key={col.key} className={col.align === 'right' ? 'text-right' : ''}>
                                    {i === 0 ? 'TOTALS' : (col.total ? col.total : '')}
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
};

export default ReportTable;
