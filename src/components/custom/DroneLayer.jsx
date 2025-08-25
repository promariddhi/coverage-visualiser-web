import { useEffect, useRef } from "react";

import { DRONE_SIZE, CANVAS_SIZE } from "@/src/lib/utils";

const DroneLayer = ({ drones }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drones.forEach((d) => {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(d.x, d.y, DRONE_SIZE / 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [drones]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="absolute top-9 left-0 pointer-events-none"
    />
  );
};
export default DroneLayer;
