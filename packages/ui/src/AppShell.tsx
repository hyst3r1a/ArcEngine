import type { ReactNode } from "react";

type Tab = {
  key: string;
  label: string;
  icon: ReactNode;
};

type Props = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  children: ReactNode;
};

export function AppShell({ tabs, activeTab, onTabChange, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-arc-bg/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                activeTab === tab.key
                  ? "text-arc-accent"
                  : "text-arc-muted hover:text-arc-text"
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
