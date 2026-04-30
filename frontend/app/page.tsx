export default function Home() {
  return (
    <>
      {/* main-header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[18px] font-semibold text-[#14142B]">Good morning, Bohdan 👋</div>
          <div className="text-[12px] text-[#8888AA]">Wednesday, April 22</div>
        </div>
        <button className="bg-[#6B5CE7] text-white border-none py-2 px-3.5 rounded-[12px] text-[12px] font-medium flex items-center gap-1.5 cursor-pointer hover:bg-[#5a4cdb] transition-colors">
          + Add task
        </button>
      </div>

      {/* add bar */}
      <div className="bg-white border-[1.5px] border-[#C4BEFA] rounded-[16px] py-2.5 px-3.5 flex items-center gap-2.5 mb-5 shadow-sm">
        <span className="text-[#6B5CE7] text-[16px]">✦</span>
        <input 
          type="text" 
          placeholder='Type anything — "math exam Friday" or "essay by Thursday 11pm"…' 
          className="flex-1 text-[13px] text-[#4A4A6A] placeholder-[#8888AA] outline-none bg-transparent"
        />
        <span className="text-[11px] text-[#8B7CF8] bg-[#EEF0FF] py-0.5 px-2 rounded-full font-medium shrink-0">AI parses</span>
      </div>

      {/* stat row */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="bg-[#6B5CE7] border border-[#6B5CE7] rounded-[16px] py-3 px-3.5">
          <div className="text-[22px] font-semibold text-white leading-none">5</div>
          <div className="text-[11px] text-white/70 mt-1">Tasks today</div>
        </div>
        <div className="bg-white border border-[#E4E6F0] rounded-[16px] py-3 px-3.5">
          <div className="text-[22px] font-semibold text-[#14142B] leading-none">2</div>
          <div className="text-[11px] text-[#8888AA] mt-1">Due this week</div>
        </div>
        <div className="bg-white border border-[#E4E6F0] rounded-[16px] py-3 px-3.5">
          <div className="text-[22px] font-semibold text-[#14142B] leading-none">8</div>
          <div className="text-[11px] text-[#8888AA] mt-1">Completed</div>
        </div>
      </div>

      {/* planner strip */}
      <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#8888AA] mb-2">This week</div>
      <div className="grid grid-cols-7 gap-1 mb-4">
        {[
          { name: 'Mon', num: 19 },
          { name: 'Tue', num: 20 },
          { name: 'Wed', num: 21, today: true },
          { name: 'Thu', num: 22 },
          { name: 'Fri', num: 23 },
          { name: 'Sat', num: 24 },
          { name: 'Sun', num: 25 },
        ].map((day) => (
          <div key={day.name} className={`border rounded-[12px] py-1.5 px-1 text-center flex flex-col items-center ${day.today ? 'bg-[#6B5CE7] border-[#6B5CE7]' : 'bg-white border-[#E4E6F0]'}`}>
            <div className={`text-[9px] font-semibold uppercase ${day.today ? 'text-white/70' : 'text-[#8888AA]'}`}>{day.name}</div>
            <div className={`text-[14px] font-semibold leading-tight ${day.today ? 'text-white' : 'text-[#14142B]'}`}>{day.num}</div>
            <div className={`w-1 h-1 rounded-full mt-1 ${day.today ? 'bg-white' : 'bg-[#C4BEFA]'}`}></div>
          </div>
        ))}
      </div>

      {/* tasks */}
      <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#8888AA] mb-2 mt-6">Today's tasks</div>
      
      <div className="bg-white border border-[#E4E6F0] rounded-[16px] p-3 mb-2 flex items-center gap-2.5">
        <div className="w-[18px] h-[18px] rounded-full border-2 border-[#CDD0E8] shrink-0 flex items-center justify-center cursor-pointer hover:border-[#6B5CE7] transition-colors"></div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[#14142B] whitespace-nowrap overflow-hidden text-ellipsis">Math exam preparation</div>
          <div className="text-[11px] text-[#8888AA] mt-0.5 flex items-center gap-1.5">
            Due Friday · 
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#6B5CE7] bg-[#EEF0FF] rounded-full py-0.5 px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B5CE7] animate-pulse"></span>
              AI parsed
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-medium py-0.5 px-1.5 rounded-full bg-[#E0F7F6] text-[#0EA5A0]">Math</span>
          <span className="text-[10px] font-semibold py-0.5 px-1.5 rounded-full bg-[#FEE2E2] text-[#EF4444]">P5</span>
        </div>
      </div>

      <div className="bg-white border border-[#E4E6F0] rounded-[16px] p-3 mb-2 flex items-center gap-2.5">
        <div className="w-[18px] h-[18px] rounded-full border-2 border-[#CDD0E8] shrink-0 flex items-center justify-center cursor-pointer hover:border-[#6B5CE7] transition-colors"></div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[#14142B] whitespace-nowrap overflow-hidden text-ellipsis">History essay — draft</div>
          <div className="text-[11px] text-[#8888AA] mt-0.5">Due Thursday 11pm</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-medium py-0.5 px-1.5 rounded-full bg-[#E0F7F6] text-[#0EA5A0]">History</span>
          <span className="text-[10px] font-semibold py-0.5 px-1.5 rounded-full bg-[#FEF3C7] text-[#F59E0B]">P4</span>
        </div>
      </div>

      <div className="bg-white border border-[#E4E6F0] rounded-[16px] p-3 mb-2 flex items-center gap-2.5">
        <div className="w-[18px] h-[18px] rounded-full border-2 border-[#10B981] bg-[#10B981] shrink-0 flex items-center justify-center cursor-pointer">
          <span className="text-white text-[12px] font-bold">✓</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[#8888AA] line-through whitespace-nowrap overflow-hidden text-ellipsis">Read chapter 4</div>
          <div className="text-[11px] text-[#8888AA] mt-0.5">Completed today</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-medium py-0.5 px-1.5 rounded-full bg-[#E0F7F6] text-[#0EA5A0]">Physics</span>
        </div>
      </div>
    </>
  );
}
