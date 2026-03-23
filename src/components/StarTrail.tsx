import { useEffect, useState, useRef } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
}

const colors = [
  "hsl(210, 100%, 65%)",  // Azul brilhante
  "hsl(200, 100%, 75%)",  // Azul claro
  "hsl(0, 0%, 95%)",      // Branco quase puro
];

const StarTrail = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const starIdRef = useRef(0);
  const [isMobile, setIsMobile] = useState(true); // Iniciar como true para evitar renderização inicial

  // Função createStar deve estar fora dos hooks para ser acessível
  const createStar = (x: number, y: number) => {
    const newStar: Star = {
      id: starIdRef.current++,
      x: x + 12, // Offset para a ponta do cursor
      y: y + 12, // Offset para a ponta do cursor
      size: Math.random() * 10 + 6, // Entre 6 e 16px (menores e delicadas)
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
    };

    setStars((prev) => {
      const updated = [...prev, newStar];
      // Aumentar número de estrelas para rastro mais longo
      return updated.slice(-60);
    });

    // Aumentar tempo para rastro mais lento
    setTimeout(() => {
      setStars((prev) => prev.filter((star) => star.id !== newStar.id));
    }, 2400);
  };

  // SEMPRE chamar todos os hooks na mesma ordem
  useEffect(() => {
    // Detectar se é mobile - apenas desktop deve mostrar estrelas
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      const isMobileDevice = isTouchDevice || isSmallScreen;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // SEMPRE chamar este useEffect, mas só adicionar listeners se não for mobile
  useEffect(() => {
    // Não fazer nada no mobile
    if (isMobile) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      createStar(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMobile]); // Dependência de isMobile para reagir quando mudar

  // Não renderizar nada no mobile - retornar null DEPOIS de todos os hooks
  if (isMobile) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star-trail"
            style={{
              left: `${star.x}px`,
              top: `${star.y}px`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              color: star.color,
              transform: `translate(-50%, -50%) rotate(${star.rotation}deg)`,
            }}
          >
            <svg
              width={star.size}
              height={star.size}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
                opacity="0.6"
                filter="drop-shadow(0 0 4px currentColor)"
              />
            </svg>
          </div>
        ))}
      </div>
      <style>{`
        .star-trail {
          position: fixed;
          pointer-events: none;
          animation: starFade 2.4s ease-out forwards;
        }
        
        @keyframes starFade {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) scale(0);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) scale(0.3);
          }
        }
      `}</style>
    </>
  );
};

export default StarTrail;
