
import React, { useState, useCallback, useMemo } from 'react';
import { QuizMode, QuizState, QuizResult, RadarData } from './types';
import { NORMAL_QUESTIONS, DETAILED_QUESTIONS, DIMENSIONS_MAPPING } from './constants';
import { generateFengRoast } from './services/geminiService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

// --- Sub-components ---

const FlickerOverlay = () => <div className="flicker-overlay" />;

const StartPage: React.FC<{ onStart: (mode: QuizMode) => void }> = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
    <div className="relative mb-12">
      <div className="w-32 h-32 rounded-full border-4 border-[#F97316] animate-pulse flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border-2 border-[#F97316] opacity-50"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-[#F97316]">
        压抑
      </div>
    </div>

    <h1 className="text-4xl font-black mb-4 tracking-tighter">你压抑吗？</h1>
    <p className="text-gray-400 mb-12 max-w-sm">
      在精英主义的崩坏中寻找底层逻辑，<br/>
      量化你的“性压抑”与职场焦虑。
    </p>

    <div className="space-y-4 w-full max-w-xs">
      <button
        onClick={() => onStart(QuizMode.NORMAL)}
        className="w-full py-4 bg-[#F97316] text-black font-bold text-lg hover:bg-orange-600 transition-colors uppercase tracking-widest"
      >
        普通版：1分钟速测
      </button>
      <button
        onClick={() => onStart(QuizMode.DETAILED)}
        className="w-full py-4 border-2 border-[#F97316] text-[#F97316] font-bold text-lg hover:bg-[#F97316] hover:text-black transition-all uppercase tracking-widest"
      >
        详细版：SCL-90 硬核分析
      </button>
    </div>

    <p className="mt-8 text-xs text-gray-500 italic">
      * 本测试不具备医疗效力，纯属抽象艺术交流
    </p>
  </div>
);

const QuizPage: React.FC<{
  state: QuizState;
  onAnswer: (questionId: string, value: number) => void;
}> = ({ state, onAnswer }) => {
  const questions = state.mode === QuizMode.NORMAL ? NORMAL_QUESTIONS : DETAILED_QUESTIONS;
  const currentQuestion = questions[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / questions.length) * 100;

  // SAFETY: If index is out of bounds during transition, don't crash
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        正在同步数据...
      </div>
    );
  }

  const handleSelect = (val: number) => {
    onAnswer(currentQuestion.id, val);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="h-1 bg-gray-800 w-full rounded-full overflow-hidden">
          <div className="h-full bg-[#F97316] transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="mt-2 text-right text-xs text-gray-500 font-mono">
          {state.currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-8 leading-tight">
          {currentQuestion.text}
        </h2>

        <div className="space-y-4">
          {state.mode === QuizMode.NORMAL ? (
            currentQuestion.options?.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx + 1)}
                className="w-full p-4 border border-gray-700 text-left hover:border-[#F97316] hover:bg-[#F97316]/5 transition-all group"
              >
                <span className="inline-block w-8 text-gray-600 group-hover:text-[#F97316] font-mono">0{idx + 1}</span>
                {opt}
              </button>
            ))
          ) : (
            <div className="space-y-4">
              {['从无', '很轻', '中度', '偏重', '严重'].map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx + 1)}
                  className="w-full p-4 border border-gray-700 text-left hover:border-[#F97316] transition-all flex justify-between items-center"
                >
                  <span>{label}</span>
                  <span className="text-xs text-gray-500 font-mono">{idx + 1}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-gray-600 uppercase tracking-widest font-mono">
        Suburban Failure Aesthetics Lab
      </div>
    </div>
  );
};

const ResultPage: React.FC<{ result: QuizResult; onReset: () => void }> = ({ result, onReset }) => {
  const radarData: RadarData[] = useMemo(() => {
    return Object.entries(result.factorScores).map(([key, val]) => ({
      subject: key,
      A: val,
      fullMark: 100,
    }));
  }, [result.factorScores]);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white p-6 pb-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none select-none">
        <img src="https://picsum.photos/800/1200?grayscale" alt="shadow" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        <header className="mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-sm font-mono text-[#F97316]">QUANTIFIED SUPPRESSION REPORT</h1>
          <div className="flex justify-between items-end mt-2">
            <h2 className="text-3xl font-black">压抑指数报告</h2>
            <div className="text-4xl font-black text-[#F97316]">{result.overallScore}</div>
          </div>
        </header>

        {radarData.length > 0 && (
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 mb-8 border border-gray-800">
            <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase text-center">系统防御因子分布</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 9 }} />
                  <Radar
                    name="Suppression"
                    dataKey="A"
                    stroke="#F97316"
                    fill="#F97316"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-[#F97316] text-black p-6 rounded-sm shadow-2xl relative mb-12">
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-[#1A1A1A] border-4 border-[#F97316] flex items-center justify-center font-black text-white">
            峰
          </div>
          <h3 className="font-bold text-sm mb-2 border-b border-black/20 pb-1 uppercase tracking-tighter">峰哥亡命天涯 毒舌点评</h3>
          <p className="text-handwriting text-lg leading-relaxed whitespace-pre-wrap">
            {result.aiRoast}
          </p>
        </div>

        <button
          onClick={onReset}
          className="w-full py-4 border border-gray-700 text-gray-500 font-bold hover:text-white hover:border-white transition-all uppercase tracking-widest text-sm"
        >
          重新审视底层逻辑
        </button>
      </div>

      <footer className="fixed bottom-0 left-0 w-full p-4 bg-black/80 backdrop-blur-md border-t border-gray-800 text-center flex justify-center space-x-2">
         <div className="text-[10px] text-gray-500 uppercase font-mono py-2">
           Developed by Abstract Lab 2024
         </div>
      </footer>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [state, setState] = useState<QuizState>({
    mode: QuizMode.HOME,
    currentQuestionIndex: 0,
    answers: {},
  });
  const [isLoading, setIsLoading] = useState(false);

  const startQuiz = (mode: QuizMode) => {
    setState({
      mode,
      currentQuestionIndex: 0,
      answers: {},
    });
  };

  const calculateResult = useCallback(async (finalAnswers: Record<string, number>, currentMode: QuizMode) => {
    setIsLoading(true);

    let overallScore = 0;
    let factorScores: Record<string, number> = {};

    if (currentMode === QuizMode.NORMAL) {
      // Normal mode logic
      const total = (Object.values(finalAnswers) as number[]).reduce((a, b) => a + b, 0);
      overallScore = Math.min(Math.round((total / 18) * 100), 100);

      NORMAL_QUESTIONS.forEach(q => {
        factorScores[q.dimension] = ((finalAnswers[q.id] || 0) / 3) * 100;
      });
    } else {
      // Detailed mode logic
      let sum = 0;
      Object.entries(DIMENSIONS_MAPPING).forEach(([factor, questionIds]) => {
        const factorSum = questionIds.reduce((acc, qid) => acc + (finalAnswers[qid] || 0), 0);
        const factorAvg = factorSum / questionIds.length;
        factorScores[factor] = ((factorAvg - 1) / 4) * 100;
        sum += factorAvg;
      });
      overallScore = Math.min(Math.round(((sum / 9 - 1) / 4) * 100), 100);
    }

    const aiRoast = await generateFengRoast(currentMode, factorScores, overallScore);

    setState(prev => ({
      ...prev,
      mode: QuizMode.RESULT,
      scoreResult: {
        overallScore,
        factorScores,
        aiRoast
      }
    }));
    setIsLoading(false);
  }, []);

  const handleAnswer = (qid: string, val: number) => {
    const nextAnswers = { ...state.answers, [qid]: val };
    const questions = state.mode === QuizMode.NORMAL ? NORMAL_QUESTIONS : DETAILED_QUESTIONS;

    if (state.currentQuestionIndex >= questions.length - 1) {
      // Last question answered - calculate results
      setState(prev => ({ ...prev, answers: nextAnswers, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
      calculateResult(nextAnswers, state.mode);
    } else {
      // Not the last question - increment index
      setState(prev => ({
        ...prev,
        answers: nextAnswers,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  const reset = () => {
    setState({
      mode: QuizMode.HOME,
      currentQuestionIndex: 0,
      answers: {},
    });
  };

  return (
    <div className="min-h-screen relative bg-[#1A1A1A] text-white">
      <FlickerOverlay />

      {isLoading && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 relative mb-8">
             <div className="absolute inset-0 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin"></div>
             <div className="absolute inset-4 border-2 border-[#F97316] opacity-30 border-b-transparent rounded-full animate-spin-slow"></div>
          </div>
          <h2 className="text-2xl font-black mb-4 tracking-widest uppercase">底层逻辑解构中...</h2>
          <p className="text-[#F97316] animate-pulse text-sm font-mono">
            {Math.random() > 0.5 ? "正在同步库尔勒力工市场的实时数据" : "正在提取15块钱盒饭的香气参数"}
          </p>
        </div>
      )}

      {state.mode === QuizMode.HOME && <StartPage onStart={startQuiz} />}

      {(state.mode === QuizMode.NORMAL || state.mode === QuizMode.DETAILED) && (
        <QuizPage
          state={state}
          onAnswer={handleAnswer}
        />
      )}

      {state.mode === QuizMode.RESULT && state.scoreResult && (
        <ResultPage result={state.scoreResult} onReset={reset} />
      )}
    </div>
  );
}
