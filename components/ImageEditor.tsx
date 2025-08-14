import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as fabric from 'fabric';
import { 
    SelectIcon, TextIcon, RectangleIcon, CircleIcon, CropIcon, BackgroundRemoverIcon,
    UndoIcon, RedoIcon, ZoomInIcon, ZoomOutIcon, RotateIcon, FlipIcon, LayersIcon,
    FilterIcon, AdjustIcon, EffectsIcon, BrushIcon, EraserIcon, ShapeIcon, LineIcon,
    EyedropperIcon, MagicWandIcon, LassoIcon, MoveIcon, TransformIcon, AlignIcon,
    GroupIcon, UngroupIcon, LockIcon, UnlockIcon, DuplicateIcon, DeleteIcon
} from './icons';

interface ImageEditorProps {
    onBack: () => void;
}

type Tool = 'select' | 'move' | 'brush' | 'eraser' | 'eyedropper' | 'magicWand' | 'lasso' | 'text' | 'shape' | 'line' | 'crop' | 'transform';
type Shape = 'rect' | 'circle' | 'triangle' | 'star' | 'polygon' | 'arrow' | 'heart';
type Filter = 'blur' | 'sharpen' | 'noise' | 'pixelate' | 'emboss' | 'edge' | 'invert' | 'sepia' | 'grayscale' | 'vintage' | 'warm' | 'cool';
type Adjustment = 'brightness' | 'contrast' | 'saturation' | 'hue' | 'gamma' | 'exposure' | 'shadows' | 'highlights' | 'temperature' | 'tint';

interface Layer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    opacity: number;
    blendMode: string;
    objects: fabric.Object[];
}

interface HistoryState {
    canvas: string;
    layers: Layer[];
    timestamp: number;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onBack }) => {
    // Core state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [selectedShape, setSelectedShape] = useState<Shape>('rect');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Canvas and rendering
    const [canvasInstance, setCanvasInstance] = useState<fabric.Canvas | null>(null);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Layers system
    const [layers, setLayers] = useState<Layer[]>([]);
    const [activeLayerId, setActiveLayerId] = useState<string>('');
    const [showLayers, setShowLayers] = useState(true);
    
    // History and undo/redo
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [maxHistorySize] = useState(50);
    
    // Tool settings
    const [brushSize, setBrushSize] = useState(10);
    const [brushColor, setBrushColor] = useState('#000000');
    const [brushOpacity, setBrushOpacity] = useState(1);
    const [textColor, setTextColor] = useState('#000000');
    const [textSize, setTextSize] = useState(24);
    const [textFont, setTextFont] = useState('Arial');
    
    // Filters and adjustments
    const [activeFilter, setActiveFilter] = useState<Filter | null>(null);
    const [filterIntensity, setFilterIntensity] = useState(50);
    const [adjustments, setAdjustments] = useState<Record<Adjustment, number>>({
        brightness: 0, contrast: 0, saturation: 0, hue: 0, gamma: 1,
        exposure: 0, shadows: 0, highlights: 0, temperature: 0, tint: 0
    });
    
    // UI state
    const [showToolbar, setShowToolbar] = useState(true);
    const [showProperties, setShowProperties] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [showAdjustments, setShowAdjustments] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPoint, setLastPoint] = useState<fabric.Point | null>(null);

    // Save canvas state to history
    const saveToHistory = useCallback(() => {
        if (!canvasInstance) return;
        
        const canvasState = canvasInstance.toJSON();
        const newState: HistoryState = {
            canvas: JSON.stringify(canvasState),
            layers: [...layers],
            timestamp: Date.now()
        };
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        
        if (newHistory.length > maxHistorySize) {
            newHistory.shift();
        }
        
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [canvasInstance, layers, history, historyIndex, maxHistorySize]);

    // Initialize canvas
    useEffect(() => {
        if (!imageUrl || !canvasContainerRef.current) return;
        
        console.log('Initializing canvas with image:', imageUrl);
        
        const container = canvasContainerRef.current;
        const canvasEl = document.createElement('canvas');
        container.innerHTML = '';
        container.appendChild(canvasEl);

        const init = async () => {
            try {
                if (!container.clientWidth) {
                    console.log('Container not ready, retrying...');
                    setTimeout(init, 100);
                    return;
                }

                console.log('Creating Fabric.js canvas...');
                const canvas = new fabric.Canvas(canvasEl, {
                    preserveObjectStacking: true,
                    selection: true,
                    width: 800, // Start with reasonable default
                    height: 600,
                    backgroundColor: '#ffffff'
                });

            setCanvasInstance(canvas);

                console.log('Loading image from URL...');
                const img = await fabric.Image.fromURL(imageUrl, {
                    crossOrigin: 'anonymous'
                });

                if (!img.width || !img.height) {
                    throw new Error('Invalid image dimensions');
                }

                console.log('Image loaded, dimensions:', img.width, 'x', img.height);

                // Calculate scale to fit within reasonable bounds
                const maxWidth = 800;
                const maxHeight = 600;
                const scaleX = maxWidth / img.width;
                const scaleY = maxHeight / img.height;
                const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond original

                const canvasWidth = img.width * scale;
                const canvasHeight = img.height * scale;

                console.log('Setting canvas dimensions:', canvasWidth, 'x', canvasHeight, 'scale:', scale);

                canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
                
                img.set({ 
                    scaleX: scale, 
                    scaleY: scale,
                    left: 0,
                    top: 0,
                    selectable: false,
                    evented: false
                });
                
                // Create background layer
                const backgroundLayer: Layer = {
                    id: 'background',
                    name: 'Background',
                    visible: true,
                    locked: false,
                    opacity: 1,
                    blendMode: 'normal',
                    objects: [img]
                };
                
                setLayers([backgroundLayer]);
                setActiveLayerId('background');
                canvas.backgroundImage = img;
                canvas.renderAll();
                
                console.log('Canvas initialization completed successfully');
                saveToHistory();
                
            } catch (error) {
                console.error("Error initializing canvas:", error);
                setError(`Could not load image for editing: ${error instanceof Error ? error.message : 'Unknown error'}`);
                
                // Clean up on error
                setCanvasInstance(currentCanvas => {
                    currentCanvas?.dispose();
                    return null;
                });
            }
        };

        const timeoutId = setTimeout(init, 100);

        return () => {
            clearTimeout(timeoutId);
            setCanvasInstance(currentCanvas => {
                if (currentCanvas) {
                    console.log('Disposing canvas...');
                    currentCanvas.dispose();
                }
                return null;
            });
        };
    }, [imageUrl]); // Remove saveToHistory from dependencies to prevent infinite loops

    // Tool management
    useEffect(() => {
        const canvas = canvasInstance;
        if (!canvas) return;

        // Configure canvas based on active tool
        canvas.isDrawingMode = ['brush', 'eraser'].includes(activeTool);
        canvas.selection = activeTool === 'select';
        canvas.forEachObject(o => o.selectable = activeTool === 'select');

        if (activeTool === 'brush') {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = brushColor;
            canvas.freeDrawingBrush.width = brushSize;
            canvas.freeDrawingBrush.opacity = brushOpacity;
        } else if (activeTool === 'eraser') {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = '#ffffff';
            canvas.freeDrawingBrush.width = brushSize;
            canvas.freeDrawingBrush.opacity = 1;
        }

        if (activeTool !== 'select') {
            canvas.discardActiveObject();
        }
        canvas.renderAll();
    }, [canvasInstance, activeTool, brushColor, brushSize, brushOpacity]);

    // Event handlers
            const handleMouseDown = useCallback((e: any) => {
        if (!e.pointer || !canvasInstance) return;
            
            if (activeTool === 'text') {
            const textbox = new fabric.Textbox('Double click to edit', {
                left: e.pointer.x,
                top: e.pointer.y,
                fontFamily: textFont,
                fontSize: textSize,
                fill: textColor,
                originX: 'center',
                originY: 'center'
            });
            canvasInstance.add(textbox);
            canvasInstance.setActiveObject(textbox);
            setActiveTool('select');
            saveToHistory();
        } else if (activeTool === 'shape') {
            let shape: fabric.Object;
            const commonProps = {
                left: e.pointer.x,
                top: e.pointer.y,
                fill: brushColor,
                stroke: '#000000',
                strokeWidth: 2,
                originX: 'center' as any,
                originY: 'center' as any
            };

            switch (selectedShape) {
                case 'rect':
                    shape = new fabric.Rect({ ...commonProps, width: 100, height: 100 });
                    break;
                case 'circle':
                    shape = new fabric.Circle({ ...commonProps, radius: 50 });
                    break;
                case 'triangle':
                    shape = new fabric.Triangle({ ...commonProps, width: 100, height: 100 });
                    break;
                case 'star':
                    shape = new fabric.Rect({ ...commonProps, width: 100, height: 100 }); // Fallback to rect since Star doesn't exist
                    break;
                default:
                    shape = new fabric.Rect({ ...commonProps, width: 100, height: 100 });
            }
            
            canvasInstance.add(shape);
            canvasInstance.setActiveObject(shape);
            setActiveTool('select');
            saveToHistory();
        } else if (activeTool === 'line') {
            setIsDrawing(true);
            setLastPoint(e.pointer);
        }
    }, [canvasInstance, activeTool, selectedShape, brushColor, textFont, textSize, textColor, saveToHistory]);

    const handleMouseMove = useCallback((e: any) => {
        if (!e.pointer || !canvasInstance || !isDrawing || !lastPoint) return;

        if (activeTool === 'line') {
            const line = new fabric.Line([lastPoint.x, lastPoint.y, e.pointer.x, e.pointer.y], {
                stroke: brushColor,
                strokeWidth: brushSize,
                selectable: false
            });
            canvasInstance.add(line);
            setLastPoint(e.pointer);
        }
    }, [canvasInstance, activeTool, isDrawing, lastPoint, brushColor, brushSize]);

    const handleMouseUp = useCallback(() => {
        setIsDrawing(false);
        setLastPoint(null);
        if (activeTool === 'line') {
            setActiveTool('select');
            saveToHistory();
        }
    }, [activeTool, saveToHistory]);

    // Add event listeners
    useEffect(() => {
        const canvas = canvasInstance;
        if (!canvas) return;

        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
        canvas.on('object:modified', saveToHistory);
        canvas.on('object:added', saveToHistory);
        canvas.on('object:removed', saveToHistory);

        return () => {
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('mouse:move', handleMouseMove);
            canvas.off('mouse:up', handleMouseUp);
            canvas.off('object:modified', saveToHistory);
            canvas.off('object:added', saveToHistory);
            canvas.off('object:removed', saveToHistory);
        };
    }, [canvasInstance, handleMouseDown, handleMouseMove, handleMouseUp, saveToHistory]);

    // File handling
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            console.log('File selected:', file.name, 'Size:', file.size);
            setIsLoading(true);
            setError('');
            handleClear();
            setImageFile(file);
            const url = URL.createObjectURL(file);
            console.log('Created object URL:', url);
            setImageUrl(url);
        } else {
            setError('Please select a valid image file.');
        }
    };

    // Background removal
    const handleBgRemove = async () => {
        if (!imageFile || !canvasInstance) return;
        setIsLoading(true);
        setError('');
        
        try {
            // Placeholder for background removal - would need to implement or use a service
            setError('Background removal feature is not available yet.');
            
        } catch (err: any) {
            setError(err.message || 'Background removal failed.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Cropping
    const startCropping = () => {
        if (!canvasInstance || isCropping) return;
        setIsCropping(true);
        setActiveTool('crop');
        canvasInstance.forEachObject(o => o.selectable = false);
        canvasInstance.discardActiveObject();
        
        const cropRect = new fabric.Rect({
            fill: 'rgba(0,0,0,0.5)',
            left: 50,
            top: 50,
            width: 200,
            height: 150,
            stroke: 'white',
            strokeWidth: 1,
            strokeDashArray: [5, 5],
            hasControls: true,
            lockRotation: true,
            borderColor: 'white',
            cornerColor: 'white',
            selectable: true
        });
        
        canvasInstance.add(cropRect);
        canvasInstance.setActiveObject(cropRect);
        canvasInstance.renderAll();
    };

    const applyCrop = () => {
        const cropRect = canvasInstance?.getActiveObject();
        if (!canvasInstance || !cropRect) return;

        const { left, top } = cropRect;
        const width = cropRect.getScaledWidth();
        const height = cropRect.getScaledHeight();
        
        if (left === undefined || top === undefined || !width || !height) return;

        const croppedDataUrl = canvasInstance.toDataURL({
            format: 'png',
            left,
            top,
            width,
            height,
            multiplier: 1
        });

        canvasInstance.remove(cropRect);
        setIsCropping(false);
        setActiveTool('select');
        
        const currentObjects = canvasInstance.getObjects().filter(o => o !== cropRect);
        setImageUrl(croppedDataUrl);

        setTimeout(() => {
            canvasInstance?.add(...currentObjects);
            canvasInstance?.renderAll();
            saveToHistory();
        }, 100);
    };

    // History operations
    const handleUndo = () => {
        if (historyIndex > 0 && canvasInstance) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const state = history[newIndex];
            canvasInstance.loadFromJSON(JSON.parse(state.canvas), () => {
                canvasInstance.renderAll();
            });
            setLayers(state.layers);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1 && canvasInstance) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const state = history[newIndex];
            canvasInstance.loadFromJSON(JSON.parse(state.canvas), () => {
                canvasInstance.renderAll();
            });
            setLayers(state.layers);
        }
    };

    // Zoom and rotation
    const handleZoom = (delta: number) => {
        const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
        setZoom(newZoom);
        if (canvasInstance) {
            canvasInstance.setZoom(newZoom);
            canvasInstance.renderAll();
        }
    };

    const handleRotate = (angle: number) => {
        const newRotation = (rotation + angle) % 360;
        setRotation(newRotation);
        if (canvasInstance) {
            canvasInstance.setAngle(newRotation);
            canvasInstance.renderAll();
        }
    };

    // Layer operations
    const addLayer = () => {
        const newLayer: Layer = {
            id: `layer-${Date.now()}`,
            name: `Layer ${layers.length + 1}`,
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'normal',
            objects: []
        };
        setLayers([...layers, newLayer]);
        setActiveLayerId(newLayer.id);
    };

    const deleteLayer = (layerId: string) => {
        if (layers.length <= 1) return;
        setLayers(layers.filter(l => l.id !== layerId));
        if (activeLayerId === layerId) {
            setActiveLayerId(layers[0].id);
        }
    };

    const toggleLayerVisibility = (layerId: string) => {
        setLayers(layers.map(l => 
            l.id === layerId ? { ...l, visible: !l.visible } : l
        ));
    };

    // Download
    const handleDownload = () => {
        if (canvasInstance) {
            const link = document.createElement('a');
            link.download = 'edited-image.png';
            link.href = canvasInstance.toDataURL({ 
                format: 'png', 
                quality: 1.0, 
                multiplier: 1 
            });
            link.click();
        }
    };
    
    // Clear
    const handleClear = () => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setImageFile(null);
        setImageUrl('');
        setError('');
        setIsLoading(false);
        setIsCropping(false);
        setActiveTool('select');
        setLayers([]);
        setHistory([]);
        setHistoryIndex(-1);
        setZoom(1);
        setRotation(0);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const toolIsActive = (tool: Tool) => activeTool === tool;

    return (
        <div className="w-full h-screen flex flex-col bg-slate-100 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Tools
            </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Advanced Image Editor</h1>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md disabled:opacity-50">
                            <UndoIcon className="h-5 w-5" />
                        </button>
                        <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md disabled:opacity-50">
                            <RedoIcon className="h-5 w-5" />
                        </button>
                        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2"></div>
                        <button onClick={() => handleZoom(-0.1)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md">
                            <ZoomOutIcon className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-medium w-16 text-center">{(zoom * 100).toFixed(0)}%</span>
                        <button onClick={() => handleZoom(0.1)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md">
                            <ZoomInIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleRotate(90)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md">
                            <RotateIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                        </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Tools */}
                {showToolbar && (
                    <div className="w-16 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center py-4 gap-2">
                        <button title="Select" onClick={() => setActiveTool('select')} className={`p-3 rounded-md ${toolIsActive('select') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <SelectIcon className="h-5 w-5" />
                        </button>
                        <button title="Move" onClick={() => setActiveTool('move')} className={`p-3 rounded-md ${toolIsActive('move') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <MoveIcon className="h-5 w-5" />
                        </button>
                        <button title="Brush" onClick={() => setActiveTool('brush')} className={`p-3 rounded-md ${toolIsActive('brush') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <BrushIcon className="h-5 w-5" />
                        </button>
                        <button title="Eraser" onClick={() => setActiveTool('eraser')} className={`p-3 rounded-md ${toolIsActive('eraser') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <EraserIcon className="h-5 w-5" />
                        </button>
                        <button title="Eyedropper" onClick={() => setActiveTool('eyedropper')} className={`p-3 rounded-md ${toolIsActive('eyedropper') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <EyedropperIcon className="h-5 w-5" />
                        </button>
                        <button title="Magic Wand" onClick={() => setActiveTool('magicWand')} className={`p-3 rounded-md ${toolIsActive('magicWand') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <MagicWandIcon className="h-5 w-5" />
                        </button>
                        <button title="Lasso" onClick={() => setActiveTool('lasso')} className={`p-3 rounded-md ${toolIsActive('lasso') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <LassoIcon className="h-5 w-5" />
                        </button>
                        <button title="Text" onClick={() => setActiveTool('text')} className={`p-3 rounded-md ${toolIsActive('text') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <TextIcon className="h-5 w-5" />
                        </button>
                        <button title="Shape" onClick={() => setActiveTool('shape')} className={`p-3 rounded-md ${toolIsActive('shape') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <ShapeIcon className="h-5 w-5" />
                        </button>
                        <button title="Line" onClick={() => setActiveTool('line')} className={`p-3 rounded-md ${toolIsActive('line') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <LineIcon className="h-5 w-5" />
                        </button>
                        <button title="Crop" onClick={isCropping ? applyCrop : startCropping} className={`p-3 rounded-md ${isCropping ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <CropIcon className="h-5 w-5" />
                        </button>
                        <button title="Transform" onClick={() => setActiveTool('transform')} className={`p-3 rounded-md ${toolIsActive('transform') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <TransformIcon className="h-5 w-5" />
                        </button>
                        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 my-2"></div>
                        <button title="Remove Background" onClick={handleBgRemove} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md">
                            <BackgroundRemoverIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Main Canvas Area */}
                <div className="flex-1 flex flex-col">
                    {!imageUrl ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="mt-4 flex flex-col justify-center items-center w-full max-w-2xl mx-auto px-6 py-10 border-2 border-slate-300 border-dashed rounded-md dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <input id="file-upload" type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                                    <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-2 text-slate-500">Click to upload an image</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div ref={canvasContainerRef} className="flex-1 relative bg-slate-200 dark:bg-slate-700 overflow-auto flex justify-center items-center p-4">
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex flex-col justify-center items-center rounded-md z-50">
                                    <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="mt-2 text-slate-600 dark:text-slate-400">Processing...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Properties, Layers, Filters */}
                <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700">
                        <button onClick={() => { setShowProperties(true); setShowFilters(false); setShowAdjustments(false); }} className={`flex-1 p-3 text-sm font-medium ${showProperties ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            Properties
                        </button>
                        <button onClick={() => { setShowProperties(false); setShowFilters(true); setShowAdjustments(false); }} className={`flex-1 p-3 text-sm font-medium ${showFilters ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            Filters
                        </button>
                        <button onClick={() => { setShowProperties(false); setShowFilters(false); setShowAdjustments(true); }} className={`flex-1 p-3 text-sm font-medium ${showAdjustments ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            Adjust
                        </button>
                    </div>

                    {/* Properties Panel */}
                    {showProperties && (
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                {/* Tool Properties */}
                                {activeTool === 'brush' && (
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Brush Properties</h3>
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-xs text-slate-600 dark:text-slate-400">Size</label>
                                                <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full" />
                                                <span className="text-xs text-slate-500">{brushSize}px</span>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-600 dark:text-slate-400">Color</label>
                                                <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-full h-8 rounded border" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-600 dark:text-slate-400">Opacity</label>
                                                <input type="range" min="0" max="1" step="0.1" value={brushOpacity} onChange={(e) => setBrushOpacity(Number(e.target.value))} className="w-full" />
                                                <span className="text-xs text-slate-500">{Math.round(brushOpacity * 100)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTool === 'text' && (
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Text Properties</h3>
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-xs text-slate-600 dark:text-slate-400">Font</label>
                                                <select value={textFont} onChange={(e) => setTextFont(e.target.value)} className="w-full p-2 border rounded text-sm">
                                                    <option value="Arial">Arial</option>
                                                    <option value="Helvetica">Helvetica</option>
                                                    <option value="Times New Roman">Times New Roman</option>
                                                    <option value="Georgia">Georgia</option>
                                                    <option value="Verdana">Verdana</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-600 dark:text-slate-400">Size</label>
                                                <input type="range" min="8" max="72" value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} className="w-full" />
                                                <span className="text-xs text-slate-500">{textSize}px</span>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-600 dark:text-slate-400">Color</label>
                                                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8 rounded border" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTool === 'shape' && (
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Shape Properties</h3>
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-xs text-slate-600 dark:text-slate-400">Shape</label>
                                                <select value={selectedShape} onChange={(e) => setSelectedShape(e.target.value as Shape)} className="w-full p-2 border rounded text-sm">
                                                    <option value="rect">Rectangle</option>
                                                    <option value="circle">Circle</option>
                                                    <option value="triangle">Triangle</option>
                                                    <option value="star">Star</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-600 dark:text-slate-400">Fill Color</label>
                                                <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-full h-8 rounded border" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-slate-900 dark:text-white">Filters</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['blur', 'sharpen', 'noise', 'pixelate', 'emboss', 'edge', 'invert', 'sepia', 'grayscale', 'vintage', 'warm', 'cool'] as Filter[]).map(filter => (
                                        <button
                                            key={filter}
                                            onClick={() => setActiveFilter(filter)}
                                            className={`p-2 text-xs rounded border ${activeFilter === filter ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                        >
                                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                {activeFilter && (
                                    <div className="mt-4">
                                        <label className="text-xs text-slate-600 dark:text-slate-400">Intensity</label>
                                        <input type="range" min="0" max="100" value={filterIntensity} onChange={(e) => setFilterIntensity(Number(e.target.value))} className="w-full" />
                                        <span className="text-xs text-slate-500">{filterIntensity}%</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Adjustments Panel */}
                    {showAdjustments && (
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-slate-900 dark:text-white">Adjustments</h3>
                                {(['brightness', 'contrast', 'saturation', 'hue', 'gamma', 'exposure', 'shadows', 'highlights', 'temperature', 'tint'] as Adjustment[]).map(adjustment => (
                                    <div key={adjustment}>
                                        <label className="text-xs text-slate-600 dark:text-slate-400 capitalize">{adjustment}</label>
                                        <input
                                            type="range"
                                            min={adjustment === 'gamma' ? 0.1 : -100}
                                            max={adjustment === 'gamma' ? 3 : 100}
                                            step={adjustment === 'gamma' ? 0.1 : 1}
                                            value={adjustments[adjustment]}
                                            onChange={(e) => setAdjustments({...adjustments, [adjustment]: Number(e.target.value)})}
                                            className="w-full"
                                        />
                                        <span className="text-xs text-slate-500">{adjustments[adjustment]}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                    {/* Layers Panel */}
                    <div className="border-t border-slate-200 dark:border-slate-700">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-slate-900 dark:text-white">Layers</h3>
                                <button onClick={addLayer} className="text-xs text-indigo-600 hover:text-indigo-700">+ Add</button>
                            </div>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {layers.map(layer => (
                                    <div key={layer.id} className={`flex items-center justify-between p-2 rounded text-xs ${activeLayerId === layer.id ? 'bg-indigo-100 dark:bg-indigo-900' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => toggleLayerVisibility(layer.id)} className="text-slate-500">
                                                {layer.visible ? '👁️' : '👁️‍🗨️'}
                                            </button>
                                            <span className="truncate">{layer.name}</span>
                                        </div>
                                        <button onClick={() => deleteLayer(layer.id)} className="text-red-500 hover:text-red-700">×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowToolbar(!showToolbar)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md">
                            {showToolbar ? 'Hide' : 'Show'} Tools
                        </button>
                        <button onClick={() => setShowLayers(!showLayers)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md">
                            <LayersIcon className="h-5 w-5" />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button onClick={handleClear} className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                            Clear
                        </button>
                        <button onClick={handleDownload} disabled={!imageUrl} className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed">
                            Download
                         </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ImageEditor;
