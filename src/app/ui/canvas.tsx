'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export type Point = { x: number; y: number };
type DrawingCanvasProps = {
    actions: { type: string, point?: Point }[];
    setActions: (actions: { type: string, point?: Point }[]) => void;
    sendDrawAction: (type: string, point?: Point) => void;
};

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ actions, setActions, sendDrawAction }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const searchParams = useSearchParams();
    const role = searchParams.get('role');

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) return;

        const startDrawing = (e: MouseEvent) => {
            context.beginPath();
            context.moveTo(e.offsetX, e.offsetY);
            sendDrawAction('draw-start', { x: e.offsetX, y: e.offsetY });
            setIsDrawing(true);
        };

        const draw = (e: MouseEvent) => {
            if (!isDrawing) return;
            context.lineTo(e.offsetX, e.offsetY);
            sendDrawAction('draw', { x: e.offsetX, y: e.offsetY });
            context.stroke();
        };

        const stopDrawing = () => {
            context.closePath();
            sendDrawAction('draw-stop');
            setIsDrawing(false);
        };

        if (role == 'admin') {
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseleave', stopDrawing);
        }
        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
        };
    }, [isDrawing]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!context) return;

        const redrawPaths = () => {
            actions.forEach((action, index) => {
                if (action.type === 'draw') {
                    context.lineTo(action.point!.x, action.point!.y);
                    context.stroke();
                }
                else if (action.type === 'draw-start') {
                    context.moveTo(action.point!.x, action.point!.y);
                    context.beginPath();
                }
                else if (action.type === 'draw-stop') {
                    context.closePath();
                }
            });
            actions.length ? setActions([]) : null;
        };

        redrawPaths();
    }, [actions]);

    return <canvas
        ref={canvasRef}
        width={900}
        height={500}
        className="border-2 border-gray-300 bg-white"
    />
};

export default DrawingCanvas;
