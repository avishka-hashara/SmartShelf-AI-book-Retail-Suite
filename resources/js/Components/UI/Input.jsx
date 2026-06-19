import React from 'react';

/**
 * Input - Labelled form input with optional icon, error and hint.
 *
 * @param {string}    label       - Field label
 * @param {string}    type        - HTML input type (default: 'text')
 * @param {string}    placeholder
 * @param {string}    error       - Validation error message
 * @param {string}    hint        - Helper text below input
 * @param {ReactNode} leadingIcon - Icon element inside input
 * @param {boolean}   required
 * @param {string}    className
 * @returns {JSX.Element}
 */
const Input = React.forwardRef(({
    label,
    type = 'text',
    placeholder,
    error,
    hint,
    leadingIcon,
    required = false,
    className = '',
    id,
    ...rest
}, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label htmlFor={inputId} className="form-label">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}

            <div className={leadingIcon ? 'search-input-wrapper' : ''}>
                {leadingIcon && (
                    <span className="search-icon">{leadingIcon}</span>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    placeholder={placeholder}
                    className={`
            ${leadingIcon ? 'search-input' : 'form-input'}
            ${error ? 'border-red-400 focus:ring-red-400' : ''}
          `}
                    {...rest}
                />
            </div>

            {error && <p className="form-error">{error}</p>}
            {hint && !error && <p className="form-hint">{hint}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
