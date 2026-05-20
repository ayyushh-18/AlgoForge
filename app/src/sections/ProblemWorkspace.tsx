import { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle2, ChevronDown, Moon, Sun, Monitor } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { getProblemById, executeCode } from '@/api/content';
import { toast } from 'sonner';

interface ProblemWorkspaceProps {
  problemId: string;
  onBack: () => void;
}

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' }
];

export function ProblemWorkspace({ problemId, onBack }: ProblemWorkspaceProps) {
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string>('// Write your code here');
  const [language, setLanguage] = useState<string>('javascript');
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [fontSize, setFontSize] = useState<number>(14);
  const [output, setOutput] = useState<string>('Execute code to see output here.');
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const data = await getProblemById(problemId);
        setProblem(data);
        
        // Load saved code from local storage
        const savedCode = localStorage.getItem(`code_${problemId}_${language}`);
        if (savedCode) {
          setCode(savedCode);
        } else {
          // Provide some boilerplate based on language
          const boilerplate: Record<string, string> = {
            javascript: `function solve() {\n  // Your code here\n}\n`,
            python: `def solve():\n    # Your code here\n    pass\n`,
            cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}\n`,
            java: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n`,
          };
          setCode(boilerplate[language] || '// Write your code here');
        }
      } catch (error) {
        toast.error('Failed to load problem');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId, language]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      localStorage.setItem(`code_${problemId}_${language}`, value);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Code cannot be empty');
      return;
    }
    
    setIsExecuting(true);
    setOutput('Running...');
    
    try {
      const result = await executeCode(problemId, code, language);
      if (result.error && !result.stdout) {
        setOutput(`Error:\n${result.error}`);
      } else {
        setOutput(result.output || 'Code executed successfully with no output.');
      }
    } catch (error: any) {
      setOutput(`Execution failed: ${error.message || 'Server error'}`);
      toast.error('Failed to execute code');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = async () => {
    toast.info('Full submission logic with test cases will be implemented next');
    await handleRunCode();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 text-center text-white/60 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#a088ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen pt-24 pb-12 text-center text-white/60 flex items-center justify-center flex-col">
        <p className="mb-4">Problem not found.</p>
        <button onClick={onBack} className="text-[#a088ff] hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#141414] pt-[72px]">
      {/* Top Navbar for Workspace */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#141414] z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Back</span>
          </button>
          <div className="h-4 w-px bg-white/20" />
          <h2 className="text-white font-medium truncate max-w-[200px] sm:max-w-md">{problem.title}</h2>
          <span className={`px-2 py-0.5 rounded text-xs font-medium difficulty-${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border border-white/10 text-sm transition-colors ${
              isExecuting ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
            }`}
          >
            {isExecuting ? (
               <div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
            ) : (
               <Play className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isExecuting ? 'Running' : 'Run Code'}</span>
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#a088ff] hover:bg-[#b09dff] text-white transition-colors text-sm font-medium shadow-lg shadow-[#a088ff]/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Problem Description */}
        <div className="w-full md:w-1/2 lg:w-[45%] xl:w-[40%] flex flex-col border-r border-white/10 overflow-hidden bg-[#141414]">
          <div className="h-10 border-b border-white/10 flex items-center px-4 bg-white/5 shrink-0">
            <span className="text-white/80 text-sm font-medium">Description</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 scrollbar-custom">
            <div className="prose prose-invert max-w-none">
              <h1 className="text-2xl font-bold text-white mb-4">{problem.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {(problem.tags || []).map((tag: string) => (
                  <span key={tag} className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="text-white/80 leading-relaxed space-y-4 whitespace-pre-wrap">
                {problem.description}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Editor and Console */}
        <div className="w-full md:flex-1 flex flex-col min-h-0">
          {/* Editor Header */}
          <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-white/80 text-sm focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id} className="bg-[#202020]">
                    {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-white/40" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-xs">A</span>
                <input 
                  type="range" 
                  min="12" max="24" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-16 accent-[#a088ff]"
                />
                <span className="text-white/40 text-xs text-xl">A</span>
              </div>
              <button 
                onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
                className="text-white/60 hover:text-white"
                title="Toggle Theme"
              >
                {theme === 'vs-dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Editor Area */}
          <div className="flex-1 min-h-0 bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={language}
              theme={theme}
              value={code}
              onChange={handleEditorChange}
              options={{
                fontSize: fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                padding: { top: 16, bottom: 16 },
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              }}
              loading={<div className="text-white/40 p-4">Loading editor...</div>}
            />
          </div>

          {/* Console / Output Area */}
          <div className="h-[200px] xl:h-[250px] border-t border-white/10 flex flex-col shrink-0 bg-[#141414]">
            <div className="h-10 border-b border-white/10 flex items-center px-4 bg-white/5 shrink-0">
              <Monitor className="w-4 h-4 text-white/60 mr-2" />
              <span className="text-white/80 text-sm font-medium">Console Output</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-white/60 whitespace-pre-wrap">
              {output}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
