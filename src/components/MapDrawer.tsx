'use client'
import React from 'react'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from './ui/button'
import { Map } from 'lucide-react'
import { SidebarMenuButton } from './ui/sidebar'

// Google Maps component
const GoogleMap = ({ onLocationSelect }) => {
    const mapRef = React.useRef(null);
    const [map, setMap] = React.useState(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [currentMarker, setCurrentMarker] = React.useState(null);
    const [geocoder, setGeocoder] = React.useState(null);
    const [placesService, setPlacesService] = React.useState(null);
    const [streetView, setStreetView] = React.useState(null);
    const [isStreetViewVisible, setIsStreetViewVisible] = React.useState(false);

    // Load Google Maps API
    React.useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;
        
        if (!apiKey) {
            setError('Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAP_KEY in your .env file.');
            return;
        }

        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
            setIsLoaded(true);
            return;
        }

        // Check if script is already loading
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            // If script exists but not loaded yet, wait for it
            const checkLoaded = setInterval(() => {
                if (window.google && window.google.maps) {
                    setIsLoaded(true);
                    clearInterval(checkLoaded);
                }
            }, 100);
            
            // Clear interval after 10 seconds to prevent infinite checking
            setTimeout(() => clearInterval(checkLoaded), 10000);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            setIsLoaded(true);
        };
        
        script.onerror = () => {
            setError('Failed to load Google Maps API');
        };

        document.head.appendChild(script);
    }, []);

    // Initialize map when API is loaded
    React.useEffect(() => {
        if (isLoaded && mapRef.current && !map && window.google && window.google.maps) {
            try {
                const mapInstance = new window.google.maps.Map(mapRef.current, {
                    center: { lat: 42.1015, lng: -72.5898 }, // Springfield, Massachusetts
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
                
                // Initialize places service if available
                if (window.google.maps.places) {
                    const placesServiceInstance = new window.google.maps.places.PlacesService(mapInstance);
                    setPlacesService(placesServiceInstance);
                }
                
                // Add initial marker
                const initialMarker = new window.google.maps.Marker({
                    position: { lat: 42.1015, lng: -72.5898 },
                    map: mapInstance,
                    title: 'Springfield, Massachusetts',
                    draggable: true,
                    animation: window.google.maps.Animation.DROP
                });
                
                setCurrentMarker(initialMarker);

                // Get the Street View panorama
                const streetViewPanorama = mapInstance.getStreetView();
                setStreetView(streetViewPanorama);

                // Function to update marker position and get location info
                const updateMarkerAndLocation = (position, marker, source = 'map') => {
                    const lat = position.lat();
                    const lng = position.lng();
                    
                    // Update marker position
                    marker.setPosition(position);
                    
                    // Animate marker only if not from street view to avoid excessive animations
                    if (source !== 'streetview') {
                        marker.setAnimation(window.google.maps.Animation.BOUNCE);
                        setTimeout(() => {
                            marker.setAnimation(null);
                        }, 750);
                    }
                    
                    // Get address from coordinates
                    geocoderInstance.geocode(
                        { location: position },
                        (results, status) => {
                            let address = 'Address not found';
                            if (status === 'OK' && results[0]) {
                                address = results[0].formatted_address;
                            }
                            
                            onLocationSelect({
                                lat: lat,
                                lng: lng,
                                address: address,
                                source: source // Track where the update came from
                            });
                        }
                    );
                };

                // Handle map clicks
                mapInstance.addListener('click', (event) => {
                    updateMarkerAndLocation(event.latLng, initialMarker, 'map');
                });

                // Handle marker drag
                initialMarker.addListener('dragend', (event) => {
                    updateMarkerAndLocation(event.latLng, initialMarker, 'marker');
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
                            updateMarkerAndLocation(position, initialMarker, 'streetview');
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
                            updateMarkerAndLocation(position, initialMarker, 'streetview');
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

                // Set initial location
                geocoderInstance.geocode(
                    { location: { lat: 42.1015, lng: -72.5898 } },
                    (results, status) => {
                        let address = 'Springfield, Massachusetts';
                        if (status === 'OK' && results[0]) {
                            address = results[0].formatted_address;
                        }
                        
                        onLocationSelect({
                            lat: 42.1015,
                            lng: -72.5898,
                            address: address,
                            source: 'initial'
                        });
                    }
                );

                setMap(mapInstance);
                
                // Initialize autocomplete after map is ready
                setTimeout(() => {
                    initializeAutocomplete(mapInstance, initialMarker, geocoderInstance);
                }, 500);

            } catch (error) {
                console.error('Error initializing map:', error);
                setError('Failed to initialize map');
            }
        }
    }, [isLoaded, map, onLocationSelect]);

    // Initialize Google Places Autocomplete Element
    const initializeAutocomplete = async (mapInstance, marker, geocoderInstance) => {
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
                        
                        mapInstance.setCenter(place.location);
                        mapInstance.setZoom(15);
                        
                        marker.setPosition(place.location);
                        marker.setAnimation(window.google.maps.Animation.BOUNCE);
                        setTimeout(() => {
                            marker.setAnimation(null);
                        }, 750);

                        onLocationSelect({
                            lat: lat,
                            lng: lng,
                            address: place.formattedAddress || place.displayName || 'Address not available',
                            source: 'search'
                        });
                    }
                } catch (error) {
                    console.error('Error handling place selection:', error);
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
                                    mapInstance.setCenter(location);
                                    mapInstance.setZoom(15);
                                    marker.setPosition(location);
                                    marker.setAnimation(window.google.maps.Animation.BOUNCE);
                                    setTimeout(() => {
                                        marker.setAnimation(null);
                                    }, 750);
                                    
                                    onLocationSelect({
                                        lat: location.lat(),
                                        lng: location.lng(),
                                        address: results[0].formatted_address,
                                        source: 'search'
                                    });
                                    
                                    e.target.value = '';
                                } else {
                                    alert('Location not found. Please try a different search term.');
                                }
                            });
                        }
                    }
                });
            }
        }
    };

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
            <div className="flex-shrink-0 p-4 border-b bg-white">
                <div
                    id="top-search-card"
                    className="w-full bg-gray-50 rounded-lg p-2"
                >
                    <div className="text-sm text-gray-600 mb-2">Search for places...</div>
                </div>
                
                {/* Street View Status Indicator */}
                {isStreetViewVisible && (
                    <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full inline-flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
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

    const handleLocationSelect = (locationData) => {
        setSelectedLocation(locationData);
    };

    const handleSaveLocation = () => {
        console.log('Final Confirmed Location:', {
            address: selectedLocation.address,
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
            coordinates: `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
        });
        
        // You can also display an alert or toast notification
        alert(`Location Saved!\n\nAddress: ${selectedLocation.address}\nCoordinates: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`);
        
        // Optionally close the drawer after saving
        setIsOpen(false);
    };

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
                    <DrawerTitle>Map View</DrawerTitle>
                    <DrawerDescription>Search, navigate and select your location on the map using the search bar above the map.</DrawerDescription>
                </DrawerHeader>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <GoogleMap onLocationSelect={handleLocationSelect} />
                    
                    {/* Location Display */}
                    <div className="flex-shrink-0 p-4 bg-gray-50 border-t">
                        <h3 className="font-medium text-gray-900 mb-2">Selected Location</h3>
                        <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Address:</span> {selectedLocation.address}</p>
                            <p><span className="font-medium">Coordinates:</span> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
                            {selectedLocation.source && (
                                <p><span className="font-medium">Source:</span> 
                                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                        selectedLocation.source === 'streetview' ? 'bg-blue-100 text-blue-800' :
                                        selectedLocation.source === 'search' ? 'bg-green-100 text-green-800' :
                                        selectedLocation.source === 'marker' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {selectedLocation.source === 'streetview' ? 'Street View Navigation' :
                                         selectedLocation.source === 'search' ? 'Search Result' :
                                         selectedLocation.source === 'marker' ? 'Marker Drag' :
                                         selectedLocation.source === 'map' ? 'Map Click' : 'Initial Location'}
                                    </span>
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                Use search, click on map, drag marker, or navigate in Street View to update location
                            </p>
                        </div>
                    </div>
                </div>
                
                <DrawerFooter className="flex-shrink-0">
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSaveLocation}
                            className="bg-green-600 hover:bg-green-700 text-white w-1/2"
                        >
                            Save Location
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="w-1/2"
                        >
                            Close
                        </Button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default MapDrawer