'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Compressor from 'compressorjs';

export type Point = { x: number; y: number };
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
            context.beginPath();
            context.moveTo(x, y);
            sendDrawAction('draw-start', { x, y });
            setIsDrawing(true);
        };

        const draw = (e: MouseEvent) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            context.lineTo(x, y);
            sendDrawAction('draw', { x, y });
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
    }, [actions]);

    return <canvas
        ref={canvasRef}
        width={900}
        height={500}
        className="border-2 border-gray-300 bg-white"
    />
};

export default DrawingCanvas;
