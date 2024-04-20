'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Compressor from 'compressorjs';

export type Point = { x: number; y: number, color: string, lineWidth: number };
export type Action = { type: string, point?: Point, url?: string };
type DrawingCanvasProps = {
    actions: Action[];
    setActions: (actions: Action[]) => void;
    sendDrawAction: (type: string, point?: Point, snapshot?: Blob) => void;
};

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ actions, setActions, sendDrawAction }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const [color, setColor] = useState('#000000');
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [lineWidth, setLineWidth] = useState(5);

    const openColorPicker = () => {
        if (colorInputRef.current)
            colorInputRef.current.click();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, []);


    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) return;

        const startDrawing = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            context.strokeStyle = color;
            context.lineWidth = lineWidth;

            context.beginPath();
            context.moveTo(x, y);
            sendDrawAction('draw-start', { x, y, color, lineWidth });
            setIsDrawing(true);
        };

        const draw = (e: MouseEvent) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            context.strokeStyle = color;
            context.lineWidth = lineWidth;

            context.lineTo(x, y);
            sendDrawAction('draw', { x, y, color, lineWidth });
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
    }, [isDrawing]); //eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!context) return;

        const redrawPaths = () => {
            actions.forEach((action, index) => {
                if (action.type === 'draw') {
                    context.strokeStyle = action.point!.color;
                    context.lineWidth = action.point!.lineWidth;
                    context.lineTo(action.point!.x, action.point!.y);
                    context.stroke();
                }
                else if (action.type === 'draw-start') {
                    context.strokeStyle = color;
                    context.lineWidth = lineWidth;
                    context.moveTo(action.point!.x, action.point!.y);
                    context.beginPath();
                }
                else if (action.type === 'draw-stop') {
                    context.closePath();
                }
                else if (action.type === 'round-start') {
                    if (canvas && context) {
                        context.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
                else if (action.type === 'req-snapshot') {
                    if (canvas) {

                        canvas.toBlob((blob) => {
                            if (blob) {
                                new Compressor(blob, {
                                    quality: 0.6,
                                    success: (compressedResult) => {
                                        sendDrawAction('snapshot', undefined, compressedResult);
                                        const url = URL.createObjectURL(compressedResult);
                                    },
                                });
                                const url = URL.createObjectURL(blob);
                            }
                        }, 'image/jpeg');
                    }
                }
                else if (action.type === 'render') {
                    const img = new Image();
                    if (action.url && canvas) {
                        img.onload = () => {
                            URL.revokeObjectURL(action.url as string);
                            canvas.width = img.width;
                            canvas.height = img.height;
                            context.clearRect(0, 0, canvas.width, canvas.height);
                            context.drawImage(img, 0, 0);
                        };
                        img.onerror = (e) => {
                            console.error('Error loading image from blob', e);
                        };
                        img.src = action.url;
                    }
                }
            });
            actions.length ? setActions([]) : null;
        };

        redrawPaths();
    }, [actions]); // eslint-disable-line react-hooks/exhaustive-deps

    return (<div className="relative">
        <div className="absolute top-0 left-0 z-10 flex space-x-2 m-2 p-2 bg-white rounded shadow-md">
            <button
                onClick={openColorPicker}
                className="bg-white text-black border rounded"
            >
                🎨
            </button>
            <input
                ref={colorInputRef}
                type="color"
                className="hidden"
                value={color}
                onChange={(e) => setColor(e.target.value)}
            />
            <label className="flex items-center space-x-1">
          <span className='text-black'>Width:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-24"  // Adjust width as needed
          />
        </label>
        </div>
        <canvas
            ref={canvasRef}
            width={980}
            height={540}
            className="border-2 border-gray-300 bg-white"
        />
    </div>
    );
};

export default DrawingCanvas;
