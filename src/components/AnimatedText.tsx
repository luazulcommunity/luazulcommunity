import React from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ 
  text, 
  className = "",
  delay = 0 
}) => {
  const letters = text.split("");

  return (
    <span className={`inline-block ${className}`}>
      {letters.map((letter, index) => (
        <span
          key={index}
          className="text-gradient-letter"
          style={{
            animationDelay: `${(index * 0.25) + delay}s`,
            animationDuration: "8s",
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
    </span>
  );
};

