import { ThemeProvider } from "@emotion/react"
import { createTheme } from "@mui/material/styles"
import React, { Suspense } from "react"
import ReactDOM from "react-dom"
import App from "./App"
import Spinner from "./components/Spinner"
import "./i18n"
import "./index.css"
import reportWebVitals from "./reportWebVitals"

const theme = createTheme({
  palette: {
    neutral: {
      main: "#000000",
      contrastText: "#FFFFFF",
    },
    primary: {
      main: "#731E3C",
    },
  },
})

declare module "@mui/material/styles" {
  interface Palette {
    neutral: Palette["primary"]
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    neutral?: PaletteOptions["primary"]
  }
}

// Update the Button's color prop options
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    neutral: true
  }
}

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Suspense fallback={<Spinner />}>
        <App />
      </Suspense>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
