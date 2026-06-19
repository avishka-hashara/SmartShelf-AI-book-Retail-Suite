import React from 'react';

export default function InteractiveSeatMap({ layout = [], activeSessions = [], selectedSeat, onSelectSeat }) {
    const occupiedSeats = new Set(
        activeSessions
            .map(s => s?.seat_number?.toString()?.toUpperCase())
            .filter(Boolean)
    );

    return (
        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 mt-4 backdrop-blur-sm shadow-inner transition-all duration-300">
            <div className="text-center mb-6 flex flex-wrap items-center justify-between gap-4">
                <h4 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Lounge Layout</h4>
                <div className="flex items-center justify-center gap-3 text-[11px] font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-slate-300 shadow-sm"></span> Available</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-200"></span> Selected</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 opacity-70"></span> Occupied</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-16 max-w-lg mx-auto my-4 justify-items-center">
                {layout.map(table => {
                    const numSeats = table.seats;
                    const radius = numSeats > 4 ? 48 : 36; // Adjust radius based on number of seats
                    const tableSizeClasses = numSeats > 4 ? "w-24 h-24 sm:w-28 sm:h-28" : "w-20 h-20 sm:w-24 sm:h-24";
                    const centerSizeClasses = numSeats > 4 ? "w-16 h-16 sm:w-20 sm:h-20" : "w-12 h-12 sm:w-14 sm:h-14";
                    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

                    return (
                        <div key={table.id} className="relative flex flex-col items-center justify-center group mb-4">
                            <div className={`relative flex items-center justify-center ${tableSizeClasses}`}>
                                {/* Table Center */}
                                <div className={`absolute ${centerSizeClasses} bg-white/80 backdrop-blur-md rounded-full shadow-sm border-2 border-slate-200 flex flex-col items-center justify-center z-10 transition-colors group-hover:border-indigo-100`}>
                                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-400 transition-colors uppercase tracking-wider">{table.label || table.id}</span>
                                </div>

                                {/* Chairs */}
                                {Array.from({ length: numSeats }).map((_, index) => {
                                    const seatLetter = letters[index % letters.length];
                                    const seatId = `${table.id}-${seatLetter}`;
                                    const isOccupied = occupiedSeats.has(seatId.toUpperCase());
                                    const isSelected = selectedSeat === seatId;

                                    // Start angle at top (-90 degrees or -Math.PI / 2)
                                    const startAngle = -Math.PI / 2;
                                    const angle = startAngle + (index * (2 * Math.PI) / numSeats);

                                    // Calculate center offset from 50%
                                    const x = 50 + (Math.cos(angle) * radius);
                                    const y = 50 + (Math.sin(angle) * radius);

                                    return (
                                        <button
                                            key={seatId}
                                            type="button"
                                            disabled={isOccupied}
                                            onClick={() => onSelectSeat(seatId)}
                                            style={{
                                                left: `${x}%`,
                                                top: `${y}%`,
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                            title={isOccupied ? "Occupied" : "Available"}
                                            className={`absolute w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-all duration-200
                                                ${isOccupied
                                                    ? 'bg-rose-50 border border-rose-100 text-rose-400/80 opacity-60 cursor-not-allowed'
                                                    : isSelected
                                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-indigo-100 z-20 scale-125'
                                                        : 'bg-white text-slate-500 border border-slate-200 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md hover:scale-110 hover:z-20 cursor-pointer'
                                                }
                                            `}
                                        >
                                            {seatLetter}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Visual Lounge Elements */}
            <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center justify-center">
                <div className="w-32 h-6 bg-slate-200/30 rounded-full flex items-center justify-center border border-slate-200/50 shadow-inner">
                    <span className="text-[9px] font-bold text-slate-400/80 uppercase tracking-widest text-center">Entrance / Counter</span>
                </div>
            </div>
        </div>
    );
}
