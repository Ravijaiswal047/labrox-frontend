import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notify } from "../../../utils/utils";
import { setLoading, setCurrentTheme } from "../loadingSlice/loadingSlice";
import { axiosInstance } from "../../../utils/axiosInstance";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { setWindowClass } from "@app/utils/helpers";

const initialState = {
  user: {},
  loading: false,
  error: "",
  message: "",
  success: false,
};

export const signInAction = createAsyncThunk(
  "signIn",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post("login/login", data);
      dispatch(setLoading(false));
      if (response.status === 200) {
        const user =
          response?.data?.user || response?.data?.message?.user || {};
        const theme =
          user?.Theme === "Default"
            ? "default_theme"
            : user?.Theme || "default_theme";

        useLocalStorage("theme", "set", theme);
        setWindowClass(`hold-transition login-page ${theme}`);
        dispatch(setCurrentTheme(theme));
        return response.data;
      } else {
        return rejectWithValue(response.data);
      }
    } catch (error) {
      dispatch(setLoading(false));
      return rejectWithValue(
        error.response ? error.response.data : error.message,
      );
    }
  },
);

export const signInWithOtpAction = createAsyncThunk(
  "signInWithOtp",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post("login/VerifyLoginOTP", data);
      dispatch(setLoading(false));
      if (response.status === 200) {
        const user =
          response?.data?.user || response?.data?.message?.user || {};
        const theme =
          user?.Theme === "Default"
            ? "default_theme"
            : user?.Theme || "default_theme";

        useLocalStorage("theme", "set", theme);
        setWindowClass(`hold-transition login-page ${theme}`);
        dispatch(setCurrentTheme(theme));
        return response.data;
      } else {
        return rejectWithValue(response.data);
      }
    } catch (error) {
      dispatch(setLoading(false));
      return rejectWithValue(
        error.response ? error.response.data : error.message,
      );
    }
  },
);

export const signInWithGoogleAction = createAsyncThunk(
  "auth/signInWithGoogle",
  async (googleToken, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("login/googleLogin", {
        token: googleToken,
      });

      if (response.status === 200) {
        const user =
          response?.data?.user || response?.data?.message?.user || {};
        const theme =
          user?.Theme === "Default"
            ? "default_theme"
            : user?.Theme || "default_theme";

        useLocalStorage("theme", "set", theme);
        setWindowClass(`hold-transition login-page ${theme}`);
        dispatch(setCurrentTheme(theme));

        return response.data;
      } else {
        return rejectWithValue(response.data);
      }
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message,
      );
    }
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInAction.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = false;
      })
      .addCase(signInAction.fulfilled, (state, action) => {
        state.user = action?.payload;
        state.loading = false;
        state.success = true;
        state.error = "";
      })
      .addCase(signInAction.rejected, (state, error) => {
        console.log(error);
        state.loading = false;
        state.error = error.message;
        state.success = false;
        state.message = error.payload.message;
        notify(error.payload.message, "error");
      })
      .addCase(signInWithOtpAction.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(signInWithOtpAction.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.success = true;
        state.error = "";
      })
      .addCase(signInWithOtpAction.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.message = action.payload?.message || "OTP Verification Failed";
        notify(state.message, "error");
      })
      .addCase(signInWithGoogleAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(signInWithGoogleAction.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.success = true;
        state.error = "";
      })
      .addCase(signInWithGoogleAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Google Login Failed";
        notify(state.error, "error");
      });
  },
});
export const { reset } = authSlice.actions;
export default authSlice.reducer;
