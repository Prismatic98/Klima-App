// Funktion zur Bestimmung der Farbe basierend auf der bioclimateSituation
const getColorBasedOnBioclimate = (bioclimateSituation) => {
    if (bioclimateSituation >= 9) {
        return '#d73027'; // Rot (unangenehm)
    } else if (bioclimateSituation >= 7) {
        return '#fdae61'; // Orange (weniger angenehm)
    } else if (bioclimateSituation >= 5) {
        return '#fee08b'; // Gelb (neutral)
    } else if (bioclimateSituation >= 3) {
        return '#66bd63'; // Hellgrün (angenehm)
    } else {
        return '#1a9850'; // Grün (sehr angenehm)
    }
};

const getCoordinates = (entity) => {
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
                    color: fromColor
                });
            });
        } else if (entity.attributes.position.PolygonType === 'Polygone') {
            const fromX = entity.attributes.position.xCentral;
            const fromY = entity.attributes.position.yCentral;
            const fromBounds = entity.attributes.position.PolygonPoints;

            coordinates.push({
                lat: fromY,
                lng: fromX,
                bioclimateSituation: fromBioclimateSituation,
                color: fromColor,
                bounds: fromBounds
            });
        } else {
            const x = entity.attributes.position.xCentral;
            const y = entity.attributes.position.yCentral;

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
    const preparedQueryUrl = 'http://localhost:8080/ContextServerAPI/predefined';
    const params = new URLSearchParams();

    params.append('application', 'DerendorfPlan');
    params.append('situation', 'Buildings');
    params.append('query', 'Buildings');

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    };

    const adresses = [];

    try {
        const response = await fetch(preparedQueryUrl, options);
        const data = await response.json();

        if (data.result && data.result.length > 0) {
            data.result.forEach((building) => {
                const buildingType = building.attributes.typ;
                if (buildingType === "public") {
                    adresses.push({
                        id: building.id,
                        name: building.name
                    })
                }
            });
        }
    } catch (error) {
        console.error(error);
    }

    return adresses;
};

export const getRoute = async (routePreference, routeStartAddress, routeEndAddress) => {
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    const preparedQueryUrl = 'http://localhost:8080/ContextServerAPI/predefined';

    const params = new URLSearchParams();

    const routeLogic = routePreference;

    params.append('application', 'DerendorfPlan');
    params.append('situation', routeLogic);
    params.append('query', routeLogic);
    params.append('part_StartingBuilding', JSON.stringify({ name: routeStartAddress }));
    params.append('part_EndingBuilding', JSON.stringify({ name: routeEndAddress }));

    if (routeLogic === 'ClimateBestPathNearCoolAreas') {
        params.append('part_CoolPlaces', '');
        params.append('param_routeLengthWeight', '30');
        params.append('param_bioclimateWeigth', '50');
        params.append('param_coolPlaceMinDistanceWeight', '10');
        params.append('param_coolPlaceAvgDistanceWeight', '10');
        params.append('param_coolPlaceMaxDistanceWeight', '10');
        params.append('param_coolPlaceMaxDistance', savedSettings?.coolPlaceDistance ?? '5');
        params.append('param_maxDerivationRouteLength', '1.2');
        params.append('param_maxDerivationBioclimate', '');
    }

    params.append('param_breakAfterMS', '1000');
    params.append('param_resultSize', '1');
    params.append('param_maxOptSteps', '300');

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    };

    const bigRoute = [];

    try {
        const response = await fetch(preparedQueryUrl, options);
        const data = await response.json();

        if (data.result && data.result.length > 0) {
            // Schleife durch die Schritte
            data.result[0].forEach(step => {
                let coordinates = getCoordinates(step.fromEntity);
                if (coordinates.length > 0)
                    bigRoute.push(coordinates);
                coordinates = getCoordinates(step.toEntity);
                if (coordinates.length > 0)
                    bigRoute.push(coordinates);
            });

            bigRoute.pop(); // Entfernt das letzte Element, wie in deinem ursprünglichen Code.
        }
    } catch (error) {
        console.error(error);
    }

    return bigRoute;
};
