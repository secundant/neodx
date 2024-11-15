import clsx from 'clsx';
import { type ReactNode } from 'react';

interface TabProps<Value> {
  label: string;
  value: Value;
  children: ReactNode;
}

interface TabsProps<Value> {
  tabs: TabProps<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
}

export const Tabs = <Value extends string>({
  tabs,
  value,
  onChange,
  className
}: TabsProps<Value>) => (
  <div className="flex flex-col">
    <div className="flex gap-2 pb-4">
      {tabs.map((tab, index) => (
        <label
          key={index}
          className={clsx(
            'cursor-pointer rounded-md py-1 px-2 text-base',
            value === tab.value
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-blue-500 hover:bg-gray-100 active:bg-gray-200',
            'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500',
            className
          )}
        >
          <input
            type="radio"
            name="tabs"
            value={tab.value}
            className="size-0 opacity-0"
            checked={value === tab.value}
            onChange={() => onChange(tab.value)}
          />
          {tab.label}
        </label>
      ))}
    </div>
    {tabs.find(it => it.value === value)?.children}
  </div>
);
