import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Coords {
  lat: number;
  lng: number;
}

interface LocationState {
  coords: Coords | null;
  locationName: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  coords: null,
  locationName: '',
  isLoading: false,
  error: null
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (
      state,
      action: PayloadAction<{ coords: Coords; locationName: string }>
    ) => {
      state.coords = action.payload.coords;
      state.locationName = action.payload.locationName;
      state.error = null;
    },
    setCoords: (state, action: PayloadAction<Coords>) => {
      state.coords = action.payload;
      state.error = null;
    },
    setLocationName: (state, action: PayloadAction<string>) => {
      state.locationName = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearLocation: (state) => {
      state.coords = null;
      state.locationName = '';
      state.error = null;
    }
  }
});

export const { 
  setLocation, 
  setCoords, 
  setLocationName, 
  setLoading, 
  setError, 
  clearLocation
} = locationSlice.actions;

// Selectors
export const selectLocation = (state: { location: LocationState }) => state.location;
export const selectCoords = (state: { location: LocationState }) => state.location.coords;
export const selectLocationName = (state: { location: LocationState }) => state.location.locationName;
export const selectIsLoading = (state: { location: LocationState }) => state.location.isLoading;
export const selectError = (state: { location: LocationState }) => state.location.error;

export default locationSlice.reducer;