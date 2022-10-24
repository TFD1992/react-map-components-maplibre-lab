import { useEffect, useCallback, useRef } from 'react';

import * as turf from '@turf/turf';
import useMap from '../../hooks/useMap';

const MlCameraFollowPath = (props) => {
	// Use a useRef hook to reference the layer object to be able to access it later inside useEffect hooks
	// without the requirement of adding it to the dependency list (ignore the false eslint exhaustive deps warning)
	const initializedRef = useRef(false);
	const pause = useRef(true);
	const zoom = useRef(60);
	const pitch = useRef(60);
	const step = useRef(1);
	const speed = useRef(1);
	const timeoutId = useRef();

	var kmPerStep = props.kmPerStep || 0.01;
	var routeDistance = turf.lineDistance(props.route);
	var stepDuration = props.stepDuration || 70;

	const mapHook = useMap({
		mapId: props.mapId,
		waitForLayer: props.insertBeforeLayer,
	});

	useEffect(() => {
		pause.current = props.pause;
		if (!pause.current) {
			play();
		}
	}, [props.pause]);
	useEffect(() => {
		if (!mapHook.map) return;
		zoom.current = props.zoom;
		if (mapHook.map.map.getZoom() !== zoom.current) {
			mapHook.map.map.setZoom(zoom.current);
		}
	}, [mapHook.map, props.zoom]);
	useEffect(() => {
		if (!mapHook.map) return;
		pitch.current = props.pitch;
		if (pitch.current !== mapHook.map.map.getPitch()) {
			mapHook.map.map.setPitch(pitch.current);
		}
	}, [mapHook.map, props.pitch]);
	useEffect(() => {
		speed.current = props.speed;
	}, [props.speed]);

	const disableInteractivity = useCallback(() => {
		if (!mapHook.map) return;
		mapHook.map.map['scrollZoom'].disable();
		mapHook.map.map['boxZoom'].disable();
		mapHook.map.map['dragRotate'].disable();
		mapHook.map.map['dragPan'].disable();
		mapHook.map.map['keyboard'].disable();
		mapHook.map.map['doubleClickZoom'].disable();
		mapHook.map.map['touchZoomRotate'].disable();
	}, [mapHook.map]);
	const enableInteractivity = useCallback(() => {
		if (!mapHook.map) return;
		mapHook.map.map['scrollZoom'].enable();
		mapHook.map.map['boxZoom'].enable();
		mapHook.map.map['dragRotate'].enable();
		mapHook.map.map['dragPan'].enable();
		mapHook.map.map['keyboard'].enable();
		mapHook.map.map['doubleClickZoom'].enable();
		mapHook.map.map['touchZoomRotate'].enable();
	}, [mapHook.map]);

	function centerRoute() {
		if (!mapHook.map || !props.route) return;
		var bbox = turf.bbox(props.route);
		var bounds;
		if (bbox && bbox.length > 3) {
			bounds = [
				[bbox[0], bbox[1]],
				[bbox[2], bbox[3]],
			];
			mapHook.map.map.fitBounds(bounds, { padding: 100 });
		}
	}
	function play() {
		if (!mapHook.map) return;

		if (!pause.current) {
			disableInteractivity();

			if (mapHook.map.map.getZoom() !== zoom.current) {
				mapHook.map.map.setZoom(zoom.current);
			}

			var alongRoute = turf.along(props.route, step.current * kmPerStep).geometry.coordinates;

			if (step.current * kmPerStep < routeDistance) {
				mapHook.map.map.panTo(alongRoute, {
					bearing: turf.bearing(
						turf.point([mapHook.map.map.getCenter().lng, mapHook.map.map.getCenter().lat]),
						turf.point(alongRoute)
					),
					duration: stepDuration,
					essential: true,
				});
				step.current = step.current + speed.current;
				console.log('PAN MOVE');
				timeoutId.current = setTimeout(() => {
					play();
				}, stepDuration);
			} else {
				mapHook.map.map.setPitch(0);
				centerRoute();
				enableInteractivity();
				console.log('ENABLE CONTROLS');
				step.current = 1;
			}
		} else {
			enableInteractivity();
		}
	}

	function reset() {
		if (!mapHook.map) return;
		centerRoute();
		enableInteractivity();
		step.current = 1;
	}

	useEffect(() => {
		if (!mapHook.map || initializedRef.current) return;
		initializedRef.current = true;
		centerRoute();
	}, [mapHook.map]);

	useEffect(() => {
		return () => {
			if (timeoutId.current) {
				clearTimeout(timeoutId.current);
			}
		};
	}, []);

	return {
		play: play,
		reset: reset,
	};
};

export default MlCameraFollowPath;
