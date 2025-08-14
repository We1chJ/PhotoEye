import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Coords {
  lat: number;
  lng: number;
}

interface LocationState {
  coords: Coords | null;
  locationName: string;
}

const initialState: LocationState = {
  coords: null,
  locationName: ''
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
    },
    clearLocation: (state) => {
      state.coords = null;
      state.locationName = '';
    }
  }
});

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
