'use client'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from './ui/button'
import { Map, MapPin, Search, Navigation, Globe } from 'lucide-react'
import { SidebarMenuButton } from './ui/sidebar'
import { toast } from 'sonner'
import { 
    setLocation, 
    setCoords, 
    setLocationName, 
    setLoading, 
    setError, 
    selectLocation,
    selectCoords,
    selectLocationName 
} from '@/store/locationSlice' // Adjust path as needed

// Google Maps component
const GoogleMap = ({ onLocationSelect }) => {
    const mapRef = React.useRef(null);
    const [map, setMap] = React.useState(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [currentMarker, setCurrentMarker] = React.useState(null);
    const [geocoder, setGeocoder] = React.useState(null);
    const [streetView, setStreetView] = React.useState(null);
    const [isStreetViewVisible, setIsStreetViewVisible] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);
    
    // Redux state
    const dispatch = useDispatch();
    const coords = useSelector(selectCoords);
    const locationName = useSelector(selectLocationName);

    // Handle mounting to prevent hydration issues
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Load Google Maps API
    React.useEffect(() => {
        if (!isMounted) return;
        
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;
        
        if (!apiKey) {
            const errorMsg = 'Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAP_KEY in your .env file.';
            setError(errorMsg);
            dispatch(setError(errorMsg));
            return;
        }

        dispatch(setLoading(true));

        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
            setIsLoaded(true);
            dispatch(setLoading(false));
            return;
        }

        // Check if script is already loading
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            // If script exists but not loaded yet, wait for it
            const checkLoaded = setInterval(() => {
                if (window.google && window.google.maps) {
                    setIsLoaded(true);
                    dispatch(setLoading(false));
                    clearInterval(checkLoaded);
                }
            }, 100);
            
            // Clear interval after 10 seconds to prevent infinite checking
            setTimeout(() => {
                clearInterval(checkLoaded);
                if (!window.google || !window.google.maps) {
                    const errorMsg = 'Timeout loading Google Maps API';
                    setError(errorMsg);
                    dispatch(setError(errorMsg));
                }
            }, 10000);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            setIsLoaded(true);
            dispatch(setLoading(false));
        };
        
        script.onerror = () => {
            const errorMsg = 'Failed to load Google Maps API';
            setError(errorMsg);
            dispatch(setError(errorMsg));
        };

        document.head.appendChild(script);
    }, [dispatch, isMounted]);

    // Initialize map when API is loaded
    React.useEffect(() => {
        if (isLoaded && mapRef.current && !map && window.google && window.google.maps && isMounted) {
            try {
                // Use Redux coords if available, otherwise default to Springfield
                const initialCoords = coords || { lat: 42.1015, lng: -72.5898 };
                
                const mapInstance = new window.google.maps.Map(mapRef.current, {
                    center: initialCoords,
                    zoom: 13,
                    mapTypeId: 'roadmap',
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: true,
                    fullscreenControl: true,
                });
                
                // Initialize geocoder
                const geocoderInstance = new window.google.maps.Geocoder();
                setGeocoder(geocoderInstance);
                
                // Add initial marker
                const initialMarker = new window.google.maps.Marker({
                    position: initialCoords,
                    map: mapInstance,
                    title: locationName || 'Selected Location',
                    draggable: true,
                    animation: window.google.maps.Animation.DROP
                });
                
                setCurrentMarker(initialMarker);

                // Get the Street View panorama
                const streetViewPanorama = mapInstance.getStreetView();
                setStreetView(streetViewPanorama);

                // Function to update marker position and get location info
                const updateMarkerAndLocation = (position, marker) => {
                    const lat = position.lat();
                    const lng = position.lng();
                    
                    // Update marker position
                    marker.setPosition(position);
                    
                    // Animate marker
                    marker.setAnimation(window.google.maps.Animation.BOUNCE);
                    setTimeout(() => {
                        marker.setAnimation(null);
                    }, 750);
                    
                    // Get address from coordinates
                    geocoderInstance.geocode(
                        { location: position },
                        (results, status) => {
                            let address = 'Address not found';
                            if (status === 'OK' && results[0]) {
                                address = results[0].formatted_address;
                            }
                            
                            const locationData = {
                                lat: lat,
                                lng: lng,
                                address: address
                            };
                            
                            // Update Redux state
                            dispatch(setLocation({
                                coords: { lat, lng },
                                locationName: address
                            }));
                            
                            // Also call the prop callback for local state
                            onLocationSelect(locationData);
                        }
                    );
                };

                // Handle map clicks
                mapInstance.addListener('click', (event) => {
                    updateMarkerAndLocation(event.latLng, initialMarker);
                });

                // Handle marker drag
                initialMarker.addListener('dragend', (event) => {
                    updateMarkerAndLocation(event.latLng, initialMarker);
                });

                // Track Street View visibility changes
                streetViewPanorama.addListener('visible_changed', () => {
                    const isVisible = streetViewPanorama.getVisible();
                    setIsStreetViewVisible(isVisible);
                    
                    if (isVisible) {
                        console.log('Street View opened');
                        // Update location when Street View opens
                        const position = streetViewPanorama.getPosition();
                        if (position) {
                            updateMarkerAndLocation(position, initialMarker);
                        }
                    } else {
                        console.log('Street View closed');
                    }
                });

                // Track Street View position changes (when user navigates in street view)
                streetViewPanorama.addListener('position_changed', () => {
                    if (streetViewPanorama.getVisible()) {
                        const position = streetViewPanorama.getPosition();
                        if (position) {
                            // Update marker and location state when user moves in Street View
                            updateMarkerAndLocation(position, initialMarker);
                            // Also center the map on the new Street View location
                            mapInstance.setCenter(position);
                        }
                    }
                });

                // Track Street View POV changes (when user looks around)
                streetViewPanorama.addListener('pov_changed', () => {
                    if (streetViewPanorama.getVisible()) {
                        const pov = streetViewPanorama.getPov();
                        const position = streetViewPanorama.getPosition();
                        
                        // You can use this to track viewing direction if needed
                        console.log('Street View POV changed:', {
                            heading: pov.heading,
                            pitch: pov.pitch,
                            position: position ? { lat: position.lat(), lng: position.lng() } : null
                        });
                    }
                });

                // Set initial location in Redux if not already set
                if (!coords) {
                    geocoderInstance.geocode(
                        { location: initialCoords },
                        (results, status) => {
                            let address = 'Springfield, Massachusetts';
                            if (status === 'OK' && results[0]) {
                                address = results[0].formatted_address;
                            }
                            
                            dispatch(setLocation({
                                coords: initialCoords,
                                locationName: address
                            }));
                            
                            const locationData = {
                                lat: initialCoords.lat,
                                lng: initialCoords.lng,
                                address: address
                            };
                            
                            onLocationSelect(locationData);
                        }
                    );
                }

                setMap(mapInstance);
                
                // Initialize autocomplete after map is ready
                setTimeout(() => {
                    initializeAutocomplete(mapInstance, initialMarker, geocoderInstance);
                }, 500);

            } catch (error) {
                console.error('Error initializing map:', error);
                const errorMsg = 'Failed to initialize map';
                setError(errorMsg);
                dispatch(setError(errorMsg));
            }
        }
    }, [isLoaded, map, onLocationSelect, coords, locationName, dispatch, isMounted]);

    // Listen to Redux state changes and update map accordingly
    React.useEffect(() => {
        if (map && currentMarker && coords && geocoder && isMounted) {
            const currentPosition = currentMarker.getPosition();
            const newPosition = new window.google.maps.LatLng(coords.lat, coords.lng);
            
            // Only update if the position actually changed (avoid infinite loops)
            if (!currentPosition || 
                Math.abs(currentPosition.lat() - coords.lat) > 0.000001 || 
                Math.abs(currentPosition.lng() - coords.lng) > 0.000001) {
                
                // Update marker position
                currentMarker.setPosition(newPosition);
                
                // Update map center
                map.setCenter(newPosition);
                
                // Update marker title
                if (locationName) {
                    currentMarker.setTitle(locationName);
                }
                
                console.log('Map updated from Redux state change');
            }
        }
    }, [coords, locationName, map, currentMarker, geocoder, isMounted]);

    // Initialize Google Places Autocomplete Element
    const initializeAutocomplete = async (mapInstance, marker, geocoderInstance) => {
        if (!isMounted) return;
        
        try {
            // Check if Places library is available
            if (!window.google || !window.google.maps || !window.google.maps.importLibrary) {
                console.warn('Google Maps Places library not available, using fallback search');
                createFallbackSearch(mapInstance, marker, geocoderInstance);
                return;
            }

            // Import Places library
            const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");

            // Create the official Google Places Autocomplete Element
            const placeAutocomplete = new PlaceAutocompleteElement();
            placeAutocomplete.id = 'place-autocomplete-input';

            // Create search card container in the top search area
            const card = document.getElementById('top-search-card');
            if (card) {
                card.innerHTML = '';
                card.appendChild(placeAutocomplete);
            } else {
                console.warn('top-search-card element not found');
                return;
            }

            // Add event listener for place selection
            placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
                try {
                    const place = placePrediction.toPlace();
                    await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });

                    if (place.location) {
                        const lat = place.location.lat();
                        const lng = place.location.lng();
                        const address = place.formattedAddress || place.displayName || 'Address not available';
                        
                        mapInstance.setCenter(place.location);
                        mapInstance.setZoom(15);
                        
                        marker.setPosition(place.location);
                        marker.setAnimation(window.google.maps.Animation.BOUNCE);
                        setTimeout(() => {
                            marker.setAnimation(null);
                        }, 750);

                        // Update Redux state
                        dispatch(setLocation({
                            coords: { lat, lng },
                            locationName: address
                        }));

                        // Also call the prop callback for local state
                        onLocationSelect({
                            lat: lat,
                            lng: lng,
                            address: address
                        });
                    }
                } catch (error) {
                    console.error('Error handling place selection:', error);
                    dispatch(setError('Error selecting place from search'));
                }
            });

            console.log('Google Places Autocomplete initialized successfully!');

        } catch (error) {
            console.error('Error initializing Places Autocomplete:', error);
            createFallbackSearch(mapInstance, marker, geocoderInstance);
        }
    };

    // Fallback search function
    const createFallbackSearch = (mapInstance, marker, geocoderInstance) => {
        const card = document.getElementById('top-search-card');
        if (card) {
            card.innerHTML = `
                <input 
                    type="text" 
                    placeholder="Search for places..." 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="fallback-search"
                />
            `;
            
            const input = document.getElementById('fallback-search');
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && geocoderInstance) {
                        const address = e.target.value.trim();
                        if (address) {
                            geocoderInstance.geocode({ address: address }, (results, status) => {
                                if (status === 'OK' && results[0]) {
                                    const location = results[0].geometry.location;
                                    const lat = location.lat();
                                    const lng = location.lng();
                                    const formattedAddress = results[0].formatted_address;
                                    
                                    mapInstance.setCenter(location);
                                    mapInstance.setZoom(15);
                                    marker.setPosition(location);
                                    marker.setAnimation(window.google.maps.Animation.BOUNCE);
                                    setTimeout(() => {
                                        marker.setAnimation(null);
                                    }, 750);
                                    
                                    // Update Redux state
                                    dispatch(setLocation({
                                        coords: { lat, lng },
                                        locationName: formattedAddress
                                    }));
                                    
                                    // Also call the prop callback for local state
                                    onLocationSelect({
                                        lat: lat,
                                        lng: lng,
                                        address: formattedAddress
                                    });
                                    
                                    e.target.value = '';
                                }
                            });
                        }
                    }
                });
            }
        }
    };

    if (!isMounted) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Initializing...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <div className="text-center p-4">
                    <Map className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Map Error</h3>
                    <p className="text-sm text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Loading Google Maps...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Top Search Bar */}
            <div className="flex-shrink-0 p-4">
                <div
                    id="top-search-card"
                    className="w-full bg-gray-50 rounded-lg p-2"
                >
                    <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Search for places...
                    </div>
                </div>
                
                {/* Street View Status Indicator */}
                {isStreetViewVisible && (
                    <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full inline-flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Street View Active - Location updates as you navigate
                    </div>
                )}
            </div>
            
            {/* Map Container */}
            <div 
                ref={mapRef} 
                className="flex-1 w-full"
                style={{ minHeight: '400px' }}
            />
        </div>
    );
};

const MapDrawer = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedLocation, setSelectedLocation] = React.useState({
        lat: 42.1015,
        lng: -72.5898,
        address: 'Loading...'
    });
    const [isMounted, setIsMounted] = React.useState(false);
    
    // Redux state and dispatch
    const dispatch = useDispatch();
    const location = useSelector(selectLocation);
    const coords = useSelector(selectCoords);
    const locationName = useSelector(selectLocationName);

    // Handle mounting to prevent hydration issues
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Update local state when Redux state changes
    React.useEffect(() => {
        if (coords && locationName && isMounted) {
            setSelectedLocation({
                lat: coords.lat,
                lng: coords.lng,
                address: locationName
            });
        }
    }, [coords, locationName, isMounted]);

    const handleLocationSelect = (locationData) => {
        setSelectedLocation(locationData);
        // Redux state is already updated in the GoogleMap component
    };

    const handleSaveLocation = () => {
        if (!isMounted) return;
        
        console.log('Final Confirmed Location:', {
            address: selectedLocation.address,
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
            coordinates: `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`,
            reduxState: location
        });
        
        // Ensure Redux state is up to date
        dispatch(setLocation({
            coords: { lat: selectedLocation.lat, lng: selectedLocation.lng },
            locationName: selectedLocation.address
        }));
        
        // Show toast notification only when save button is clicked
        toast.success('Location Saved Successfully!', {
            description: `${selectedLocation.address} (${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)})`,
        });
        
        // Optionally close the drawer after saving
        setIsOpen(false);
    };

    if (!isMounted) {
        return (
            <SidebarMenuButton asChild tooltip="Map">
                <a href="#" className="flex items-center gap-2">
                    <Map />
                    <span>Map</span>
                </a>
            </SidebarMenuButton>
        );
    }

    return (
        <Drawer direction='left' dismissible={false} open={isOpen} onOpenChange={setIsOpen}>
            <SidebarMenuButton asChild tooltip="Map" onClick={() => setIsOpen(true)}>
                <a href="#" className="flex items-center gap-2">
                    <Map />
                    <span>Map</span>
                </a>
            </SidebarMenuButton>
            <DrawerContent className="!w-3/4 !max-w-none h-[90vh] flex flex-col">
                <DrawerHeader className="flex-shrink-0">
                    <DrawerTitle className="text-2xl font-bold">
                        Interactive World Map
                    </DrawerTitle>
                    <DrawerDescription className="text-base text-gray-700">
                        Search for places, click anywhere on the map, drag the marker around, or dive into Street View to explore and select your location.
                    </DrawerDescription>
                </DrawerHeader>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <GoogleMap onLocationSelect={handleLocationSelect} />
                    
                    {/* Location Display */}
                    <div className="flex-shrink-0 p-4">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg">
                            Your Selected Location
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-blue-600">
                                    Address:
                                </span>
                                <span className="text-gray-800 font-medium">{selectedLocation.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-green-600">
                                    Coordinates:
                                </span>
                                <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono">
                                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                                </code>
                            </div>
                            <p className="text-sm text-gray-600">
                                Use search, click on map, drag marker, or navigate in Street View to update location.
                            </p>
                        </div>
                    </div>
                </div>
                
                <DrawerFooter className="flex-shrink-0">
                    <div className="flex gap-3">
                        <Button
                            onClick={handleSaveLocation}
                            className="w-1/2 flex items-center gap-2"
                        >
                            Save Location
                            <MapPin className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="w-1/2 flex items-center gap-2"
                        >
                            Close
                            <Navigation className="h-4 w-4" />
                        </Button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default MapDrawer