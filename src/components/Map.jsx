import React, { useEffect, useRef, useState } from 'react';

const MAP_CONTAINER_ID = 'naver-map';

function loadMapScript(clientId) {
  return new Promise((resolve, reject) => {
    if (!clientId) {
      reject(new Error('Missing Naver Map client id'));
      return;
    }

    if (window.naver?.maps) {
      resolve(window.naver.maps);
      return;
    }

    const existingScript = document.querySelector('script[data-naver-map="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.naver.maps));
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.setAttribute('data-naver-map', 'true');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=geocoder`;
    script.async = true;
    script.onload = () => resolve(window.naver.maps);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function Map({ center, selectedRestaurant, onSelectLocation, language }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    loadMapScript(import.meta.env.VITE_NAVER_MAP_CLIENT_ID)
      .then((maps) => {
        if (!mounted) return;
        mapInstanceRef.current = new maps.Map(mapRef.current, {
          center: new maps.LatLng(center.lat, center.lng),
          zoom: 14,
          logoControl: false,
          mapDataControl: false,
        });

        mapInstanceRef.current.setOptions('mapTypeControl', true);

        markerRef.current = new maps.Marker({
          position: new maps.LatLng(center.lat, center.lng),
          map: mapInstanceRef.current,
        });

        maps.Event.addListener(mapInstanceRef.current, 'click', (event) => {
          const position = event.coord;
          onSelectLocation({ lat: position.y, lng: position.x });
        });
      })
      .catch((err) => {
        console.error('Failed to load Naver Map', err);
        setError(err);
      });

    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) return;

    const maps = window.naver.maps;
    const target = selectedRestaurant || center;

    if (!target) return;

    const latLng = new maps.LatLng(target.lat, target.lng);
    mapInstanceRef.current.setCenter(latLng);
    if (selectedRestaurant) {
      mapInstanceRef.current.setZoom(16);
    }

    if (!markerRef.current) {
      markerRef.current = new maps.Marker({
        position: latLng,
        map: mapInstanceRef.current,
      });
    } else {
      markerRef.current.setPosition(latLng);
    }
  }, [center, selectedRestaurant]);

  if (error) {
    return (
      <div className="map-fallback" role="alert">
        <p>
          {language === 'ko'
            ? '지도를 불러오지 못했습니다. API 키가 설정되었는지 확인해주세요.'
            : 'Failed to load the map. Please ensure that the API key is configured.'}
        </p>
      </div>
    );
  }

  if (!import.meta.env.VITE_NAVER_MAP_CLIENT_ID) {
    return (
      <div className="map-fallback">
        <h3>{language === 'ko' ? '샘플 지도 보기' : 'Sample map preview'}</h3>
        <p>
          {language === 'ko'
            ? '환경 변수에 네이버 지도 API 키를 설정하면 실제 지도가 표시됩니다.'
            : 'Add your Naver Map API key to the environment file to enable the live map.'}
        </p>
      </div>
    );
  }

  return <div id={MAP_CONTAINER_ID} ref={mapRef} className="naver-map" aria-label="Map" />;
}
