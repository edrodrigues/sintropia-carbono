"use client";

import { useState, useRef, useEffect } from "react";

interface Script {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ScriptsManagerProps {
  scripts: Script[];
}

export function ScriptsManager({ scripts }: ScriptsManagerProps) {
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [args, setArgs] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const runScript = async () => {
    if (!selectedScript || isRunning) return;

    setIsRunning(true);
    setOutput([]);
    
    try {
      const response = await fetch("/api/admin/scripts/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script: selectedScript,
          args: args.trim() ? args.split(" ") : [],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setOutput([`error: ${errorText}`]);
        setIsRunning(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setOutput(["error: Failed to read stream"]);
        setIsRunning(false);
        return;
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n\n").filter(Boolean);
        setOutput((prev) => [...prev, ...lines]);
      }
    } catch (error) {
      setOutput((prev) => [...prev, `error: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Script List */}
      <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {scripts.map((script) => (
          <button
            key={script.id}
            onClick={() => !isRunning && setSelectedScript(script.id)}
            disabled={isRunning}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
              selectedScript === script.id
                ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 ring-2 ring-indigo-500/20"
                : "bg-white border-gray-200 hover:border-indigo-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-indigo-800"
            } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{script.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{script.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {script.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Execution Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {selectedScript ? `Executar: ${selectedScript}` : "Selecione um script para começar"}
            </h2>
            <button
              onClick={runScript}
              disabled={!selectedScript || isRunning}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${
                !selectedScript || isRunning
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none"
              }`}
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Executando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Executar Script
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Argumentos (opcional)
              </label>
              <input
                type="text"
                value={args}
                onChange={(e) => setArgs(e.target.value)}
                placeholder="Ex: --dry-run --audience=123"
                disabled={isRunning}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Saída do Console
              </label>
              <div
                ref={outputRef}
                className="w-full h-[400px] bg-gray-950 text-emerald-400 font-mono text-sm p-4 rounded-xl overflow-y-auto border border-gray-800 shadow-inner custom-scrollbar"
              >
                {output.length === 0 ? (
                  <span className="text-gray-600">Aguardando execução...</span>
                ) : (
                  output.map((line, i) => {
                    const isError = line.startsWith("error:");
                    const isDone = line.startsWith("done:");
                    const cleanLine = line.replace(/^(data|error|done): /, "");
                    
                    return (
                      <div key={i} className={`mb-1 whitespace-pre-wrap ${
                        isError ? "text-red-400" : isDone ? "text-indigo-400 font-bold" : ""
                      }`}>
                        {isError ? "✖ " : isDone ? "✓ " : "> "}{cleanLine}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Security Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 dark:bg-amber-900/10 dark:border-amber-900/30">
          <svg className="w-5 h-5 text-amber-600 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div>
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">Atenção Admin</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              Estes scripts têm acesso direto ao banco de dados e à API do Resend. Use com cautela e sempre teste com <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded text-amber-900 dark:text-amber-100">--dry-run</code> quando disponível antes de realizar ações reais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
