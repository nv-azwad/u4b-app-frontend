'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (children !== displayChildren) {
      setTransitionStage('fadeOut');
    }
  }, [children, displayChildren]);

  return (
    <div
      className={`
        ${transitionStage === 'fadeIn' ? 'animate-slide-in-right' : ''}
        ${transitionStage === 'fadeOut' ? 'animate-slide-out-left' : ''}
      `}
      onAnimationEnd={() => {
        if (transitionStage === 'fadeOut') {
          setDisplayChildren(children);
          setTransitionStage('fadeIn');
        }
      }}
    >
      {displayChildren}
    </div>
  );
}