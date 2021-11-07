import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import "./Spinner.css"

export default function CircularIndeterminate() {
  return (
    <Box className="spinnerCSS" sx={{}}>
      <CircularProgress />
    </Box>
  )
}
