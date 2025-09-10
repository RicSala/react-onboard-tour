import { useState, useEffect } from 'react';

interface DebuggerProps {
  element: HTMLElement;
  floatingStyles: {
    position?: string;
    top?: string | number;
    left?: string | number;
    transform?: string;
  };
  currentStep: number;
  floatingRef: React.RefObject<HTMLElement>;
  isTourActive: boolean;
}

// Debugger Component
export const Debugger = ({
  element,
  floatingStyles,
  currentStep,
  floatingRef,
  isTourActive,
}: DebuggerProps) => {
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    setUpdateCount((prev) => prev + 1);
  }, [floatingStyles.position, floatingStyles.top, floatingStyles.transform]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        left: 10,
        background: 'rgba(0, 0, 0, 0.95)',
        color: '#00ff00',
        padding: '15px',
        fontSize: '11px',
        fontFamily: 'monospace',
        zIndex: 100000,
        borderRadius: '8px',
        width: '400px',
        border: '1px solid #00ff00',
      }}
    >
      <div style={{ color: '#ffff00', fontSize: '14px', marginBottom: '10px' }}>
        🔍 Tour Debugger
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Tour Active:</strong> {isTourActive ? '✅' : '❌'}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Step:</strong> {currentStep}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Element:</strong> {element ? '✅ EXISTS' : '❌ NULL'}
      </div>
      <div
        style={{
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid #555',
        }}
      >
        <div style={{ color: '#ff00ff', marginBottom: '5px' }}>
          FloatingStyles:
        </div>
        <div style={{ paddingLeft: '10px' }}>
          <div>
            <strong>position:</strong> {floatingStyles.position || 'undefined'}
          </div>
          <div>
            <strong>top:</strong> {floatingStyles.top || 'undefined'}
          </div>
          <div>
            <strong>left:</strong> {floatingStyles.left || 'undefined'}
          </div>
          <div>
            <strong>transform:</strong>{' '}
            {floatingStyles.transform || 'undefined'}
          </div>
        </div>
      </div>
      {/* floating size */}
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#888' }}>
        Floating Size: {floatingRef.current?.getBoundingClientRect().width}x
        {floatingRef.current?.getBoundingClientRect().height}
      </div>
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#888' }}>
        Updates: {updateCount}
      </div>
    </div>
  );
};
