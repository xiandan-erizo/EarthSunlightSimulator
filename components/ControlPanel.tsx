import React from 'react';
import { Calendar, Clock, Info, Loader2, Sun, Play, Pause } from 'lucide-react';
import { GeminiAnalysis } from '../types';

interface ControlPanelProps {
  date: Date;
  setDate: (date: Date) => void;
  hour: number;
  setHour: (h: number) => void;
  dayOfYear: number;
  setDayOfYear: (d: number) => void;
  isAutoPlaying: boolean;
  setIsAutoPlaying: (playing: boolean) => void;
  onAnalyze: () => void;
  analysis: GeminiAnalysis;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  date,
  hour,
  setHour,
  dayOfYear,
  setDayOfYear,
  isAutoPlaying,
  setIsAutoPlaying,
  onAnalyze,
  analysis
}) => {
  
  const formatTime = (h: number) => {
    const hours = Math.floor(h);
    const minutes = Math.floor((h - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} UTC`;
  };

  const formatDateFromDay = (dayIndex: number) => {
    const date = new Date(2024, 0); // Start of year
    date.setDate(dayIndex + 1);
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-80 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-6 text-white shadow-2xl transition-all duration-300 hover:border-white/20 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sun className="w-6 h-6 text-yellow-400" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-200 to-orange-400 bg-clip-text text-transparent">
            TerraLux 3D
          </h1>
        </div>
        
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`p-2 rounded-full transition-colors ${isAutoPlaying ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
          title={isAutoPlaying ? "暂停时间流逝" : "开始时间流逝"}
        >
          {isAutoPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        
        {/* Time Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-300">
            <span className="flex items-center gap-2"><Clock size={14} /> 时间 (UTC)</span>
            <span className="font-mono text-yellow-400">{formatTime(hour)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="24"
            step="0.01"
            value={hour}
            onChange={(e) => setHour(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400 hover:accent-yellow-300"
          />
        </div>

        {/* Day of Year Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-300">
            <span className="flex items-center gap-2"><Calendar size={14} /> 日期 (季节)</span>
            <span className="font-mono text-blue-300">{formatDateFromDay(dayOfYear)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="364"
            step="1"
            value={dayOfYear}
            onChange={(e) => setDayOfYear(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-400 hover:accent-blue-300"
          />
          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span>1月</span>
            <span>6月 (夏至)</span>
            <span>12月</span>
          </div>
        </div>

        {/* AI Action */}
        <button
          onClick={onAnalyze}
          disabled={analysis.loading}
          className="w-full group relative flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg font-medium transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analysis.loading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <Info className="w-4 h-4" />
          )}
          {analysis.loading ? "Gemini 正在分析..." : "解读当前日照情况"}
        </button>

        {/* AI Result */}
        {(analysis.text || analysis.error) && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10 text-sm leading-relaxed text-gray-200 animate-fade-in">
            {analysis.error ? (
              <span className="text-red-400">{analysis.error}</span>
            ) : (
              analysis.text
            )}
          </div>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/10 text-xs text-gray-500 text-center">
        {isAutoPlaying ? "自动演示中 - 拖动滑块手动调节" : "手动模式 - 点击播放按钮自动演示"}
      </div>
    </div>
  );
};