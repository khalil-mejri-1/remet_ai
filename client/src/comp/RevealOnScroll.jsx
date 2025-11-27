import React, { useEffect, useRef, useState } from 'react';

const RevealOnScroll = ({ children, threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // عندما يظهر العنصر بنسبة معينة على الشاشة
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref.current); // إيقاف المراقبة بعد الظهور الأول لتحسين الأداء
        }
      },
      {
        threshold: threshold, // نسبة الظهور المطلوبة (0.1 = 10%)
        rootMargin: "0px 0px -50px 0px" // هامش لتأخير الحركة قليلاً
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return (
    <div 
      ref={ref} 
      className={`reveal-element ${isVisible ? 'active' : ''}`}
    >
      {children}
    </div>
  );
};

export default RevealOnScroll;