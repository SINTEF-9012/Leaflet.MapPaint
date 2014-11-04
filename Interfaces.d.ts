interface Touch {
	identifier: number;
	target: EventTarget;
	screenX: number;
	screenY: number;
	clientX: number;
	clientY: number;
	pageX: number;
	pageY: number;
}

interface TouchList extends Array<Touch> {
	item(index: number): Touch;
	identifiedTouch(identifier: number): Touch;
}

interface TouchEvent extends UIEvent {
	touches: TouchList;
	targetTouches: TouchList;
	changedTouches: TouchList;
	altKey: boolean;
	metaKey: boolean;
	ctrlKey: boolean;
	shiftKey: boolean;
	// initTouchEvent (type:string, canBubble:boolean, cancelable:boolean, view:AbstractView, detail:number, ctrlKey:boolean, altKey:boolean, shiftKey:boolean, metaKey:boolean, touches:TouchList, targetTouches:TouchList, changedTouches:TouchList);
}


declare module MapPaint {

	export interface PaintPoint {
		x: number;
		y: number;
	}

	export interface PaintBounds {
		xMin: number;
		xMax: number;
		yMin: number;
		yMax: number;
	}
	
	export interface PartitionGridPaintPoint extends PaintPoint {
		remove?: boolean;
	}		


	export interface Pencil {
		draw(context: CanvasRenderingContext2D, point: PaintPoint, previousPoint: PaintPoint, sketch: Sketchy);
	}

}

declare module L {
	export interface IMapPaint extends L.IHandler {
		saveMethod: (image: string, bounds: L.LatLngBounds) => void;
	}

	export var MapPaint: IMapPaint;
} 
