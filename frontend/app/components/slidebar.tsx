export default function Sidebar() {
    return (
        // Головний контейнер сайдбару: ширина 220px, білий фон, рамка справа
        <aside className="w-[220px] bg-white border-r border-[#E4E6F0] flex flex-col py-5 h-screen sticky top-0 shrink-0">

            {/* Логотип */}
            <div className="px-5 pb-5 border-b border-[#E4E6F0] mb-3">
                <span className="text-[18px] font-semibold text-[#6B5CE7]">
                    plato<span className="text-[#0EA5A0]">do</span>
                </span>
            </div>

            {/* Навігація (Меню) */}
            <nav className="flex flex-col">
                {/* Активний пункт меню */}
                <div className="flex items-center gap-[10px] px-5 py-[9px] text-[13px] font-medium text-[#6B5CE7] bg-[#EEF0FF] cursor-pointer">
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
                    Dashboard
                    <span className="ml-auto bg-[#6B5CE7] text-white text-[10px] px-1.5 py-[1px] rounded-full font-semibold">
                        3
                    </span>
                </div>

                {/* Неактивний пункт меню */}
                <div className="flex items-center gap-[10px] px-5 py-[9px] text-[13px] font-medium text-[#4A4A6A] hover:text-[#6B5CE7] hover:bg-[#EEF0FF] cursor-pointer transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M1 7h14" /></svg>
                    Planner
                </div>

                {/* Ще один пункт */}
                <div className="flex items-center gap-[10px] px-5 py-[9px] text-[13px] font-medium text-[#4A4A6A] hover:text-[#6B5CE7] hover:bg-[#EEF0FF] cursor-pointer transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2a6 6 0 100 12A6 6 0 008 2z" /><path d="M8 5v3l2 2" /></svg>
                    Alerts
                </div>
            </nav>

            {/* Профіль користувача (притиснутий донизу завдяки mt-auto) */}
            <div className="mt-auto px-5 pt-3 border-t border-[#E4E6F0]">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#6B5CE7] text-white flex items-center justify-center text-[11px] font-semibold">
                        B
                    </div>
                    <span className="text-[12px] font-medium text-[#14142B]">Bohdan</span>
                </div>
            </div>

        </aside>
    );
}