const isCoordinate = (input) => {
    // Überprüfung auf das Koordinaten-Muster im String
    const coordinatePattern = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;

    // Wenn der Input ein String ist, überprüfe das Koordinatenmuster
    if (typeof input === 'string') {
        if (!coordinatePattern.test(input)) {
            return false; // Kein Koordinaten-Format
        }

        // Aufteilen des Strings in Latitude und Longitude
        const [latitude, longitude] = input.split(',').map(Number);

        // Überprüfen, ob die Zahlen in den gültigen Bereichen liegen
        return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    }

    // Überprüfen, ob der Input ein Objekt mit den Properties "lat" und "lon" ist
    if (typeof input === 'object' && input !== null && 'lat' in input && 'lng' in input) {
        const { lat, lng } = input;

        // Überprüfen, ob lat und lon Zahlen sind und in den gültigen Bereichen liegen
        return typeof lat === 'number' && lat >= -90 && lat <= 90 &&
            typeof lng === 'number' && lng >= -180 && lng <= 180;
    }

    // Wenn es weder ein gültiger String noch ein Objekt ist, gib false zurück
    return false;
};


// Funktion zur Bestimmung der Farbe basierend auf der bioclimateSituation
const getColorBasedOnBioclimate = (bioclimateSituation) => {
    if (bioclimateSituation >= 9) {
        return '#e74c3c'; // Rot (unangenehm)
    } else if (bioclimateSituation >= 7) {
        return '#f39c12'; // Orange (weniger angenehm)
    } else if (bioclimateSituation >= 5) {
        return '#f1c40f'; // Gelb (neutral)
    } else if (bioclimateSituation >= 3) {
        return '#27ae60'; // Hellgrün (angenehm)
    } else {
        return '#2ecc71'; // Grün (sehr angenehm)
    }
};

const calculateWalkingTime = (distanceInMeters) => {
    const averageWalkingSpeedMPerMin = 83.33; // 5 km/h in Meter pro Minute
    const timeInMinutes = distanceInMeters / averageWalkingSpeedMPerMin;
    return timeInMinutes.toFixed(0); // Rückgabe der Zeit in Minuten, auf 0 Dezimalstellen gerundet
};

const getCoordinates = (entity, lineStroke) => {
    const coordinates = [];
    if (entity) {
        const fromBioclimateSituation = entity.attributes.bioclimatesituation;
        const fromColor = getColorBasedOnBioclimate(fromBioclimateSituation);

        // Verarbeite fromEntity basierend auf dem PolygonType
        if (entity.attributes.position.PolygonType === 'Line') {
            const fromPoints = entity.attributes.position.PolygonPoints;
            fromPoints.forEach((point) => {
                coordinates.push({
                    lat: point.y,
                    lng: point.x,
                    bioclimateSituation: fromBioclimateSituation,
                    color: fromColor,
                    lineStroke: lineStroke,
                    name: entity?.name
                });
            });
        } else if (entity.attributes.position.PolygonType === 'Polygone') {
            const fromX = entity.attributes.position.xStart;
            const fromY = entity.attributes.position.yStart;
            const fromBounds = entity.attributes.position.PolygonPoints;

            coordinates.push({
                lat: fromY,
                lng: fromX,
                bioclimateSituation: fromBioclimateSituation,
                color: '#2563eb',
                name: entity?.name,
                bounds: fromBounds
            });
        } else {
            const x = entity.attributes.position.xStart;
            const y = entity.attributes.position.yStart;

            coordinates.push({
                lat: y,
                lng: x,
                bioclimateSituation: fromBioclimateSituation,
                color: fromColor
            });
        }
    }
    return coordinates;
}

export const getAddresses = async () => {
    // const preparedQueryUrl = 'http://localhost:8080/ContextServerAPI/predefined';
    const preparedQueryUrl = 'https://cs.climateapp.webtec.medien.hs-duesseldorf.de/contextserver/ContextServerAPI/predefined';
    const params = new URLSearchParams();

    params.append('application', 'DerendorfPlan');
    params.append('situation', 'Buildings');
    params.append('query', 'Buildings');

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa('climateapp:6qczyGSzkg4z6Qpb')}`
        },
        body: params.toString()
    };

    const adresses = [];

    try {
        const response = await fetch(preparedQueryUrl, options);
        const data = await response.json();

        if (data.result && data.result.length > 0) {
            data.result.forEach((building) => {
                adresses.push({
                    id: building.id,
                    name: building.name
                })
            });
        }
    } catch (error) {
        console.error(error);
    }

    return adresses;
};

export const getClimatePlaces = async (types) => {
    // const preparedQueryUrl = 'http://localhost:8080/ContextServerAPI/predefined';
    const preparedQueryUrl = 'https://cs.climateapp.webtec.medien.hs-duesseldorf.de/contextserver/ContextServerAPI/predefined';
    const params = new URLSearchParams();

    params.append('application', 'DerendorfPlan');
    params.append('situation', 'CoolPlaces');
    params.append('query', 'CoolPlaces');

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa('climateapp:6qczyGSzkg4z6Qpb')}`
        },
        body: params.toString()
    };

    const places = [];

    try {
        const response = await fetch(preparedQueryUrl, options);
        const data = await response.json();

        if (data.result && data.result.length > 0) {
            data.result.forEach((place) => {
                const placeType = place.entitytype;
                if (types.includes(placeType)) {
                    places.push(place);
                }
            });
        }
    } catch (error) {
        console.error(error);
    }

    return places;
};

export const getRouteToCoolPlace = async (startPoint, endPoint, lineStroke) => {
    // const preparedQueryUrl = 'http://localhost:8080/ContextServerAPI/predefined';
    const preparedQueryUrl = 'https://cs.climateapp.webtec.medien.hs-duesseldorf.de/contextserver/ContextServerAPI/predefined';
    const params = new URLSearchParams();
    let distance = 0.00252;

    params.append('application', 'DerendorfPlan');

    if (isCoordinate(startPoint)) {
        const latitude = startPoint.lat;
        const longitude = startPoint.lng;
        params.append('situation', 'ShortestPathFromPositionToCoolPlace');
        params.append('query', 'ShortestPathFromPositionToCoolPlace');
        params.append('param_xPosition', longitude);
        params.append('param_yPosition', latitude);
        distance = await checkPathsNearBy(longitude, latitude, distance);
        console.log('Distanz: ' + distance);
    } else {
        params.append('situation', 'ShortestPathFromWayToCoolPlace');
        params.append('query', 'ShortestPathFromWayToCoolPlace');
        params.append('part_StartWay', JSON.stringify({name: startPoint}));
    }

    // params.append('part_EndingCoolPlace', JSON.stringify({name: "Refillstation Rather Strasse"}));
    params.append('part_EndingCoolPlace', JSON.stringify({name: endPoint}));

    params.append('param_breakAfterMS', '30000');
    params.append('param_resultSize', '1');
    params.append('param_maxOptSteps', '1');
    params.append('param_distance', distance.toString());

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa('climateapp:6qczyGSzkg4z6Qpb')}`
        },
        body: params.toString()
    };

    const bigRoute = [];
    let routeLength = 0;
    let routeDuration = 0;

    try {
        const response = await fetch(preparedQueryUrl, options);
        const data = await response.json();

        if (data.result && data.result.length > 0) {
            const firstObject = data.result[0][0];
            if (firstObject.aggregation && firstObject.aggregation.routeLength) {
                routeLength = firstObject.aggregation.routeLength;
                routeDuration = calculateWalkingTime(routeLength);
            }
            data.result[0].forEach(step => {
                let coordinates = getCoordinates(step.fromEntity, lineStroke);
                if (coordinates.length > 0)
                    bigRoute.push(coordinates);
                coordinates = getCoordinates(step.toEntity, lineStroke);
                if (coordinates.length > 0)
                    bigRoute.push(coordinates);
            });

            bigRoute.pop();
        }
    } catch (error) {
        console.error(error);
    }

    return {
        route: bigRoute,
        routeLength: routeLength,
        routeDuration: routeDuration,
    };
}

export const checkPathsNearBy = async (longitude, latitude, distance = 0.00252) => {
    // const preparedQueryUrl = 'http://localhost:8080/ContextServerAPI/predefined';
    const preparedQueryUrl = 'https://cs.climateapp.webtec.medien.hs-duesseldorf.de/contextserver/ContextServerAPI/predefined';

    const params = new URLSearchParams();
    params.append('application', 'DerendorfPlan');
    params.append('situation', 'PathsNearBy');
    params.append('query', 'PathsNearBy');
    params.append('param_xPosition', longitude);
    params.append('param_yPosition', latitude);
    params.append('param_distance', distance.toString());

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa('climateapp:6qczyGSzkg4z6Qpb')}`
        },
        body: params.toString()
    };

    try {
        const response = await fetch(preparedQueryUrl, options);
        const data = await response.json();

        // Überprüfen, ob "size" existiert und größer als 0 ist
        if (data.size && data.size > 0) {
            return distance;  // Ergebnis zurückgeben, wenn "size" größer als 0 ist
        } else {
            // Distance um 0.003 erhöhen und die Anfrage erneut ausführen
            return await checkPathsNearBy(longitude, latitude, distance + 0.003);
        }
    } catch (error) {
        console.error('Fehler bei der Anfrage:', error);
        throw error;  // Fehler weitergeben, um die Handhabung zu ermöglichen
    }
};


export const getRoute = async (routePreference, routeStartAddress, routeEndAddress, coolPlaceStopover) => {
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    // const preparedQueryUrl = 'http://localhost:8080/ContextServerAPI/predefined';
    const preparedQueryUrl = 'https://cs.climateapp.webtec.medien.hs-duesseldorf.de/contextserver/ContextServerAPI/predefined';

    // routeStartAddress = '51.2361071, 6.7940233';

    const routeLengthWeight = routePreference;
    const bioclimateWeight = 100 -routePreference;
    let query = '';
    if (coolPlaceStopover)
        query = 'ClimateBestPathNearCoolAreas';
    else
        query = bioclimateWeight >= 50 ? 'ClimateBestPath' : 'ShortestPath';
    let distance = 0.00252;

    const params = new URLSearchParams();
    params.append('application', 'DerendorfPlan');

    if (isCoordinate(routeStartAddress)) {
        const [latitude, longitude] = routeStartAddress.split(',').map(Number);
        params.append('situation', 'ClimateBestPathNearCoolAreasFromPositionToBuilding');
        params.append('query', 'ClimateBestPathNearCoolAreasFromPositionToBuilding');
        params.append('param_xPosition', longitude);
        params.append('param_yPosition', latitude);
        distance = await checkPathsNearBy(longitude, latitude, distance);
        console.log('Distanz: ' + distance);
    } else {
        params.append('situation', query);
        params.append('query', query);
        params.append('part_StartingBuilding', JSON.stringify({name: routeStartAddress}));
    }

    params.append('part_EndingBuilding', JSON.stringify({name: routeEndAddress}));
    params.append('part_CoolPlaces', '');
    params.append('param_routeLengthWeight', routeLengthWeight.toString());
    params.append('param_bioclimateWeigth', bioclimateWeight.toString());
    params.append('param_coolPlaceMinDistanceWeight', bioclimateWeight > 0 ? '30' : '0');
    params.append('param_coolPlaceAvgDistanceWeight', bioclimateWeight > 0 ? '10' : '0');
    params.append('param_coolPlaceMaxDistanceWeight', bioclimateWeight > 0 ? '10' : '0');
    params.append('param_coolPlaceMaxDistance', bioclimateWeight > 0 ? (savedSettings?.coolPlaceDistance ?? '100') : '1');
    params.append('param_maxDerivationRouteLength', bioclimateWeight > 0 ? '2' : '0.7');
    params.append('param_maxDerivationBioclimate', '');
    
    params.append('param_breakAfterMS', '30000');
    params.append('param_resultSize', '1');
    params.append('param_maxOptSteps', '30');
    params.append('param_distance', distance.toString());

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa('climateapp:6qczyGSzkg4z6Qpb')}`
        },
        body: params.toString()
    };

    let bigRoute = [];
    let routeLength = 0;
    let routeDuration = 0;
    let coolPlaceIsNear = false;
    let coolPlaceName = '';
    let coolPlaceDistance = Infinity; // Initialisieren auf unendlich, um die geringste Distanz zu finden
    let wayToCoolPlace = '';

    try {
        const response = await fetch(preparedQueryUrl, options);
        const data = await response.json();

        if (data.result && data.result.length > 0) {
            const firstObject = data.result[0][0];
            if (firstObject.aggregation && firstObject.aggregation.routeLength) {
                routeLength = firstObject.aggregation.routeLength;
                routeDuration = calculateWalkingTime(routeLength);
            }

            data.result[0].forEach(step => {
                let coordinates = getCoordinates(step.fromEntity, 'line');
                if (coordinates.length > 0) bigRoute.push(coordinates);
                coordinates = getCoordinates(step.toEntity, 'line');
                if (coordinates.length > 0) bigRoute.push(coordinates);
                let entityType = step.fromEntity?.entitytype

                // Überprüfe, ob die Relation eine coolDistance hat
                console.log(coolPlaceStopover)
                if (coolPlaceStopover && coolPlaceStopover.includes(entityType) && step.relation && step.relation.attributes && step.relation.attributes.coolDistance) {
                    const coolDistance = step.relation.attributes.coolDistance * 1000;

                    // Aktualisiere die geringste coolDistance
                    if (coolDistance < coolPlaceDistance) {
                        coolPlaceDistance = coolDistance;
                        coolPlaceName = step.fromEntity?.name ?? '';
                        wayToCoolPlace = step.toEntity?.name ?? '';
                    }
                }
            });

            bigRoute.pop(); // Entfernt den letzten leeren Schritt, falls vorhanden

            // Überprüfe, ob der nächste kühle Ort in Reichweite ist
            if (coolPlaceStopover && coolPlaceDistance <= (savedSettings?.coolPlaceDistance ?? 200)) {
                coolPlaceIsNear = true;

                const coolPlaceRouteObj = await getRouteToCoolPlace(wayToCoolPlace, coolPlaceName, 'dash');
                if (coolPlaceRouteObj && coolPlaceRouteObj.route) {
                    // Berechne die Mitte des bigRoute Arrays
                    const middleIndex = Math.floor(bigRoute.length / 2);

                    // Füge coolPlaceRouteObj.route in der Mitte von bigRoute ein
                    bigRoute.splice(middleIndex, 0, ...coolPlaceRouteObj.route);
                    // bigRoute = bigRoute.concat(coolPlaceRouteObj.route);

                }
            }
        }
    } catch (error) {
        console.error(error);
    }

    return {
        route: bigRoute,
        routeLength: routeLength,
        routeDuration: routeDuration,
        coolPlaceIsNear: coolPlaceIsNear,
        coolPlaceName: coolPlaceName,
        coolPlaceDistance: coolPlaceDistance,
        wayToCoolPlace: wayToCoolPlace
    };
};
