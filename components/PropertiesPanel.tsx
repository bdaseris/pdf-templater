import React, { useState } from 'react';
import { EditorElement } from '../types';
import { Trash2, Sparkles, AlignLeft, AlignCenter, AlignRight, Bold, Italic, RotateCw } from 'lucide-react';
import { generateTextContent } from '../services/geminiService';

interface PropertiesPanelProps {
  element: EditorElement | null;
  onChange: (id: string, updates: Partial<EditorElement>) => void;
  onDelete: (id: string) => void;
  canvasSettings: { backgroundColor: string };
  onCanvasSettingChange: (settings: { backgroundColor: string }) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  element, 
  onChange, 
  onDelete,
  canvasSettings,
  onCanvasSettingChange
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStyleChange = (key: keyof React.CSSProperties, value: any) => {
    if (!element) return;
    onChange(element.id, {
      style: { ...element.style, [key]: value }
    });
  };

  const handleAI = async () => {
    if (!element || !aiPrompt) return;
    setIsGenerating(true);
    const newText = await generateTextContent(aiPrompt, element.content);
    onChange(element.id, { content: newText });
    setIsGenerating(false);
    setAiPrompt('');
  };

  if (!element) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <h3 className="font-semibold text-gray-800 mb-4">Canvas Settings</h3>
        <div className="space-y-4">
           <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={canvasSettings.backgroundColor}
                onChange={(e) => onCanvasSettingChange({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <span className="text-sm text-gray-600">{canvasSettings.backgroundColor}</span>
            </div>
          </div>
        </div>
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
          Select an element on the canvas to edit its properties.
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 capitalize">{element.type} Properties</h3>
        <button 
          onClick={() => onDelete(element.id)}
          className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors"
          title="Delete Element"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        {/* Layout */}
        <section>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Layout</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">X</label>
              <input 
                type="number" 
                value={Math.round(element.x)} 
                onChange={(e) => onChange(element.id, { x: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Y</label>
              <input 
                type="number" 
                value={Math.round(element.y)} 
                onChange={(e) => onChange(element.id, { y: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Width</label>
              <input 
                type="number" 
                value={Math.round(element.width)} 
                onChange={(e) => onChange(element.id, { width: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Height</label>
              <input 
                type="number" 
                value={Math.round(element.height)} 
                onChange={(e) => onChange(element.id, { height: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
            <div className="col-span-2">
               <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><RotateCw size={10} /> Rotation (deg)</label>
               <input 
                type="number" 
                value={Math.round(element.rotation || 0)}
                onChange={(e) => onChange(element.id, { rotation: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
               />
            </div>
          </div>
        </section>

        {/* Content specific properties */}
        {element.type === 'text' && (
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Typography</h4>
            
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Content</label>
              <textarea 
                rows={4}
                value={element.content} 
                onChange={(e) => onChange(element.id, { content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* AI Magic */}
            <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
               <div className="flex items-center gap-2 mb-2 text-indigo-700">
                 <Sparkles size={16} />
                 <span className="text-xs font-bold">AI Magic Write</span>
               </div>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={aiPrompt}
                   onChange={(e) => setAiPrompt(e.target.value)}
                   placeholder="e.g., Professional bio..."
                   className="flex-1 px-2 py-1 text-xs border border-indigo-200 rounded focus:outline-none text-white"
                 />
                 <button 
                  onClick={handleAI}
                  disabled={isGenerating || !aiPrompt}
                  className="bg-indigo-600 text-white text-xs px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                 >
                   {isGenerating ? '...' : 'Go'}
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Font Size</label>
                <input 
                  type="number" 
                  value={parseInt(element.style.fontSize?.toString() || '16')}
                  onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-white"
                />
              </div>
              <div>
                 <label className="block text-xs text-gray-500 mb-1">Color</label>
                 <div className="flex items-center gap-2 border border-gray-300 rounded-md p-1">
                  <input 
                    type="color" 
                    value={element.style.color?.toString() || '#000000'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="w-6 h-6 border-0 p-0 text-white"
                  />
                  <span className="text-xs text-gray-600 truncate">{element.style.color}</span>
                 </div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => handleStyleChange('fontWeight', element.style.fontWeight === 'bold' ? 'normal' : 'bold')}
                className={`p-2 rounded border ${element.style.fontWeight === 'bold' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600'}`}
              >
                <Bold size={16} />
              </button>
              <button 
                onClick={() => handleStyleChange('fontStyle', element.style.fontStyle === 'italic' ? 'normal' : 'italic')}
                className={`p-2 rounded border ${element.style.fontStyle === 'italic' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600'}`}
              >
                <Italic size={16} />
              </button>
               <button 
                onClick={() => handleStyleChange('textAlign', 'left')}
                className={`p-2 rounded border ${element.style.textAlign === 'left' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600'}`}
              >
                <AlignLeft size={16} />
              </button>
               <button 
                onClick={() => handleStyleChange('textAlign', 'center')}
                className={`p-2 rounded border ${element.style.textAlign === 'center' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600'}`}
              >
                <AlignCenter size={16} />
              </button>
               <button 
                onClick={() => handleStyleChange('textAlign', 'right')}
                className={`p-2 rounded border ${element.style.textAlign === 'right' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600'}`}
              >
                <AlignRight size={16} />
              </button>
            </div>
          </section>
        )}

        {(element.type === 'box' || element.type === 'text') && (
           <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Appearance</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={element.style.backgroundColor?.toString() || '#ffffff'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="w-full h-8 cursor-pointer text-white"
                  />
                </div>
              </div>
               <div>
                <label className="block text-xs text-gray-500 mb-1">Border Radius (px)</label>
                <input 
                  type="range" 
                  min="0"
                  max="50"
                  value={parseInt(element.style.borderRadius?.toString() || '0')}
                  onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)}
                  className="w-full text-white"
                />
              </div>
            </div>
           </section>
        )}

        {element.type === 'image' && (
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Image Source</h4>
            <div className="mb-4">
               <label className="block text-xs text-gray-500 mb-1">URL</label>
               <input 
                 type="text" 
                 value={element.content} 
                 onChange={(e) => onChange(element.id, { content: e.target.value })}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-white"
               />
               <p className="text-xs text-gray-400 mt-1">Supports generic image URLs</p>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Opacity</label>
              <input 
                type="range" 
                min="0" max="1" step="0.1"
                value={element.style.opacity || 1}
                onChange={(e) => handleStyleChange('opacity', e.target.value)}
                className="w-full text-white"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;